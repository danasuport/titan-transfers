'use client'

import { Link } from '@/lib/i18n/navigation'
import { russoOne } from '@/lib/fonts'
import { formatDistance, formatDuration } from '@/lib/utils/formatters'
import type { Locale } from '@/lib/i18n/config'

interface Route {
  _id: string
  title: string
  slug: { current: string }
  origin?: { _id: string; title: string; slug: { current: string }; translations?: Record<string, any> }
  destination?: { _id: string; title: string; slug: { current: string }; translations?: Record<string, any> }
  distance?: number
  estimatedDuration?: number
  translations?: Record<string, { slug?: { current: string } }>
}

interface RouteCardProps {
  routes: Route[]
  locale: Locale
}

export function RouteInlineBlock({ routes, locale }: RouteCardProps) {
  if (!routes || routes.length === 0) return null
  const es = locale === 'es'

  return (
    <div style={{ margin: '2.5rem 0', border: '1.5px solid #e5e7eb', background: '#F8FAF0', transform: 'skewX(-4deg)', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1.5px solid #e5e7eb', transform: 'skewX(4deg)' }}>
        <h3 className={russoOne.className} style={{ fontSize: '1rem', color: '#242426', margin: 0, fontWeight: 400 }}>
          {es ? 'Rutas disponibles' : 'Available routes'}
        </h3>
      </div>

      {/* Routes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#e5e7eb' }}>
        {routes.map((route) => {
          const originName = (locale !== 'en' && route.origin?.translations?.[locale]?.title) || route.origin?.title || ''
          const destName   = (locale !== 'en' && route.destination?.translations?.[locale]?.title) || route.destination?.title || ''
          const routeSlug  = (locale !== 'en' && route.translations?.[locale]?.slug?.current) || route.slug.current
          const originSlug = route.origin?.slug?.current

          return (
            <Link
              key={route._id}
              href={originSlug ? `/airport/${originSlug}/${routeSlug}/` as any : `/` as any}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{ background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.5rem', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f0f4e3')}
                onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
              >
                {/* Origin → Destination */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', transform: 'skewX(4deg)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#242426' }}>{originName}</span>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#8BAA1D">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#8BAA1D' }}>{destName}</span>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', transform: 'skewX(4deg)' }}>
                  {route.distance && (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{formatDistance(route.distance)}</span>
                  )}
                  {route.estimatedDuration && (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{formatDuration(route.estimatedDuration)}</span>
                  )}
                  <span style={{ display: 'inline-flex', alignItems: 'center', background: '#242426', color: '#ffffff', padding: '0.3rem 0.85rem', transform: 'skewX(-8deg)', fontSize: '0.72rem', fontWeight: 400 }}>
                    <span style={{ transform: 'skewX(8deg)', display: 'inline-block' }}>{es ? 'Ver →' : 'View →'}</span>
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
