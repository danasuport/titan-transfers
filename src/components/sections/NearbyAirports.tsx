'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { getAirportUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import { russoOne } from '@/lib/fonts'
import type { Locale } from '@/lib/i18n/config'

const DURATION = 4000
const PER_PAGE = 4

interface Airport {
  _id: string
  title: string
  slug: { current: string }
  iataCode?: string
  translations?: Record<string, { title?: string; slug?: { current: string } }>
}

function IconPlane() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  )
}

function IconArrow() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}

export function NearbyAirports({ airports, title }: { airports: Airport[]; title?: string }) {
  const locale = useLocale() as Locale
  const [page, setPage] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  if (!airports || airports.length === 0) return null

  const pages = Math.ceil(airports.length / PER_PAGE)

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (pages <= 1) return
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

  const visible = airports.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {title && (
        <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#242426', textTransform: 'none', marginBottom: '2rem', textAlign: 'center' }}>
          {title}
        </h2>
      )}

      {/* Cards */}
      <div
        key={animKey}
        className="resp-nearby-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(visible.length, 4)}, 1fr)`,
          gap: '1rem',
          animation: 'nearbyFade 0.35s ease-out',
        }}
      >
        {visible.map((airport) => (
          <Link
            key={airport._id}
            href={getAirportUrl(airport, locale) as any}
            style={{ textDecoration: 'none' }}
          >
            <AirportCard airport={airport} locale={locale} />
          </Link>
        ))}
      </div>

      {/* Dots — skewed squares matching fleet/destinations carousels */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '2rem' }}>
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Page ${i + 1}`}
              style={{
                position: 'relative',
                width: '24px',
                height: i === page ? '32px' : '24px',
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
                <span key={animKey} style={{
                  position: 'absolute', inset: 0, background: '#8BAA1D',
                  transformOrigin: 'left center',
                  animation: `fillNearby ${DURATION}ms linear forwards`,
                }} />
              )}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes nearbyFade {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fillNearby {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}

function AirportCard({ airport, locale }: { airport: Airport; locale: Locale }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        background: hovered ? '#ffffff' : '#F8FAF0',
        border: `1.5px solid ${hovered ? '#8BAA1D' : '#e5e7eb'}`,
        padding: '1rem 1.25rem',
        borderRadius: '4px',
        transition: 'border-color 0.15s, background 0.15s',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Green left accent on hover */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: '3px', background: '#8BAA1D',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.15s',
      }} />

      {/* IATA badge */}
      <div style={{
        flexShrink: 0,
        width: '44px', height: '44px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hovered ? '#8BAA1D' : '#242426',
        color: '#ffffff',
        fontSize: '0.7rem', fontWeight: 800,
        letterSpacing: '0.05em',
        transform: 'skewX(-8deg)',
        transition: 'background 0.15s',
      }}>
        <span style={{ transform: 'skewX(8deg)', display: 'block', textAlign: 'center', lineHeight: 1 }}>
          {airport.iataCode ? airport.iataCode : <IconPlane />}
        </span>
      </div>

      {/* Name */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <span style={{
          display: 'block',
          fontSize: '0.875rem', fontWeight: 600,
          color: hovered ? '#8BAA1D' : '#242426',
          whiteSpace: 'normal', lineHeight: 1.35,
          transition: 'color 0.15s',
        }}>
          {getTranslatedTitle(airport, locale)}
        </span>
        {airport.iataCode && (
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px', display: 'block' }}>
            {airport.iataCode}
          </span>
        )}
      </div>

      {/* Arrow */}
      <div style={{
        flexShrink: 0,
        color: hovered ? '#8BAA1D' : '#94a3b8',
        transition: 'color 0.15s, transform 0.15s',
        transform: hovered ? 'translateX(2px)' : 'translateX(0)',
      }}>
        <IconArrow />
      </div>
    </div>
  )
}
