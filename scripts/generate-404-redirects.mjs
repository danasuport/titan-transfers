/**
 * Builds the redirect maps that clear Search Console's "Not found (404)" report.
 *
 * Two families, both written as exact-path 301s so they can't capture anything
 * they weren't meant to:
 *
 * 1. route-slug-redirects.json — routes whose slug was regenerated during the
 *    WordPress migration. "transfer-istanbul-to-halkali" became
 *    "transfer-istanbul-airport-ist-to-halkali": the page is alive, only its
 *    address moved, and no redirect was left behind. Google still holds the old
 *    address in all six languages, so this reads the GSC export and pairs each
 *    dead URL with the live route by ORIGIN AIRPORT + DESTINATION SLUG, matching
 *    the destination in any of the six locales. Anything it can't pair with
 *    confidence is reported and left out — a wrong redirect is worse than a 404.
 *
 * 2. region-legacy-redirects.json — WordPress served regions at
 *    /private-transfers/<region>/, which is the CITY path on this site, so every
 *    region URL Google remembers lands on a city lookup and 404s. Generated for
 *    every region in Sanity, not just the ones GSC has reported, and only after
 *    checking that no city shares the slug.
 *
 * Usage:
 *   node scripts/generate-404-redirects.mjs            # dry run, prints a summary
 *   node scripts/generate-404-redirects.mjs --write    # writes both JSON files
 */
import { readFileSync, writeFileSync } from 'fs'
import { createClient } from '@sanity/client'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim()
}

const WRITE = process.argv.includes('--write')
const GSC_CSV = 'docs/gsc-404-2026-08-27.csv'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const LOCALES = ['es', 'ar', 'it', 'de', 'fr']
// Locale → the airport section segment, straight from src/lib/i18n/config.ts.
// Kept here as a literal because this is a plain .mjs script and config.ts is TS.
const AIRPORT_SEGMENT = {
  en: 'airport-transfers-private-taxi',
  es: 'traslados-aeropuerto-privados-taxi',
  it: 'trasferimenti-aeroporto-taxi-privato',
  ar: 'nakl-mataar',
  de: 'flughafentransfer-privat-taxi',
  fr: 'transferts-aeroport-taxi-prive',
}
const CITY_SEGMENT = { en: 'private-transfers', es: 'traslados-privados-taxi' }
const REGION_SEGMENT = { en: 'private-transfers-region', es: 'traslados-privados-region' }

const localized = (item, locale, fallback) =>
  locale === 'en' ? fallback : item?.translations?.[locale]?.slug?.current || fallback

/** Every slug a document answers to, across the six locales. */
const allSlugs = (doc) => [doc?.slug?.current, ...LOCALES.map((l) => doc?.translations?.[l]?.slug?.current)].filter(Boolean)

async function routeSlugRedirects() {
  const urls = readFileSync(GSC_CSV, 'utf8')
    .split('\n')
    .slice(1)
    .map((l) => l.split(',')[0].trim())
    .filter((u) => u.startsWith('http'))

  const out = []
  const skipped = []

  for (const url of urls) {
    const segments = new URL(url).pathname.split('/').filter(Boolean)
    const locale = LOCALES.includes(segments[0]) ? segments[0] : 'en'
    const path = locale === 'en' ? segments : segments.slice(1)
    // Only <section>/<airport>/<route> URLs are route pages. Anything else in
    // the export (WordPress listings, feeds, another company's product pages)
    // is handled by hand in next.config.ts.
    if (path.length !== 3) continue

    const [, airportSlug, deadSlug] = path
    const airport = await client.fetch(
      `*[_type == "airport" && (slug.current == $s ${LOCALES.map((l) => `|| translations.${l}.slug.current == $s`).join(' ')})][0]{ _id, slug, translations }`,
      { s: airportSlug }
    )
    if (!airport) {
      skipped.push([url, 'the airport segment matches no airport'])
      continue
    }

    const routes = await client.fetch(
      `*[_type == "route" && origin._ref == $id]{ slug, translations, "destination": destination->{ slug, translations } }`,
      { id: airport._id }
    )

    // The dead slug always ends with the destination's slug in whichever
    // language it was written ("…-to-halkali", "…-a-kadikoy", "…-ila-taragona").
    // Longest match wins, so "puerto-juarez" beats a route to "juarez".
    let best = null
    let bestLength = 0
    for (const route of routes) {
      for (const destSlug of allSlugs(route.destination)) {
        const hit = deadSlug === destSlug || deadSlug.endsWith(`-${destSlug}`)
        if (hit && destSlug.length > bestLength) {
          best = route
          bestLength = destSlug.length
        }
      }
    }
    if (!best) {
      skipped.push([url, 'no live route to that destination'])
      continue
    }
    // Already correct? Then the URL 404s for some other reason; don't touch it.
    if (allSlugs(best).includes(deadSlug)) {
      skipped.push([url, 'the slug is already the live one'])
      continue
    }

    const prefix = locale === 'en' ? '' : `/${locale}`
    out.push({
      source: new URL(url).pathname,
      destination: `${prefix}/${AIRPORT_SEGMENT[locale]}/${localized(airport, locale, airport.slug.current)}/${localized(best, locale, best.slug.current)}/`,
      permanent: true,
    })
  }

  return { out, skipped }
}

async function regionRedirects() {
  const regions = await client.fetch(`*[_type == "region" && defined(slug.current)]{ slug, translations }`)
  const citySlugs = new Set(
    (await client.fetch(`*[_type == "city" && defined(slug.current)]{ slug, translations }`)).flatMap(allSlugs)
  )

  const out = []
  const collisions = []
  for (const region of regions) {
    for (const locale of ['en', 'es']) {
      const slug = localized(region, locale, region.slug.current)
      // A slug that is also a city's would hijack a live city page.
      if (citySlugs.has(slug)) {
        collisions.push(slug)
        continue
      }
      const prefix = locale === 'en' ? '' : `/${locale}`
      out.push({
        source: `${prefix}/${CITY_SEGMENT[locale]}/${slug}/`,
        destination: `${prefix}/${REGION_SEGMENT[locale]}/${slug}/`,
        permanent: true,
      })
    }
  }
  return { out, collisions }
}

const routes = await routeSlugRedirects()
const regions = await regionRedirects()

console.log(`rutas renombradas: ${routes.out.length} redirecciones`)
for (const [url, why] of routes.skipped) console.log(`  · fuera: ${why} — ${new URL(url).pathname}`)
console.log(`regiones: ${regions.out.length} redirecciones (${regions.collisions.length} descartadas por colisión con una ciudad)`)

if (WRITE) {
  writeFileSync('scripts/route-slug-redirects.json', `${JSON.stringify(routes.out, null, 2)}\n`)
  writeFileSync('scripts/region-legacy-redirects.json', `${JSON.stringify(regions.out, null, 2)}\n`)
  console.log('\nescritos scripts/route-slug-redirects.json y scripts/region-legacy-redirects.json')
} else {
  console.log('\n(dry run — pasa --write para escribir los ficheros)')
}
