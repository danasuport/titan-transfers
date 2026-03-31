/**
 * Generate 301 redirects from old WordPress URLs to new Next.js URLs
 *
 * Usage: npx tsx scripts/generate-redirects.ts > redirects.json
 *
 * Then import the generated redirects into next.config.ts
 */

import { createClient } from '@sanity/client'

const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

interface Redirect {
  source: string
  destination: string
  permanent: boolean
}

async function generateRedirects() {
  const redirects: Redirect[] = []

  // Fetch all content from Sanity
  const [airports, routes, cities, countries] = await Promise.all([
    sanity.fetch('*[_type == "airport"]{ title, slug, iataCode, translations }'),
    sanity.fetch('*[_type == "route"]{ title, slug, origin->{ slug }, translations }'),
    sanity.fetch('*[_type == "city"]{ title, slug, translations }'),
    sanity.fetch('*[_type == "country"]{ title, slug, translations }'),
  ])

  // Airport redirects — old: /airport/{slug} → new: /airport/{slug}/
  for (const airport of airports) {
    // Ensure trailing slash
    redirects.push({
      source: `/airport/${airport.slug.current}`,
      destination: `/airport/${airport.slug.current}/`,
      permanent: true,
    })

    // Spanish versions
    const esSlug = airport.translations?.es?.slug?.current
    if (esSlug) {
      redirects.push({
        source: `/es/airport/${airport.slug.current}`,
        destination: `/es/aeropuerto/${esSlug}/`,
        permanent: true,
      })
      redirects.push({
        source: `/es/airport/${airport.slug.current}/`,
        destination: `/es/aeropuerto/${esSlug}/`,
        permanent: true,
      })
    }
  }

  // Route redirects — old format variations
  for (const route of routes) {
    if (!route.origin?.slug?.current) continue

    // Old WordPress route format: /rutas/{slug}
    redirects.push({
      source: `/rutas/${route.slug.current}`,
      destination: `/airport/${route.origin.slug.current}/${route.slug.current}/`,
      permanent: true,
    })
    redirects.push({
      source: `/rutas/${route.slug.current}/`,
      destination: `/airport/${route.origin.slug.current}/${route.slug.current}/`,
      permanent: true,
    })

    // Spanish route redirects
    const esSlug = route.translations?.es?.slug?.current
    if (esSlug) {
      redirects.push({
        source: `/es/rutas/${route.slug.current}`,
        destination: `/es/aeropuerto/${route.origin.slug.current}/${esSlug}/`,
        permanent: true,
      })
      redirects.push({
        source: `/es/rutas/${route.slug.current}/`,
        destination: `/es/aeropuerto/${route.origin.slug.current}/${esSlug}/`,
        permanent: true,
      })
    }
  }

  // City redirects
  for (const city of cities) {
    redirects.push({
      source: `/city/${city.slug.current}`,
      destination: `/city/${city.slug.current}/`,
      permanent: true,
    })
    const esSlug = city.translations?.es?.slug?.current
    if (esSlug) {
      redirects.push({
        source: `/es/city/${city.slug.current}`,
        destination: `/es/ciudad/${esSlug}/`,
        permanent: true,
      })
      redirects.push({
        source: `/es/city/${city.slug.current}/`,
        destination: `/es/ciudad/${esSlug}/`,
        permanent: true,
      })
    }
  }

  // Country redirects
  for (const country of countries) {
    redirects.push({
      source: `/country/${country.slug.current}`,
      destination: `/country/${country.slug.current}/`,
      permanent: true,
    })
    const esSlug = country.translations?.es?.slug?.current
    if (esSlug) {
      redirects.push({
        source: `/es/country/${country.slug.current}`,
        destination: `/es/pais/${esSlug}/`,
        permanent: true,
      })
    }
  }

  // Common WordPress URL patterns
  redirects.push(
    { source: '/wp-admin', destination: '/', permanent: true },
    { source: '/wp-login.php', destination: '/login/', permanent: true },
    { source: '/feed', destination: '/blog/', permanent: true },
    { source: '/feed/', destination: '/blog/', permanent: true },
  )

  return redirects
}

async function main() {
  const redirects = await generateRedirects()
  console.log(JSON.stringify(redirects, null, 2))
  console.error(`Generated ${redirects.length} redirects`)
}

main().catch(console.error)
