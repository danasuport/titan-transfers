'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { russoOne } from '@/lib/fonts'

const categories = [
  { href: '/airports/',  icon: '/icon-browse-airports.svg',  count: '120+', labelKey: 'airports'  as const },
  { href: '/cities/',    icon: '/icon-browse-cities.svg',    count: '145+', labelKey: 'cities'    as const },
  { href: '/countries/', icon: '/icon-browse-countries.svg', count: '30+',  labelKey: 'countries' as const },
  { href: '/services/',  icon: '/icon-browse-services.svg',  count: '4',    labelKey: 'services'  as const },
]

export function BrowseCategories() {
  const tNav = useTranslations('nav')
  const locale = useLocale()
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section style={{ background: '#f8faf0', padding: '4rem 0' }}>
      <div className="site-container">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className={russoOne.className} style={{ fontSize: '3rem', color: '#242426', marginBottom: '0.75rem' }}>
            {locale === 'es' ? 'Explora por categoría' : 'Browse by category'}
          </h2>
          <p style={{ fontSize: '1rem', color: '#475569', maxWidth: '560px', margin: '0 auto' }}>
            {locale === 'es'
              ? 'Encuentra tu traslado perfecto explorando aeropuertos, ciudades, países y servicios.'
              : 'Find your perfect transfer by browsing airports, cities, countries and services.'}
          </p>
        </div>

        {/* Categories row */}
        <div className="mob-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {categories.map((cat, i) => {
            const isHovered = hovered === i
            return (
              <Link
                key={cat.href}
                href={cat.href as any}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  textDecoration: 'none',
                  borderLeft: i > 0 ? '1px solid #e2e8f0' : 'none',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '1.25rem',
                }}
              >
                {/* Icon */}
                <Image src={cat.icon} alt="" width={80} height={80} style={{ flexShrink: 0 }} />

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div className={russoOne.className} style={{ fontSize: '2.75rem', color: '#8BAA1D', lineHeight: 1 }}>
                    {cat.count}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#242426', marginTop: '0.25rem' }}>
                    {tNav(cat.labelKey)}
                  </div>
                </div>

                {/* Arrow box */}
                <div style={{
                  flexShrink: 0,
                  width: '36px', height: '36px',
                  background: isHovered ? '#242426' : '#8BAA1D',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: isHovered ? 'skewX(-12deg) scale(1.15)' : 'skewX(-12deg) scale(1)',
                  transition: 'background 0.2s, transform 0.2s',
                }}>
                  <svg
                    width="18" height="18" fill="none" viewBox="0 0 24 24"
                    stroke="#ffffff" strokeWidth={2.5}
                    style={{
                      transform: 'skewX(12deg)',
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}
