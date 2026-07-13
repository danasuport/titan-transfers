'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useLocale } from 'next-intl'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { russoOne } from '@/lib/fonts'
import { getLocalizedPath } from '@/lib/utils/slugHelpers'
import { pick } from '@/lib/i18n/pick'
import type { Locale } from '@/lib/i18n/config'

interface Airport { _id: string; title: string; iataCode: string; slug: string; esSlug?: string; arSlug?: string; arTitle?: string; city?: string; country?: string; countryAr?: string; countrySlug?: string }
interface City { _id: string; title: string; slug: string; esSlug?: string; arSlug?: string; arTitle?: string; country?: string; countryAr?: string; countrySlug?: string }
interface Country { _id: string; title: string; slug: string; esSlug?: string; arSlug?: string; arTitle?: string; airportCount?: number; cityCount?: number }
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
  const es = locale === 'es'
  const ar = locale === 'ar'
  const [data, setData] = useState<MenuData | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/megamenu').then(r => r.json()).then(setData)
  }, [])

  function slug(item: { slug: string; esSlug?: string; arSlug?: string }) {
    if (ar && item.arSlug) return item.arSlug
    if (es && item.esSlug) return item.esSlug
    return item.slug
  }

  function title(item: { title: string; arTitle?: string }) {
    return ar && item.arTitle ? item.arTitle : item.title
  }

  function countryName(item: { country?: string; countryAr?: string }) {
    return ar && item.countryAr ? item.countryAr : (item.country ?? '')
  }

  const q = search.toLowerCase()

  const airports = (data?.airports ?? []).filter(a =>
    !q || a.title.toLowerCase().includes(q) || (a.arTitle ?? '').includes(search) || (a.iataCode ?? '').toLowerCase().includes(q) || (a.city ?? '').toLowerCase().includes(q) || (a.country ?? '').toLowerCase().includes(q) || (a.countryAr ?? '').includes(search)
  )

  const cities = (data?.cities ?? []).filter(c =>
    !q || c.title.toLowerCase().includes(q) || (c.arTitle ?? '').includes(search) || (c.country ?? '').toLowerCase().includes(q) || (c.countryAr ?? '').includes(search)
  )

  const countries = (data?.countries ?? []).filter(c =>
    !q || c.title.toLowerCase().includes(q) || (c.arTitle ?? '').includes(search)
  )

  // Group by country — use Arabic name if available so the heading is in Arabic too
  const airportsByCountry: Record<string, Airport[]> = {}
  airports.forEach(a => {
    const key = countryName(a) || 'Other'
    if (!airportsByCountry[key]) airportsByCountry[key] = []
    airportsByCountry[key].push(a)
  })

  const citiesByCountry: Record<string, City[]> = {}
  cities.forEach(c => {
    const key = countryName(c) || 'Other'
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
    textDecoration: 'none',
  })

  const airportSegment = getLocalizedPath('airport', locale as Locale)
  const citySegment = getLocalizedPath('private-transfers', locale as Locale)
  const countrySegment = getLocalizedPath('private-transfers-country', locale as Locale)

  function airportHref(a: Airport) {
    return `/${airportSegment}/${slug(a)}/`
  }
  function cityHref(c: City) {
    return `/${citySegment}/${slug(c)}/`
  }
  function countryHref(slugStr: string | undefined) {
    return `/${countrySegment}/${slugStr}/`
  }

  if (mobile) {
    return (
      <MegaMenuMobile type={type} onClose={onClose} locale={locale} data={data}
        airports={airports} cities={cities} countries={countries}
        airportsByCountry={airportsByCountry} citiesByCountry={citiesByCountry}
        slug={slug} title={title} airportHref={airportHref} cityHref={cityHref} countryHref={countryHref} />
    )
  }

  return (
    <div style={{ padding: '1.5rem 0 1rem' }}>

      {/* AIRPORTS */}
      {type === 'airports' && (
        <div>
          {!data && <Skeleton />}
          {data && Object.keys(airportsByCountry).length === 0 && <Empty locale={locale} />}
          <div style={{ columns: '4', columnGap: '2rem' }}>
            {Object.entries(airportsByCountry).map(([country, items]) => (
              <div key={country} style={{ breakInside: 'avoid', marginBottom: '1.25rem' }}>
                <Link href={countryHref(items[0]?.countrySlug) as never} onClick={onClose} className={russoOne.className} style={{ fontSize: '0.72rem', color: '#6B8313', textTransform: 'none', letterSpacing: '0.08em', marginBottom: '0.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
                  <Flag countrySlug={items[0]?.countrySlug ?? ''} /> {country}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                {items.map(a => (
                  <HoverItem key={a._id} href={airportHref(a)} onClose={onClose} style={itemStyle}>
                    {a.iataCode && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B8313', background: '#f0f4e3', padding: '1px 5px', borderRadius: '3px', flexShrink: 0 }}>
                        {a.iataCode}
                      </span>
                    )}
                    <span style={{ fontSize: '0.85rem', color: 'inherit' }}>{title(a)}</span>
                  </HoverItem>
                ))}
              </div>
            ))}
          </div>
          <Footer href="/airports/" label={pick(locale, { en: 'Browse all airports', es: 'Ver todos los aeropuertos', ar: 'تصفّح كل المطارات', it: 'Vedi tutti gli aeroporti', de: 'Alle Flughäfen durchsuchen' })} onClose={onClose} />
        </div>
      )}

      {/* CITIES */}
      {type === 'cities' && (
        <div>
          {!data && <Skeleton />}
          {data && Object.keys(citiesByCountry).length === 0 && <Empty locale={locale} />}
          <div style={{ columns: '4', columnGap: '2rem' }}>
            {Object.entries(citiesByCountry).map(([country, items]) => (
              <div key={country} style={{ breakInside: 'avoid', marginBottom: '1.25rem' }}>
                <Link href={countryHref(items[0]?.countrySlug) as never} onClick={onClose} className={russoOne.className} style={{ fontSize: '0.72rem', color: '#6B8313', textTransform: 'none', letterSpacing: '0.08em', marginBottom: '0.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
                  <Flag countrySlug={items[0]?.countrySlug ?? ''} /> {country}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                {items.map(c => (
                  <HoverItem key={c._id} href={cityHref(c)} onClose={onClose} style={itemStyle}>
                    <span style={{ fontSize: '0.85rem', color: 'inherit' }}>{title(c)}</span>
                  </HoverItem>
                ))}
              </div>
            ))}
          </div>
          <Footer href="/cities/" label={pick(locale, { en: 'Browse all cities', es: 'Ver todas las ciudades', ar: 'تصفّح كل المدن', it: 'Vedi tutte le città', de: 'Alle Städte durchsuchen' })} onClose={onClose} />
        </div>
      )}

      {/* COUNTRIES */}
      {type === 'countries' && (
        <div>
          {!data && <Skeleton />}
          {data && countries.length === 0 && <Empty locale={locale} />}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {countries.map(c => (
              <HoverItem key={c._id} href={countryHref(slug(c))} onClose={onClose} style={itemStyle}>
                <Flag countrySlug={c.slug} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'inherit' }}>{title(c)}</div>
                  {(c.airportCount || c.cityCount) ? (
                    <div style={{ fontSize: '0.7rem', color: 'inherit', opacity: 0.7 }}>
                      {c.airportCount ? `${c.airportCount} ${pick(locale, { en: 'airports', es: 'aeropuertos', ar: 'مطار', it: 'aeroporti', de: 'Flughäfen' })}` : ''}
                      {c.airportCount && c.cityCount ? ' · ' : ''}
                      {c.cityCount ? `${c.cityCount} ${pick(locale, { en: 'cities', es: 'ciudades', ar: 'مدينة', it: 'città', de: 'Städte' })}` : ''}
                    </div>
                  ) : null}
                </div>
              </HoverItem>
            ))}
          </div>
          <Footer href="/countries/" label={pick(locale, { en: 'Browse all countries', es: 'Ver todos los países', ar: 'تصفّح كل الدول', it: 'Vedi tutti i paesi', de: 'Alle Länder durchsuchen' })} onClose={onClose} />
        </div>
      )}

    </div>
  )
}

function MegaMenuMobile({ type, onClose, locale, data, countries, airportsByCountry, citiesByCountry, title, airportHref, cityHref, countryHref }: {
  type: Tab; onClose: () => void; locale: string; data: MenuData | null
  airports: Airport[]; cities: City[]; countries: Country[]
  airportsByCountry: Record<string, Airport[]>; citiesByCountry: Record<string, City[]>
  slug: (item: { slug: string; esSlug?: string; arSlug?: string }) => string
  title: (item: { title: string; arTitle?: string }) => string
  airportHref: (a: Airport) => string
  cityHref: (c: City) => string
  countryHref: (slug: string | undefined) => string
}) {
  const es = locale === 'es'
  const ar = locale === 'ar'
  const [openCountry, setOpenCountry] = useState<string | null>(null)

  const groupStyle: React.CSSProperties = { borderBottom: '1px solid #f1f5f9' }
  const groupHeader: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0', cursor: 'pointer', gap: '0.5rem' }
  const itemRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer', borderBottom: '1px solid #f8fafc', textDecoration: 'none', color: '#242426' }

  return (
    <div style={{ padding: '0.5rem 0' }}>
      {!data && <div style={{ padding: '1rem 0', color: '#64748b', fontSize: '0.85rem' }}>{pick(locale, { en: 'Loading...', es: 'Cargando...', ar: 'جارٍ التحميل...', it: 'Caricamento...', de: 'Wird geladen...' })}</div>}

      {/* AIRPORTS & CITIES — grouped by country accordion */}
      {(type === 'airports' || type === 'cities') && data && (
        <>
          {Object.entries(type === 'airports' ? airportsByCountry : citiesByCountry).map(([country, items]) => (
            <div key={country} style={groupStyle}>
              <div style={groupHeader} onClick={() => setOpenCountry(openCountry === country ? null : country)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Flag countrySlug={(items[0] as Airport | City)?.countrySlug ?? ''} />
                  <span className={russoOne.className} style={{ fontSize: '0.8rem', color: '#242426' }}>{country}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({items.length})</span>
                </div>
                <svg style={{ flexShrink: 0, transition: 'transform 0.2s', transform: openCountry === country ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#94a3b8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {openCountry === country && (
                <div style={{ paddingBottom: '0.5rem' }}>
                  {/* Country page link header */}
                  <Link href={countryHref((items[0] as Airport | City)?.countrySlug) as never} onClick={onClose} style={{ display: 'block', padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: '#6B8313', textDecoration: 'none', fontWeight: 600, borderBottom: '1px solid #f8fafc' }}>
                    {ar ? `عرض الدولة: ${country} ←` : es ? `Ver país: ${country} →` : `View country: ${country} →`}
                  </Link>
                  {type === 'airports' && (items as Airport[]).map(a => (
                    <Link key={a._id} href={airportHref(a) as never} onClick={onClose} style={itemRowStyle}>
                      {a.iataCode && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6B8313', background: '#f0f4e3', padding: '1px 5px', flexShrink: 0 }}>{a.iataCode}</span>}
                      <span style={{ fontSize: '0.875rem', color: '#242426' }}>{title(a)}</span>
                    </Link>
                  ))}
                  {type === 'cities' && (items as City[]).map(c => (
                    <Link key={c._id} href={cityHref(c) as never} onClick={onClose} style={itemRowStyle}>
                      <span style={{ fontSize: '0.875rem', color: '#242426' }}>{title(c)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div style={{ paddingTop: '1rem' }}>
            <Link href={(type === 'airports' ? '/airports/' : '/cities/') as never} onClick={onClose}
              style={{ display: 'block', textAlign: 'center', background: '#242426', color: '#ffffff', padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}>
              {type === 'airports'
                ? pick(locale, { en: 'Browse all airports →', es: 'Ver todos los aeropuertos →', ar: '← تصفّح كل المطارات', it: 'Vedi tutti gli aeroporti →', de: 'Alle Flughäfen durchsuchen →' })
                : pick(locale, { en: 'Browse all cities →', es: 'Ver todas las ciudades →', ar: '← تصفّح كل المدن', it: 'Vedi tutte le città →', de: 'Alle Städte durchsuchen →' })}
            </Link>
          </div>
        </>
      )}

      {/* COUNTRIES — simple grid */}
      {type === 'countries' && data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
            {countries.map(c => (
              <Link key={c._id} href={countryHref(ar && c.arSlug ? c.arSlug : (es && c.esSlug ? c.esSlug : c.slug)) as never} onClick={onClose}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer', background: '#f8fafc', borderRadius: '4px', textDecoration: 'none' }}>
                <Flag countrySlug={c.slug} />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#242426', lineHeight: 1.2 }}>{title(c)}</div>
                  {(c.airportCount || c.cityCount) && (
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                      {[
                        c.airportCount && `${c.airportCount} ${pick(locale, { en: 'airports', es: 'aerop.', ar: 'مطار', it: 'aeroporto', de: 'Flughäfen' })}`,
                        c.cityCount && `${c.cityCount} ${pick(locale, { en: 'cities', es: 'ciud.', ar: 'مدينة', it: 'città', de: 'Städte' })}`,
                      ].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <Link href={'/countries/' as never} onClick={onClose}
            style={{ display: 'block', textAlign: 'center', background: '#242426', color: '#ffffff', padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}>
            {pick(locale, { en: 'Browse all countries →', es: 'Ver todos los países →', ar: '← تصفّح كل الدول', it: 'Vedi tutti i paesi →', de: 'Alle Länder durchsuchen →' })}
          </Link>
        </>
      )}
    </div>
  )
}

function HoverItem({ children, style, href, onClose }: { children: ReactNode; style: (h: boolean) => React.CSSProperties; href: string; onClose: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link href={href as never} onClick={onClose} style={style(hovered)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ transform: 'skewX(8deg)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: hovered ? '#ffffff' : 'inherit' }}>
        {children}
      </div>
    </Link>
  )
}

function Footer({ href, label, onClose }: { href: string; label: string; onClose: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '0.5rem' }}>
      <Link
        href={href as never}
        onClick={onClose}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ background: hovered ? '#242426' : 'transparent', color: hovered ? '#ffffff' : '#242426', border: '2px solid #242426', padding: '0.4rem 1.25rem', transform: 'skewX(-12deg)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
      >
        <span style={{ transform: 'skewX(12deg)', display: 'inline-block' }}>{label} →</span>
      </Link>
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

function Empty({ locale }: { locale: string }) {
  return <p style={{ fontSize: '0.875rem', color: '#64748b', padding: '1rem 0' }}>{pick(locale, { en: 'No results', es: 'Sin resultados', ar: 'لا توجد نتائج', it: 'Nessun risultato', de: 'Keine Ergebnisse' })}</p>
}
