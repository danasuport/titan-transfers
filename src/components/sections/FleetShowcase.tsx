'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { russoOne } from '@/lib/fonts'
import { SkewButton } from '@/components/ui/SkewButton'

const DURATION = 5000
const PER_PAGE = 4

function IconPerson() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
    </svg>
  )
}
function IconBag() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg style={{ flexShrink: 0 }} width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#8BAA1D">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

const vehicles = [
  { key: 'economy',      pax: 3, bags: 3, img: '/vehicles/economy3pax.png' },
  { key: 'comfort',      pax: 3, bags: 3, img: '/vehicles/confort3pax.png' },
  { key: 'minivan',      pax: 6, bags: 5, img: '/vehicles/minivan.png' },
  { key: 'mpv',          pax: 7, bags: 7, img: '/vehicles/mvp-suv.png' },
  { key: 'premiumSedan', pax: 3, bags: 3, img: '/vehicles/premiumclaseE.png' },
  { key: 'luxurySedan',  pax: 3, bags: 2, img: '/vehicles/luxury.png' },
  { key: 'premiumVan',   pax: 6, bags: 6, img: '/vehicles/premiumminivan.png' },
] as const

export function FleetShowcase() {
  const t = useTranslations('fleet')
  const tTrust = useTranslations('trust')

  const pages = Math.ceil(vehicles.length / PER_PAGE)
  const [page, setPage] = useState(0)
  const [animKey, setAnimKey] = useState(0)


  function goTo(i: number) {
    setPage(i)
    setAnimKey(k => k + 1)
  }

  const visible = vehicles.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)
  const showCta = visible.length < PER_PAGE

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="site-container">

        {/* Preload all images silently so carousel never flickers */}
        <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {vehicles.map(v => (
            <Image key={v.key} src={v.img} alt="" fill sizes="1px" priority />
          ))}
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className={russoOne.className} style={{ fontSize: '3rem', color: '#242426', marginBottom: '0.75rem' }}>
            {t('title')}
          </h2>
          <p style={{ fontSize: '1rem', color: '#475569', marginBottom: '1.5rem' }}>
            {t('subtitle')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {[tTrust('fixedPrice'), tTrust('freeCancel')].map((feat) => (
              <div key={feat} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                border: '1.5px solid #8BAA1D', padding: '0.4rem 1rem',
                fontSize: '0.875rem', fontWeight: 500, color: '#242426',
              }}>
                <IconCheck />
                {feat}
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="resp-4col" style={{ display: 'grid', gap: '1.25rem', marginTop: '2.5rem' }}>
          {visible.map((v) => (
            <div key={v.key} style={{ border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
                <Image src={v.img} alt={t(v.key as any)} fill quality={80} className="object-cover" sizes="25vw" />
                <div style={{
                  position: 'absolute', bottom: '0.6rem', left: '0.6rem',
                  display: 'flex', gap: '0.5rem',
                }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                    color: '#ffffff', fontSize: '0.75rem', fontWeight: 600,
                    padding: '0.2rem 0.5rem', borderRadius: '3px',
                  }}>
                    <IconPerson />{v.pax}
                  </span>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                    color: '#ffffff', fontSize: '0.75rem', fontWeight: 600,
                    padding: '0.2rem 0.5rem', borderRadius: '3px',
                  }}>
                    <IconBag />{v.bags}
                  </span>
                </div>
              </div>
              <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#242426', marginBottom: '0.5rem' }}>{t(v.key as any)}</h3>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
                  {t(`${v.key}Desc` as any)}
                </p>
              </div>
            </div>
          ))}

          {/* CTA card */}
          {showCta && (
            <div style={{ position: 'relative', overflow: 'hidden', minHeight: '260px' }}>
              {/* Background photo */}
              <Image
                src="/how-it-works.jpg"
                alt=""
                fill
                className="object-cover"
                sizes="25vw"
              />
              {/* Green overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(139,170,29,0.88)' }} />
              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1, padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 className={russoOne.className} style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                  {tTrust('bookTransfer')}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {tTrust('fixedPriceDesc')}
                </p>
                <SkewButton href="/#booking" variant="outline-white" style={{ alignSelf: 'flex-start', fontSize: '0.875rem', padding: '0.6rem 1.5rem' }}>{tTrust('bookNow')}</SkewButton>
              </div>
            </div>
          )}
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '1.25rem', alignItems: 'flex-end' }}>
          <style>{`
            @keyframes fillDotFleet {
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
                position: 'relative', width: '28px',
                height: i === page ? '36px' : '28px',
                padding: 0, border: 'none',
                background: i < page ? '#8BAA1D' : '#242426',
                cursor: 'pointer', transform: 'skewX(-12deg)',
                transition: 'height 0.3s', overflow: 'hidden',
              }}
            >
              {i === page && (
                <span key={animKey} style={{
                  position: 'absolute', inset: 0, background: '#8BAA1D',
                  transformOrigin: 'left center',
                  animation: `fillDotFleet ${DURATION}ms linear forwards`,
                }} />
              )}
            </button>
          ))}
        </div>

      </div>
    </section>
  )
}
