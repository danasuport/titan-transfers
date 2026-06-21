export const locales = ['en', 'es', 'ar', 'it'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  ar: 'العربية',
  it: 'Italiano',
}

// Locales that render right-to-left. Used to set <html dir="rtl"> and to swap
// font families in the root layout.
export const rtlLocales: Locale[] = ['ar']
export function isRtlLocale(locale: string): boolean {
  return (rtlLocales as string[]).includes(locale)
}

export const pathTranslations: Record<string, Record<Locale, string>> = {
  airports: { en: 'airports', es: 'aeropuertos', ar: 'matarat', it: 'aeroporti' },
  airport: { en: 'airport-transfers-private-taxi', es: 'traslados-aeropuerto-privados-taxi', ar: 'nakl-mataar', it: 'trasferimenti-aeroporto-taxi-privato' },
  cities: { en: 'cities', es: 'ciudades', ar: 'mudun', it: 'citta' },
  city: { en: 'city', es: 'ciudad', ar: 'madina', it: 'citta' },
  countries: { en: 'countries', es: 'paises', ar: 'buldan', it: 'paesi' },
  country: { en: 'country', es: 'pais', ar: 'balad', it: 'paese' },
  regions: { en: 'regions', es: 'regiones', ar: 'manatik', it: 'regioni' },
  region: { en: 'region', es: 'region', ar: 'mintaqa', it: 'regione' },
  'private-transfers': { en: 'private-transfers', es: 'traslados-privados-taxi', ar: 'nakl-khass', it: 'trasferimenti-privati-taxi' },
  'private-transfers-country': { en: 'private-transfers-country', es: 'traslados-privados-pais', ar: 'nakl-khass-balad', it: 'trasferimenti-privati-paese' },
  'private-transfers-region': { en: 'private-transfers-region', es: 'traslados-privados-region', ar: 'nakl-khass-mintaqa', it: 'trasferimenti-privati-regione' },
  services: { en: 'services', es: 'servicios', ar: 'khadamat', it: 'servizi' },
  blog: { en: 'blog', es: 'blog', ar: 'mudawana', it: 'blog' },
  contact: { en: 'contact', es: 'contacto', ar: 'tawasul', it: 'contatto' },
  login: { en: 'login', es: 'acceso', ar: 'dukhul', it: 'accesso' },
  about: { en: 'about', es: 'sobre-nosotros', ar: 'man-nahnu', it: 'chi-siamo' },
  faq: { en: 'faq', es: 'preguntas-frecuentes', ar: 'asila-shaaia', it: 'domande-frequenti' },
  to: { en: 'to', es: 'a', ar: 'ila', it: 'a' },
}

export const routePrefixTranslations: Record<string, Record<Locale, string>> = {
  'airport-transfers': { en: 'airport-transfers', es: 'traslados-aeropuerto', ar: 'nakl-mataar', it: 'trasferimenti-aeroporto' },
  'port-transfers': { en: 'port-transfers', es: 'traslados-puerto', ar: 'nakl-mina', it: 'trasferimenti-porto' },
  'train-station-transfers': { en: 'train-station-transfers', es: 'traslados-estacion-tren', ar: 'nakl-mahattat-qitar', it: 'trasferimenti-stazione' },
  'city-to-city': { en: 'city-to-city', es: 'ciudad-a-ciudad', ar: 'madina-ila-madina', it: 'citta-a-citta' },
}
