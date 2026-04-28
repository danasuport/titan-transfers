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
      en: '/airport-transfers-private-taxi/[slug]/',
      es: '/traslados-aeropuerto-privados-taxi/[slug]/',
    },
    '/airport/[slug]/[routeSlug]/': {
      en: '/airport-transfers-private-taxi/[slug]/[routeSlug]/',
      es: '/traslados-aeropuerto-privados-taxi/[slug]/[routeSlug]/',
    },
    '/cities/': {
      en: '/cities/',
      es: '/ciudades/',
    },
    '/city/[slug]/': {
      en: '/private-transfers/[slug]/',
      es: '/traslados-privados-taxi/[slug]/',
    },
    '/countries/': {
      en: '/countries/',
      es: '/paises/',
    },
    '/country/[slug]/': {
      en: '/private-transfers-country/[slug]/',
      es: '/traslados-privados-pais/[slug]/',
    },
    '/regions/': {
      en: '/regions/',
      es: '/regiones/',
    },
    '/region/[slug]/': {
      en: '/private-transfers-region/[slug]/',
      es: '/traslados-privados-region/[slug]/',
    },
    '/services/': {
      en: '/services/',
      es: '/servicios/',
    },
    '/services/[slug]/': {
      en: '/services/[slug]/',
      es: '/servicios/[slug]/',
    },
    '/blog/': '/blog/',
    '/blog/[slug]/': '/blog/[slug]/',
    '/contact/': {
      en: '/contact/',
      es: '/contacto/',
    },
    '/booking/': {
      en: '/booking/',
      es: '/reserva/',
    },
    '/register/': {
      en: '/register/',
      es: '/registro/',
    },
    '/user-dashboard/': {
      en: '/user-dashboard/',
      es: '/mi-cuenta/',
    },
    '/reset-password/': {
      en: '/reset-password/',
      es: '/restablecer-contrasena/',
    },
    '/forgot-password/': {
      en: '/forgot-password/',
      es: '/recuperar-contrasena/',
    },
    '/login/': {
      en: '/login/',
      es: '/acceso/',
    },
    '/about/': {
      en: '/about/',
      es: '/sobre-nosotros/',
    },
    '/legal/': {
      en: '/legal-notice/',
      es: '/aviso-legal/',
    },
    '/privacy/': {
      en: '/privacy-policy/',
      es: '/politica-de-privacidad/',
    },
    '/terms/': {
      en: '/terms-and-conditions/',
      es: '/terminos-y-condiciones/',
    },
    '/cookies/': {
      en: '/cookie-policy/',
      es: '/politica-de-cookies/',
    },
    '/sitemap-page/': {
      en: '/web-sitemap/',
      es: '/mapa-del-sitio/',
    },
    '/faq/': {
      en: '/faq/',
      es: '/preguntas-frecuentes/',
    },
  },
})
