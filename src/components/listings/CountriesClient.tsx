'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { russoOne } from '@/lib/fonts'
import type { Locale } from '@/lib/i18n/config'

interface CountryItem {
  _id: string
  title: string
  href: string
  imgUrl: string | null
  airportCount: number
  cityCount: number
}

interface Props {
  items: CountryItem[]
  locale: Locale
}

export function CountriesClient({ items, locale }: Props) {
  const [search, setSearch] = useState('')
  const es = locale === 'es'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(c => c.title.toLowerCase().includes(q))
  }, [search, items])

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
            placeholder={es ? 'Buscar país...' : 'Search country...'}
            style={{ transform: 'skewX(6deg)', border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', color: '#242426', fontFamily: 'inherit', width: '100%' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ transform: 'skewX(6deg)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem', lineHeight: 1, padding: 0 }}>×</button>
          )}
        </div>
        {search && (
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.5rem', paddingLeft: '0.25rem' }}>
            {filtered.length} {es ? 'resultados' : 'results'}
          </p>
        )}
      </div>

      {/* Countries grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filtered.map(country => (
          <CountryCard key={country._id} country={country} es={es} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' }}>
          {es ? 'Sin resultados para' : 'No results for'} &ldquo;{search}&rdquo;
        </p>
      )}
    </section>
  )
}

function CountryCard({ country, es }: { country: CountryItem; es: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={country.href as any} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position: 'relative', height: '220px', overflow: 'hidden', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 3% 100%)', cursor: 'pointer' }}
      >
        {country.imgUrl ? (
          <Image
            src={country.imgUrl}
            alt={country.title}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center', transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.4s ease' }}
            sizes="400px"
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: '#242426' }} />
        )}

        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)', transition: 'opacity 0.3s' }} />
        {hovered && <div style={{ position: 'absolute', inset: 0, background: 'rgba(139,170,29,0.12)' }} />}

        {/* Content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem 1.25rem 1rem' }}>
          <h2 className={russoOne.className} style={{ fontSize: '1.25rem', color: '#ffffff', margin: '0 0 0.5rem', transition: 'color 0.2s', ...(hovered ? { color: '#d4e87a' } : {}) }}>
            {country.title}
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {country.airportCount > 0 && (
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#8BAA1D"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                {country.airportCount} {es ? 'aeropuertos' : 'airports'}
              </span>
            )}
            {country.cityCount > 0 && (
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#8BAA1D"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18" /></svg>
                {country.cityCount} {es ? 'ciudades' : 'cities'}
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '26px', background: '#8BAA1D', transform: 'skewX(-8deg)', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#fff" style={{ transform: 'skewX(8deg)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
