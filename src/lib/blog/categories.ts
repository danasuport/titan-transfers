import type { Locale } from '@/lib/i18n/config'

// Canonical blog category keys. Stored verbatim in the Sanity `category` field.
// Order here = display order of the filter bar.
export type BlogCategoryKey =
  | 'events'
  | 'gastronomy'
  | 'places'
  | 'monuments'
  | 'beaches'
  | 'sports'
  | 'guides'

export const BLOG_CATEGORIES: { key: BlogCategoryKey; labels: Record<Locale, string> }[] = [
  { key: 'events',     labels: { en: 'Events',     es: 'Eventos',     ar: 'فعاليات', it: 'Eventi',      de: 'Events' } },
  { key: 'gastronomy', labels: { en: 'Gastronomy', es: 'Gastronomía', ar: 'مأكولات', it: 'Gastronomia', de: 'Gastronomie' } },
  { key: 'places',     labels: { en: 'Places',     es: 'Lugares',     ar: 'أماكن',   it: 'Luoghi',      de: 'Orte' } },
  { key: 'monuments',  labels: { en: 'Monuments',  es: 'Monumentos',  ar: 'معالم',   it: 'Monumenti',   de: 'Sehenswürdigkeiten' } },
  { key: 'beaches',    labels: { en: 'Beaches',    es: 'Playas',      ar: 'شواطئ',   it: 'Spiagge',     de: 'Strände' } },
  { key: 'sports',     labels: { en: 'Sports',     es: 'Deportes',    ar: 'رياضة',   it: 'Sport',       de: 'Sport' } },
  { key: 'guides',     labels: { en: 'Guides',     es: 'Guías',       ar: 'أدلة',    it: 'Guide',       de: 'Reiseführer' } },
]

export const ALL_LABEL: Record<Locale, string> = { en: 'All', es: 'Todos', ar: 'الكل', it: 'Tutti', de: 'Alle' }

export const EMPTY_CATEGORY_LABEL: Record<Locale, string> = {
  en: 'No articles in this category yet — new content coming soon.',
  es: 'Aún no hay artículos en esta categoría. ¡Pronto publicaremos contenido nuevo!',
  ar: 'لا توجد مقالات في هذه الفئة بعد — محتوى جديد قريبًا.',
  it: 'Ancora nessun articolo in questa categoria — nuovi contenuti in arrivo.',
  de: 'Noch keine Artikel in dieser Kategorie — neue Inhalte folgen in Kürze.',
}

// Map any stored/legacy category value to a canonical key.
// Legacy seed scripts wrote 'Events' / 'Guides' / 'guide'.
export function normalizeCategory(raw?: string | null): BlogCategoryKey | null {
  if (!raw) return null
  const v = raw.trim().toLowerCase()
  const known = BLOG_CATEGORIES.find((c) => c.key === v)
  if (known) return known.key
  if (v === 'event') return 'events'
  if (v === 'guide') return 'guides'
  return null
}

export function getCategoryLabel(key: string | null | undefined, locale: Locale): string {
  const norm = normalizeCategory(key)
  if (!norm) return ''
  const def = BLOG_CATEGORIES.find((c) => c.key === norm)
  return def?.labels[locale] || def?.labels.en || ''
}
