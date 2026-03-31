import { defineRouting } from 'next-intl/routing'
import { locales, defaultLocale } from './config'

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: {
    mode: 'as-needed',
  },
  pathnames: {
    '/': '/',
    '/airports/': {
      en: '/airports/',
      es: '/aeropuertos/',
    },
    '/airport/[slug]/': {
      en: '/airport/[slug]/',
      es: '/aeropuerto/[slug]/',
    },
    '/airport/[slug]/[routeSlug]/': {
      en: '/airport/[slug]/[routeSlug]/',
      es: '/aeropuerto/[slug]/[routeSlug]/',
    },
    '/cities/': {
      en: '/cities/',
      es: '/ciudades/',
    },
    '/city/[slug]/': {
      en: '/city/[slug]/',
      es: '/ciudad/[slug]/',
    },
    '/countries/': {
      en: '/countries/',
      es: '/paises/',
    },
    '/country/[slug]/': {
      en: '/country/[slug]/',
      es: '/pais/[slug]/',
    },
    '/regions/': {
      en: '/regions/',
      es: '/regiones/',
    },
    '/region/[slug]/': {
      en: '/region/[slug]/',
      es: '/region/[slug]/',
    },
    '/services/': {
      en: '/services/',
      es: '/servicios/',
    },
    '/services/[slug]/': {
      en: '/services/[slug]/',
      es: '/servicios/[slug]/',
    },
    '/blog/': {
      en: '/blog/',
      es: '/blog/',
    },
    '/blog/[slug]/': {
      en: '/blog/[slug]/',
      es: '/blog/[slug]/',
    },
    '/contact/': {
      en: '/contact/',
      es: '/contacto/',
    },
    '/login/': {
      en: '/login/',
      es: '/acceso/',
    },
    '/about/': {
      en: '/about/',
      es: '/sobre-nosotros/',
    },
    '/faq/': {
      en: '/faq/',
      es: '/preguntas-frecuentes/',
    },
  },
})
