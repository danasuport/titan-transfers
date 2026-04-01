'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { russoOne } from '@/lib/fonts'
import type { Locale } from '@/lib/i18n/config'

interface AirportItem {
  _id: string
  title: string
  iataCode?: string
  href: string
  imgUrl: string | null
  country: string
  countrySlug: string | null
}

interface Props {
  groups: [string, AirportItem[]][]
  locale: Locale
}

export function AirportsClient({ groups, locale }: Props) {
  const [search, setSearch] = useState('')
  const es = locale === 'es'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return groups
    return groups
      .map(([country, airports]) => {
        const fa = airports.filter(a =>
          a.title.toLowerCase().includes(q) ||
          a.iataCode?.toLowerCase().includes(q) ||
          country.toLowerCase().includes(q)
        )
        return [country, fa] as [string, AirportItem[]]
      })
      .filter(([, fa]) => fa.length > 0)
  }, [search, groups])

  const total = filtered.reduce((s, [, a]) => s + a.length, 0)

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
            placeholder={es ? 'Buscar aeropuerto o ciudad...' : 'Search airport or city...'}
            style={{ transform: 'skewX(6deg)', border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', color: '#242426', fontFamily: 'inherit', width: '100%' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ transform: 'skewX(6deg)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem', lineHeight: 1, padding: 0 }}>×</button>
          )}
        </div>
        {search && (
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.5rem', paddingLeft: '0.25rem' }}>
            {total} {es ? 'resultados' : 'results'}
          </p>
        )}
      </div>

      {/* Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        {filtered.map(([country, airports]) => (
          <div key={country}>
            {/* Country header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#8BAA1D', padding: '6px 10px', transform: 'skewX(-8deg)' }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#fff" style={{ transform: 'skewX(8deg)', display: 'block' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#242426', margin: 0, lineHeight: 1.2 }}>{country}</h2>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{airports.length} {es ? 'aeropuertos' : 'airports'}</span>
                </div>
              </div>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>

            {/* Airport grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {airports.map(airport => (
                <AirportCard key={airport._id} airport={airport} />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' }}>
            {es ? 'Sin resultados para' : 'No results for'} &ldquo;{search}&rdquo;
          </p>
        )}
      </div>
    </section>
  )
}

function AirportCard({ airport }: { airport: AirportItem }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={airport.href as any} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position: 'relative', height: '180px', overflow: 'hidden', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 4% 100%)', cursor: 'pointer' }}
      >
        {/* Image or fallback */}
        {airport.imgUrl ? (
          <Image
            src={airport.imgUrl}
            alt={airport.title}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center', transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.4s ease' }}
            sizes="300px"
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: '#242426' }} />
        )}

        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: hovered ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' : 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)', transition: 'background 0.3s' }} />

        {/* IATA badge */}
        {airport.iataCode && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: '#8BAA1D', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', padding: '3px 8px', border: '1px solid rgba(139,170,29,0.4)' }}>
            {airport.iataCode}
          </div>
        )}

        {/* Title */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.3, transition: 'color 0.2s', ...(hovered ? { color: '#d4e87a' } : {}) }}>
            {airport.title}
          </div>
        </div>

        {/* Arrow on hover */}
        <div style={{ position: 'absolute', bottom: '0.85rem', right: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '22px', background: '#8BAA1D', transform: 'skewX(-8deg)', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#fff" style={{ transform: 'skewX(8deg)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
