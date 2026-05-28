import { defineRouting } from 'next-intl/routing'
import { locales, defaultLocale } from './config'

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: {
    mode: 'as-needed',
  },
  // Never auto-redirect based on Accept-Language. Visitors land in the default
  // locale (English) and we show a popup suggesting Spanish if their browser is in ES.
  localeDetection: false,
  pathnames: {
    '/': '/',
    '/airports/': {
      en: '/airports/',
      es: '/aeropuertos/',
      ar: '/matarat/',
    },
    '/airport/[slug]/': {
      en: '/airport-transfers-private-taxi/[slug]/',
      es: '/traslados-aeropuerto-privados-taxi/[slug]/',
      ar: '/nakl-mataar/[slug]/',
    },
    '/airport/[slug]/[routeSlug]/': {
      en: '/airport-transfers-private-taxi/[slug]/[routeSlug]/',
      es: '/traslados-aeropuerto-privados-taxi/[slug]/[routeSlug]/',
      ar: '/nakl-mataar/[slug]/[routeSlug]/',
    },
    '/cities/': {
      en: '/cities/',
      es: '/ciudades/',
      ar: '/mudun/',
    },
    '/city/[slug]/': {
      en: '/private-transfers/[slug]/',
      es: '/traslados-privados-taxi/[slug]/',
      ar: '/nakl-khass/[slug]/',
    },
    '/countries/': {
      en: '/countries/',
      es: '/paises/',
      ar: '/buldan/',
    },
    '/country/[slug]/': {
      en: '/private-transfers-country/[slug]/',
      es: '/traslados-privados-pais/[slug]/',
      ar: '/nakl-khass-balad/[slug]/',
    },
    '/regions/': {
      en: '/regions/',
      es: '/regiones/',
      ar: '/manatik/',
    },
    '/region/[slug]/': {
      en: '/private-transfers-region/[slug]/',
      es: '/traslados-privados-region/[slug]/',
      ar: '/nakl-khass-mintaqa/[slug]/',
    },
    '/services/': {
      en: '/services/',
      es: '/servicios/',
      ar: '/khadamat/',
    },
    '/services/[slug]/': {
      en: '/services/[slug]/',
      es: '/servicios/[slug]/',
      ar: '/khadamat/[slug]/',
    },
    '/blog/': {
      en: '/blog/',
      es: '/blog/',
      ar: '/mudawana/',
    },
    '/blog/[slug]/': {
      en: '/blog/[slug]/',
      es: '/blog/[slug]/',
      ar: '/mudawana/[slug]/',
    },
    '/contact/': {
      en: '/contact/',
      es: '/contacto/',
      ar: '/tawasul/',
    },
    '/booking/': {
      en: '/booking/',
      es: '/reserva/',
      ar: '/hajz/',
    },
    '/register/': {
      en: '/register/',
      es: '/registro/',
      ar: '/tasjeel/',
    },
    '/user-dashboard/': {
      en: '/user-dashboard/',
      es: '/mi-cuenta/',
      ar: '/hisabi/',
    },
    '/reset-password/': {
      en: '/reset-password/',
      es: '/restablecer-contrasena/',
      ar: '/taghyir-kalimat-mururor/',
    },
    '/forgot-password/': {
      en: '/forgot-password/',
      es: '/recuperar-contrasena/',
      ar: '/nasit-kalimat-mururor/',
    },
    '/login/': {
      en: '/login/',
      es: '/acceso/',
      ar: '/dukhul/',
    },
    '/about/': {
      en: '/about/',
      es: '/sobre-nosotros/',
      ar: '/man-nahnu/',
    },
    '/legal/': {
      en: '/legal-notice/',
      es: '/aviso-legal/',
      ar: '/ishaar-kanuni/',
    },
    '/privacy/': {
      en: '/privacy-policy/',
      es: '/politica-de-privacidad/',
      ar: '/siyasat-khususiya/',
    },
    '/terms/': {
      en: '/terms-and-conditions/',
      es: '/terminos-y-condiciones/',
      ar: '/shurut-wa-ahkam/',
    },
    '/cookies/': {
      en: '/cookie-policy/',
      es: '/politica-de-cookies/',
      ar: '/siyasat-cookies/',
    },
    '/sitemap-page/': {
      en: '/web-sitemap/',
      es: '/mapa-del-sitio/',
      ar: '/kharitat-mawqaa/',
    },
    '/faq/': {
      en: '/faq/',
      es: '/preguntas-frecuentes/',
      ar: '/asila-shaaia/',
    },
  },
})
