'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/config'

interface CityItem {
  _id: string
  title: string
  href: string
  imgUrl: string | null
  country: string
  countrySlug: string | null
}

interface Props {
  groups: [string, CityItem[]][]
  locale: Locale
}

export function CitiesClient({ groups, locale }: Props) {
  const [search, setSearch] = useState('')
  const es = locale === 'es'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return groups
    return groups
      .map(([country, cities]) => {
        const fc = cities.filter(c =>
          c.title.toLowerCase().includes(q) ||
          country.toLowerCase().includes(q)
        )
        return [country, fc] as [string, CityItem[]]
      })
      .filter(([, fc]) => fc.length > 0)
  }, [search, groups])

  const total = filtered.reduce((s, [, c]) => s + c.length, 0)

  return (
    <section style={{ background: '#ffffff', padding: '3rem 6vw 5rem' }}>

      {/* Search bar */}
      <div style={{ marginBottom: '3rem', maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#F8FAF0', border: '1.5px solid #e5e7eb', padding: '0.65rem 1rem', transform: 'skewX(-6deg)' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#94a3b8" style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={es ? 'Buscar ciudad o país...' : 'Search city or country...'}
            style={{ transform: 'skewX(6deg)', border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', color: '#242426', fontFamily: 'inherit', width: '100%' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ transform: 'skewX(6deg)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1rem', lineHeight: 1, padding: 0 }}>×</button>
          )}
        </div>
        {search && (
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem', paddingLeft: '0.25rem' }}>
            {total} {es ? 'resultados' : 'results'}
          </p>
        )}
      </div>

      {/* Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        {filtered.map(([country, cities]) => (
          <div key={country}>
            {/* Country header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#8BAA1D', padding: '6px 10px', transform: 'skewX(-8deg)' }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#fff" style={{ transform: 'skewX(8deg)', display: 'block' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#242426', margin: 0, lineHeight: 1.2 }}>{country}</h2>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{cities.length} {es ? 'ciudades' : 'cities'}</span>
                </div>
              </div>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>

            {/* City grid — compact list style for many items */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.6rem' }}>
              {cities.map(city => (
                <CityCard key={city._id} city={city} />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' }}>
            {es ? 'Sin resultados para' : 'No results for'} &ldquo;{search}&rdquo;
          </p>
        )}
      </div>
    </section>
  )
}

function CityCard({ city }: { city: CityItem }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={city.href as any} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: hovered ? '#F8FAF0' : '#ffffff',
          border: `1.5px solid ${hovered ? '#8BAA1D' : '#e5e7eb'}`,
          padding: '0.6rem 0.85rem',
          transform: 'skewX(-6deg)',
          transition: 'border-color 0.15s, background 0.15s',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        {/* Thumbnail */}
        <div style={{ width: '40px', height: '40px', flexShrink: 0, position: 'relative', overflow: 'hidden', transform: 'skewX(6deg)' }}>
          {city.imgUrl ? (
            <Image src={city.imgUrl} alt={city.title} fill style={{ objectFit: 'cover' }} sizes="40px" />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#e5e7eb' }} />
          )}
        </div>

        {/* Name + arrow */}
        <div style={{ transform: 'skewX(6deg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: hovered ? '#242426' : '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {city.title}
          </span>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke={hovered ? '#8BAA1D' : '#d1d5db'} style={{ flexShrink: 0, marginLeft: '0.4rem', transition: 'stroke 0.15s' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
