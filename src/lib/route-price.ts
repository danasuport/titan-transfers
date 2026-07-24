import { routeKey } from '@/lib/route-key'
import type { Locale } from '@/lib/i18n/config'
import type { VehiclePrice } from '@/lib/admin/catalog'

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

/** The per-vehicle price list for a route, matched the same way. [] when none. */
export function vehiclePricesForRoute(
  iata: string | null | undefined,
  destinationNames: (string | null | undefined)[],
  table: Map<string, VehiclePrice[]> | null,
): VehiclePrice[] {
  if (!table) return []
  for (const name of destinationNames) {
    const key = routeKey(iata, name)
    if (key && table.has(key)) return table.get(key)!
  }
  return []
}

// The sheet's vehicle labels are English. Everything else — display names in
// each language, and capacity — is keyed off the sheet label. Passengers/bags
// are the standard capacities of each ETO class (not in the sheet).
const VEHICLES: Record<string, { pax: number; bags: number; name: Record<Locale, string> }> = {
  'Sedan': { pax: 3, bags: 3, name: { en: 'Sedan', es: 'Turismo', it: 'Berlina', de: 'Limousine', ar: 'سيدان' } },
  'Executive Sedan': { pax: 3, bags: 3, name: { en: 'Executive Sedan', es: 'Turismo ejecutivo', it: 'Berlina executive', de: 'Executive-Limousine', ar: 'سيدان تنفيذي' } },
  'People Carrier': { pax: 6, bags: 5, name: { en: 'People Carrier', es: 'Monovolumen', it: 'Monovolume', de: 'Van', ar: 'حافلة صغيرة' } },
  'Large People Carrier': { pax: 8, bags: 8, name: { en: 'Large People Carrier', es: 'Monovolumen grande', it: 'Monovolume grande', de: 'Großraum-Van', ar: 'حافلة كبيرة' } },
  'Executive People Carrier': { pax: 6, bags: 6, name: { en: 'Executive People Carrier', es: 'Monovolumen ejecutivo', it: 'Monovolume executive', de: 'Executive-Van', ar: 'حافلة تنفيذية' } },
  'Minibus': { pax: 16, bags: 16, name: { en: 'Minibus', es: 'Microbús', it: 'Minibus', de: 'Minibus', ar: 'ميني باص' } },
}

export interface VehicleRow {
  name: string
  pax: number | null
  bags: number | null
  price: number
}

/** Vehicles ready to render for one locale — translated name + capacity. */
export function vehicleRows(vehicles: VehiclePrice[], locale: Locale): VehicleRow[] {
  return vehicles.map(v => {
    const spec = VEHICLES[v.vehicle]
    return {
      name: spec?.name[locale] || v.vehicle,
      pax: spec?.pax ?? null,
      bags: spec?.bags ?? null,
      price: v.price,
    }
  })
}

const LOCALE_TAG: Record<Locale, string> = {
  en: 'en-GB', es: 'es-ES', it: 'it-IT', de: 'de-DE', ar: 'ar-AE',
}
const FROM_WORD: Record<Locale, string> = {
  en: 'From', es: 'Desde', it: 'Da', de: 'Ab', ar: 'ابتداءً من',
}

/** "32,97 €" / "€32.97" — locale-aware currency, no prefix. */
export function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale] || 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** "Desde 32,97 €" / "From €32.97" — locale-aware currency, prefixed with "from". */
export function formatFromPrice(amount: number, locale: Locale): string {
  return `${FROM_WORD[locale] || FROM_WORD.en} ${formatPrice(amount, locale)}`
}
