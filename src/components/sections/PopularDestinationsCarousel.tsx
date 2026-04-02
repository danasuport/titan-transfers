'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { useLocale } from 'next-intl'
import { russoOne } from '@/lib/fonts'

const DURATION = 5000
const PER_PAGE = 5

interface City {
  _id: string
  title: string
  slug: { current: string }
  imgUrl?: string
  country?: { title: string }
  localTitle: string
  localSlug: string
  linkPrefix?: string
}

export function PopularDestinationsCarousel({ cities, heading, subheading }: {
  cities: City[]
  heading: string
  subheading: string
}) {
  const locale = useLocale()
  const pages = Math.ceil(cities.length / PER_PAGE)
  const [page, setPage] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(p => (p === pages - 1 ? 0 : p + 1))
      setAnimKey(k => k + 1)
    }, DURATION)
    return () => clearTimeout(t)
  }, [page, animKey, pages])

  function goTo(i: number) {
    setPage(i)
    setAnimKey(k => k + 1)
  }

  const visible = cities.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="site-container">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className={russoOne.className} style={{ fontSize: '3rem', color: '#242426', marginBottom: '0.75rem' }}>
            {heading}
          </h2>
          <p style={{ fontSize: '1rem', color: '#475569', maxWidth: '640px', margin: '0 auto 1rem' }}>
            {subheading}
          </p>
          <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '700px', margin: '0 auto', lineHeight: 1.7 }}>
            {locale === 'es'
              ? <>Reserva tu transfer privado desde el aeropuerto en{' '}
                  <Link href={'/traslados-privados-taxi/ciudad/barcelona/' as any} style={{ color: '#8BAA1D', textDecoration: 'none', fontWeight: 500 }}>Barcelona</Link>,{' '}
                  <Link href={'/traslados-privados-taxi/ciudad/london/' as any} style={{ color: '#8BAA1D', textDecoration: 'none', fontWeight: 500 }}>Londres</Link>,{' '}
                  <Link href={'/traslados-privados-taxi/ciudad/paris/' as any} style={{ color: '#8BAA1D', textDecoration: 'none', fontWeight: 500 }}>París</Link>,{' '}
                  <Link href={'/traslados-privados-taxi/ciudad/dubai/' as any} style={{ color: '#8BAA1D', textDecoration: 'none', fontWeight: 500 }}>Dubái</Link>{' '}
                  y más de 100 destinos en todo el mundo. Precio fijo, conductor profesional y recogida personalizada.</>
              : <>Book your private airport transfer in{' '}
                  <Link href={'/private-transfers/city/barcelona/' as any} style={{ color: '#8BAA1D', textDecoration: 'none', fontWeight: 500 }}>Barcelona</Link>,{' '}
                  <Link href={'/private-transfers/city/london/' as any} style={{ color: '#8BAA1D', textDecoration: 'none', fontWeight: 500 }}>London</Link>,{' '}
                  <Link href={'/private-transfers/city/paris/' as any} style={{ color: '#8BAA1D', textDecoration: 'none', fontWeight: 500 }}>Paris</Link>,{' '}
                  <Link href={'/private-transfers/city/dubai/' as any} style={{ color: '#8BAA1D', textDecoration: 'none', fontWeight: 500 }}>Dubai</Link>{' '}
                  and 100+ destinations worldwide. Fixed price, professional driver, meet & greet included.</>
            }
          </p>
        </div>

        {/* Preload all images */}
        <div style={{ display: 'none' }} aria-hidden="true">
          {cities.map(c => c.imgUrl && (
            <Image key={c._id} src={c.imgUrl} alt="" width={1} height={1} sizes="1px" priority />
          ))}
        </div>

        {/* Cards grid */}
        <div className="resp-destinations-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', minHeight: '340px' }}>
          {visible.map((city, idx) => (
            <Link
              key={city._id}
              href={`${city.linkPrefix ?? '/private-transfers/city/'}${city.localSlug}/` as any}
              className={idx >= 4 ? 'dest-card-5th' : ''}
              style={{ textDecoration: 'none', display: 'block', borderRadius: '8px', overflow: 'hidden', position: 'relative', aspectRatio: '3/4' }}
            >
              {/* Image */}
              {city.imgUrl ? (
                <Image
                  src={city.imgUrl}
                  alt={`Transfer privado en ${city.localTitle}`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: '#e2e8f0' }} />
              )}

              {/* Country chip top-left */}
              {city.country && (
                <div style={{
                  position: 'absolute', top: '0.75rem', left: '0.75rem',
                  background: 'rgba(0,0,0,0.45)',
                  backdropFilter: 'blur(6px)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '4px',
                }}>
                  {city.country.title}
                </div>
              )}

              {/* Bottom bar */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: '#8BAA1D',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span className={russoOne.className} style={{ color: '#ffffff', fontSize: '1.25rem' }}>
                  {city.localTitle}
                </span>
                {/* Decorative strips */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0, 1].map(i => (
                    <div key={i} style={{
                      width: '10px', height: '22px',
                      background: 'rgba(255,255,255,0.5)',
                      transform: 'skewX(-12deg)',
                    }} />
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '1.25rem', alignItems: 'flex-end' }}>
          <style>{`
            @keyframes fillDotDest {
              from { transform: scaleX(0) }
              to   { transform: scaleX(1) }
            }
          `}</style>
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Página ${i + 1}`}
              style={{
                position: 'relative',
                width: '28px',
                height: i === page ? '36px' : '28px',
                padding: 0,
                border: 'none',
                background: i < page ? '#8BAA1D' : '#242426',
                cursor: 'pointer',
                transform: 'skewX(-12deg)',
                transition: 'height 0.3s',
                overflow: 'hidden',
              }}
            >
              {i === page && (
                <span
                  key={animKey}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#8BAA1D',
                    transformOrigin: 'left center',
                    animation: `fillDotDest ${DURATION}ms linear forwards`,
                  }}
                />
              )}
            </button>
          ))}
        </div>

      </div>
    </section>
  )
}
