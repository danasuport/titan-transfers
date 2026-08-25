'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { formatDistance, formatDuration } from '@/lib/utils/formatters'
import { getTranslatedTitle, getTranslatedSlug, getLocalizedPath } from '@/lib/utils/slugHelpers'
import { pick } from '@/lib/i18n/pick'
import { russoOne } from '@/lib/fonts'
import type { Locale } from '@/lib/i18n/config'

interface Route {
  _id: string
  title: string
  slug: { current: string }
  distance?: number
  estimatedDuration?: number
  origin?: { _id: string; title: string; slug: { current: string }; translations?: Record<string, { title?: string; slug?: { current: string } }> }
  destination?: { _id: string; title: string; slug: { current: string }; translations?: Record<string, { title?: string; slug?: { current: string } }> }
  translations?: Record<string, { title?: string; slug?: { current: string } }>
}

/**
 * One route in the list. Deliberately stateless: the hover styling lives in
 * globals.css (.route-card), so 275 of these cost the browser nothing to
 * hydrate. Rendering them all still matters for SEO — each one is an internal
 * link to a route page — so they stay in the HTML and `content-visibility`
 * handles the paint cost.
 */
function RouteCard({ route, airportSlug, locale, price }: { route: Route; airportSlug: string; locale: Locale; price?: string }) {
  const routeSlug = getTranslatedSlug(route, locale)
  const destTitle = route.destination ? getTranslatedTitle(route.destination, locale) : getTranslatedTitle(route, locale)
  // Each route uses its own origin when available; fall back to the parent airportSlug
  // (this matters on city pages where routes come from many different airports).
  const originSlug = route.origin?.slug?.current || airportSlug

  const airportSegment = getLocalizedPath('airport', locale)
  return (
    <Link href={`/${airportSegment}/${originSlug}/${routeSlug}/` as any} style={{ textDecoration: 'none' }}>
      <div className="route-card">
        <span className="route-card__name">{destTitle}</span>

        <div className="route-card__meta">
          {route.distance && <span className="route-card__stat">{formatDistance(route.distance)}</span>}
          {route.distance && route.estimatedDuration && <span className="route-card__dot">·</span>}
          {route.estimatedDuration && <span className="route-card__stat">{formatDuration(route.estimatedDuration)}</span>}
          {/* Real sheet price. Seeing it before the click is what turns a list
              of place names into a comparison a visitor can act on. */}
          {price && <span className="route-card__price">{price}</span>}
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} className="route-card__arrow">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

export function RoutesList({
  routes,
  airportSlug,
  cityName,
  title,
  prices,
}: {
  routes: Route[]
  airportSlug: string
  cityName?: string
  title?: string
  /** Route _id → formatted "from" price. Resolved on the server, where the
   *  sheet lives; absent on pages that don't have prices to hand. */
  prices?: Record<string, string>
}) {
  const locale = useLocale() as Locale
  const [filter, setFilter] = useState('')

  if (!routes || routes.length === 0) return null

  // Deduplicate by destination title
  const seen = new Set<string>()
  const unique = routes.filter(r => {
    const dest = r.destination ? getTranslatedTitle(r.destination, locale) : getTranslatedTitle(r, locale)
    if (seen.has(dest)) return false
    seen.add(dest)
    return true
  })

  const filtered = filter.trim()
    ? unique.filter(r => {
        const dest = r.destination ? getTranslatedTitle(r.destination, locale) : getTranslatedTitle(r, locale)
        return dest.toLowerCase().includes(filter.toLowerCase())
      })
    : unique

  return (
    <section>
      {/* Header: title + inline filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {title && (
          <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#242426', margin: 0, flexShrink: 0 }}>
            {title}
          </h2>
        )}
        {/* Filter input — skewed */}
        <div style={{ transform: 'skewX(-8deg)', border: '1.5px solid #e5e7eb', background: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.9rem', flex: 1, minWidth: '180px', maxWidth: '280px' }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#94a3b8" style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder={pick(locale, { en: 'Filter destination...', es: 'Filtrar destino...', ar: 'تصفية الوجهة...', it: 'Filtra destinazione...', de: 'Ziel filtern...', fr: 'Filtrer la destination...' })}
            style={{
              transform: 'skewX(8deg)',
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '0.82rem', color: '#242426', fontFamily: 'inherit', width: '100%',
            }}
          />
          {filter && (
            <button onClick={() => setFilter('')} style={{ transform: 'skewX(8deg)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, lineHeight: 1 }}>
              ×
            </button>
          )}
        </div>
        {filter && (
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            {filtered.length} {pick(locale, { en: 'results', es: 'resultados', ar: 'نتائج', it: 'risultati', de: 'Ergebnisse', fr: 'résultats' })}
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="resp-routes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
        {filtered.map((route) => (
          <RouteCard key={route._id} route={route} airportSlug={airportSlug} locale={locale} price={prices?.[route._id]} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '1rem' }}>
          {pick(locale, { en: 'No results', es: 'Sin resultados', ar: 'لا توجد نتائج', it: 'Nessun risultato', de: 'Keine Ergebnisse', fr: 'Aucun résultat' })}
        </p>
      )}
    </section>
  )
}
