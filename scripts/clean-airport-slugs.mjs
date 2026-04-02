/**
 * Clean airport slugs: strip "-airport-transfers" / "-traslados-al-aeropuerto" suffix
 * so URLs become /airport-transfers/barcelona/ instead of /airport-transfers/barcelona-airport-transfers/
 *
 * Usage: node scripts/clean-airport-slugs.mjs [--dry-run]
 *
 * --dry-run  Preview changes without writing to Sanity
 */

import { client } from './lib/sanity-client.mjs'

const DRY_RUN = process.argv.includes('--dry-run')

// Suffixes to strip
const EN_SUFFIXES = ['-airport-transfers', '-airport']
const ES_SUFFIXES = ['-traslados-al-aeropuerto', '-traslados-aeropuerto', '-aeropuerto']

function stripSuffix(slug, suffixes) {
  for (const suffix of suffixes) {
    if (slug.endsWith(suffix)) return slug.slice(0, -suffix.length)
  }
  return slug
}

function cleanEnSlug(slug) {
  return stripSuffix(slug, EN_SUFFIXES)
}

function cleanEsSlug(slug) {
  return stripSuffix(slug, ES_SUFFIXES)
}

async function main() {
  console.log(`\n${DRY_RUN ? '🔍 DRY RUN — no changes will be made\n' : '🚀 Running migration\n'}`)

  const airports = await client.fetch(`
    *[_type == "airport"]{
      _id,
      title,
      slug,
      "esSlug": translations.es.slug.current
    } | order(title asc)
  `)

  console.log(`Found ${airports.length} airports\n`)

  const redirects = []
  const skipped = []
  let changed = 0

  for (const airport of airports) {
    const oldEnSlug = airport.slug?.current
    if (!oldEnSlug) {
      skipped.push({ title: airport.title, reason: 'no EN slug' })
      continue
    }

    const newEnSlug = cleanEnSlug(oldEnSlug)
    const oldEsSlug = airport.esSlug || null
    const newEsSlug = oldEsSlug ? cleanEsSlug(oldEsSlug) : null

    const enChanged = newEnSlug !== oldEnSlug
    const esChanged = newEsSlug && newEsSlug !== oldEsSlug

    if (!enChanged && !esChanged) {
      skipped.push({ title: airport.title, reason: `slug already clean: ${oldEnSlug}` })
      continue
    }

    console.log(`✏️  ${airport.title}`)
    if (enChanged) console.log(`   EN: ${oldEnSlug} → ${newEnSlug}`)
    if (esChanged) console.log(`   ES: ${oldEsSlug} → ${newEsSlug}`)

    redirects.push({ from: oldEnSlug, to: newEnSlug, esFrom: oldEsSlug, esTo: newEsSlug })

    if (!DRY_RUN) {
      const patch = client.patch(airport._id)

      if (enChanged) {
        patch.set({ 'slug.current': newEnSlug })
      }
      if (esChanged) {
        patch.set({ 'translations.es.slug.current': newEsSlug })
      }

      await patch.commit()
      changed++
    } else {
      changed++
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`✅ ${DRY_RUN ? 'Would change' : 'Changed'}: ${changed} airports`)
  console.log(`⏭  Skipped: ${skipped.length} airports (already clean or no slug)`)

  // ── Generate redirect entries for next.config.ts ──────────────────────────
  if (redirects.length > 0) {
    console.log(`\n${'─'.repeat(60)}`)
    console.log('📋 Add these redirects to next.config.ts:\n')
    console.log('// Airport slug cleanup redirects')
    for (const r of redirects) {
      console.log(`  { source: '/airport-transfers/${r.from}/', destination: '/airport-transfers/${r.to}/', permanent: true },`)
      if (r.esFrom && r.esTo && r.esFrom !== r.esTo) {
        console.log(`  { source: '/es/traslado-aeropuerto/${r.esFrom}/', destination: '/es/traslado-aeropuerto/${r.esTo}/', permanent: true },`)
      }
      // Also redirect the pre-keyword-prefix URLs (from before this session's changes)
      console.log(`  { source: '/airport/${r.from}/', destination: '/airport-transfers/${r.to}/', permanent: true },`)
      if (r.esFrom && r.esTo) {
        console.log(`  { source: '/es/aeropuerto/${r.esFrom}/', destination: '/es/traslado-aeropuerto/${r.esTo}/', permanent: true },`)
      }
    }
  }

  if (skipped.length > 0 && DRY_RUN) {
    console.log(`\n${'─'.repeat(60)}`)
    console.log('⏭  Skipped airports:')
    for (const s of skipped) {
      console.log(`   - ${s.title}: ${s.reason}`)
    }
  }
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
