'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { russoOne } from '@/lib/fonts'
import type { Locale } from '@/lib/i18n/config'

interface ServiceItem {
  slug: string
  title: string
  img: string
  iconPath: string
  stats: { value: string; label: string }[]
  desc: string
}

interface Props {
  items: ServiceItem[]
  locale: Locale
}

export function ServicesClient({ items, locale }: Props) {
  return (
    <section style={{ background: '#ffffff', padding: '3rem 6vw 5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '1.5rem' }}>
        {items.map(item => (
          <ServiceCard key={item.slug} item={item} locale={locale} />
        ))}
      </div>
    </section>
  )
}

function ServiceCard({ item, locale }: { item: ServiceItem; locale: Locale }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={{ pathname: '/services/[slug]/' as any, params: { slug: item.slug } }} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position: 'relative', height: '300px', overflow: 'hidden', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 3% 100%)', cursor: 'pointer' }}
      >
        <Image
          src={item.img}
          alt={item.title}
          fill
          style={{ objectFit: 'cover', objectPosition: 'center', transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.4s ease' }}
          sizes="600px"
        />

        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)', transition: 'opacity 0.3s' }} />
        {hovered && <div style={{ position: 'absolute', inset: 0, background: 'rgba(139,170,29,0.1)' }} />}

        {/* Icon badge */}
        <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', display: 'inline-flex', background: hovered ? '#8BAA1D' : 'rgba(36,36,38,0.75)', padding: '10px', transform: 'skewX(-8deg)', backdropFilter: 'blur(4px)', transition: 'background 0.2s' }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#ffffff" style={{ transform: 'skewX(8deg)', display: 'block' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
          </svg>
        </div>

        {/* Content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem 1.5rem 1.25rem' }}>
          <h2 className={russoOne.className} style={{ fontSize: '1.4rem', color: '#ffffff', margin: '0 0 0.6rem', transition: 'color 0.2s', ...(hovered ? { color: '#d4e87a' } : {}) }}>
            {item.title}
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: '0.85rem', maxWidth: '380px' }}>
            {item.desc}
          </p>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {item.stats.map(s => (
              <span key={s.label} style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#8BAA1D">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <strong style={{ color: 'rgba(255,255,255,0.9)', marginRight: '2px' }}>{s.value}</strong>
                {s.label}
              </span>
            ))}
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
