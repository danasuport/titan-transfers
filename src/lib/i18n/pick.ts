import type { Locale } from './config'
import { defaultLocale } from './config'

/**
 * Inline localization helper for the many spots where we have short
 * one-off strings (page H1, hero stats, button labels) that don't justify
 * an entry in messages/*.json. Falls back to the default locale if the
 * caller forgot to provide a translation for the active locale.
 *
 * Example:
 *   const title = pick(locale, { en: 'Airports', es: 'Aeropuertos', ar: 'المطارات' })
 */
export function pick<T>(locale: string, options: Partial<Record<Locale, T>>): T {
  const v = options[locale as Locale]
  if (v !== undefined) return v
  return options[defaultLocale] as T
}
