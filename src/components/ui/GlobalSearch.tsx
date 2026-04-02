'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { useLocale } from 'next-intl'

interface Result {
  _id: string
  title: string
  slug: string
  esSlug?: string
  iataCode?: string
  city?: string
  country?: string
}

interface Results {
  airports: Result[]
  cities: Result[]
  countries: Result[]
}

export function GlobalSearch() {
  const locale = useLocale()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Results | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.length < 2) { setResults(null); setOpen(false); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data)
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function getSlug(item: Result) {
    return locale === 'es' && item.esSlug ? item.esSlug : item.slug
  }

  function navigate(type: 'airport' | 'city' | 'country', item: Result) {
    const slug = getSlug(item)
    const paths = {
      airport: locale === 'es' ? `/traslados-aeropuerto-privados-taxi/${slug}/` : `/airport-transfers-private-taxi/${slug}/`,
      city: locale === 'es' ? `/traslados-privados-taxi/${slug}/` : `/private-transfers/${slug}/`,
      country: locale === 'es' ? `/traslados-privados-taxi/${slug}/` : `/private-transfers/${slug}/`,
    }
    router.push(paths[type] as any)
    setOpen(false)
    setQuery('')
  }

  const hasResults = results && (results.airports.length + results.cities.length + results.countries.length) > 0
  const placeholder = locale === 'es' ? 'Buscar aeropuertos, ciudades, países...' : 'Search airports, cities, countries...'

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1, maxWidth: '420px', minWidth: '180px' }}>
      {/* Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        border: focused ? '2px solid #8BAA1D' : '2px solid #242426',
        background: '#f8faf0',
        padding: '0.4rem 0.85rem',
        transform: 'skewX(-12deg)',
        transition: 'border-color 0.2s',
      }}>
        {loading ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8BAA1D" strokeWidth="2.5" style={{ flexShrink: 0, animation: 'spin 0.8s linear infinite', transform: 'skewX(12deg)' }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" style={{ flexShrink: 0, transform: 'skewX(12deg)' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); if (results && query.length >= 2) setOpen(true) }}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '0.875rem',
            color: '#242426',
            width: '100%',
            fontFamily: 'inherit',
            transform: 'skewX(12deg)',
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8', flexShrink: 0, transform: 'skewX(12deg)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          zIndex: 200,
          maxHeight: '420px',
          overflowY: 'auto',
        }}>
          {!hasResults ? (
            <div style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              {locale === 'es' ? 'Sin resultados' : 'No results found'}
            </div>
          ) : (
            <>
              {results!.airports.length > 0 && (
                <Section label={locale === 'es' ? 'Aeropuertos' : 'Airports'} icon="✈️">
                  {results!.airports.map(item => (
                    <ResultRow
                      key={item._id}
                      title={item.title}
                      subtitle={`${item.iataCode ? item.iataCode + ' · ' : ''}${item.city ?? ''}${item.country ? ', ' + item.country : ''}`}
                      onClick={() => navigate('airport', item)}
                    />
                  ))}
                </Section>
              )}
              {results!.cities.length > 0 && (
                <Section label={locale === 'es' ? 'Ciudades' : 'Cities'} icon="🏙️">
                  {results!.cities.map(item => (
                    <ResultRow
                      key={item._id}
                      title={item.title}
                      subtitle={item.country ?? ''}
                      onClick={() => navigate('city', item)}
                    />
                  ))}
                </Section>
              )}
              {results!.countries.length > 0 && (
                <Section label={locale === 'es' ? 'Países' : 'Countries'} icon="🌍">
                  {results!.countries.map(item => (
                    <ResultRow
                      key={item._id}
                      title={item.title}
                      subtitle=""
                      onClick={() => navigate('country', item)}
                    />
                  ))}
                </Section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'none', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span>{icon}</span>{label}
      </div>
      {children}
    </div>
  )
}

function ResultRow({ title, subtitle, onClick }: { title: string; subtitle: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        textAlign: 'left',
        padding: '0.6rem 1rem',
        background: hovered ? '#f8faf0' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        borderLeft: hovered ? '3px solid #8BAA1D' : '3px solid transparent',
        transition: 'background 0.1s, border-color 0.1s',
        fontFamily: 'inherit',
      }}
    >
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#242426' }}>{title}</span>
      {subtitle && <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1px' }}>{subtitle}</span>}
    </button>
  )
}
