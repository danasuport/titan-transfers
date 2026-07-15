import { unstable_cache } from 'next/cache'
import { sanityClient } from '@/lib/sanity/client'
import { routeKey } from '@/lib/route-key'

// The two catalogues the dashboard compares, both read live:
//
//   sheet — the client's pricing spreadsheet. A route in it is one we sell,
//           whether or not it has been published yet.
//   web   — Sanity. A route in it is live on the site.
//
// Neither is a subset of the other (checked: 1.095 routes are priced but not
// published, 52 are published but absent from the sheet), so "do we have this
// route?" is the union and "is it on the site?" is Sanity alone.
//
// Read live rather than stored on booking_search, because both catalogues change
// independently of the searches: route_exists is frozen when a search is
// enriched, so a route published today would still read as missing on every
// search recorded before it.

const SHEET_TTL = 3600
const FETCH_TIMEOUT_MS = 10_000

/**
 * Google publishes any link-shared sheet as CSV with no auth. Overridable so the
 * sheet can move without a deploy; the default is the sheet in use today.
 */
const SHEET_CSV_URL =
  process.env.ROUTES_SHEET_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1Av3de0RAoJpHEI1_fEPIdUXPlvXahaMfloCpWG42IG4/export?format=csv&gid=0'

/** The sheet's column headers. Renaming either one in Drive breaks the match. */
const COL_AIRPORT = 'Airport'
const COL_RESORT = 'Resort'

// ─── CSV ─────────────────────────────────────────────────────────────────────

/**
 * RFC 4180 enough for Drive's export: quoted fields, doubled quotes, and commas
 * or newlines inside them. The sheet's prices are quoted ("30,00" — Spanish
 * decimals), so splitting on commas would shift every column after Vehicle.
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch !== '"') cell += ch
      else if (text[i + 1] === '"') { cell += '"'; i++ }
      else quoted = false
      continue
    }
    if (ch === '"') quoted = true
    else if (ch === ',') { row.push(cell); cell = '' }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
    else if (ch !== '\r') cell += ch
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows
}

// ─── sheet ───────────────────────────────────────────────────────────────────

// The URL is an argument, not a closed-over constant, so it lands in the cache
// key: repointing ROUTES_SHEET_CSV_URL at a different sheet must not keep serving
// the old one's routes for the rest of the TTL.
const fetchSheetKeys = unstable_cache(
  async (url: string): Promise<string[]> => {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: 'follow',
    })
    if (!res.ok) throw new Error(`sheet responded ${res.status}`)

    const rows = parseCsv(await res.text())
    const header = rows.shift()
    if (!header) throw new Error('sheet is empty')

    const iAirport = header.indexOf(COL_AIRPORT)
    const iResort = header.indexOf(COL_RESORT)
    if (iAirport === -1 || iResort === -1) {
      throw new Error(`sheet has no "${COL_AIRPORT}"/"${COL_RESORT}" columns`)
    }

    // One row per vehicle type, so ~5 rows collapse into each route.
    const keys = new Set<string>()
    for (const r of rows) {
      const key = routeKey(r[iAirport], r[iResort])
      if (key) keys.add(key)
    }
    if (keys.size === 0) throw new Error('sheet yielded no routes')
    return [...keys]
  },
  ['routes-sheet'],
  { revalidate: SHEET_TTL, tags: ['routes-sheet'] }
)

/** Routes we sell. null when the sheet can't be read — never an empty set. */
export async function getSheetIndex(): Promise<Set<string> | null> {
  try {
    return new Set(await fetchSheetKeys(SHEET_CSV_URL))
  } catch (err) {
    // Degrade to "unknown" rather than telling the client we don't sell a route
    // we do. The dashboard renders "—" for the whole column when this is null.
    console.error('[admin] routes sheet unavailable:', err)
    return null
  }
}

// ─── web (Sanity) ────────────────────────────────────────────────────────────

/** Locales a published route should be translated into. `en` is the root field. */
const LOCALES = ['es', 'it', 'de', 'ar'] as const

export interface RouteStatus {
  hasImage: boolean
  hasContent: boolean
  missingLangs: string[]
}

interface SanityRoute {
  iata: string
  dest: string
  destTr?: Record<string, { title?: string } | undefined>
  hasImage: boolean
  hasContent: boolean
  langs: Record<string, boolean>
}

const fetchWebRoutes = unstable_cache(
  async (): Promise<SanityRoute[]> =>
    sanityClient.fetch(
      `*[_type == "route" && defined(origin->iataCode) && defined(destination->title)]{
         "iata": origin->iataCode,
         "dest": destination->title,
         "destTr": destination->translations,
         "hasImage": defined(featuredImage.asset),
         "hasContent": count(contentSections) > 0,
         "langs": {
           ${LOCALES.map(l => `"${l}": defined(translations.${l}.title)`).join(', ')}
         }
       }`
    ),
  ['routes-web'],
  { revalidate: SHEET_TTL, tags: ['routes-web'] }
)

/**
 * Published routes → how complete each one is, keyed under EVERY name we know
 * the destination by.
 *
 * Why every name: Google's `locality` is inconsistent. For a city's own place_id
 * it returns the English exonym ("Rome"), but for an address inside it — a hotel
 * or a street, which is what visitors actually search — it returns the local name
 * ("Roma"), and language=en does not change that. Matching on the English title
 * alone reported routes we do have as missing, for every city with an exonym.
 *
 * null when Sanity can't be read.
 */
export async function getWebIndex(): Promise<Map<string, RouteStatus> | null> {
  let routes: SanityRoute[]
  try {
    routes = await fetchWebRoutes()
  } catch (err) {
    console.error('[admin] Sanity route catalogue unavailable:', err)
    return null
  }

  // sanityClient swallows its own errors and returns [] — indistinguishable from
  // a real empty result, except that the catalogue is never legitimately empty.
  if (routes.length === 0) {
    console.error('[admin] Sanity returned no routes — treating as unavailable')
    return null
  }

  const index = new Map<string, RouteStatus>()
  for (const r of routes) {
    const status: RouteStatus = {
      hasImage: !!r.hasImage,
      hasContent: !!r.hasContent,
      missingLangs: LOCALES.filter(l => !r.langs?.[l]),
    }
    const names = [r.dest, ...Object.values(r.destTr || {}).map(t => t?.title)]
    for (const name of names) {
      const key = routeKey(r.iata, name)
      if (key) index.set(key, status)
    }
  }
  return index
}

// ─── verdict ─────────────────────────────────────────────────────────────────

export interface RouteVerdict {
  /** Do we sell it? Sheet ∪ web. null = can't tell. */
  haveIt: boolean | null
  /** Is it live on the site? null = can't tell. */
  onWeb: boolean | null
  /** Completeness of the published route, when there is one. */
  status: RouteStatus | null
}

const UNKNOWN: RouteVerdict = { haveIt: null, onWeb: null, status: null }

export function verdictFor(
  key: string | null,
  sheet: Set<string> | null,
  web: Map<string, RouteStatus> | null
): RouteVerdict {
  // Neither end is an airport: not a catalogue route, so there is nothing to answer.
  if (!key) return UNKNOWN

  const status = web?.get(key) ?? null
  const onWeb = web ? web.has(key) : null
  if (onWeb) return { haveIt: true, onWeb: true, status }

  // Published settles "do we have it?" on its own; otherwise only the sheet can,
  // and without it we say so instead of guessing "no".
  const haveIt = sheet ? sheet.has(key) : null
  return { haveIt, onWeb, status }
}
