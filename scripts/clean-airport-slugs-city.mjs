/**
 * For single-airport cities: rename slug to just the city slug
 * e.g. barcelona-el-prat → barcelona, lisbon → lisbon (already ok), faro → faro
 *
 * Multi-airport cities (London, Paris, etc.) keep city+name: london-heathrow, paris-cdg
 *
 * Usage: node scripts/clean-airport-slugs-city.mjs [--dry-run]
 */

import { client } from './lib/sanity-client.mjs'

const DRY_RUN = process.argv.includes('--dry-run')

// Cities with multiple airports — keep city+airport slug
const MULTI_AIRPORT_CITIES = new Set([
  'Beijing', 'Chicago', 'Dubai', 'Houston', 'Istanbul', 'London',
  'Milan', 'New York', 'Panama City', 'Paris', 'Rome', 'Shanghai',
  'Washington D.C.',
])

async function main() {
  console.log(`\n${DRY_RUN ? '🔍 DRY RUN\n' : '🚀 Running migration\n'}`)

  // Fetch all airports with their city info
  const airports = await client.fetch(`
    *[_type == "airport"]{
      _id, title,
      "slug": slug.current,
      "esSlug": translations.es.slug.current,
      "cityTitle": city->title,
      "citySlug": city->slug.current,
      "esCitySlug": city->translations.es.slug.current
    } | order(title asc)
  `)

  console.log(`Found ${airports.length} airports\n`)

  // Count airports per city to detect multi-airport cities dynamically
  const cityCount = {}
  for (const a of airports) {
    if (a.cityTitle) cityCount[a.cityTitle] = (cityCount[a.cityTitle] || 0) + 1
  }

  const redirects = []
  let changed = 0
  let skipped = 0

  for (const a of airports) {
    const isMulti = MULTI_AIRPORT_CITIES.has(a.cityTitle) || (cityCount[a.cityTitle] || 0) > 1

    if (isMulti) {
      skipped++
      continue // keep city+airport name slug
    }

    const citySlug = a.citySlug
    const esCitySlug = a.esCitySlug || a.citySlug

    if (!citySlug) {
      console.log(`⚠️  ${a.title} — no city slug, skipping`)
      skipped++
      continue
    }

    const oldEn = a.slug
    const oldEs = a.esSlug
    const newEn = citySlug
    const newEs = esCitySlug

    if (oldEn === newEn && (!oldEs || oldEs === newEs)) {
      skipped++
      continue
    }

    console.log(`✏️  ${a.title}`)
    if (oldEn !== newEn) console.log(`   EN: ${oldEn} → ${newEn}`)
    if (oldEs && oldEs !== newEs) console.log(`   ES: ${oldEs} → ${newEs}`)

    redirects.push({ oldEn, newEn, oldEs: oldEs || null, newEs })

    if (!DRY_RUN) {
      const patch = client.patch(a._id)
      if (oldEn !== newEn) patch.set({ 'slug.current': newEn })
      if (oldEs && oldEs !== newEs) patch.set({ 'translations.es.slug.current': newEs })
      await patch.commit()
      changed++
    } else {
      changed++
    }
  }

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`✅ ${DRY_RUN ? 'Would change' : 'Changed'}: ${changed}`)
  console.log(`⏭  Skipped (multi-airport or already clean): ${skipped}`)

  if (redirects.length > 0) {
    console.log(`\n📋 Redirects to add in next.config.ts:\n`)
    for (const r of redirects) {
      if (r.oldEn !== r.newEn) {
        console.log(`  { source: '/airport-transfers-private-taxi/${r.oldEn}/', destination: '/airport-transfers-private-taxi/${r.newEn}/', permanent: true },`)
        console.log(`  { source: '/airport-transfers/${r.oldEn}/', destination: '/airport-transfers-private-taxi/${r.newEn}/', permanent: true },`)
      }
      if (r.oldEs && r.oldEs !== r.newEs) {
        console.log(`  { source: '/es/traslados-aeropuerto-privados-taxi/${r.oldEs}/', destination: '/es/traslados-aeropuerto-privados-taxi/${r.newEs}/', permanent: true },`)
      }
    }
  }
}

main().catch(err => { console.error(err.message); process.exit(1) })
