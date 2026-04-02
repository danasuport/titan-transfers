import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  trailingSlash: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    // Old URL structure → new keyword-rich URLs (wildcard)
    const urlUpgradeRedirects = [
      { source: '/airport/:slug/:routeSlug/', destination: '/airport-transfers/:slug/:routeSlug/', permanent: true },
      { source: '/airport/:slug/', destination: '/airport-transfers/:slug/', permanent: true },
      { source: '/es/aeropuerto/:slug/:routeSlug/', destination: '/es/traslado-aeropuerto/:slug/:routeSlug/', permanent: true },
      { source: '/es/aeropuerto/:slug/', destination: '/es/traslado-aeropuerto/:slug/', permanent: true },
      { source: '/city/:slug/', destination: '/private-transfers/city/:slug/', permanent: true },
      { source: '/es/ciudad/:slug/', destination: '/es/traslados-privados-taxi/ciudad/:slug/', permanent: true },
      { source: '/country/:slug/', destination: '/private-transfers/country/:slug/', permanent: true },
      { source: '/es/pais/:slug/', destination: '/es/traslados-privados-taxi/pais/:slug/', permanent: true },
      { source: '/region/:slug/', destination: '/private-transfers/region/:slug/', permanent: true },
      { source: '/es/region/:slug/', destination: '/es/traslados-privados-taxi/region/:slug/', permanent: true },
    ]

    // Per-airport slug redirects: old slug (with -airport-transfers suffix) → clean slug
    let airportSlugRedirects: { source: string; destination: string; permanent: boolean }[] = []
    try {
      const { createClient } = await import('@sanity/client')
      const sanity = createClient({ projectId: '6iu2za90', dataset: 'production', apiVersion: '2024-01-01', useCdn: false })
      const airports: { slug: string; esSlug: string | null }[] = await sanity.fetch(
        `*[_type == "airport"]{ "slug": slug.current, "esSlug": translations.es.slug.current }`
      )
      airportSlugRedirects = airports.flatMap(({ slug, esSlug }) => {
        const entries: { source: string; destination: string; permanent: boolean }[] = []
        if (slug) {
          // old slug had -airport-transfers or -airport suffix
          entries.push({ source: `/airport-transfers/${slug}-airport-transfers/`, destination: `/airport-transfers/${slug}/`, permanent: true })
          entries.push({ source: `/airport-transfers/${slug}-airport/`, destination: `/airport-transfers/${slug}/`, permanent: true })
        }
        if (esSlug) {
          entries.push({ source: `/es/traslado-aeropuerto/${esSlug}-traslados-al-aeropuerto/`, destination: `/es/traslado-aeropuerto/${esSlug}/`, permanent: true })
          entries.push({ source: `/es/traslado-aeropuerto/${esSlug}-aeropuerto/`, destination: `/es/traslado-aeropuerto/${esSlug}/`, permanent: true })
        }
        return entries
      })
    } catch {
      // Sanity unavailable at build time — skip dynamic redirects
    }

    return [...urlUpgradeRedirects, ...airportSlugRedirects]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)\\.(jpg|jpeg|png|webp|avif|svg|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
