'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { russoOne } from '@/lib/fonts'
import { SkewButton } from '@/components/ui/SkewButton'
import { getServiceUrl } from '@/lib/utils/slugHelpers'
import type { Locale } from '@/lib/i18n/config'

const slides = [
  {
    slugEn: 'airport-transfers',
    slugEs: 'traslados-aeropuerto',
    stat: '120+ aeropuertos',
    titleKey: 'airportTransfers' as const,
    descKey: 'airportTransfersDesc' as const,
    img: '/services/airport-transfers.png',
  },
  {
    slugEn: 'port-transfers',
    slugEs: 'traslados-puerto',
    stat: '30+ puertos',
    titleKey: 'portTransfers' as const,
    descKey: 'portTransfersDesc' as const,
    img: '/services/port-transfers-v2.png',
  },
  {
    slugEn: 'train-station-transfers',
    slugEs: 'traslados-estacion-tren',
    stat: '80+ estaciones',
    titleKey: 'trainStationTransfers' as const,
    descKey: 'trainTransfersDesc' as const,
    img: '/services/train-transfers.png',
  },
  {
    slugEn: 'city-to-city',
    slugEs: 'ciudad-a-ciudad',
    stat: '200+ rutas',
    titleKey: 'cityToCity' as const,
    descKey: 'cityToCityDesc' as const,
    img: '/services/city-to-city.png',
  },
]

export function ServiceTypes() {
  const DURATION = 5000
  const [active, setActive] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const tNav = useTranslations('nav')
  const tHome = useTranslations('home')
  const tCommon = useTranslations('common')
  const locale = useLocale() as Locale

  const slide = slides[active]
  const href = getServiceUrl(locale === 'es' ? slide.slugEs : slide.slugEn, locale)

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(i => (i === slides.length - 1 ? 0 : i + 1))
      setAnimKey(k => k + 1)
    }, DURATION)
    return () => clearTimeout(timer)
  }, [active, animKey])

  function goTo(i: number) {
    setActive(i)
    setAnimKey(k => k + 1)
  }
  function prev() { goTo(active === 0 ? slides.length - 1 : active - 1) }
  function next() { goTo(active === slides.length - 1 ? 0 : active + 1) }

  return (
    <section className="bg-white service-types-section py-16 lg:py-20">
      <div className="site-container">
        {/* Preload all slide images */}
        <div style={{ display: 'none' }} aria-hidden="true">
          {slides.map(s => <Image key={s.img} src={s.img} alt="" width={1} height={1} sizes="1px" priority />)}
        </div>
        <div className="service-carousel-wrap" style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: '340px',
          overflow: 'hidden',
          backgroundColor: '#f8faf0',
        }}>

          {/* ── Left: Image ── */}
          <div className="service-carousel-img" style={{ position: 'relative', minHeight: '340px' }}>
            <Image
              src={slide.img}
              alt={tNav(slide.titleKey)}
              fill
              className="object-contain object-left service-carousel-img-el"
              sizes="50vw"
            />
          </div>

          {/* ── Right: Content ── */}
          <div className="service-carousel-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem 3rem 3rem 4rem' }}>
            {/* Stat label */}
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B8313', marginBottom: '0.75rem' }}>
              {slide.stat}
            </div>

            {/* Title */}
            <h2 className={russoOne.className} style={{ fontSize: '2.75rem', lineHeight: 1.1, color: '#242426', marginBottom: '1rem' }}>
              {tNav(slide.titleKey)}
            </h2>

            {/* Description */}
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#475569', marginBottom: '2rem', maxWidth: '380px' }}>
              {tHome(slide.descKey)}
            </p>

            {/* CTA Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <SkewButton href={`/${href.replace(/^\//, '')}`} variant="primary">{tCommon('learnMore')} {tNav(slide.titleKey)}</SkewButton>
            </div>
          </div>

        </div>

        {/* Dots — always outside the card */}
        <div className="service-carousel-dots" style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '1rem', alignItems: 'flex-end' }}>
          <style>{`
            @keyframes fillDot {
              from { transform: scaleX(0) }
              to   { transform: scaleX(1) }
            }
          `}</style>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                position: 'relative',
                width: '28px',
                height: i === active ? '36px' : '28px',
                padding: 0,
                border: 'none',
                background: i < active ? '#8BAA1D' : '#242426',
                cursor: 'pointer',
                transform: 'skewX(-12deg)',
                transition: 'height 0.3s',
                overflow: 'hidden',
              }}
            >
              {i === active && (
                <span
                  key={animKey}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#8BAA1D',
                    transformOrigin: 'left center',
                    animation: `fillDot ${DURATION}ms linear forwards`,
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
