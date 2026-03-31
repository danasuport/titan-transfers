import { defaultLocale, pathTranslations, type Locale } from '@/lib/i18n/config'

type WithSlugAndTranslations = {
  slug: { current: string }
  translations?: Record<string, { slug?: { current: string }; title?: string }>
}

export function getLocalizedPath(segment: string, locale: Locale): string {
  return pathTranslations[segment]?.[locale] || segment
}

export function getTranslatedSlug(item: WithSlugAndTranslations, locale: Locale): string {
  if (locale === defaultLocale) return item.slug.current
  return item.translations?.[locale]?.slug?.current || item.slug.current
}

export function getTranslatedTitle(item: { title: string; translations?: Record<string, { title?: string }> }, locale: Locale): string {
  if (locale === defaultLocale) return item.title
  return item.translations?.[locale]?.title || item.title
}

// URL builders — accept either a raw slug string or an object with translations
function resolveSlug(slugOrItem: string | WithSlugAndTranslations, locale: Locale): string {
  if (typeof slugOrItem === 'string') return slugOrItem
  return getTranslatedSlug(slugOrItem, locale)
}

export function getAirportUrl(slugOrItem: string | WithSlugAndTranslations, locale: Locale): string {
  const segment = getLocalizedPath('airport', locale)
  const slug = resolveSlug(slugOrItem, locale)
  return `/${segment}/${slug}/`
}

export function getRouteUrl(airportSlugOrItem: string | WithSlugAndTranslations, routeSlugOrItem: string | WithSlugAndTranslations, locale: Locale): string {
  const segment = getLocalizedPath('airport', locale)
  const airportSlug = resolveSlug(airportSlugOrItem, locale)
  const routeSlug = resolveSlug(routeSlugOrItem, locale)
  return `/${segment}/${airportSlug}/${routeSlug}/`
}

export function getCityUrl(slugOrItem: string | WithSlugAndTranslations, locale: Locale): string {
  const segment = getLocalizedPath('city', locale)
  const slug = resolveSlug(slugOrItem, locale)
  return `/${segment}/${slug}/`
}

export function getCountryUrl(slugOrItem: string | WithSlugAndTranslations, locale: Locale): string {
  const segment = getLocalizedPath('country', locale)
  const slug = resolveSlug(slugOrItem, locale)
  return `/${segment}/${slug}/`
}

export function getRegionUrl(slugOrItem: string | WithSlugAndTranslations, locale: Locale): string {
  const segment = getLocalizedPath('region', locale)
  const slug = resolveSlug(slugOrItem, locale)
  return `/${segment}/${slug}/`
}

export function getServiceUrl(slugOrItem: string | WithSlugAndTranslations, locale: Locale): string {
  const segment = getLocalizedPath('services', locale)
  const slug = resolveSlug(slugOrItem, locale)
  return `/${segment}/${slug}/`
}

export function getBlogUrl(slugOrItem: string | WithSlugAndTranslations, locale: Locale): string {
  const segment = getLocalizedPath('blog', locale)
  const slug = resolveSlug(slugOrItem, locale)
  return `/${segment}/${slug}/`
}

export function getBlogListUrl(locale: Locale): string {
  const segment = getLocalizedPath('blog', locale)
  return `/${segment}/`
}

export function buildLocalizedUrl(segments: string[], locale: Locale): string {
  const translatedSegments = segments.map((s) => {
    if (s.startsWith('[')) return s
    return getLocalizedPath(s, locale) || s
  })
  return `/${translatedSegments.join('/')}/`
}
