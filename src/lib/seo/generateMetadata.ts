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
      locale: locale === 'es' ? 'es_ES' : locale === 'it' ? 'it_IT' : locale === 'ar' ? 'ar_AR' : 'en_GB',
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
  } else if (locale === 'it') {
    fallbackTitle = `Trasferimenti aeroporto ${city} — taxi privato prezzo fisso | ${SITE_NAME}`
    fallbackDesc = `Prenota il tuo trasferimento privato da ${airportTitle}. Prezzo fisso, accoglienza in terminal con cartello, autista professionale. Nessun costo nascosto.`
  } else {
    fallbackTitle = `${city} Airport Transfers — Private Taxi Fixed Price | ${SITE_NAME}`
    fallbackDesc = `Book private transfers from ${airportTitle}. Fixed price, meet & greet, 24/7 service. Door-to-door airport taxi service.`
  }

  const title = t?.seoTitle || airport.seoTitle || fallbackTitle
  const description = t?.seoDescription || airport.seoDescription || fallbackDesc
  return { title, description }
}

export function generateRouteMetadata(
  route: { title: string; seoTitle?: string; seoDescription?: string; origin?: { title: string }; destination?: { title: string }; translations?: Record<string, { seoTitle?: string; seoDescription?: string }> },
  locale: Locale,
) {
  const t = locale !== defaultLocale ? route.translations?.[locale] : undefined
  const origin = route.origin?.title || ''
  const destination = route.destination?.title || ''

  let fallbackTitle: string
  let fallbackDesc: string

  if (locale === 'es') {
    fallbackTitle = `Transfer privado de ${origin} a ${destination} — taxi precio fijo | ${SITE_NAME}`
    fallbackDesc = `Reserva tu traslado privado de ${origin} a ${destination}. Precio fijo, conductor profesional, servicio puerta a puerta 24/7. Sin sorpresas.`
  } else if (locale === 'it') {
    fallbackTitle = `Transfer privato da ${origin} a ${destination} — taxi prezzo fisso | ${SITE_NAME}`
    fallbackDesc = `Prenota il tuo trasferimento privato da ${origin} a ${destination}. Prezzo fisso, autista professionale, servizio porta a porta 24/7. Nessuna sorpresa.`
  } else {
    fallbackTitle = `Private Transfer from ${origin} to ${destination} | Fixed Price Taxi | ${SITE_NAME}`
    fallbackDesc = `Book your private transfer from ${origin} to ${destination}. Fixed price, meet & greet, 24/7 service.`
  }

  const title = t?.seoTitle || route.seoTitle || fallbackTitle
  const description = t?.seoDescription || route.seoDescription || fallbackDesc
  return { title, description }
}

export function generateCityMetadata(city: { title: string; seoTitle?: string; seoDescription?: string; translations?: Record<string, { title?: string; seoTitle?: string; seoDescription?: string }> }, locale: Locale) {
  const t = locale !== defaultLocale ? city.translations?.[locale] : undefined
  const cityTitle = t?.title || city.title
  let fallbackTitle: string
  let fallbackDesc: string

  if (locale === 'es') {
    fallbackTitle = `Traslados privados en ${cityTitle} — taxi aeropuerto y ciudad | ${SITE_NAME}`
    fallbackDesc = `Transfers privados en ${cityTitle} con precio fijo. Traslado aeropuerto, puerto y ciudad a ciudad. Conductor profesional, reserva online al instante.`
  } else if (locale === 'it') {
    fallbackTitle = `Trasferimenti privati a ${cityTitle} — taxi aeroporto e città | ${SITE_NAME}`
    fallbackDesc = `Trasferimenti privati a ${cityTitle} a prezzo fisso. Transfer aeroporto, porto e città. Autista professionale, prenotazione online immediata.`
  } else {
    fallbackTitle = `Private Transfers in ${cityTitle} | Airport, Port & City Transfers | ${SITE_NAME}`
    fallbackDesc = `Book private transfers in ${cityTitle}. Airport transfers, port transfers, and city-to-city service. Fixed price, professional driver.`
  }

  const title = t?.seoTitle || city.seoTitle || fallbackTitle
  const description = t?.seoDescription || city.seoDescription || fallbackDesc
  return { title, description }
}

export function generateCountryMetadata(country: { title: string; seoTitle?: string; seoDescription?: string; translations?: Record<string, { title?: string; seoTitle?: string; seoDescription?: string }> }, locale: Locale) {
  const t = locale !== defaultLocale ? country.translations?.[locale] : undefined
  const countryTitle = t?.title || country.title
  let fallbackTitle: string
  let fallbackDesc: string

  if (locale === 'es') {
    fallbackTitle = `Traslados privados en ${countryTitle} — transfers aeropuerto taxi | ${SITE_NAME}`
    fallbackDesc = `Reserva tu transfer privado en ${countryTitle}. Aeropuertos, ciudades y rutas con precio fijo y conductor profesional. Servicio 24/7.`
  } else if (locale === 'it') {
    fallbackTitle = `Trasferimenti privati in ${countryTitle} — transfer aeroporto taxi | ${SITE_NAME}`
    fallbackDesc = `Prenota il tuo transfer privato in ${countryTitle}. Aeroporti, città e tratte a prezzo fisso con autista professionale. Servizio 24/7.`
  } else {
    fallbackTitle = `Private Transfers in ${countryTitle} | Airport & City Taxi | ${SITE_NAME}`
    fallbackDesc = `Book private transfers across ${countryTitle}. Airport, port and city transfers with fixed prices and professional drivers.`
  }

  const title = t?.seoTitle || country.seoTitle || fallbackTitle
  const description = t?.seoDescription || country.seoDescription || fallbackDesc
  return { title, description }
}

export function generateRegionMetadata(region: { title: string; seoTitle?: string; seoDescription?: string; translations?: Record<string, { title?: string; seoTitle?: string; seoDescription?: string }> }, locale: Locale) {
  const t = locale !== defaultLocale ? region.translations?.[locale] : undefined
  const regionTitle = t?.title || region.title
  let fallbackTitle: string
  let fallbackDesc: string

  if (locale === 'es') {
    fallbackTitle = `Transfer privado en ${regionTitle} — traslados taxi aeropuerto | ${SITE_NAME}`
    fallbackDesc = `Traslados privados en ${regionTitle} con precio fijo. Transfer aeropuerto, resort y ciudad a ciudad. Conductor profesional, cancelación gratuita.`
  } else if (locale === 'it') {
    fallbackTitle = `Transfer privato in ${regionTitle} — trasferimenti taxi aeroporto | ${SITE_NAME}`
    fallbackDesc = `Trasferimenti privati in ${regionTitle} a prezzo fisso. Transfer aeroporto, resort e città. Autista professionale, cancellazione gratuita.`
  } else {
    fallbackTitle = `Private Transfers in ${regionTitle} | Airport & Resort Taxi | ${SITE_NAME}`
    fallbackDesc = `Book private transfers in ${regionTitle}. Airport to resort, city-to-city and more. Fixed price, professional driver.`
  }

  const title = t?.seoTitle || region.seoTitle || fallbackTitle
  const description = t?.seoDescription || region.seoDescription || fallbackDesc
  return { title, description }
}

export function generateBlogMetadata(post: { title: string; seoTitle?: string; seoDescription?: string; excerpt?: string; translations?: Record<string, { title?: string; seoTitle?: string; seoDescription?: string }> }, locale: Locale) {
  const t = locale !== defaultLocale ? post.translations?.[locale] : undefined
  const title = t?.seoTitle || post.seoTitle || `${t?.title || post.title} | ${SITE_NAME} Blog`
  const description = t?.seoDescription || post.seoDescription || post.excerpt || post.title
  return { title, description }
}
