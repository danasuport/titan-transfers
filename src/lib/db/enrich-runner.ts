import { sanityClient } from '@/lib/sanity/client'
import { routeKey, searchRouteKey } from '@/lib/route-key'
import { getPool, ensureSchema } from './client'
import { resolvePlace, placeLabel } from './enrich'

// The enrichment pass, shared by scripts/enrich-searches.mjs (local) and
// /api/admin/enrich (production cron). Production runs the compiled app, where
// devDependencies and the scripts/ folder don't exist — hence the endpoint.

export interface EnrichResult {
  processed: number
  failed: number
  items: { id: number; from: string; to: string; routeExists: boolean | null }[]
}

/**
 * "BCN|cubelles" for every airport→city route in Sanity — indexed under EVERY
 * name we know the city by.
 *
 * Why: Google's `locality` is inconsistent. For a city's own place_id it returns
 * the English exonym ("Rome"), but for an address INSIDE that city — which is
 * what visitors actually search, a hotel or a street — it returns the local name
 * ("Roma"). Passing language=en does NOT fix it (checked: Roma, Milano, Firenze
 * and München all stay local). Matching on the English title alone therefore
 * reported routes we do have as missing, for every city with an exonym.
 *
 * Since every city is already translated into all 5 locales, indexing those
 * names too makes the match work whichever name Google hands back.
 */
async function loadRouteIndex(): Promise<Set<string>> {
  interface RouteRow {
    iata: string
    dest: string
    destTr?: Record<string, { title?: string } | undefined>
  }
  const routes: RouteRow[] = await sanityClient.fetch(
    `*[_type == "route" && defined(origin->iataCode) && defined(destination->title)]{
       "iata": origin->iataCode,
       "dest": destination->title,
       "destTr": destination->translations }`
  )

  const index = new Set<string>()
  for (const r of routes) {
    const names = [r.dest, ...Object.values(r.destTr || {}).map(t => t?.title)]
    for (const name of names) {
      const key = routeKey(r.iata, name)
      if (key) index.add(key)
    }
  }
  return index
}

export async function runEnrichment(opts: { limit?: number; force?: boolean } = {}): Promise<EnrichResult> {
  const limit = opts.limit ?? 200
  const force = opts.force ?? false

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set')

  await ensureSchema()
  const pool = getPool()

  const { rows } = await pool.query(
    `SELECT id, pickup_text, pickup_pid, dest_text, dest_pid
       FROM booking_search
      WHERE ${force ? 'TRUE' : 'enriched_at IS NULL'}
      ORDER BY id
      LIMIT $1`,
    [limit]
  )
  if (rows.length === 0) return { processed: 0, failed: 0, items: [] }

  // Only pay for the Sanity round-trip when there's actually work to do.
  const routeIndex = await loadRouteIndex()

  const result: EnrichResult = { processed: 0, failed: 0, items: [] }

  for (const row of rows) {
    try {
      const pickup = row.pickup_pid ? await resolvePlace(row.pickup_pid, apiKey) : null
      const dest = row.dest_pid ? await resolvePlace(row.dest_pid, apiKey) : null

      // Our catalogue only models airport→city routes, so we can only answer
      // "do we have this?" when one end is an airport we know by IATA. Both
      // directions count (the return leg is the same route).
      //
      // No key => NULL, not false: a city→city search isn't a route we could be
      // "missing", and marking it would fill the client's backlog with noise.
      const key = searchRouteKey({
        pickup_is_airport: pickup?.is_airport ?? null,
        pickup_iata: pickup?.iata ?? null,
        pickup_city: pickup?.city ?? null,
        dest_is_airport: dest?.is_airport ?? null,
        dest_iata: dest?.iata ?? null,
        dest_city: dest?.city ?? null,
      })
      const routeExists = key ? routeIndex.has(key) : null

      const from = placeLabel(pickup, row.pickup_text)
      const to = placeLabel(dest, row.dest_text)

      await pool.query(
        `UPDATE booking_search SET
           pickup_country = $2, pickup_city = $3, pickup_is_airport = $4, pickup_label = $5,
           dest_country   = $6, dest_city   = $7, dest_is_airport   = $8, dest_label   = $9,
           route_exists   = $10, enriched_at = now()
         WHERE id = $1`,
        [
          row.id,
          pickup?.country ?? null, pickup?.city ?? null, pickup?.is_airport ?? null, from,
          dest?.country ?? null, dest?.city ?? null, dest?.is_airport ?? null, to,
          routeExists,
        ]
      )

      result.items.push({ id: row.id, from, to, routeExists })
      result.processed++
    } catch (err) {
      console.error(`[enrich] row ${row.id} failed:`, err)
      result.failed++
    }
  }

  return result
}
