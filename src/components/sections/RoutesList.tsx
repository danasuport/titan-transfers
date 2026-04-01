'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { formatDistance, formatDuration } from '@/lib/utils/formatters'
import { getTranslatedTitle, getTranslatedSlug } from '@/lib/utils/slugHelpers'
import { russoOne } from '@/lib/fonts'
import type { Locale } from '@/lib/i18n/config'

interface Route {
  _id: string
  title: string
  slug: { current: string }
  distance?: number
  estimatedDuration?: number
  destination?: { _id: string; title: string; slug: { current: string }; translations?: Record<string, { title?: string; slug?: { current: string } }> }
  translations?: Record<string, { title?: string; slug?: { current: string } }>
}

function RouteCard({ route, airportSlug, locale }: { route: Route; airportSlug: string; locale: Locale }) {
  const [hovered, setHovered] = useState(false)
  const routeSlug = getTranslatedSlug(route, locale)
  const destTitle = route.destination ? getTranslatedTitle(route.destination, locale) : getTranslatedTitle(route, locale)

  return (
    <Link href={`/airport/${airportSlug}/${routeSlug}/` as any} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          background: hovered ? '#8BAA1D' : '#ffffff',
          border: '1.5px solid',
          borderColor: hovered ? '#8BAA1D' : '#e5e7eb',
          padding: '0.75rem 1rem 0.75rem 1.25rem',
          transform: 'skewX(-8deg)',
          transition: 'background 0.15s, border-color 0.15s',
          cursor: 'pointer',
        }}
      >
        {/* Destination name */}
        <span style={{
          transform: 'skewX(8deg)',
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: hovered ? '#ffffff' : '#242426',
          transition: 'color 0.15s',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
        }}>
          {destTitle}
        </span>

        {/* Distance + time */}
        <div style={{ transform: 'skewX(8deg)', display: 'flex', gap: '0.6rem', flexShrink: 0, alignItems: 'center' }}>
          {route.distance && (
            <span style={{ fontSize: '0.7rem', color: hovered ? 'rgba(255,255,255,0.75)' : '#94a3b8', transition: 'color 0.15s', whiteSpace: 'nowrap' }}>
              {formatDistance(route.distance)}
            </span>
          )}
          {route.distance && route.estimatedDuration && (
            <span style={{ color: hovered ? 'rgba(255,255,255,0.35)' : '#d1d5db', fontSize: '0.65rem' }}>·</span>
          )}
          {route.estimatedDuration && (
            <span style={{ fontSize: '0.7rem', color: hovered ? 'rgba(255,255,255,0.75)' : '#94a3b8', transition: 'color 0.15s', whiteSpace: 'nowrap' }}>
              {formatDuration(route.estimatedDuration)}
            </span>
          )}
          <svg
            width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke={hovered ? '#ffffff' : '#94a3b8'}
            style={{ transition: 'stroke 0.15s', flexShrink: 0 }}
          >
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
}: {
  routes: Route[]
  airportSlug: string
  cityName?: string
  title?: string
}) {
  const locale = useLocale() as Locale
  const es = locale === 'es'
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
            placeholder={es ? 'Filtrar destino...' : 'Filter destination...'}
            style={{
              transform: 'skewX(8deg)',
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '0.82rem', color: '#242426', fontFamily: 'inherit', width: '100%',
            }}
          />
          {filter && (
            <button onClick={() => setFilter('')} style={{ transform: 'skewX(8deg)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, lineHeight: 1 }}>
              ×
            </button>
          )}
        </div>
        {filter && (
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            {filtered.length} {es ? 'resultados' : 'results'}
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="resp-routes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
        {filtered.map((route) => (
          <RouteCard key={route._id} route={route} airportSlug={airportSlug} locale={locale} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '1rem' }}>
          {es ? 'Sin resultados' : 'No results'}
        </p>
      )}
    </section>
  )
}
