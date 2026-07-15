/**
 * Create / update the analytics schema and print what's there.
 *
 * Usage:
 *   npx tsx scripts/db-init.mjs
 *
 * Reads DATABASE_URL from the environment, falling back to .env.local.
 * The schema itself lives in src/lib/db/client.ts (ensureSchema) and is
 * idempotent, so this is safe to re-run and production provisions itself on
 * the first API call without needing direct DB access.
 */

import { readFileSync } from 'fs'

if (!process.env.DATABASE_URL) {
  try {
    const env = readFileSync('.env.local', 'utf-8')
    const m = env.match(/^DATABASE_URL=(.+)$/m)
    if (m) process.env.DATABASE_URL = m[1].trim()
  } catch { /* no .env.local — rely on the real env */ }
}

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL (env or .env.local)')
  process.exit(1)
}

const { getPool, ensureSchema } = await import('../src/lib/db/client.ts')

await ensureSchema()
const pool = getPool()

const tables = await pool.query(
  `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1`
)
console.log('Tables:', tables.rows.map(r => r.table_name).join(', ') || '(none)')

for (const t of ['booking_search', 'place_cache']) {
  const cols = await pool.query(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_name=$1 ORDER BY ordinal_position`, [t]
  )
  console.log(`\n${t} — ${cols.rows.length} columns`)
  console.log(cols.rows.map(r => '  ' + r.column_name.padEnd(20) + r.data_type).join('\n'))
}

const idx = await pool.query(
  `SELECT tablename, indexname FROM pg_indexes WHERE tablename IN ('booking_search','place_cache') ORDER BY 1,2`
)
console.log('\nIndexes:')
console.log(idx.rows.map(r => `  ${r.tablename}.${r.indexname}`).join('\n'))

await pool.end()
