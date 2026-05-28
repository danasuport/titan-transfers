export const locales = ['en', 'es', 'ar'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  ar: 'العربية',
}

// Locales that render right-to-left. Used to set <html dir="rtl"> and to swap
// font families in the root layout.
export const rtlLocales: Locale[] = ['ar']
export function isRtlLocale(locale: string): boolean {
  return (rtlLocales as string[]).includes(locale)
}

export const pathTranslations: Record<string, Record<Locale, string>> = {
  airports: { en: 'airports', es: 'aeropuertos', ar: 'matarat' },
  airport: { en: 'airport-transfers-private-taxi', es: 'traslados-aeropuerto-privados-taxi', ar: 'nakl-mataar' },
  cities: { en: 'cities', es: 'ciudades', ar: 'mudun' },
  city: { en: 'city', es: 'ciudad', ar: 'madina' },
  countries: { en: 'countries', es: 'paises', ar: 'buldan' },
  country: { en: 'country', es: 'pais', ar: 'balad' },
  regions: { en: 'regions', es: 'regiones', ar: 'manatik' },
  region: { en: 'region', es: 'region', ar: 'mintaqa' },
  'private-transfers': { en: 'private-transfers', es: 'traslados-privados-taxi', ar: 'nakl-khass' },
  'private-transfers-country': { en: 'private-transfers-country', es: 'traslados-privados-pais', ar: 'nakl-khass-balad' },
  'private-transfers-region': { en: 'private-transfers-region', es: 'traslados-privados-region', ar: 'nakl-khass-mintaqa' },
  services: { en: 'services', es: 'servicios', ar: 'khadamat' },
  blog: { en: 'blog', es: 'blog', ar: 'mudawana' },
  contact: { en: 'contact', es: 'contacto', ar: 'tawasul' },
  login: { en: 'login', es: 'acceso', ar: 'dukhul' },
  about: { en: 'about', es: 'sobre-nosotros', ar: 'man-nahnu' },
  faq: { en: 'faq', es: 'preguntas-frecuentes', ar: 'asila-shaaia' },
  to: { en: 'to', es: 'a', ar: 'ila' },
}

export const routePrefixTranslations: Record<string, Record<Locale, string>> = {
  'airport-transfers': { en: 'airport-transfers', es: 'traslados-aeropuerto', ar: 'nakl-mataar' },
  'port-transfers': { en: 'port-transfers', es: 'traslados-puerto', ar: 'nakl-mina' },
  'train-station-transfers': { en: 'train-station-transfers', es: 'traslados-estacion-tren', ar: 'nakl-mahattat-qitar' },
  'city-to-city': { en: 'city-to-city', es: 'ciudad-a-ciudad', ar: 'madina-ila-madina' },
}
