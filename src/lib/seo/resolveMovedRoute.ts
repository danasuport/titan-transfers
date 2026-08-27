import { sanityClient } from '@/lib/sanity/client'
import { getRouteUrl } from '@/lib/utils/slugHelpers'
import { defaultLocale, type Locale } from '@/lib/i18n/config'

/**
 * Last chance before a route page 404s: work out whether the URL is an old
 * address of a route that is still on sale, and hand back where it moved to.
 *
 * Route slugs have been regenerated twice — once in the WordPress migration
 * (`transfer-istanbul-to-halkali` → `transfer-istanbul-airport-ist-to-halkali`)
 * and again when duplicates were merged. Each rename orphaned the old address
 * in all six languages, and Google keeps every one of them for years: that is
 * most of what Search Console reports as "Not found (404)". Static redirects
 * clean up the addresses Google has already told us about; this covers the ones
 * it hasn't, and any future rename, without anyone having to notice.
 *
 * The match runs on the one part of the slug that survives every renaming: the
 * destination. Whatever else changes, an old slug still ends with the
 * destination's own slug in the language it was written — "…-to-halkali",
 * "…-a-kadikoy", "…-ila-taragona" — so a route of the same airport whose
 * destination matches that tail is the page the visitor was asking for. The
 * longest match wins, so "…-to-puerto-juarez" can't be claimed by a route to
 * Juárez.
 *
 * Returns null unless it is sure, in which case the caller should 404: sending
 * someone to the wrong transfer is worse than telling them the page is gone.
 */
export async function resolveMovedRoute(
  airportSlug: string,
  deadRouteSlug: string,
  locale: Locale
): Promise<string | null> {
  const LOCALES = ['es', 'ar', 'it', 'de', 'fr'] as const
  const matchesAnyLocale = `slug.current == $airportSlug ${LOCALES.map((l) => `|| translations.${l}.slug.current == $airportSlug`).join(' ')}`

  const airport = await sanityClient.fetch(
    `*[_type == "airport" && (${matchesAnyLocale})][0]{
      slug, translations,
      "routes": *[_type == "route" && origin._ref == ^._id && hidden != true]{
        slug, translations, "destination": destination->{ slug, translations }
      }
    }`,
    { airportSlug }
  )
  if (!airport?.routes?.length) return null

  const slugsOf = (doc: { slug?: { current?: string }; translations?: Record<string, { slug?: { current?: string } }> } | null) =>
    [doc?.slug?.current, ...LOCALES.map((l) => doc?.translations?.[l]?.slug?.current)].filter(Boolean) as string[]

  let best: (typeof airport.routes)[number] | null = null
  let bestLength = 0
  let ambiguous = false

  for (const route of airport.routes) {
    for (const destSlug of slugsOf(route.destination)) {
      if (deadRouteSlug !== destSlug && !deadRouteSlug.endsWith(`-${destSlug}`)) continue
      if (destSlug.length > bestLength) {
        best = route
        bestLength = destSlug.length
        ambiguous = false
      } else if (destSlug.length === bestLength && best && route.slug?.current !== best.slug?.current) {
        // Two different routes of this airport claim the same destination tail.
        // Can't tell which one was meant, so don't guess.
        ambiguous = true
      }
    }
  }
  if (!best || ambiguous) return null

  const prefix = locale === defaultLocale ? '' : `/${locale}`
  const target = `${prefix}${getRouteUrl(airport, best, locale)}`
  // Redirecting a URL to itself would loop the browser.
  return target.endsWith(`/${airportSlug}/${deadRouteSlug}/`) ? null : target
}
