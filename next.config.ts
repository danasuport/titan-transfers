import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import legacyRedirects from './scripts/legacy-redirects.json' assert { type: 'json' }
import duplicateRouteRedirects from './scripts/duplicate-route-redirects.json' assert { type: 'json' }
import routeSlugRedirects from './scripts/route-slug-redirects.json' assert { type: 'json' }
import regionLegacyRedirects from './scripts/region-legacy-redirects.json' assert { type: 'json' }

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  trailingSlash: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Next.js 16 strict-whitelists the quality param: any request for a
    // quality not listed here gets a 400 from /_next/image. HeroSection
    // asks for 85 and FleetShowcase for 80, so they need to be on the
    // list. Default 75 stays for everything that does not pass quality={}.
    qualities: [75, 80, 85],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    // Old URL structure → new keyword-rich URLs (wildcard)
    const urlUpgradeRedirects = [
      // Strip "-airport-transfers" / "-airport-transfer" / "-airpot-transfers"
      // suffixes BEFORE the generic /airport/:slug/ rule (which would otherwise
      // capture them greedily into :slug and end up at a non-existent Sanity slug).
      // Specific /airport/<x>/ overrides where Sanity has no matching slug —
      // MUST come before /airport/:slug/ catch-all below.
      { source: '/airport/skopje/', destination: '/airports/', permanent: true },
      { source: '/airport/skopje-airport-transfers/', destination: '/airports/', permanent: true },
      { source: '/airport/traslados-al-aeropuerto-de-phuket/', destination: '/airports/', permanent: true },
      { source: '/airport/:slug([^/]+?)-airport-transfers/', destination: '/airport-transfers-private-taxi/:slug/', permanent: true },
      { source: '/airport/:slug([^/]+?)-airport-transfer/', destination: '/airport-transfers-private-taxi/:slug/', permanent: true },
      { source: '/airport/:slug([^/]+?)-airpot-transfers/', destination: '/airport-transfers-private-taxi/:slug/', permanent: true },
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

      // ── WP slug-mismatch overrides — MUST come before the wildcards that
      // strip the suffix into :slug, otherwise the wildcard captures first
      // and sends the request to a non-existent Sanity slug. ───────────────
      { source: '/country/bosnia-private-transfers/', destination: '/private-transfers-country/bosnia-and-herzegovina/', permanent: true },
      { source: '/cities/private-transfers-new-york-city/', destination: '/private-transfers/new-york/', permanent: true },

      // EN airport slug mismatches (WP uses long IATA-style, Sanity uses city)
      { source: '/airport/dallas-fort-worth-airport-transfers/', destination: '/airport-transfers-private-taxi/dallas/', permanent: true },
      { source: '/airport/los-angeles-lax-airport-transfers/', destination: '/airport-transfers-private-taxi/los-angeles/', permanent: true },
      { source: '/airport/marrakesh-airport-transfers/', destination: '/airport-transfers-private-taxi/marrakech/', permanent: true },
      { source: '/airport/prague-airport-prg-airport-transfers/', destination: '/airport-transfers-private-taxi/prague/', permanent: true },
      // (skopje/, skopje-airport-transfers/, traslados-al-aeropuerto-de-phuket
      //  moved earlier — must beat /airport/:slug/ catch-all.)

      // EN city slug mismatches — when Sanity uses a shorter/cleaner slug
      { source: '/city/beijing-pekin-private-transfers/', destination: '/private-transfers/beijing/', permanent: true },
      { source: '/city/cartagena-de-indias-private-transfers/', destination: '/private-transfers/cartagena/', permanent: true },
      { source: '/city/dallas-fort-worth-private-transfers/', destination: '/private-transfers/dallas/', permanent: true },
      { source: '/city/guangzhou-canton-private-transfers/', destination: '/private-transfers/guangzhou/', permanent: true },
      { source: '/city/marrakesh-private-transfers/', destination: '/private-transfers/marrakech/', permanent: true },
      { source: '/city/nanjing-nanjing-private-transfers/', destination: '/private-transfers/nanjing/', permanent: true },
      { source: '/city/porto-oporto-private-transfers/', destination: '/private-transfers/porto/', permanent: true },
      { source: '/city/prague-praga-private-transfers/', destination: '/private-transfers/prague/', permanent: true },
      // EN cities not in Sanity → listing (better than 404)
      { source: '/city/bucharest-private-transfers/', destination: '/cities/', permanent: true },
      { source: '/city/mostar-private-transfers/', destination: '/cities/', permanent: true },
      { source: '/city/raleigh-durham-private-transfers/', destination: '/cities/', permanent: true },
      { source: '/city/sharm-el-sheikh-private-transfers/', destination: '/cities/', permanent: true },
      { source: '/city/washington-d-c-private-transfers/', destination: '/cities/', permanent: true },

      // ES airport slug mismatches
      { source: '/es/airport/los-angeles-lax-traslados-al-aeropuerto/', destination: '/es/traslados-aeropuerto-privados-taxi/los-angeles/', permanent: true },
      { source: '/es/airport/nankin-traslados-al-aeropuerto/', destination: '/es/traslados-aeropuerto-privados-taxi/nanjing/', permanent: true },
      { source: '/es/airport/ohare-de-chicago-traslados-al-aeropuerto/', destination: '/es/aeropuertos/', permanent: true },

      // ES city slug mismatches (translated WP slugs → Sanity EN slugs)
      { source: '/es/city/traslados-privados-en-asuan/', destination: '/es/traslados-privados-taxi/aswan/', permanent: true },
      { source: '/es/city/traslados-privados-en-bufalo/', destination: '/es/traslados-privados-taxi/buffalo/', permanent: true },
      { source: '/es/city/traslados-privados-en-cartagena-de-indias/', destination: '/es/traslados-privados-taxi/cartagena/', permanent: true },
      { source: '/es/city/traslados-privados-en-guangzhou-canton/', destination: '/es/traslados-privados-taxi/guangzhou/', permanent: true },
      { source: '/es/city/traslados-privados-en-mineapolis/', destination: '/es/traslados-privados-taxi/minneapolis/', permanent: true },
      { source: '/es/city/traslados-privados-en-oporto-oporto/', destination: '/es/traslados-privados-taxi/porto/', permanent: true },
      { source: '/es/city/traslados-privados-en-praga-praga/', destination: '/es/traslados-privados-taxi/prague/', permanent: true },
      { source: '/es/city/traslados-privados-en-skopie/', destination: '/es/traslados-privados-taxi/skopje/', permanent: true },
      { source: '/es/city/traslados-privados-en-tanger/', destination: '/es/traslados-privados-taxi/tangier/', permanent: true },
      { source: '/es/city/traslados-privados-dallas-fort-worth/', destination: '/es/traslados-privados-taxi/dallas/', permanent: true },
      // ES city slugs whose Sanity equivalent doesn't exist → ES cities listing
      { source: '/es/city/traslados-privados-en-bucarest/', destination: '/es/ciudades/', permanent: true },
      { source: '/es/city/traslados-privados-en-mostar/', destination: '/es/ciudades/', permanent: true },
      { source: '/es/city/traslados-privados-en-raleigh-durham/', destination: '/es/ciudades/', permanent: true },
      { source: '/es/city/traslados-privados-en-sharm-el-sheikh/', destination: '/es/ciudades/', permanent: true },
      { source: '/es/city/traslados-privados-en-washington-d-c/', destination: '/es/ciudades/', permanent: true },

      // ES country slug mismatch
      { source: '/es/pais/moldavia-traslados-privados/', destination: '/es/traslados-privados-pais/moldova/', permanent: true },

      // ── WP legacy: /city/<slug>-private-transfers/ (~93 indexed URLs) ──────
      // MUST come before /city/:slug/ — otherwise :slug greedily eats the suffix.
      { source: '/city/:slug([^/]+?)-private-transfers/', destination: '/private-transfers/:slug/', permanent: true },

      { source: '/city/:slug/', destination: '/private-transfers/:slug/', permanent: true },
      { source: '/es/ciudad/:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },

      // ── WP legacy: /country/<slug>-private-transfers/ (22 indexed URLs) ─────
      // Match BEFORE /country/:slug/ so the suffix doesn't get captured into :slug.
      { source: '/country/:slug([^/]+?)-private-transfers/', destination: '/private-transfers-country/:slug/', permanent: true },

      // ── WP legacy: ES airport URLs with translation suffix (~126 indexed) ───
      // Order matters: more specific suffix first.
      { source: '/es/airport/:slug([^/]+?)-traslados-al-aeropuerto/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/', permanent: true },
      { source: '/es/airport/:slug([^/]+?)-traslados-desde-el-aeropuerto/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/', permanent: true },

      // ── WP legacy: ES city URLs with translated prefix (~94 indexed) ────────
      // The WP slug-translations are heterogeneous; match the three known prefixes.
      { source: '/es/city/traslados-privados-en-:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },
      { source: '/es/city/traslados-de-:slug([^/]+?)-private/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },
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
      { source: '/es/pais/:slug([^/]+?)-traslados-privados/', destination: '/es/traslados-privados-pais/:slug/', permanent: true },
      { source: '/es/pais/:slug([^/]+?)-private-transfers/', destination: '/es/traslados-privados-pais/:slug/', permanent: true },

      // ── ES country slugs ──────────────────────────────────────────────────
      // Aquí hubo 10 redirecciones (alemania→germany, irlanda→ireland…) de
      // cuando las páginas ES de país vivían con el slug inglés. Desde que
      // Sanity tiene el slug en español, countryBySlugQuery resuelve el país
      // por el slug de CUALQUIER idioma, así que sobraban — y hacían daño: el
      // sitemap publica /es/…/alemania/, esa URL redirigía a /germany/, y
      // /germany/ declaraba como canónica /alemania/. Google no podía indexar
      // ninguna de las dos. Eliminadas el 12/09/2026.
      // El alias corto legacy de WP sí se mantiene, apuntando al slug ES, que
      // es el que publica el sitemap.
      { source: '/es/traslados-privados-pais/bosnia/', destination: '/es/traslados-privados-pais/bosnia-y-herzegovina/', permanent: true },

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
      // Slug-mismatch overrides for new-york-city / bosnia were moved earlier
      // in the array (above the wildcard suffix-strippers) so the wildcard
      // doesn't capture them first.
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

      // /city/:slug-private-transfers/ moved earlier (must beat /city/:slug/).

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

      // ── Old /rutas/ listing pages — send to the airports listing (the
      // /airport-transfers-private-taxi/ root has no listing of its own). ──
      { source: '/rutas/', destination: '/airports/', permanent: true },
      { source: '/rutas/:path*', destination: '/airports/', permanent: true },
      { source: '/es/rutas/', destination: '/es/aeropuertos/', permanent: true },
      { source: '/es/rutas/:path*', destination: '/es/aeropuertos/', permanent: true },

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

    // Section roots. /airport-transfers-private-taxi/ etc. are only ever used
    // with a slug (…/barcelona/), so the bare segment had no page and returned
    // 404 — in all six languages, for every section. They're linked from
    // breadcrumbs and guessed by visitors, so each one points at its listing.
    const sectionRootRedirects = [
      { source: '/airport-transfers-private-taxi/', destination: '/airports/', permanent: true },
      { source: '/private-transfers/', destination: '/cities/', permanent: true },
      { source: '/private-transfers-country/', destination: '/countries/', permanent: true },
      { source: '/private-transfers-region/', destination: '/regions/', permanent: true },
      { source: '/region/', destination: '/regions/', permanent: true },
      { source: '/es/traslados-aeropuerto-privados-taxi/', destination: '/es/aeropuertos/', permanent: true },
      { source: '/es/traslados-privados-taxi/', destination: '/es/ciudades/', permanent: true },
      { source: '/es/traslados-privados-pais/', destination: '/es/paises/', permanent: true },
      { source: '/es/traslados-privados-region/', destination: '/es/regiones/', permanent: true },
      { source: '/it/trasferimenti-aeroporto-taxi-privato/', destination: '/it/aeroporti/', permanent: true },
      { source: '/it/trasferimenti-privati-taxi/', destination: '/it/citta/', permanent: true },
      { source: '/it/trasferimenti-privati-paese/', destination: '/it/paesi/', permanent: true },
      { source: '/it/trasferimenti-privati-regione/', destination: '/it/regioni/', permanent: true },
      { source: '/de/flughafentransfer-privat-taxi/', destination: '/de/flughaefen/', permanent: true },
      { source: '/de/private-transfers-taxi/', destination: '/de/staedte/', permanent: true },
      { source: '/de/private-transfers-land/', destination: '/de/laender/', permanent: true },
      { source: '/de/private-transfers-region/', destination: '/de/regionen/', permanent: true },
      { source: '/fr/transferts-aeroport-taxi-prive/', destination: '/fr/aeroports/', permanent: true },
      { source: '/fr/transferts-prives-taxi/', destination: '/fr/villes/', permanent: true },
      { source: '/fr/transferts-prives-pays/', destination: '/fr/pays/', permanent: true },
      { source: '/fr/transferts-prives-region/', destination: '/fr/regions/', permanent: true },
      { source: '/ar/nakl-mataar/', destination: '/ar/matarat/', permanent: true },
      { source: '/ar/nakl-khass/', destination: '/ar/mudun/', permanent: true },
      { source: '/ar/nakl-khass-balad/', destination: '/ar/buldan/', permanent: true },
      { source: '/ar/nakl-khass-mintaqa/', destination: '/ar/manatik/', permanent: true },
    ]

    // The rest of Search Console's 404 report (2026-08-27): WordPress leavings
    // that no generated map covers. Exact paths, and they sit ahead of
    // urlUpgradeRedirects because several of its wildcards would otherwise
    // capture them and forward the request to a slug Sanity doesn't have —
    // which is how /airport/atlanta-airport-transfers-2/ ended up redirecting
    // to a 404 instead of to Atlanta.
    const wpLeftoverRedirects = [
      // WP nested airport hubs: /airports/<city hub>/<airport>-airport-transfers/.
      // Stripping the suffix yields exactly the Sanity slug (london-gatwick,
      // paris-beauvais, new-york-jfk…), so one rule covers the whole family,
      // including the hubs Google hasn't re-crawled yet and the one WP left
      // behind as "__trashed".
      { source: '/airports/:hub/:slug([^/]+?)-airport-transfers/', destination: '/airport-transfers-private-taxi/:slug/', permanent: true },
      { source: '/airports/london-airport-transfers/', destination: '/airports/', permanent: true },
      { source: '/airports/paris-airport-transfers/', destination: '/airports/', permanent: true },
      { source: '/airports/new-york-airport-transfers/', destination: '/airports/', permanent: true },

      // Wildcards that used to land on a non-existent slug.
      { source: '/airport/atlanta-airport-transfers-2/', destination: '/airport-transfers-private-taxi/atlanta/', permanent: true },
      { source: '/airport/barcelona-el-prat-airport/', destination: '/airport-transfers-private-taxi/barcelona/', permanent: true },
      { source: '/airport/barcelona-el-prat-airport/barcelona-el-prat-to-sitges/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-sitges/', permanent: true },
      { source: '/airport-transfers-private-taxi/barcelona-el-prat-airport/', destination: '/airport-transfers-private-taxi/barcelona/', permanent: true },

      // WP paginated city listing.
      { source: '/city/page/:n/', destination: '/cities/', permanent: true },

      // WP feeds and orphan pages.
      { source: '/country/feed/', destination: '/countries/', permanent: true },
      { source: '/es/comments/feed/', destination: '/es/blog/', permanent: true },
      { source: '/es/country/', destination: '/es/paises/', permanent: true },
      { source: '/es/choose-vehicle/', destination: '/es/reserva/', permanent: true },
      { source: '/america-airport-transfers/', destination: '/airports/', permanent: true },
      // A WordPress post that was never migrated. Nothing to point it at but
      // the blog itself.
      { source: '/como-preparar-equipaje-traslados-aeropuerto/', destination: '/es/blog/', permanent: true },

      // Section roots served without their locale prefix.
      { source: '/traslados-privados-pais/', destination: '/es/paises/', permanent: true },
      { source: '/trasferimenti-privati-paese/', destination: '/it/paesi/', permanent: true },

      // Arabic service pages whose slug was renamed (nakl-mataar → nakl-almatar,
      // madina-ila-madina → nakl-min-madina-ila-madina). Port transfers never
      // got an Arabic slug and still answers to the English one.
      { source: '/ar/khadamat/nakl-mataar/', destination: '/ar/khadamat/nakl-almatar/', permanent: true },
      { source: '/ar/khadamat/madina-ila-madina/', destination: '/ar/khadamat/nakl-min-madina-ila-madina/', permanent: true },
      { source: '/ar/khadamat/nakl-mina/', destination: '/ar/khadamat/port-transfers/', permanent: true },
      // Same page asked for without the /ar prefix. The i18n middleware answers
      // that one first with a 307 to /services/nakl-mataar/, so the landing URL
      // needs its own rule or the visitor still ends on a 404.
      { source: '/khadamat/nakl-mataar/', destination: '/ar/khadamat/nakl-almatar/', permanent: true },
      { source: '/services/nakl-mataar/', destination: '/ar/khadamat/nakl-almatar/', permanent: true },
    ]

    // Legacy /rutas/ redirects generated by scripts/generate-legacy-redirects.mjs
    // (cross-references each old URL against the actual Sanity route slugs)
    return [
      // Canonical host: 301 www.titantransfers.com/* → titantransfers.com/*
      // (host-conditional, so it only fires for the www host and cannot loop).
      // Consolidates the duplicate host so Google indexes a single origin.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.titantransfers.com' }],
        destination: 'https://titantransfers.com/:path*',
        permanent: true,
      },
      ...legacyRedirects,
      // Deleted duplicate routes → the surviving one. Exact paths, so they must
      // sit ahead of the wildcard rules below. Generated by
      // scripts/dedupe-routes.mjs; don't hand-edit.
      ...duplicateRouteRedirects,
      // Routes whose slug was regenerated in the migration, and WordPress region
      // URLs served under what is now the city path. Both exact-path and both
      // generated by scripts/generate-404-redirects.mjs; don't hand-edit.
      ...routeSlugRedirects,
      ...regionLegacyRedirects,
      ...wpLeftoverRedirects,
      ...sectionRootRedirects,
      ...urlUpgradeRedirects,
      ...airportSlugRedirects,
    ]
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
          // Permissions-Policy: deny camera/microphone everywhere; explicitly
          // allow payment + geolocation to the WP booking subdomain so Stripe
          // Elements (loaded inside the booking iframe at wp.titantransfers.com)
          // can initialise and run 3D Secure.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(self "https://wp.titantransfers.com"), geolocation=(self "https://wp.titantransfers.com")' },
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
