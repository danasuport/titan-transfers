import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import legacyRedirects from './scripts/legacy-redirects.json' assert { type: 'json' }

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

      // ── WP legacy: /country/<slug>-private-transfers/ (22 indexed URLs) ─────
      // Match BEFORE /country/:slug/ so the suffix doesn't get captured into :slug.
      { source: '/country/:slug-private-transfers/', destination: '/private-transfers-country/:slug/', permanent: true },

      // ── WP legacy: ES airport URLs with translation suffix (~126 indexed) ───
      // Order matters: more specific suffix first.
      { source: '/es/airport/:slug-traslados-al-aeropuerto/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/', permanent: true },
      { source: '/es/airport/:slug-traslados-desde-el-aeropuerto/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/', permanent: true },

      // ── WP legacy: ES city URLs with translated prefix (~94 indexed) ────────
      // The WP slug-translations are heterogeneous; match the three known prefixes.
      { source: '/es/city/traslados-privados-en-:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },
      { source: '/es/city/traslados-de-:slug-private/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },
      { source: '/es/city/traslados-privados-:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },

      // ── ES city slug overrides where Sanity uses the EN base slug ──────────
      // (e.g. "bruselas" in WP → "brussels" in Sanity). Keep as explicit
      // sources because the wildcards above can't translate the slug itself.
      { source: '/es/traslados-privados-taxi/bruselas/', destination: '/es/traslados-privados-taxi/brussels/', permanent: true },
      { source: '/es/traslados-privados-taxi/atenas/', destination: '/es/traslados-privados-taxi/athens/', permanent: true },
      { source: '/es/traslados-privados-taxi/londres/', destination: '/es/traslados-privados-taxi/london/', permanent: true },
      { source: '/es/traslados-privados-taxi/roma/', destination: '/es/traslados-privados-taxi/rome/', permanent: true },
      { source: '/es/traslados-privados-taxi/lisboa/', destination: '/es/traslados-privados-taxi/lisbon/', permanent: true },
      { source: '/es/traslados-privados-taxi/nueva-york/', destination: '/es/traslados-privados-taxi/new-york/', permanent: true },

      // ── WP legacy: ES pais URLs with translated suffix (~23 indexed) ────────
      { source: '/es/pais/:slug-traslados-privados/', destination: '/es/traslados-privados-pais/:slug/', permanent: true },
      { source: '/es/pais/:slug-private-transfers/', destination: '/es/traslados-privados-pais/:slug/', permanent: true },

      // ── ES country slug overrides (translated WP names → Sanity EN slugs) ──
      { source: '/es/traslados-privados-pais/belgica/', destination: '/es/traslados-privados-pais/belgium/', permanent: true },
      { source: '/es/traslados-privados-pais/grecia/', destination: '/es/traslados-privados-pais/greece/', permanent: true },
      { source: '/es/traslados-privados-pais/hungria/', destination: '/es/traslados-privados-pais/hungary/', permanent: true },
      { source: '/es/traslados-privados-pais/irlanda/', destination: '/es/traslados-privados-pais/ireland/', permanent: true },
      { source: '/es/traslados-privados-pais/alemania/', destination: '/es/traslados-privados-pais/germany/', permanent: true },
      { source: '/es/traslados-privados-pais/republica-checa/', destination: '/es/traslados-privados-pais/czech-republic/', permanent: true },
      { source: '/es/traslados-privados-pais/marruecos/', destination: '/es/traslados-privados-pais/morocco/', permanent: true },
      { source: '/es/traslados-privados-pais/egipto/', destination: '/es/traslados-privados-pais/egypt/', permanent: true },
      { source: '/es/traslados-privados-pais/tailandia/', destination: '/es/traslados-privados-pais/thailand/', permanent: true },
      { source: '/es/traslados-privados-pais/rumania/', destination: '/es/traslados-privados-pais/romania/', permanent: true },
      { source: '/es/traslados-privados-pais/jamaica/', destination: '/es/traslados-privados-pais/jamaica/', permanent: true },
      { source: '/es/traslados-privados-pais/bosnia/', destination: '/es/traslados-privados-pais/bosnia-and-herzegovina/', permanent: true },

      // /es/airport/:slug/, /es/city/:slug/, /es/pais/:slug/ (clean slug, no
      // translation suffix) -> handled by the :path* catchalls below, which
      // send to the listing instead of attempting a slug match that often 404s.

      { source: '/country/:slug/', destination: '/private-transfers-country/:slug/', permanent: true },
      { source: '/region/:slug/', destination: '/private-transfers-region/:slug/', permanent: true },
      { source: '/es/region/:slug/', destination: '/es/traslados-privados-region/:slug/', permanent: true },
      // Remove type segment from private-transfers URLs
      { source: '/private-transfers/city/:slug/', destination: '/private-transfers/:slug/', permanent: true },
      { source: '/private-transfers/country/:slug/', destination: '/private-transfers-country/:slug/', permanent: true },
      { source: '/private-transfers/region/:slug/', destination: '/private-transfers-region/:slug/', permanent: true },
      { source: '/es/traslados-privados-taxi/ciudad/:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },
      { source: '/es/traslados-privados-taxi/pais/:slug/', destination: '/es/traslados-privados-pais/:slug/', permanent: true },
      { source: '/es/traslados-privados-taxi/region/:slug/', destination: '/es/traslados-privados-region/:slug/', permanent: true },

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
      // Specific slug fixes (where WP slug ≠ Sanity slug)
      { source: '/cities/private-transfers-new-york-city/', destination: '/private-transfers/new-york/', permanent: true },
      { source: '/country/bosnia-private-transfers/', destination: '/private-transfers-country/bosnia-and-herzegovina/', permanent: true },
      // Wildcard fallback — strips "private-transfers-" prefix (works for most slugs)
      { source: '/cities/private-transfers-:slug/', destination: '/private-transfers/:slug/', permanent: true },
      { source: '/es/ciudades/traslados-privados-:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },

      // ── Old WordPress/Yoast country URLs (/countries/private-transfers-[slug]/) ──
      { source: '/es/paises/traslados-privados-en-espana/', destination: '/es/traslados-privados-pais/spain/', permanent: true },
      { source: '/es/paises/traslados-privados-en-francia/', destination: '/es/traslados-privados-pais/france/', permanent: true },
      { source: '/es/paises/traslados-privados-en-paises-bajos/', destination: '/es/traslados-privados-pais/netherlands/', permanent: true },
      { source: '/es/paises/traslados-privados-italia/', destination: '/es/traslados-privados-pais/italy/', permanent: true },
      { source: '/es/paises/traslados-privados-estados-unidos/', destination: '/es/traslados-privados-pais/united-states/', permanent: true },
      { source: '/es/paises/traslados-privados-reino-unido/', destination: '/es/traslados-privados-pais/united-kingdom/', permanent: true },
      { source: '/es/paises/traslados-privados-turquia/', destination: '/es/traslados-privados-pais/turkey/', permanent: true },
      { source: '/es/paises/traslados-privados-portugal/', destination: '/es/traslados-privados-pais/portugal/', permanent: true },
      { source: '/es/paises/traslados-privados-mexico/', destination: '/es/traslados-privados-pais/mexico/', permanent: true },
      { source: '/es/paises/traslados-privados-emirates-arabes-unidos/', destination: '/es/traslados-privados-pais/united-arab-emirates/', permanent: true },
      { source: '/countries/private-transfers-:slug/', destination: '/private-transfers-country/:slug/', permanent: true },

      // ── WP legacy: /city/<slug>-private-transfers/ — biggest 404 family (93 URLs) ──
      // Yoast appended "-private-transfers" to the city slug. Strip the suffix.
      { source: '/city/:slug-private-transfers/', destination: '/private-transfers/:slug/', permanent: true },

      // ── WP listing-only pages with no equivalent on the new site ─────────────
      // The clean listing pages (/airports/, /cities/, /countries/) live elsewhere
      // and the /airport/ /city/ /country/ singular forms were never real listings.
      { source: '/airport/', destination: '/airports/', permanent: true },
      { source: '/city/', destination: '/cities/', permanent: true },
      { source: '/country/', destination: '/countries/', permanent: true },
      { source: '/es/airport/', destination: '/es/aeropuertos/', permanent: true },
      { source: '/es/city/', destination: '/es/ciudades/', permanent: true },
      { source: '/es/pais/', destination: '/es/paises/', permanent: true },

      // ── WP test/widget pages — no SEO value, send to home so the 404 disappears ──
      { source: '/cx_widget/:path*', destination: '/', permanent: true },
      { source: '/prova/', destination: '/', permanent: true },
      { source: '/page-test/', destination: '/', permanent: true },

      // ── Catchall fallbacks for ES legacy paths whose specific pattern didn't match ──
      // These fire AFTER all specific patterns above so an unknown ES slug ends
      // up at the right listing page instead of a 404. Better for SEO than a
      // dead end: Google sees a 301 to a topical listing.
      { source: '/es/airport/:path*', destination: '/es/aeropuertos/', permanent: true },
      { source: '/es/city/:path*', destination: '/es/ciudades/', permanent: true },
      { source: '/es/pais/:path*', destination: '/es/paises/', permanent: true },
      { source: '/es/aeropuertos/:slug/:rest*', destination: '/es/aeropuertos/', permanent: true },

      // ── Old WordPress listing pages (only redirects that don't conflict with current listing pages) ──
      { source: '/es/traslados-aeropuerto-america/', destination: '/es/aeropuertos/', permanent: true },

      // ── Old WordPress airport detail pages (/airports/[slug]/) ──
      { source: '/airports/:slug/', destination: '/airport-transfers-private-taxi/:slug/', permanent: true },

      // /es/aeropuertos/:nested/ (WP category pages) -> the catchall below
      // forwards them to the listing. Clean slug-by-slug match isn't possible
      // because the WP slugs ("traslados-al-aeropuerto-de-paris") don't match
      // the Sanity ES slugs ("paris").

      // ── Old /rutas/ listing pages — fallback for any slug not in legacyRedirects ──
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

    // Legacy /rutas/ redirects generated by scripts/generate-legacy-redirects.mjs
    // (cross-references each old URL against the actual Sanity route slugs)
    return [...legacyRedirects, ...urlUpgradeRedirects, ...airportSlugRedirects]
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
      // Block indexing on every non-production host (sslip.io test URL,
      // raw IP, Coolify preview hostnames). Done via response headers — NOT
      // via middleware — so that ISR cache stays public on the real domain.
      // Each rule below adds X-Robots-Tag: noindex when the host header
      // matches the pattern. Stays harmless on titantransfers.com because
      // none of these match it.
      {
        source: '/(.*)',
        has: [{ type: 'host', value: '(?<host>.*\\.sslip\\.io)' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/(.*)',
        has: [{ type: 'host', value: '(?<host>\\d+\\.\\d+\\.\\d+\\.\\d+(:\\d+)?)' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/(.*)',
        has: [{ type: 'host', value: '(?<host>.*\\.coolify\\..*)' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/(.*)',
        has: [{ type: 'host', value: '(?<host>localhost(:\\d+)?)' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
