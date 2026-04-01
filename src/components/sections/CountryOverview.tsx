'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { getAirportUrl, getCityUrl, getRegionUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import type { Locale } from '@/lib/i18n/config'

interface CountryOverviewProps {
  airports?: Array<{ _id: string; title: string; slug: { current: string }; iataCode?: string; translations?: Record<string, { title?: string; slug?: { current: string } }> }>
  cities?: Array<{ _id: string; title: string; slug: { current: string }; translations?: Record<string, { title?: string; slug?: { current: string } }> }>
  regions?: Array<{ _id: string; title: string; slug: { current: string }; translations?: Record<string, { title?: string; slug?: { current: string } }> }>
}

function SkewCard({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link href={href as any} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
          background: hovered ? '#8BAA1D' : '#ffffff',
          border: '1.5px solid', borderColor: hovered ? '#8BAA1D' : '#e5e7eb',
          padding: '0.75rem 1rem 0.75rem 1.25rem',
          transform: 'skewX(-8deg)',
          transition: 'background 0.15s, border-color 0.15s',
          cursor: 'pointer',
        }}
      >
        <div style={{ transform: 'skewX(8deg)', display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1 }}>
          {children}
        </div>
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke={hovered ? '#ffffff' : '#94a3b8'} style={{ transform: 'skewX(8deg)', flexShrink: 0, transition: 'stroke 0.15s' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  )
}

export function CountryOverview({ airports, cities, regions }: CountryOverviewProps) {
  const locale = useLocale() as Locale

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {airports && airports.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {airports.map((a) => (
            <SkewCard key={a._id} href={getAirportUrl(a, locale)}>
              {a.iataCode && (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8BAA1D', background: '#f0f4e3', padding: '1px 5px', flexShrink: 0 }}>
                  {a.iataCode}
                </span>
              )}
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#242426', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {getTranslatedTitle(a, locale)}
              </span>
            </SkewCard>
          ))}
        </div>
      )}

      {cities && cities.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {cities.map((c) => (
            <SkewCard key={c._id} href={getCityUrl(c, locale)}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#242426', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {getTranslatedTitle(c, locale)}
              </span>
            </SkewCard>
          ))}
        </div>
      )}

      {regions && regions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {regions.map((r) => (
            <SkewCard key={r._id} href={getRegionUrl(r, locale)}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#242426', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {getTranslatedTitle(r, locale)}
              </span>
            </SkewCard>
          ))}
        </div>
      )}
    </div>
  )
}
