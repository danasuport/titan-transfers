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
const COL_VEHICLE = 'Vehicle'
// Two price columns with very different fill. `price` (col E) is what the client
// pointed at but is only ~12% complete; `Our Target` is ~92% complete and is
// what "From X €" has always used. Per route we prefer `price` when it's filled
// in for that route and fall back to `Our Target` — never mixing the two within
// one route's table, or a cheaper Executive than Sedan could appear.
const COL_PRICE = 'price'
const COL_TARGET = 'Our Target'
// How many priced vehicles a route needs in `price` before we trust that column
// for the whole route rather than falling back to `Our Target`.
const PRICE_MIN_ROWS = 4

/**
 * Spanish-formatted money → number. "32,97" → 32.97, "1 076,21" → 1076.21
 * (thousands are separated by a non-breaking space in the sheet). Empty, "-" and
 * 0 all mean "no usable price" → null.
 */
function parsePrice(raw: string | undefined): number | null {
  if (!raw) return null
  const n = parseFloat(raw.replace(/[\s .]/g, '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : null
}

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

/** One priced vehicle for a route, cheapest-first when returned as a list. */
export interface VehiclePrice {
  vehicle: string
  price: number
}
/** [routeKey, vehicles cheapest-first]. Empty array = route with no usable price. */
type SheetRow = [string, VehiclePrice[]]

// The URL is an argument, not a closed-over constant, so it lands in the cache
// key: repointing ROUTES_SHEET_CSV_URL at a different sheet must not keep serving
// the old one's routes for the rest of the TTL.
//
// Returns each route's per-vehicle price list, cheapest-first. One download
// feeds everything: the dashboard ("do we sell it?" = key present), the hero
// ("from X €" = vehicles[0].price) and the price table (the whole list).
// Serialised as entries because unstable_cache is JSON only.
const fetchSheetRows = unstable_cache(
  async (url: string): Promise<SheetRow[]> => {
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
    const iVehicle = header.indexOf(COL_VEHICLE)
    // Both price columns are optional: absent just means no prices, not a broken sheet.
    const iPrice = header.indexOf(COL_PRICE)
    const iTarget = header.indexOf(COL_TARGET)

    // Gather every vehicle row per route, keeping both column values so the
    // route can pick a single coherent source below.
    const byKey = new Map<string, { vehicle: string; price: number | null; target: number | null }[]>()
    for (const r of rows) {
      const key = routeKey(r[iAirport], r[iResort])
      if (!key) continue
      const vehicle = iVehicle === -1 ? '' : (r[iVehicle] || '').trim()
      if (!byKey.has(key)) byKey.set(key, [])
      byKey.get(key)!.push({
        vehicle,
        price: iPrice === -1 ? null : parsePrice(r[iPrice]),
        target: iTarget === -1 ? null : parsePrice(r[iTarget]),
      })
    }
    if (byKey.size === 0) throw new Error('sheet yielded no routes')

    const out: SheetRow[] = []
    for (const [key, rowsForRoute] of byKey) {
      // Trust `price` for the whole route only when it's well-filled there,
      // otherwise take `Our Target`. Never mix the two within one route.
      const priced = rowsForRoute.filter(v => v.price != null).length
      const useColumn: 'price' | 'target' = priced >= PRICE_MIN_ROWS ? 'price' : 'target'
      const vehicles = rowsForRoute
        .map(v => ({ vehicle: v.vehicle, price: useColumn === 'price' ? v.price : v.target }))
        .filter((v): v is VehiclePrice => v.price != null && !!v.vehicle)
        // Cheapest first, and dedupe a vehicle that appears twice.
        .sort((a, b) => a.price - b.price)
      const seen = new Set<string>()
      const deduped = vehicles.filter(v => (seen.has(v.vehicle) ? false : (seen.add(v.vehicle), true)))
      out.push([key, deduped])
    }
    return out
  },
  // Bumped to -v3 when the shape changed (min price → per-vehicle list); a stale
  // older entry in a persisted data cache would otherwise deserialise wrong.
  ['routes-sheet-v3'],
  { revalidate: SHEET_TTL, tags: ['routes-sheet'] }
)

/** Routes we sell. null when the sheet can't be read — never an empty set. */
export async function getSheetIndex(): Promise<Set<string> | null> {
  try {
    return new Set((await fetchSheetRows(SHEET_CSV_URL)).map(([k]) => k))
  } catch (err) {
    // Degrade to "unknown" rather than telling the client we don't sell a route
    // we do. The dashboard renders "—" for the whole column when this is null.
    console.error('[admin] routes sheet unavailable:', err)
    return null
  }
}

/** Cheapest sheet price per route key — the "from X €" figure. */
export async function getSheetPrices(): Promise<Map<string, number> | null> {
  try {
    const prices = new Map<string, number>()
    for (const [k, vehicles] of await fetchSheetRows(SHEET_CSV_URL)) {
      if (vehicles.length) prices.set(k, vehicles[0].price)
    }
    return prices
  } catch (err) {
    console.error('[admin] routes sheet unavailable:', err)
    return null
  }
}

/** Full per-vehicle price list per route key, cheapest-first — the price table. */
export async function getVehiclePrices(): Promise<Map<string, VehiclePrice[]> | null> {
  try {
    const m = new Map<string, VehiclePrice[]>()
    for (const [k, vehicles] of await fetchSheetRows(SHEET_CSV_URL)) {
      if (vehicles.length) m.set(k, vehicles)
    }
    return m
  } catch (err) {
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
