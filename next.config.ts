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
      { source: '/airport/:slug/:routeSlug/', destination: '/airport-transfers-private-taxi/:slug/:routeSlug/', permanent: true },
      { source: '/airport/:slug/', destination: '/airport-transfers-private-taxi/:slug/', permanent: true },
      { source: '/airport-transfers/:slug/:routeSlug/', destination: '/airport-transfers-private-taxi/:slug/:routeSlug/', permanent: true },
      { source: '/airport-transfers/:slug/', destination: '/airport-transfers-private-taxi/:slug/', permanent: true },
      { source: '/es/aeropuerto/:slug/:routeSlug/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/:routeSlug/', permanent: true },
      { source: '/es/aeropuerto/:slug/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/', permanent: true },
      { source: '/es/traslado-aeropuerto/:slug/:routeSlug/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/:routeSlug/', permanent: true },
      { source: '/es/traslado-aeropuerto/:slug/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/', permanent: true },
      // Specific slug cleanup redirects
      { source: '/airport-transfers-private-taxi/barcelona-el-prat/', destination: '/airport-transfers-private-taxi/barcelona/', permanent: true },
      { source: '/airport-transfers-private-taxi/dallas-fort-worth/', destination: '/airport-transfers-private-taxi/dallas/', permanent: true },
      { source: '/airport-transfers-private-taxi/girona-costa-brava/', destination: '/airport-transfers-private-taxi/girona/', permanent: true },
      { source: '/airport-transfers-private-taxi/los-angeles-lax/', destination: '/airport-transfers-private-taxi/los-angeles/', permanent: true },
      { source: '/airport-transfers-private-taxi/marrakesh/', destination: '/airport-transfers-private-taxi/marrakech/', permanent: true },
      { source: '/airport-transfers-private-taxi/prague-airport-prg/', destination: '/airport-transfers-private-taxi/prague/', permanent: true },
      { source: '/es/traslados-aeropuerto-privados-taxi/abu-dabi/', destination: '/es/traslados-aeropuerto-privados-taxi/abu-dhabi/', permanent: true },
      { source: '/es/traslados-aeropuerto-privados-taxi/traslados-aeropuerto-barcelona-transfer-privado-taxi/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/', permanent: true },
      { source: '/es/traslados-aeropuerto-privados-taxi/aeropuerto-girona-costa-brava/', destination: '/es/traslados-aeropuerto-privados-taxi/girona/', permanent: true },
      { source: '/es/traslados-aeropuerto-privados-taxi/traslados-aeropuerto-ciudad-de-mexico/', destination: '/es/traslados-aeropuerto-privados-taxi/ciudad-de-mexico/', permanent: true },
      { source: '/es/traslados-aeropuerto-privados-taxi/aeropuerto-reus/', destination: '/es/traslados-aeropuerto-privados-taxi/reus/', permanent: true },
      { source: '/es/traslados-aeropuerto-privados-taxi/tanger/', destination: '/es/traslados-aeropuerto-privados-taxi/tangier/', permanent: true },
      { source: '/city/:slug/', destination: '/private-transfers/:slug/', permanent: true },
      { source: '/es/ciudad/:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },
      { source: '/country/:slug/', destination: '/private-transfers/:slug/', permanent: true },
      { source: '/es/pais/:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },
      { source: '/region/:slug/', destination: '/private-transfers/:slug/', permanent: true },
      { source: '/es/region/:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },
      // Remove type segment from private-transfers URLs
      { source: '/private-transfers/city/:slug/', destination: '/private-transfers/:slug/', permanent: true },
      { source: '/private-transfers/country/:slug/', destination: '/private-transfers/:slug/', permanent: true },
      { source: '/private-transfers/region/:slug/', destination: '/private-transfers/:slug/', permanent: true },
      { source: '/es/traslados-privados-taxi/ciudad/:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },
      { source: '/es/traslados-privados-taxi/pais/:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },
      { source: '/es/traslados-privados-taxi/region/:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },

      // ── Old WordPress/Yoast city URLs (/cities/private-transfers-[slug]/) ──
      // Specific overrides first (edge cases where prefix removal gives wrong slug)
      { source: '/cities/private-transfers-in-faro-the-algarve/', destination: '/private-transfers/faro/', permanent: true },
      { source: '/cities/private-transfers-in-cancun-and-the-riviera-maya/', destination: '/private-transfers/cancun/', permanent: true },
      { source: '/es/ciudades/traslados-privados-faro-y-algarve/', destination: '/es/traslados-privados-taxi/faro/', permanent: true },
      { source: '/es/ciudades/traslados-privados-cancun-and-the-riviera-maya/', destination: '/es/traslados-privados-taxi/cancun/', permanent: true },
      { source: '/es/ciudades/traslados-privados-atenas/', destination: '/es/traslados-privados-taxi/athens/', permanent: true },
      { source: '/es/ciudades/traslados-privados-lisboa/', destination: '/es/traslados-privados-taxi/lisbon/', permanent: true },
      { source: '/es/ciudades/traslados-privados-londres/', destination: '/es/traslados-privados-taxi/london/', permanent: true },
      { source: '/es/ciudades/traslados-privados-roma/', destination: '/es/traslados-privados-taxi/rome/', permanent: true },
      { source: '/es/ciudades/traslados-privados-paris/', destination: '/es/traslados-privados-taxi/paris/', permanent: true },
      { source: '/es/ciudades/traslados-privados-nueva-york/', destination: '/es/traslados-privados-taxi/new-york/', permanent: true },
      { source: '/es/ciudades/traslados-privados-las-vegas/', destination: '/es/traslados-privados-taxi/las-vegas/', permanent: true },
      // Wildcard fallback — strips "private-transfers-" prefix (works for most slugs)
      { source: '/cities/private-transfers-:slug/', destination: '/private-transfers/:slug/', permanent: true },
      { source: '/es/ciudades/traslados-privados-:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },

      // ── Old WordPress/Yoast country URLs (/countries/private-transfers-[slug]/) ──
      { source: '/es/paises/traslados-privados-en-espana/', destination: '/es/traslados-privados-taxi/spain/', permanent: true },
      { source: '/es/paises/traslados-privados-en-francia/', destination: '/es/traslados-privados-taxi/france/', permanent: true },
      { source: '/es/paises/traslados-privados-en-paises-bajos/', destination: '/es/traslados-privados-taxi/netherlands/', permanent: true },
      { source: '/es/paises/traslados-privados-italia/', destination: '/es/traslados-privados-taxi/italy/', permanent: true },
      { source: '/es/paises/traslados-privados-estados-unidos/', destination: '/es/traslados-privados-taxi/united-states/', permanent: true },
      { source: '/es/paises/traslados-privados-reino-unido/', destination: '/es/traslados-privados-taxi/united-kingdom/', permanent: true },
      { source: '/es/paises/traslados-privados-turquia/', destination: '/es/traslados-privados-taxi/turkey/', permanent: true },
      { source: '/es/paises/traslados-privados-portugal/', destination: '/es/traslados-privados-taxi/portugal/', permanent: true },
      { source: '/es/paises/traslados-privados-mexico/', destination: '/es/traslados-privados-taxi/mexico/', permanent: true },
      { source: '/es/paises/traslados-privados-emirates-arabes-unidos/', destination: '/es/traslados-privados-taxi/united-arab-emirates/', permanent: true },
      { source: '/countries/private-transfers-:slug/', destination: '/private-transfers/:slug/', permanent: true },
      { source: '/es/paises/', destination: '/es/traslados-privados-taxi/', permanent: true },
      { source: '/countries/', destination: '/private-transfers/', permanent: true },

      // ── Old WordPress listing pages ──
      { source: '/cities/', destination: '/private-transfers/', permanent: true },
      { source: '/es/ciudades/', destination: '/es/traslados-privados-taxi/', permanent: true },
      { source: '/airports/', destination: '/airport-transfers-private-taxi/', permanent: true },
      { source: '/es/aeropuertos/', destination: '/es/traslados-aeropuerto-privados-taxi/', permanent: true },
      { source: '/es/traslados-aeropuerto-america/', destination: '/es/traslados-aeropuerto-privados-taxi/', permanent: true },

      // ── Old WordPress airport detail pages (/airports/[slug]/) ──
      { source: '/airports/:slug/', destination: '/airport-transfers-private-taxi/:slug/', permanent: true },

      // ── Old WordPress category airport pages ──
      { source: '/es/aeropuertos/:slug/:routeSlug/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/:routeSlug/', permanent: true },
      { source: '/es/aeropuertos/:slug/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/', permanent: true },

      // ── Old route pages (/rutas/[slug]/) → airport listing (can't map without slug lookup) ──
      { source: '/rutas/:slug/', destination: '/airport-transfers-private-taxi/', permanent: true },
      { source: '/es/rutas/:slug/', destination: '/es/traslados-aeropuerto-privados-taxi/', permanent: true },
      { source: '/rutas/', destination: '/airport-transfers-private-taxi/', permanent: true },
      { source: '/es/rutas/', destination: '/es/traslados-aeropuerto-privados-taxi/', permanent: true },

      // ── Old landing pages ──
      { source: '/landing-aeropuertos-barcelona/', destination: '/airport-transfers-private-taxi/barcelona/', permanent: true },

      // ── Old auth/booking URLs from WordPress ──
      { source: '/es/booking/', destination: '/es/reserva/', permanent: true },
      { source: '/es/iniciar-sesion/', destination: '/es/acceso/', permanent: true },
      { source: '/contact-us/', destination: '/contact/', permanent: true },
      { source: '/es/contacta-con-nosotros/', destination: '/es/contacto/', permanent: true },
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
          entries.push({ source: `/airport-transfers-private-taxi/${slug}-airport-transfers/`, destination: `/airport-transfers-private-taxi/${slug}/`, permanent: true })
          entries.push({ source: `/airport-transfers-private-taxi/${slug}-airport/`, destination: `/airport-transfers-private-taxi/${slug}/`, permanent: true })
        }
        if (esSlug) {
          entries.push({ source: `/es/traslados-aeropuerto-privados-taxi/${esSlug}-traslados-al-aeropuerto/`, destination: `/es/traslados-aeropuerto-privados-taxi/${esSlug}/`, permanent: true })
          entries.push({ source: `/es/traslados-aeropuerto-privados-taxi/${esSlug}-aeropuerto/`, destination: `/es/traslados-aeropuerto-privados-taxi/${esSlug}/`, permanent: true })
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
