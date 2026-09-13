import type { Locale } from '@/lib/i18n/config'

/**
 * Cifras de reseñas de toda la web: portada, pie, contadores, textos de las
 * seis traducciones y el JSON-LD `aggregateRating` de cada página.
 *
 * Son las que publican las plataformas, copiadas a mano el día de `checkedAt`.
 * Para actualizarlas basta con cambiar este objeto y desplegar; ningún otro
 * fichero lleva números de reseñas.
 *
 * Antes la web anunciaba 4,8 / +2.500 reseñas y en el pie 4,9 / +1.800 en
 * Trusted Shops, cuando las reales eran ~820 y 288. Declarar reseñas que no
 * existen hace que Google retire las estrellas y, en la UE, es práctica
 * desleal (RDL 24/2021), así que aquí solo entra lo que se puede comprobar
 * pinchando en `url`.
 *
 * Una plataforma con `rating`/`count` a null no entra en los totales y en el
 * pie se muestra sin cifra, solo con el enlace.
 */
export const REVIEWS_CHECKED_AT = '2026-09-13'

type Platform = {
  name: string
  url: string
  rating: number | null
  count: number | null
}

export const REVIEW_PLATFORMS = {
  trustpilot: {
    name: 'Trustpilot',
    url: 'https://ie.trustpilot.com/review/titantransfers.com',
    rating: 4.6,
    count: 535,
  },
  trustedShops: {
    name: 'Trusted Shops',
    // También en JSON, sin clave: api.trustedshops.com/rest/public/v2/shops/X39CC0944707618A0C37EAA21E972D649/quality.json
    url: 'https://www.trustedshops.eu/buyerrating/info_X39CC0944707618A0C37EAA21E972D649.html',
    rating: 4.73,
    count: 288,
  },
  google: {
    name: 'Google',
    url: 'https://share.google/yx9663y7evY9Sbv75',
    rating: 3.9,
    count: 38,
  },
} satisfies Record<string, Platform>

const counted = (Object.values(REVIEW_PLATFORMS) as Platform[]).filter(
  (p): p is Platform & { rating: number; count: number } => p.rating !== null && p.count !== null,
)

/** Suma exacta de reseñas de las plataformas con cifra (823). Para el JSON-LD. */
export const TOTAL_REVIEWS = counted.reduce((n, p) => n + p.count, 0)

/** Media ponderada por número de reseñas, a un decimal (4,6). */
export const OVERALL_RATING =
  Math.round((counted.reduce((s, p) => s + p.rating * p.count, 0) / TOTAL_REVIEWS) * 10) / 10

/**
 * Lo que se anuncia en los textos: el total redondeado hacia abajo a la
 * centena (823 → 800), para que "más de 800" siga siendo cierto aunque una
 * plataforma pierda alguna reseña antes de la próxima revisión. Trusted Shops
 * solo cuenta los últimos 12 meses, así que su número también puede bajar.
 */
export const REVIEWS_FLOOR = Math.floor(TOTAL_REVIEWS / 100) * 100

const LOCALE_TAG: Record<Locale, string> = {
  en: 'en-GB', es: 'es-ES', it: 'it-IT', de: 'de-DE', ar: 'ar-AE', fr: 'fr-FR',
}

/** "4,6" / "4.6", con el separador decimal del idioma. */
export function formatRating(rating: number, locale: Locale, digits = 1): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale] || 'en-GB', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(rating)
}

/** "800" / "800" — con separador de miles del idioma cuando haga falta. */
export function formatCount(count: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale] || 'en-GB').format(count)
}

/**
 * Sustituye [[RATING]] y [[REVIEWS]] en los mensajes de traducción. Se hace al
 * cargar los mensajes (src/lib/i18n/request.ts) para que los JSON de idiomas
 * no lleven cifras escritas a mano.
 */
export function withReviewFigures<T>(messages: T, locale: Locale): T {
  const rating = formatRating(OVERALL_RATING, locale)
  const reviews = formatCount(REVIEWS_FLOOR, locale)
  const walk = (v: unknown): unknown => {
    if (typeof v === 'string') return v.replaceAll('[[RATING]]', rating).replaceAll('[[REVIEWS]]', reviews)
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]))
    return v
  }
  return walk(messages) as T
}
