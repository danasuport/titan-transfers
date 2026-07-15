/**
 * Fill in the enrichment columns of booking_search:
 *   country / city / is_airport / label  (Google Geocoding on the place_id, cached)
 *   route_exists                         (does this route exist in Sanity?)
 *
 * Usage (LOCAL ONLY):
 *   npx tsx scripts/enrich-searches.mjs [--limit=200] [--force]
 *
 * In PRODUCTION use the endpoint instead — the standalone build has no
 * devDependencies and no scripts/ folder:
 *   curl -fsS -X POST https://titantransfers.com/api/admin/enrich/ \
 *        -H "Authorization: Bearer $ADMIN_PASSWORD"
 *
 * Both paths run the exact same code (src/lib/db/enrich-runner.ts).
 */

import { readFileSync } from 'fs'

function loadEnv(key) {
  if (process.env[key]) return process.env[key]
  try {
    const env = readFileSync('.env.local', 'utf-8')
    const m = env.match(new RegExp(`^${key}=(.+)$`, 'm'))
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : ''
  } catch { return '' }
}

for (const key of ['DATABASE_URL', 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', 'NEXT_PUBLIC_SANITY_PROJECT_ID', 'NEXT_PUBLIC_SANITY_DATASET']) {
  process.env[key] = loadEnv(key)
}
if (!process.env.DATABASE_URL) { console.error('Missing DATABASE_URL'); process.exit(1) }
if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) { console.error('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'); process.exit(1) }

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]
}))

const { runEnrichment } = await import('../src/lib/db/enrich-runner.ts')
const { getPool } = await import('../src/lib/db/client.ts')

const result = await runEnrichment({
  limit: args.limit ? Number(args.limit) : 200,
  force: !!args.force,
})

for (const i of result.items) {
  const mark = i.routeExists === true ? '✅ tenemos'
    : i.routeExists === false ? '❌ NO tenemos'
    : '· n/a'
  console.log(`  #${i.id} ${i.from} → ${i.to}  [${mark}]`)
}
console.log(`\nDone. enriched: ${result.processed}, failed: ${result.failed}`)

await getPool().end()
