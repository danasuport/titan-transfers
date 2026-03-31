import type { Metadata } from 'next'
import { defaultLocale, type Locale } from '@/lib/i18n/config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://titantransfers.com'
const SITE_NAME = 'Titan Transfers'

interface MetadataParams {
  title: string
  description: string
  path: string
  locale: Locale
  alternates?: { locale: Locale; path: string }[]
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
}

export function generatePageMetadata({
  title,
  description,
  path,
  locale,
  alternates = [],
  image,
  type = 'website',
  publishedTime,
}: MetadataParams): Metadata {
  const url = `${SITE_URL}${path}`
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`

  const languages: Record<string, string> = {}
  for (const alt of alternates) {
    languages[alt.locale] = `${SITE_URL}${alt.path}`
  }
  languages['x-default'] = `${SITE_URL}${alternates.find((a) => a.locale === defaultLocale)?.path || path}`

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: locale === 'es' ? 'es_ES' : 'en_GB',
      type,
      ...(image && { images: [{ url: image, width: 1200, height: 630 }] }),
      ...(publishedTime && { publishedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      ...(image && { images: [image] }),
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export function generateAirportMetadata(airport: { title: string; seoTitle?: string; seoDescription?: string; translations?: Record<string, { title?: string; seoTitle?: string; seoDescription?: string }> }, locale: Locale) {
  const t = locale !== defaultLocale ? airport.translations?.[locale] : undefined
  const airportTitle = t?.title || airport.title
  const title = t?.seoTitle || airport.seoTitle || `${airportTitle} Transfers | Private Airport Transfers | ${SITE_NAME}`
  const description = t?.seoDescription || airport.seoDescription || `Book private transfers from ${airportTitle}. Fixed price, meet & greet, 24/7 service. Door-to-door airport taxi service.`
  return { title, description }
}

export function generateRouteMetadata(route: { title: string; seoTitle?: string; seoDescription?: string; origin?: { title: string }; destination?: { title: string } }, locale: Locale) {
  const title = route.seoTitle || `Private Transfer from ${route.origin?.title} to ${route.destination?.title} | ${SITE_NAME}`
  const description = route.seoDescription || `Book your private transfer from ${route.origin?.title} to ${route.destination?.title}. Fixed price, meet & greet, 24/7 service.`
  return { title, description }
}

export function generateCityMetadata(city: { title: string; seoTitle?: string; seoDescription?: string }, locale: Locale) {
  const title = city.seoTitle || `Private Transfers in ${city.title} | Airport, Port & City Transfers | ${SITE_NAME}`
  const description = city.seoDescription || `Book private transfers in ${city.title}. Airport transfers, port transfers, and city-to-city service.`
  return { title, description }
}

export function generateCountryMetadata(country: { title: string; seoTitle?: string; seoDescription?: string }, locale: Locale) {
  const title = country.seoTitle || `Private Transfers in ${country.title} | ${SITE_NAME}`
  const description = country.seoDescription || `Book private transfers across ${country.title}. Airport, port and city transfers with fixed prices.`
  return { title, description }
}

export function generateRegionMetadata(region: { title: string; seoTitle?: string; seoDescription?: string }, locale: Locale) {
  const title = region.seoTitle || `Private Transfers in ${region.title} | Book Your Ride | ${SITE_NAME}`
  const description = region.seoDescription || `Book private transfers in ${region.title}. Airport to resort, city-to-city and more.`
  return { title, description }
}

export function generateBlogMetadata(post: { title: string; seoTitle?: string; seoDescription?: string; excerpt?: string }, locale: Locale) {
  const title = post.seoTitle || `${post.title} | ${SITE_NAME} Blog`
  const description = post.seoDescription || post.excerpt || post.title
  return { title, description }
}
