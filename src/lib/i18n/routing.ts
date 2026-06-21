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
      it: '/aeroporti/',
    },
    '/airport/[slug]/': {
      en: '/airport-transfers-private-taxi/[slug]/',
      es: '/traslados-aeropuerto-privados-taxi/[slug]/',
      ar: '/nakl-mataar/[slug]/',
      it: '/trasferimenti-aeroporto-taxi-privato/[slug]/',
    },
    '/airport/[slug]/[routeSlug]/': {
      en: '/airport-transfers-private-taxi/[slug]/[routeSlug]/',
      es: '/traslados-aeropuerto-privados-taxi/[slug]/[routeSlug]/',
      ar: '/nakl-mataar/[slug]/[routeSlug]/',
      it: '/trasferimenti-aeroporto-taxi-privato/[slug]/[routeSlug]/',
    },
    '/cities/': {
      en: '/cities/',
      es: '/ciudades/',
      ar: '/mudun/',
      it: '/citta/',
    },
    '/city/[slug]/': {
      en: '/private-transfers/[slug]/',
      es: '/traslados-privados-taxi/[slug]/',
      ar: '/nakl-khass/[slug]/',
      it: '/trasferimenti-privati-taxi/[slug]/',
    },
    '/countries/': {
      en: '/countries/',
      es: '/paises/',
      ar: '/buldan/',
      it: '/paesi/',
    },
    '/country/[slug]/': {
      en: '/private-transfers-country/[slug]/',
      es: '/traslados-privados-pais/[slug]/',
      ar: '/nakl-khass-balad/[slug]/',
      it: '/trasferimenti-privati-paese/[slug]/',
    },
    '/regions/': {
      en: '/regions/',
      es: '/regiones/',
      ar: '/manatik/',
      it: '/regioni/',
    },
    '/region/[slug]/': {
      en: '/private-transfers-region/[slug]/',
      es: '/traslados-privados-region/[slug]/',
      ar: '/nakl-khass-mintaqa/[slug]/',
      it: '/trasferimenti-privati-regione/[slug]/',
    },
    '/services/': {
      en: '/services/',
      es: '/servicios/',
      ar: '/khadamat/',
      it: '/servizi/',
    },
    '/services/[slug]/': {
      en: '/services/[slug]/',
      es: '/servicios/[slug]/',
      ar: '/khadamat/[slug]/',
      it: '/servizi/[slug]/',
    },
    '/blog/': {
      en: '/blog/',
      es: '/blog/',
      ar: '/mudawana/',
      it: '/blog/',
    },
    '/blog/[slug]/': {
      en: '/blog/[slug]/',
      es: '/blog/[slug]/',
      ar: '/mudawana/[slug]/',
      it: '/blog/[slug]/',
    },
    '/contact/': {
      en: '/contact/',
      es: '/contacto/',
      ar: '/tawasul/',
      it: '/contatto/',
    },
    '/booking/': {
      en: '/booking/',
      es: '/reserva/',
      ar: '/hajz/',
      it: '/prenotazione/',
    },
    '/register/': {
      en: '/register/',
      es: '/registro/',
      ar: '/tasjeel/',
      it: '/registrazione/',
    },
    '/user-dashboard/': {
      en: '/user-dashboard/',
      es: '/mi-cuenta/',
      ar: '/hisabi/',
      it: '/il-mio-account/',
    },
    '/reset-password/': {
      en: '/reset-password/',
      es: '/restablecer-contrasena/',
      ar: '/taghyir-kalimat-mururor/',
      it: '/reimposta-password/',
    },
    '/forgot-password/': {
      en: '/forgot-password/',
      es: '/recuperar-contrasena/',
      ar: '/nasit-kalimat-mururor/',
      it: '/password-dimenticata/',
    },
    '/login/': {
      en: '/login/',
      es: '/acceso/',
      ar: '/dukhul/',
      it: '/accesso/',
    },
    '/about/': {
      en: '/about/',
      es: '/sobre-nosotros/',
      ar: '/man-nahnu/',
      it: '/chi-siamo/',
    },
    '/legal/': {
      en: '/legal-notice/',
      es: '/aviso-legal/',
      ar: '/ishaar-kanuni/',
      it: '/note-legali/',
    },
    '/privacy/': {
      en: '/privacy-policy/',
      es: '/politica-de-privacidad/',
      ar: '/siyasat-khususiya/',
      it: '/informativa-privacy/',
    },
    '/terms/': {
      en: '/terms-and-conditions/',
      es: '/terminos-y-condiciones/',
      ar: '/shurut-wa-ahkam/',
      it: '/termini-e-condizioni/',
    },
    '/cookies/': {
      en: '/cookie-policy/',
      es: '/politica-de-cookies/',
      ar: '/siyasat-cookies/',
      it: '/informativa-cookie/',
    },
    '/sitemap-page/': {
      en: '/web-sitemap/',
      es: '/mapa-del-sitio/',
      ar: '/kharitat-mawqaa/',
      it: '/mappa-del-sito/',
    },
    '/faq/': {
      en: '/faq/',
      es: '/preguntas-frecuentes/',
      ar: '/asila-shaaia/',
      it: '/domande-frequenti/',
    },
  },
})
