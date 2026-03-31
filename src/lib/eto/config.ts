export const ETO_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_ETO_URL || 'https://www.titantransfers.es/eto/',
  siteKey: process.env.NEXT_PUBLIC_ETO_SITE_KEY || '',
  defaultLang: 'en-GB',
}

export const LOCALE_TO_ETO_LANG: Record<string, string> = {
  en: 'en-GB',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-PT',
  nl: 'nl-NL',
  ru: 'ru-RU',
}

const TYPE_TO_PATH: Record<ETOIframeType, string> = {
  'booking-widget': 'booking/widget',
  'booking': 'booking',
  'customer': 'customer',
  'driver': 'driver',
  'admin': 'admin',
}

export type ETOIframeType = 'booking-widget' | 'booking' | 'customer' | 'driver' | 'admin'

export interface ETOBookingParams {
  siteKey?: string
  lang?: string
  bookingType?: string
  fromCategory?: string
  fromLocation?: string
  toCategory?: string
  toLocation?: string
  date?: string
  returnTrip?: boolean
  returnFromCategory?: string
  returnFromLocation?: string
  returnToCategory?: string
  returnToLocation?: string
  returnDate?: string
  serviceId?: string
  serviceDuration?: string
}

export function buildETOUrl(type: ETOIframeType, params: ETOBookingParams = {}): string {
  const base = ETO_CONFIG.baseUrl.replace(/\/+$/, '')
  const path = TYPE_TO_PATH[type]
  const url = new URL(`${base}/${path}`)

  const siteKey = params.siteKey || ETO_CONFIG.siteKey
  if (siteKey) url.searchParams.set('site_key', siteKey)
  if (params.lang) url.searchParams.set('lang', params.lang)
  if (params.bookingType) url.searchParams.set('bookingType', params.bookingType)
  if (params.fromCategory) url.searchParams.set('r1cs', params.fromCategory)
  if (params.fromLocation) url.searchParams.set('r1ls', params.fromLocation)
  if (params.toCategory) url.searchParams.set('r1ce', params.toCategory)
  if (params.toLocation) url.searchParams.set('r1le', params.toLocation)
  if (params.date) url.searchParams.set('r1d', params.date)
  if (params.returnTrip) {
    url.searchParams.set('r', '2')
    if (params.returnFromCategory) url.searchParams.set('r2cs', params.returnFromCategory)
    if (params.returnFromLocation) url.searchParams.set('r2ls', params.returnFromLocation)
    if (params.returnToCategory) url.searchParams.set('r2ce', params.returnToCategory)
    if (params.returnToLocation) url.searchParams.set('r2le', params.returnToLocation)
    if (params.returnDate) url.searchParams.set('r2d', params.returnDate)
  }
  if (params.serviceId) url.searchParams.set('s', params.serviceId)
  if (params.serviceDuration) url.searchParams.set('sd', params.serviceDuration)

  return url.toString()
}
