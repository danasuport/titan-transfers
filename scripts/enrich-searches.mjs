/**
 * Fill in the enrichment columns of booking_search:
 *   country / city / is_airport  (via Google Geocoding on the place_id, cached)
 *   route_exists                 (does this route already exist in Sanity?)
 *
 * Usage:
 *   npx tsx scripts/enrich-searches.mjs [--limit=200] [--force]
 *
 * Idempotent: only touches rows where enriched_at IS NULL unless --force.
 * Safe to run on a schedule.
 */

import { readFileSync } from 'fs'

// ─── env ─────────────────────────────────────────────────────────────────────
function loadEnv(key) {
  if (process.env[key]) return process.env[key]
  try {
    const env = readFileSync('.env.local', 'utf-8')
    const m = env.match(new RegExp(`^${key}=(.+)$`, 'm'))
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : ''
  } catch { return '' }
}
process.env.DATABASE_URL = loadEnv('DATABASE_URL')
const GOOGLE_KEY = loadEnv('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')

if (!process.env.DATABASE_URL) { console.error('Missing DATABASE_URL'); process.exit(1) }
if (!GOOGLE_KEY) { console.error('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'); process.exit(1) }

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]
}))
const LIMIT = args.limit ? Number(args.limit) : 200
const FORCE = !!args.force

const { getPool, ensureSchema } = await import('../src/lib/db/client.ts')
const { resolvePlace, placeLabel } = await import('../src/lib/db/enrich.ts')
const { client: sanity } = await import('./lib/sanity-client.mjs')

// ─── Sanity route index ──────────────────────────────────────────────────────

/** Accent- and case-insensitive key so "Vilanova i la Geltrú" == "vilanova i la geltru". */
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

console.log('Loading Sanity route index…')
// Every route in Sanity has an airport origin (checked: 738/738), so the route
// key is always IATA + destination city.
const routes = await sanity.fetch(
  `*[_type == "route" && defined(origin->iataCode) && defined(destination->title)]{
     "iata": origin->iataCode, "dest": destination->title }`
)
// "BCN|cubelles" → route exists
const routeIndex = new Set(routes.map(r => `${r.iata}|${norm(r.dest)}`))
console.log(`  ${routeIndex.size} airport→city routes indexed`)

// ─── run ─────────────────────────────────────────────────────────────────────

await ensureSchema()
const pool = getPool()

const { rows } = await pool.query(
  `SELECT id, pickup_text, pickup_pid, dest_text, dest_pid
     FROM booking_search
    WHERE ${FORCE ? 'TRUE' : 'enriched_at IS NULL'}
    ORDER BY id
    LIMIT $1`,
  [LIMIT]
)
console.log(`\n${rows.length} search(es) to enrich\n`)

let ok = 0, failed = 0

for (const row of rows) {
  try {
    const pickup = row.pickup_pid ? await resolvePlace(row.pickup_pid, GOOGLE_KEY) : null
    const dest = row.dest_pid ? await resolvePlace(row.dest_pid, GOOGLE_KEY) : null

    // Our catalogue only models airport→city routes, so we can only answer
    // "do we have this?" when one end is an airport we know by IATA. Both
    // directions count — an airport→hotel search and the hotel→airport return
    // leg are demand for the same route.
    //
    // Neither end an airport => NULL, not false. A city→city search isn't a
    // route we could "be missing"; claiming otherwise would pollute the
    // "routes to add" list with noise.
    let routeExists = null
    if (pickup?.is_airport && pickup.iata && dest?.city) {
      routeExists = routeIndex.has(`${pickup.iata}|${norm(dest.city)}`)
    } else if (dest?.is_airport && dest.iata && pickup?.city) {
      routeExists = routeIndex.has(`${dest.iata}|${norm(pickup.city)}`)
    }

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
    const mark = routeExists === true ? '✅ tenemos' : routeExists === false ? '❌ NO tenemos' : '· sin cruzar'
    console.log(`  #${row.id} ${from} → ${to}  [${mark}]`)
    ok++
  } catch (e) {
    console.error(`  #${row.id} failed: ${e.message}`)
    failed++
  }
}

console.log(`\nDone. enriched: ${ok}, failed: ${failed}`)
await pool.end()
