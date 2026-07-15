// Mirror of the parts of src/lib/i18n/config.ts that scripts need. Scripts are
// plain .mjs and can't import the TypeScript config, so this is a copy — if the
// locale list or the airport path segments change there, change them here too.
// Kept deliberately small: only what's needed to build a route's public URL.

export const locales = ['en', 'es', 'ar', 'it', 'de']
export const defaultLocale = 'en'

export const pathTranslations = {
  airport: {
    en: 'airport-transfers-private-taxi',
    es: 'traslados-aeropuerto-privados-taxi',
    ar: 'nakl-mataar',
    it: 'trasferimenti-aeroporto-taxi-privato',
    de: 'flughafentransfer-privat-taxi',
  },
}
