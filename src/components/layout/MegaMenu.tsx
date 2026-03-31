'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from '@/lib/i18n/navigation'
import { russoOne } from '@/lib/fonts'

interface Airport { _id: string; title: string; iataCode: string; slug: string; esSlug?: string; city?: string; country?: string; countrySlug?: string }
interface City { _id: string; title: string; slug: string; esSlug?: string; country?: string; countrySlug?: string }
interface Country { _id: string; title: string; slug: string; esSlug?: string; airportCount?: number; cityCount?: number }
interface MenuData { airports: Airport[]; cities: City[]; countries: Country[] }

const COUNTRY_FLAGS: Record<string, string> = {
  'spain': 'es', 'france': 'fr', 'italy': 'it', 'germany': 'de',
  'united-kingdom': 'gb', 'united-states': 'us', 'portugal': 'pt',
  'netherlands': 'nl', 'greece': 'gr', 'turkey': 'tr', 'japan': 'jp',
  'thailand': 'th', 'australia': 'au', 'canada': 'ca', 'mexico': 'mx',
  'morocco': 'ma', 'czech-republic': 'cz', 'austria': 'at',
  'singapore': 'sg', 'united-arab-emirates': 'ae', 'china': 'cn',
  'panama': 'pa', 'belgium': 'be', 'hungary': 'hu', 'egypt': 'eg',
  'ireland': 'ie', 'colombia': 'co', 'brazil': 'br', 'argentina': 'ar',
  'switzerland': 'ch', 'sweden': 'se', 'norway': 'no', 'denmark': 'dk',
  'poland': 'pl', 'romania': 'ro', 'croatia': 'hr', 'bulgaria': 'bg',
  'russia': 'ru', 'ukraine': 'ua', 'india': 'in', 'indonesia': 'id',
  'malaysia': 'my', 'south-korea': 'kr', 'taiwan': 'tw', 'vietnam': 'vn',
  'philippines': 'ph', 'new-zealand': 'nz', 'south-africa': 'za',
  'kenya': 'ke', 'nigeria': 'ng', 'israel': 'il', 'jordan': 'jo',
  'saudi-arabia': 'sa', 'qatar': 'qa', 'kuwait': 'kw', 'bahrain': 'bh',
  'peru': 'pe', 'chile': 'cl', 'ecuador': 'ec', 'dominican-republic': 'do',
  'costa-rica': 'cr', 'cuba': 'cu', 'jamaica': 'jm',
}

function Flag({ countrySlug }: { countrySlug: string }) {
  const code = COUNTRY_FLAGS[countrySlug]
  if (!code) return null
  return <img src={`https://flagcdn.com/20x15/${code}.png`} alt={countrySlug} width={20} height={15} style={{ borderRadius: '2px', objectFit: 'cover', flexShrink: 0 }} />
}

type Tab = 'airports' | 'cities' | 'countries'

export function MegaMenu({ type, onClose }: { type: Tab; onClose: () => void }) {
  const locale = useLocale()
  const router = useRouter()
  const es = locale === 'es'
  const [data, setData] = useState<MenuData | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/megamenu').then(r => r.json()).then(setData)
  }, [])


  function slug(item: { slug: string; esSlug?: string }) {
    return es && item.esSlug ? item.esSlug : item.slug
  }

  function go(path: string) {
    onClose()
    router.push(path as any)
  }

  const q = search.toLowerCase()

  const airports = (data?.airports ?? []).filter(a =>
    !q || a.title.toLowerCase().includes(q) || (a.iataCode ?? '').toLowerCase().includes(q) || (a.city ?? '').toLowerCase().includes(q) || (a.country ?? '').toLowerCase().includes(q)
  )

  const cities = (data?.cities ?? []).filter(c =>
    !q || c.title.toLowerCase().includes(q) || (c.country ?? '').toLowerCase().includes(q)
  )

  const countries = (data?.countries ?? []).filter(c =>
    !q || c.title.toLowerCase().includes(q)
  )

  // Group airports by country
  const airportsByCountry: Record<string, Airport[]> = {}
  airports.forEach(a => {
    const key = a.country ?? 'Other'
    if (!airportsByCountry[key]) airportsByCountry[key] = []
    airportsByCountry[key].push(a)
  })

  // Group cities by country
  const citiesByCountry: Record<string, City[]> = {}
  cities.forEach(c => {
    const key = c.country ?? 'Other'
    if (!citiesByCountry[key]) citiesByCountry[key] = []
    citiesByCountry[key].push(c)
  })

  const itemStyle = (hovered: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.35rem 0.5rem', cursor: 'pointer', borderRadius: '4px',
    background: hovered ? '#f8faf0' : 'transparent',
    borderLeft: hovered ? '2px solid #8BAA1D' : '2px solid transparent',
    transition: 'all 0.1s',
  })

  return (
    <div style={{ padding: '1.5rem 0 1rem' }}>


      {/* AIRPORTS */}
      {type === 'airports' && (
        <div>
          {!data && <Skeleton />}
          {data && Object.keys(airportsByCountry).length === 0 && <Empty es={es} />}
          <div style={{ columns: '4', columnGap: '2rem' }}>
            {Object.entries(airportsByCountry).map(([country, items]) => (
              <div key={country} style={{ breakInside: 'avoid', marginBottom: '1.25rem' }}>
                <div className={russoOne.className} onClick={() => go(es ? `/pais/${items[0]?.countrySlug}/` : `/country/${items[0]?.countrySlug}/`)} style={{ fontSize: '0.72rem', color: '#8BAA1D', textTransform: 'none', letterSpacing: '0.08em', marginBottom: '0.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Flag countrySlug={items[0]?.countrySlug ?? ''} /> {country}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
                {items.map(a => (
                  <HoverItem key={a._id} style={itemStyle} onClick={() => go(es ? `/aeropuerto/${slug(a)}/` : `/airport/${slug(a)}/`)}>
                    {a.iataCode && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8BAA1D', background: '#f0f4e3', padding: '1px 5px', borderRadius: '3px', flexShrink: 0 }}>
                        {a.iataCode}
                      </span>
                    )}
                    <span style={{ fontSize: '0.85rem', color: '#242426' }}>{a.title}</span>
                  </HoverItem>
                ))}
              </div>
            ))}
          </div>
          <Footer href={es ? '/aeropuertos/' : '/airports/'} label={es ? 'Ver todos los aeropuertos' : 'Browse all airports'} />
        </div>
      )}

      {/* CITIES */}
      {type === 'cities' && (
        <div>
          {!data && <Skeleton />}
          {data && Object.keys(citiesByCountry).length === 0 && <Empty es={es} />}
          <div style={{ columns: '4', columnGap: '2rem' }}>
            {Object.entries(citiesByCountry).map(([country, items]) => (
              <div key={country} style={{ breakInside: 'avoid', marginBottom: '1.25rem' }}>
                <div className={russoOne.className} onClick={() => go(es ? `/pais/${items[0]?.countrySlug}/` : `/country/${items[0]?.countrySlug}/`)} style={{ fontSize: '0.72rem', color: '#8BAA1D', textTransform: 'none', letterSpacing: '0.08em', marginBottom: '0.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Flag countrySlug={items[0]?.countrySlug ?? ''} /> {country}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
                {items.map(c => (
                  <HoverItem key={c._id} style={itemStyle} onClick={() => go(es ? `/ciudad/${slug(c)}/` : `/city/${slug(c)}/`)}>
                    <span style={{ fontSize: '0.85rem', color: '#242426' }}>{c.title}</span>
                  </HoverItem>
                ))}
              </div>
            ))}
          </div>
          <Footer href={es ? '/ciudades/' : '/cities/'} label={es ? 'Ver todas las ciudades' : 'Browse all cities'} />
        </div>
      )}

      {/* COUNTRIES */}
      {type === 'countries' && (
        <div>
          {!data && <Skeleton />}
          {data && countries.length === 0 && <Empty es={es} />}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {countries.map(c => (
              <HoverItem key={c._id} style={itemStyle} onClick={() => go(es ? `/pais/${slug(c)}/` : `/country/${slug(c)}/`)}>
                <Flag countrySlug={c.slug} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#242426' }}>{c.title}</div>
                  {(c.airportCount || c.cityCount) ? (
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {c.airportCount ? `${c.airportCount} ${es ? 'aeropuertos' : 'airports'}` : ''}
                      {c.airportCount && c.cityCount ? ' · ' : ''}
                      {c.cityCount ? `${c.cityCount} ${es ? 'ciudades' : 'cities'}` : ''}
                    </div>
                  ) : null}
                </div>
              </HoverItem>
            ))}
          </div>
          <Footer href={es ? '/paises/' : '/countries/'} label={es ? 'Ver todos los países' : 'Browse all countries'} />
        </div>
      )}

    </div>
  )
}

function HoverItem({ children, style, onClick }: { children: React.ReactNode; style: (h: boolean) => React.CSSProperties; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={style(hovered)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onClick}>
      {children}
    </div>
  )
}

function Footer({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false)
  const router = useRouter()
  return (
    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '0.5rem' }}>
      <button
        onClick={() => router.push(href as any)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ background: hovered ? '#242426' : 'transparent', color: hovered ? '#ffffff' : '#242426', border: '2px solid #242426', padding: '0.4rem 1.25rem', transform: 'skewX(-12deg)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <span style={{ transform: 'skewX(12deg)', display: 'inline-block' }}>{label} →</span>
      </button>
    </div>
  )
}

function Skeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1rem' }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{ height: '12px', background: '#e5e7eb', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}

function Empty({ es }: { es: boolean }) {
  return <p style={{ fontSize: '0.875rem', color: '#94a3b8', padding: '1rem 0' }}>{es ? 'Sin resultados' : 'No results'}</p>
}
