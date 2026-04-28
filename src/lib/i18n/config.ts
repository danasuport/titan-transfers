export const locales = ['en', 'es'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
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
  'private-transfers-country': { en: 'private-transfers-country', es: 'traslados-privados-pais' },
  'private-transfers-region': { en: 'private-transfers-region', es: 'traslados-privados-region' },
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
