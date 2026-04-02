export const locales = ['en', 'es', 'de', 'fr', 'nl', 'it', 'zh', 'no', 'sv', 'ga', 'da'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  nl: 'Nederlands',
  it: 'Italiano',
  zh: '中文',
  no: 'Norsk',
  sv: 'Svenska',
  ga: 'Gaeilge',
  da: 'Dansk',
}

export const pathTranslations: Record<string, Record<Locale, string>> = {
  airports: { en: 'airports', es: 'aeropuertos' },
  airport: { en: 'airport-transfers-private-taxi', es: 'traslados-aeropuerto-privados-taxi' },
  cities: { en: 'cities', es: 'ciudades' },
  city: { en: 'city', es: 'ciudad' },
  countries: { en: 'countries', es: 'paises' },
  country: { en: 'country', es: 'pais' },
  regions: { en: 'regions', es: 'regiones' },
  region: { en: 'region', es: 'region' },
  'private-transfers': { en: 'private-transfers', es: 'traslados-privados-taxi' },
  services: { en: 'services', es: 'servicios' },
  blog: { en: 'blog', es: 'blog' },
  contact: { en: 'contact', es: 'contacto' },
  login: { en: 'login', es: 'acceso' },
  about: { en: 'about', es: 'sobre-nosotros' },
  faq: { en: 'faq', es: 'preguntas-frecuentes' },
  to: { en: 'to', es: 'a' },
}

export const routePrefixTranslations: Record<string, Record<Locale, string>> = {
  'airport-transfers': { en: 'airport-transfers', es: 'traslados-aeropuerto' },
  'port-transfers': { en: 'port-transfers', es: 'traslados-puerto' },
  'train-station-transfers': { en: 'train-station-transfers', es: 'traslados-estacion-tren' },
  'city-to-city': { en: 'city-to-city', es: 'ciudad-a-ciudad' },
}
