/**
 * Phase 7: Populate cross-references between CPTs
 * - airports.nearbyAirports[] (airports in same city or region)
 * - cities.nearbyAirports[] (airports that serve this city)
 * - cities.relatedCities[] (cities in same region/country)
 */

import { client } from './lib/sanity-client.mjs'

async function migrate() {
  console.log('🔗 Populating cross-references...\n')

  // ── Fetch all data ────────────────────────────────────────────────────
  const [airports, cities] = await Promise.all([
    client.fetch('*[_type=="airport"]{_id, title, "slug": slug.current, "cityRef": city._ref, "countryRef": country._ref, "regionRef": region._ref}'),
    client.fetch('*[_type=="city"]{_id, title, "slug": slug.current, "countryRef": country._ref, "regionRef": region._ref}'),
  ])

  // ── 1) Airport nearbyAirports ─────────────────────────────────────────
  console.log('━━━ Airport → nearbyAirports ━━━')
  let apUpdated = 0

  // Group airports by city and region
  const airportsByCity = {}
  const airportsByRegion = {}
  const airportsByCountry = {}

  for (const ap of airports) {
    if (ap.cityRef) {
      if (!airportsByCity[ap.cityRef]) airportsByCity[ap.cityRef] = []
      airportsByCity[ap.cityRef].push(ap)
    }
    if (ap.regionRef) {
      if (!airportsByRegion[ap.regionRef]) airportsByRegion[ap.regionRef] = []
      airportsByRegion[ap.regionRef].push(ap)
    }
    if (ap.countryRef) {
      if (!airportsByCountry[ap.countryRef]) airportsByCountry[ap.countryRef] = []
      airportsByCountry[ap.countryRef].push(ap)
    }
  }

  for (let i = 0; i < airports.length; i += 5) {
    const batch = airports.slice(i, i + 5)
    await Promise.all(batch.map(async (ap) => {
      // Find nearby: same city first, then same region, then same country
      const nearby = new Set()

      // Same city airports
      if (ap.cityRef && airportsByCity[ap.cityRef]) {
        for (const other of airportsByCity[ap.cityRef]) {
          if (other._id !== ap._id) nearby.add(other._id)
        }
      }

      // Same region airports (up to 5 total)
      if (ap.regionRef && airportsByRegion[ap.regionRef] && nearby.size < 5) {
        for (const other of airportsByRegion[ap.regionRef]) {
          if (other._id !== ap._id && nearby.size < 5) nearby.add(other._id)
        }
      }

      // Same country airports (up to 5 total)
      if (ap.countryRef && airportsByCountry[ap.countryRef] && nearby.size < 5) {
        for (const other of airportsByCountry[ap.countryRef]) {
          if (other._id !== ap._id && nearby.size < 5) nearby.add(other._id)
        }
      }

      if (nearby.size === 0) return

      const refs = [...nearby].map(id => ({ _type: 'reference', _ref: id, _key: id.replace(/[^a-zA-Z0-9]/g, '') }))

      try {
        await client.patch(ap._id).set({ nearbyAirports: refs }).commit()
        apUpdated++
        process.stdout.write('.')
      } catch (err) {
        process.stdout.write('x')
      }
    }))
    await new Promise(r => setTimeout(r, 200))
  }
  console.log(`\n  ✅ ${apUpdated} airports updated with nearbyAirports\n`)

  // ── 2) City nearbyAirports ────────────────────────────────────────────
  console.log('━━━ City → nearbyAirports ━━━')
  let cityApUpdated = 0

  // Build city→airports map: airports whose city ref points to this city
  const cityToAirports = {}
  for (const ap of airports) {
    if (ap.cityRef) {
      if (!cityToAirports[ap.cityRef]) cityToAirports[ap.cityRef] = []
      cityToAirports[ap.cityRef].push(ap._id)
    }
  }

  // Also find airports by same region for cities without direct airport refs
  for (let i = 0; i < cities.length; i += 5) {
    const batch = cities.slice(i, i + 5)
    await Promise.all(batch.map(async (city) => {
      const nearbyIds = new Set()

      // Direct airports serving this city
      if (cityToAirports[city._id]) {
        for (const id of cityToAirports[city._id]) nearbyIds.add(id)
      }

      // Airports in same region (up to 3)
      if (city.regionRef && airportsByRegion[city.regionRef] && nearbyIds.size < 3) {
        for (const ap of airportsByRegion[city.regionRef]) {
          if (nearbyIds.size < 3) nearbyIds.add(ap._id)
        }
      }

      // Airports in same country (up to 3)
      if (nearbyIds.size === 0 && city.countryRef && airportsByCountry[city.countryRef]) {
        for (const ap of airportsByCountry[city.countryRef]) {
          if (nearbyIds.size < 3) nearbyIds.add(ap._id)
        }
      }

      if (nearbyIds.size === 0) return

      const refs = [...nearbyIds].map(id => ({ _type: 'reference', _ref: id, _key: id.replace(/[^a-zA-Z0-9]/g, '') }))

      try {
        await client.patch(city._id).set({ nearbyAirports: refs }).commit()
        cityApUpdated++
        process.stdout.write('.')
      } catch (err) {
        process.stdout.write('x')
      }
    }))
    await new Promise(r => setTimeout(r, 200))
  }
  console.log(`\n  ✅ ${cityApUpdated} cities updated with nearbyAirports\n`)

  // ── 3) City relatedCities ─────────────────────────────────────────────
  console.log('━━━ City → relatedCities ━━━')
  let cityRelUpdated = 0

  // Group cities by region and country
  const citiesByRegion = {}
  const citiesByCountry = {}
  for (const c of cities) {
    if (c.regionRef) {
      if (!citiesByRegion[c.regionRef]) citiesByRegion[c.regionRef] = []
      citiesByRegion[c.regionRef].push(c)
    }
    if (c.countryRef) {
      if (!citiesByCountry[c.countryRef]) citiesByCountry[c.countryRef] = []
      citiesByCountry[c.countryRef].push(c)
    }
  }

  for (let i = 0; i < cities.length; i += 5) {
    const batch = cities.slice(i, i + 5)
    await Promise.all(batch.map(async (city) => {
      const related = new Set()

      // Same region cities (up to 5)
      if (city.regionRef && citiesByRegion[city.regionRef]) {
        for (const other of citiesByRegion[city.regionRef]) {
          if (other._id !== city._id && related.size < 5) related.add(other._id)
        }
      }

      // Same country cities if still under 5
      if (related.size < 5 && city.countryRef && citiesByCountry[city.countryRef]) {
        for (const other of citiesByCountry[city.countryRef]) {
          if (other._id !== city._id && related.size < 5) related.add(other._id)
        }
      }

      if (related.size === 0) return

      const refs = [...related].map(id => ({ _type: 'reference', _ref: id, _key: id.replace(/[^a-zA-Z0-9]/g, '') }))

      try {
        await client.patch(city._id).set({ relatedCities: refs }).commit()
        cityRelUpdated++
        process.stdout.write('.')
      } catch (err) {
        process.stdout.write('x')
      }
    }))
    await new Promise(r => setTimeout(r, 200))
  }
  console.log(`\n  ✅ ${cityRelUpdated} cities updated with relatedCities\n`)

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`🔗 Cross-references complete!`)
  console.log(`   Airports with nearby: ${apUpdated}`)
  console.log(`   Cities with airports: ${cityApUpdated}`)
  console.log(`   Cities with related:  ${cityRelUpdated}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

migrate().catch(console.error)
