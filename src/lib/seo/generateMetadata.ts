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

export function generateAirportMetadata(
  airport: { title: string; seoTitle?: string; seoDescription?: string; translations?: Record<string, { title?: string; seoTitle?: string; seoDescription?: string }> },
  locale: Locale,
  cityTitle?: string,
) {
  const t = locale !== defaultLocale ? airport.translations?.[locale] : undefined
  const airportTitle = t?.title || airport.title
  const city = cityTitle || airportTitle

  let fallbackTitle: string
  let fallbackDesc: string

  if (locale === 'es') {
    fallbackTitle = `Traslado aeropuerto ${city} — taxi privado precio fijo | ${SITE_NAME}`
    fallbackDesc = `Reserva tu traslado privado desde ${airportTitle}. Precio fijo, recogida en terminal con cartel, conductor profesional. Sin cargos ocultos.`
  } else {
    fallbackTitle = `${city} Airport Transfers — Private Taxi Fixed Price | ${SITE_NAME}`
    fallbackDesc = `Book private transfers from ${airportTitle}. Fixed price, meet & greet, 24/7 service. Door-to-door airport taxi service.`
  }

  const title = t?.seoTitle || airport.seoTitle || fallbackTitle
  const description = t?.seoDescription || airport.seoDescription || fallbackDesc
  return { title, description }
}

export function generateRouteMetadata(
  route: { title: string; seoTitle?: string; seoDescription?: string; origin?: { title: string }; destination?: { title: string } },
  locale: Locale,
) {
  const origin = route.origin?.title || ''
  const destination = route.destination?.title || ''

  let fallbackTitle: string
  let fallbackDesc: string

  if (locale === 'es') {
    fallbackTitle = `Transfer privado de ${origin} a ${destination} — taxi precio fijo | ${SITE_NAME}`
    fallbackDesc = `Reserva tu traslado privado de ${origin} a ${destination}. Precio fijo, conductor profesional, servicio puerta a puerta 24/7. Sin sorpresas.`
  } else {
    fallbackTitle = `Private Transfer from ${origin} to ${destination} | Fixed Price Taxi | ${SITE_NAME}`
    fallbackDesc = `Book your private transfer from ${origin} to ${destination}. Fixed price, meet & greet, 24/7 service.`
  }

  const title = route.seoTitle || fallbackTitle
  const description = route.seoDescription || fallbackDesc
  return { title, description }
}

export function generateCityMetadata(city: { title: string; seoTitle?: string; seoDescription?: string }, locale: Locale) {
  let fallbackTitle: string
  let fallbackDesc: string

  if (locale === 'es') {
    fallbackTitle = `Traslados privados en ${city.title} — taxi aeropuerto y ciudad | ${SITE_NAME}`
    fallbackDesc = `Transfers privados en ${city.title} con precio fijo. Traslado aeropuerto, puerto y ciudad a ciudad. Conductor profesional, reserva online al instante.`
  } else {
    fallbackTitle = `Private Transfers in ${city.title} | Airport, Port & City Transfers | ${SITE_NAME}`
    fallbackDesc = `Book private transfers in ${city.title}. Airport transfers, port transfers, and city-to-city service. Fixed price, professional driver.`
  }

  const title = city.seoTitle || fallbackTitle
  const description = city.seoDescription || fallbackDesc
  return { title, description }
}

export function generateCountryMetadata(country: { title: string; seoTitle?: string; seoDescription?: string }, locale: Locale) {
  let fallbackTitle: string
  let fallbackDesc: string

  if (locale === 'es') {
    fallbackTitle = `Traslados privados en ${country.title} — transfers aeropuerto taxi | ${SITE_NAME}`
    fallbackDesc = `Reserva tu transfer privado en ${country.title}. Aeropuertos, ciudades y rutas con precio fijo y conductor profesional. Servicio 24/7.`
  } else {
    fallbackTitle = `Private Transfers in ${country.title} | Airport & City Taxi | ${SITE_NAME}`
    fallbackDesc = `Book private transfers across ${country.title}. Airport, port and city transfers with fixed prices and professional drivers.`
  }

  const title = country.seoTitle || fallbackTitle
  const description = country.seoDescription || fallbackDesc
  return { title, description }
}

export function generateRegionMetadata(region: { title: string; seoTitle?: string; seoDescription?: string }, locale: Locale) {
  let fallbackTitle: string
  let fallbackDesc: string

  if (locale === 'es') {
    fallbackTitle = `Transfer privado en ${region.title} — traslados taxi aeropuerto | ${SITE_NAME}`
    fallbackDesc = `Traslados privados en ${region.title} con precio fijo. Transfer aeropuerto, resort y ciudad a ciudad. Conductor profesional, cancelación gratuita.`
  } else {
    fallbackTitle = `Private Transfers in ${region.title} | Airport & Resort Taxi | ${SITE_NAME}`
    fallbackDesc = `Book private transfers in ${region.title}. Airport to resort, city-to-city and more. Fixed price, professional driver.`
  }

  const title = region.seoTitle || fallbackTitle
  const description = region.seoDescription || fallbackDesc
  return { title, description }
}

export function generateBlogMetadata(post: { title: string; seoTitle?: string; seoDescription?: string; excerpt?: string }, locale: Locale) {
  const title = post.seoTitle || `${post.title} | ${SITE_NAME} Blog`
  const description = post.seoDescription || post.excerpt || post.title
  return { title, description }
}
