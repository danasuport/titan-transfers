import { routeKey } from '@/lib/route-key'
import type { Locale } from '@/lib/i18n/config'

// Shows the client's sheet price on a route page as "From …". The price is the
// cheapest vehicle for that route (see getSheetPrices), so it's a genuine "from".

/**
 * The price for a route, tried against every name we know the destination by —
 * the sheet may hold "Roma" where Sanity's title is "Rome", so we match on the
 * title and all its translations, same as the catalogue index does.
 * null when there's no price (route absent, or sheet unavailable).
 */
export function priceForRoute(
  iata: string | null | undefined,
  destinationNames: (string | null | undefined)[],
  prices: Map<string, number> | null,
): number | null {
  if (!prices) return null
  for (const name of destinationNames) {
    const key = routeKey(iata, name)
    if (key && prices.has(key)) return prices.get(key)!
  }
  return null
}

const LOCALE_TAG: Record<Locale, string> = {
  en: 'en-GB', es: 'es-ES', it: 'it-IT', de: 'de-DE', ar: 'ar-AE',
}
const FROM_WORD: Record<Locale, string> = {
  en: 'From', es: 'Desde', it: 'Da', de: 'Ab', ar: 'ابتداءً من',
}

/** "Desde 32,97 €" / "From €32.97" — locale-aware currency, prefixed with "from". */
export function formatFromPrice(amount: number, locale: Locale): string {
  const money = new Intl.NumberFormat(LOCALE_TAG[locale] || 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${FROM_WORD[locale] || FROM_WORD.en} ${money}`
}
