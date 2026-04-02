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
  // Europe
  'spain': 'es', 'france': 'fr', 'italy': 'it', 'germany': 'de',
  'united-kingdom': 'gb', 'uk': 'gb', 'great-britain': 'gb', 'england': 'gb',
  'portugal': 'pt', 'netherlands': 'nl', 'holland': 'nl', 'greece': 'gr',
  'turkey': 'tr', 'turkiye': 'tr', 'morocco': 'ma', 'maroc': 'ma',
  'czech-republic': 'cz', 'czechia': 'cz', 'austria': 'at',
  'belgium': 'be', 'hungary': 'hu', 'ireland': 'ie',
  'switzerland': 'ch', 'sweden': 'se', 'norway': 'no', 'denmark': 'dk',
  'poland': 'pl', 'romania': 'ro', 'croatia': 'hr', 'bulgaria': 'bg',
  'russia': 'ru', 'ukraine': 'ua', 'finland': 'fi', 'slovakia': 'sk',
  'serbia': 'rs', 'slovenia': 'si', 'albania': 'al', 'montenegro': 'me',
  'north-macedonia': 'mk', 'bosnia': 'ba', 'bosnia-and-herzegovina': 'ba',
  'luxembourg': 'lu', 'malta': 'mt', 'cyprus': 'cy', 'iceland': 'is',
  'latvia': 'lv', 'lithuania': 'lt', 'estonia': 'ee',
  'moldova': 'md', 'belarus': 'by', 'georgia': 'ge', 'armenia': 'am',
  'azerbaijan': 'az', 'kosovo': 'xk',
  // Americas
  'united-states': 'us', 'usa': 'us', 'canada': 'ca', 'mexico': 'mx',
  'brazil': 'br', 'argentina': 'ar', 'colombia': 'co', 'chile': 'cl',
  'peru': 'pe', 'ecuador': 'ec', 'venezuela': 've', 'bolivia': 'bo',
  'paraguay': 'py', 'uruguay': 'uy', 'panama': 'pa', 'costa-rica': 'cr',
  'cuba': 'cu', 'jamaica': 'jm', 'dominican-republic': 'do',
  'puerto-rico': 'pr', 'guatemala': 'gt', 'honduras': 'hn',
  'el-salvador': 'sv', 'nicaragua': 'ni', 'haiti': 'ht',
  'trinidad-and-tobago': 'tt', 'barbados': 'bb', 'bahamas': 'bs',
  // Asia
  'japan': 'jp', 'thailand': 'th', 'singapore': 'sg',
  'united-arab-emirates': 'ae', 'uae': 'ae', 'china': 'cn',
  'india': 'in', 'indonesia': 'id', 'malaysia': 'my',
  'south-korea': 'kr', 'korea': 'kr', 'taiwan': 'tw', 'vietnam': 'vn',
  'philippines': 'ph', 'israel': 'il', 'jordan': 'jo',
  'saudi-arabia': 'sa', 'qatar': 'qa', 'kuwait': 'kw', 'bahrain': 'bh',
  'oman': 'om', 'iran': 'ir', 'iraq': 'iq', 'pakistan': 'pk',
  'bangladesh': 'bd', 'sri-lanka': 'lk', 'nepal': 'np',
  'myanmar': 'mm', 'cambodia': 'kh', 'laos': 'la',
  'hong-kong': 'hk', 'macau': 'mo', 'mongolia': 'mn',
  'uzbekistan': 'uz', 'kazakhstan': 'kz', 'kyrgyzstan': 'kg',
  'tajikistan': 'tj', 'turkmenistan': 'tm', 'afghanistan': 'af',
  'lebanon': 'lb', 'syria': 'sy', 'yemen': 'ye',
  // Africa
  'south-africa': 'za', 'kenya': 'ke', 'nigeria': 'ng',
  'egypt': 'eg', 'ethiopia': 'et', 'ghana': 'gh', 'tanzania': 'tz',
  'uganda': 'ug', 'mozambique': 'mz', 'madagascar': 'mg',
  'ivory-coast': 'ci', 'cameroon': 'cm', 'senegal': 'sn',
  'tunisia': 'tn', 'algeria': 'dz', 'libya': 'ly', 'sudan': 'sd',
  'angola': 'ao', 'zambia': 'zm', 'zimbabwe': 'zw',
  'rwanda': 'rw', 'namibia': 'na', 'botswana': 'bw',
  // Oceania
  'australia': 'au', 'new-zealand': 'nz', 'fiji': 'fj',
  'papua-new-guinea': 'pg',
}

function Flag({ countrySlug }: { countrySlug: string }) {
  if (!countrySlug) return null
  const code = COUNTRY_FLAGS[countrySlug] ?? COUNTRY_FLAGS[countrySlug.toLowerCase()]
  if (!code) return null
  return <img src={`https://flagcdn.com/${code}.svg`} alt="" style={{ width: '20px', height: '14px', borderRadius: '2px', objectFit: 'cover', flexShrink: 0, display: 'inline-block' }} />
}

type Tab = 'airports' | 'cities' | 'countries'

export function MegaMenu({ type, onClose, mobile = false }: { type: Tab; onClose: () => void; mobile?: boolean }) {
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
    padding: '0.35rem 0.6rem',
    cursor: 'pointer',
    transform: 'skewX(-8deg)',
    background: hovered ? '#8BAA1D' : 'transparent',
    transition: 'background 0.12s',
  })

  if (mobile) {
    return (
      <MegaMenuMobile type={type} onClose={onClose} es={es} data={data}
        airports={airports} cities={cities} countries={countries}
        airportsByCountry={airportsByCountry} citiesByCountry={citiesByCountry}
        slug={slug} go={go} />
    )
  }

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
                <div className={russoOne.className} onClick={() => go(es ? `/traslados-privados-taxi/pais/${items[0]?.countrySlug}/` : `/private-transfers/country/${items[0]?.countrySlug}/`)} style={{ fontSize: '0.72rem', color: '#8BAA1D', textTransform: 'none', letterSpacing: '0.08em', marginBottom: '0.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Flag countrySlug={items[0]?.countrySlug ?? ''} /> {country}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
                {items.map(a => (
                  <HoverItem key={a._id} style={itemStyle} onClick={() => go(es ? `/traslado-aeropuerto/${slug(a)}/` : `/airport-transfers/${slug(a)}/`)}>
                    {a.iataCode && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8BAA1D', background: '#f0f4e3', padding: '1px 5px', borderRadius: '3px', flexShrink: 0 }}>
                        {a.iataCode}
                      </span>
                    )}
                    <span style={{ fontSize: '0.85rem', color: 'inherit' }}>{a.title}</span>
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
                <div className={russoOne.className} onClick={() => go(es ? `/traslados-privados-taxi/pais/${items[0]?.countrySlug}/` : `/private-transfers/country/${items[0]?.countrySlug}/`)} style={{ fontSize: '0.72rem', color: '#8BAA1D', textTransform: 'none', letterSpacing: '0.08em', marginBottom: '0.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Flag countrySlug={items[0]?.countrySlug ?? ''} /> {country}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
                {items.map(c => (
                  <HoverItem key={c._id} style={itemStyle} onClick={() => go(es ? `/traslados-privados-taxi/ciudad/${slug(c)}/` : `/private-transfers/city/${slug(c)}/`)}>
                    <span style={{ fontSize: '0.85rem', color: 'inherit' }}>{c.title}</span>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {countries.map(c => (
              <HoverItem key={c._id} style={itemStyle} onClick={() => go(es ? `/traslados-privados-taxi/pais/${slug(c)}/` : `/private-transfers/country/${slug(c)}/`)}>
                <Flag countrySlug={c.slug} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'inherit' }}>{c.title}</div>
                  {(c.airportCount || c.cityCount) ? (
                    <div style={{ fontSize: '0.7rem', color: 'inherit', opacity: 0.7 }}>
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

function MegaMenuMobile({ type, onClose, es, data, airports, cities, countries, airportsByCountry, citiesByCountry, slug, go }: {
  type: Tab; onClose: () => void; es: boolean; data: MenuData | null
  airports: Airport[]; cities: City[]; countries: Country[]
  airportsByCountry: Record<string, Airport[]>; citiesByCountry: Record<string, City[]>
  slug: (item: { slug: string; esSlug?: string }) => string
  go: (path: string) => void
}) {
  const [openCountry, setOpenCountry] = useState<string | null>(null)

  const groupStyle: React.CSSProperties = { borderBottom: '1px solid #f1f5f9' }
  const groupHeader: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0', cursor: 'pointer', gap: '0.5rem' }
  const itemRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer', borderBottom: '1px solid #f8fafc' }

  return (
    <div style={{ padding: '0.5rem 0' }}>
      {!data && <div style={{ padding: '1rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>Cargando...</div>}

      {/* AIRPORTS & CITIES — grouped by country accordion */}
      {(type === 'airports' || type === 'cities') && data && (
        <>
          {Object.entries(type === 'airports' ? airportsByCountry : citiesByCountry).map(([country, items]) => (
            <div key={country} style={groupStyle}>
              <div style={groupHeader} onClick={() => setOpenCountry(openCountry === country ? null : country)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Flag countrySlug={(items[0] as any)?.countrySlug ?? ''} />
                  <span className={russoOne.className} style={{ fontSize: '0.8rem', color: '#242426' }}>{country}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({items.length})</span>
                </div>
                <svg style={{ flexShrink: 0, transition: 'transform 0.2s', transform: openCountry === country ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#94a3b8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {openCountry === country && (
                <div style={{ paddingBottom: '0.5rem' }}>
                  {type === 'airports' && (items as Airport[]).map(a => (
                    <div key={a._id} style={itemRowStyle} onClick={() => go(es ? `/traslado-aeropuerto/${slug(a)}/` : `/airport-transfers/${slug(a)}/`)}>
                      {a.iataCode && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#8BAA1D', background: '#f0f4e3', padding: '1px 5px', flexShrink: 0 }}>{a.iataCode}</span>}
                      <span style={{ fontSize: '0.875rem', color: '#242426' }}>{a.title}</span>
                    </div>
                  ))}
                  {type === 'cities' && (items as City[]).map(c => (
                    <div key={c._id} style={itemRowStyle} onClick={() => go(es ? `/traslados-privados-taxi/ciudad/${slug(c)}/` : `/private-transfers/city/${slug(c)}/`)}>
                      <span style={{ fontSize: '0.875rem', color: '#242426' }}>{c.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div style={{ paddingTop: '1rem' }}>
            <button onClick={() => go(type === 'airports' ? (es ? '/aeropuertos/' : '/airports/') : (es ? '/ciudades/' : '/cities/'))}
              style={{ background: '#242426', color: '#ffffff', border: 'none', padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
              {type === 'airports' ? (es ? 'Ver todos los aeropuertos →' : 'Browse all airports →') : (es ? 'Ver todas las ciudades →' : 'Browse all cities →')}
            </button>
          </div>
        </>
      )}

      {/* COUNTRIES — simple grid */}
      {type === 'countries' && data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
            {countries.map(c => (
              <div key={c._id} onClick={() => go(es ? `/traslados-privados-taxi/pais/${slug(c)}/` : `/private-transfers/country/${slug(c)}/`)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer', background: '#f8fafc', borderRadius: '4px' }}>
                <Flag countrySlug={c.slug} />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#242426', lineHeight: 1.2 }}>{c.title}</div>
                  {(c.airportCount || c.cityCount) && (
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                      {[c.airportCount && `${c.airportCount} ${es ? 'aerop.' : 'airports'}`, c.cityCount && `${c.cityCount} ${es ? 'ciud.' : 'cities'}`].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => go(es ? '/paises/' : '/countries/')}
            style={{ background: '#242426', color: '#ffffff', border: 'none', padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
            {es ? 'Ver todos los países →' : 'Browse all countries →'}
          </button>
        </>
      )}
    </div>
  )
}

function HoverItem({ children, style, onClick }: { children: React.ReactNode; style: (h: boolean) => React.CSSProperties; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={style(hovered)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onClick}>
      <div style={{ transform: 'skewX(8deg)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: hovered ? '#ffffff' : 'inherit' }}>
        {children}
      </div>
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
