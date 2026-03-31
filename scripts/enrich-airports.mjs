/**
 * Phase 5: Enrich existing airports with descriptions, references, and SEO
 * Patches each airport with Portable Text content, country/city/region refs
 */

import { client } from './lib/sanity-client.mjs'
import { generateAirportEN, generateAirportES, seoTitle, seoDesc } from './lib/content-templates.mjs'

// Map of airport slug → city slug (for reference linking)
const AIRPORT_TO_CITY = {
  'abu-dhabi-airport-transfers': 'abu-dhabi',
  'alicante-airport-transfers': 'alicante',
  'amsterdam-airport-transfers': 'amsterdam',
  'antalya-airport-transfers': 'antalya',
  'athens-airport-transfers': 'athens',
  'atlanta-airport-transfers': 'atlanta',
  'austin-airport-transfers': 'austin',
  'baltimore-airport-transfers': 'baltimore',
  'beijing-airport-transfers': 'beijing',
  'beijing-daxing-airport-transfers': 'beijing',
  'berlin-airport-transfers': 'berlin',
  'bogota-airport-transfers': 'bogota',
  'boston-airport-transfers': 'boston',
  'brussels-airport-transfers': 'brussels',
  'budapest-airport-transfers': 'budapest',
  'buffalo-airport-transfers': 'buffalo',
  'cairo-airport-transfers': 'cairo',
  'cancun-airport-transfers': 'cancun',
  'cartagena-airport-transfers': 'cartagena',
  'catania-airport-transfers': 'catania',
  'changsha-airport-transfers': 'changsha',
  'charleroi-airport-transfers': 'charleroi',
  'charleston-airport-transfers': 'charleston',
  'charlotte-airport-transfers': 'charlotte',
  'chicago-midway-airport-transfers': 'chicago',
  'chicago-ohare-airport-transfers': 'chicago',
  'cologne-airport-transfers': 'cologne',
  'cozumel-airport-transfers': 'cozumel',
  'dallas-fort-worth-airport-transfers': 'dallas',
  'denver-airport-transfers': 'denver',
  'detroit-airport-transfers': 'detroit',
  'dubai-airport-transfers': 'dubai',
  'dubai-world-central-airport-transfers': 'dubai',
  'dublin-airport-transfers': 'dublin',
  'dusseldorf-airport-transfers': 'dusseldorf',
  'edinburgh-airport-transfers': 'edinburgh',
  'faro-airport-transfers': 'faro',
  'florence-airport-transfers': 'florence',
  'fort-lauderdale-airport-transfers': 'fort-lauderdale',
  'frankfurt-airport-transfers': 'frankfurt',
  'girona-costa-brava-airport': 'girona',
  'guangzhou-airport-transfers': 'guangzhou',
  'hong-kong-airport-transfers': 'hong-kong',
  'honolulu-airport-transfers': 'honolulu',
  'houston-airport-transfers': 'houston',
  'houston-hobby-airport-transfers': 'houston',
  'hurghada-airport-transfers': 'hurghada',
  'istanbul-airport-transfers': 'istanbul',
  'istanbul-sabiha-gokcen-airport-transfers': 'istanbul',
  'kansas-city-airport-transfers': 'kansas-city',
  'kos-airport-transfers': 'kos',
  'lanzarote-airport-transfers': 'lanzarote',
  'las-vegas-airport-transfers': 'las-vegas',
  'lisbon-airport-transfers': 'lisbon',
  'london-city-airport-transfers': 'london',
  'london-gatwick-airport-transfers': 'london',
  'london-heathrow-airport-transfers': 'london',
  'london-luton-airport-transfers': 'london',
  'london-stansted-airport-transfers': 'london',
  'los-angeles-lax-airport-transfers': 'los-angeles',
  'madrid-airport-transfers': 'madrid',
  'malaga-airport-transfers': 'malaga',
  'manchester-airport-transfers': 'manchester',
  'marrakesh-airport-transfers': 'marrakech',
  'marsa-alam-airport-transfers': 'marsa-alam',
  'miami-airport-transfers': 'miami',
  'milan-bergamo-airport-transfers': 'milan',
  'milan-linate-airport-transfers': 'milan',
  'milan-malpensa-airport-transfers': 'milan',
  'minneapolis-airport-transfers': 'minneapolis',
  'montego-bay-airport-transfers': 'montego-bay',
  'montreal-airport-transfers': 'montreal',
  'munich-airport-transfers': 'munich',
  'nanjing-airport-transfers': 'nanjing',
  'new-orleans-airport-transfers': 'new-orleans',
  'new-york-jfk-airport-transfers': 'new-york',
  'new-york-la-guardia-airport-transfers': 'new-york',
  'newark-airport-transfers': 'newark',
  'orlando-airport-transfers': 'orlando',
  'ottawa-airport-transfers': 'ottawa',
  'palermo-airport-transfers': 'palermo',
  'palma-de-mallorca-airport-transfers': 'palma-de-mallorca',
  'panama-albrook-airport-transfers': 'panama-city',
  'panama-city-airport-transfers': 'panama-city',
  'panama-pacifico-airport-transfers': 'panama-city',
  'paris-beauvais-airport-transfers': 'paris',
  'paris-charles-de-gaulle-airport-transfers': 'paris',
  'paris-orly-airport-transfers': 'paris',
  'philadelphia-airport-transfers': 'philadelphia',
  'phoenix-airport-transfers': 'phoenix',
  'phuket-airport-transfers': 'phuket',
  'pittsburgh-airport-transfers': 'pittsburgh',
  'porto-airport-transfers': 'porto',
  'prague-airport-prg-airport-transfers': 'prague',
  'pristina-airport-transfers': 'pristina',
  'punta-cana-airport-transfers': 'punta-cana',
  'raleigh-airport-transfers': 'raleigh',
  'ras-al-khaimah-airport-transfers': 'ras-al-khaimah',
  'reus-airport': 'reus',
  'richmond-airport-transfers': 'richmond',
  'rome-ciampino-airport-transfers': 'rome',
  'rome-fiumicino-airport-transfers': 'rome',
  'salt-lake-city-airport-transfers': 'salt-lake-city',
  'san-antonio-airport-transfers': 'san-antonio',
  'san-diego-airport-transfers': 'san-diego',
  'san-francisco-airport-transfers': 'san-francisco',
  'san-juan-airport-transfers': 'san-juan',
  'santiago-de-compostela-airport-transfers': 'santiago-de-compostela',
  'santo-domingo-airport-transfers': 'santo-domingo',
  'sarajevo-airport-transfers': 'sarajevo',
  'seattle-airport-transfers': 'seattle',
  'shanghai-airport-transfers': 'shanghai',
  'shanghai-pudong-airport-transfers': 'shanghai',
  'sharjah-airport-transfers': 'sharjah',
  'shenzhen-airport-transfers': 'shenzhen',
  'skopje-airport-transfers': 'skopje',
  'tampa-airport-transfers': 'tampa',
  'tangier-airport-transfers': 'tangier',
  'tirana-airport-transfers': 'tirana',
  'tulum-airport-transfers': 'tulum',
  'vancouver-airport-transfers': 'vancouver',
  'washington-dulles-airport-transfers': 'washington-dc',
  'washington-ronald-reagan-airport-transfers': 'washington-dc',
  // Barcelona special slug
  'barcelona-el-prat-airport': 'barcelona',
}

// City slug → country slug mapping
const CITY_TO_COUNTRY = {}
const CITY_TO_REGION = {}

// Build from the cities migration data
import { readFileSync } from 'fs'

async function buildMappings() {
  const cities = await client.fetch('*[_type=="city"]{_id, "slug": slug.current, "countryRef": country._ref, "regionRef": region._ref}')
  for (const c of cities) {
    CITY_TO_COUNTRY[c.slug] = c.countryRef
    if (c.regionRef) CITY_TO_REGION[c.slug] = c.regionRef
  }
}

async function migrate() {
  console.log('✈️  Enriching airports with content + references...\n')

  await buildMappings()

  // Get all airports
  const airports = await client.fetch('*[_type=="airport"]{_id, title, iataCode, "slug": slug.current, "hasDesc": defined(description), "esTitle": translations.es.title}')

  let enriched = 0, skipped = 0, errors = 0

  for (let i = 0; i < airports.length; i += 5) {
    const batch = airports.slice(i, i + 5)
    await Promise.all(batch.map(async (ap) => {
      const citySlug = AIRPORT_TO_CITY[ap.slug]
      if (!citySlug) {
        console.log(`  ⚠️  ${ap.title} — no city mapping for slug "${ap.slug}"`)
        errors++
        return
      }

      // Skip Barcelona (already has full content)
      if (ap.slug === 'barcelona-el-prat-airport' && ap.hasDesc) {
        console.log(`  ⏭️  ${ap.title} — already enriched`)
        skipped++
        return
      }

      process.stdout.write(`  ✈️  ${ap.title} (${ap.iataCode})...`)

      const countryRef = CITY_TO_COUNTRY[citySlug]
      const regionRef = CITY_TO_REGION[citySlug]

      // Get city name for templates
      const cityDoc = await client.fetch('*[_id==$id][0]{title}', { id: `city-${citySlug}` })
      const cityName = cityDoc?.title || citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

      const data = {
        slug: ap.slug,
        airport: ap.title,
        iata: ap.iataCode,
        city: cityName,
        country: countryRef ? countryRef.replace('country-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '',
        esTitle: ap.esTitle,
      }

      const patch = {
        description: generateAirportEN(data),
        city: { _type: 'reference', _ref: `city-${citySlug}` },
        seoTitle: seoTitle('airport', ap.title, 'en'),
        seoDescription: seoDesc('airport', ap.title, 'en'),
      }

      if (countryRef) patch.country = { _type: 'reference', _ref: countryRef }
      if (regionRef) patch.region = { _type: 'reference', _ref: regionRef }

      // Spanish description
      patch['translations.es.description'] = generateAirportES(data)
      patch['translations.es.seoTitle'] = seoTitle('airport', ap.esTitle || ap.title, 'es')
      patch['translations.es.seoDescription'] = seoDesc('airport', ap.esTitle || ap.title, 'es')

      try {
        await client.patch(ap._id).set(patch).commit()
        enriched++
        console.log(' ✅')
      } catch (err) {
        errors++
        console.log(` ❌ ${err.message}`)
      }
    }))
    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ Enriched: ${enriched} | ⏭️ Skipped: ${skipped} | ❌ Errors: ${errors}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

migrate().catch(console.error)
