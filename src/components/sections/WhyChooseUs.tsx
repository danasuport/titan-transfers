'use client'

import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { russoOne } from '@/lib/fonts'


export function WhyChooseUs() {
  const t = useTranslations('home')
  const tTrust = useTranslations('trust')
  const locale = useLocale()

  const stats = [
    { value: '+120', label: tTrust('airports'), icon: '/icon-airplane.svg' },
    { value: '+30', label: tTrust('countries'), icon: '/icon-map.svg' },
    { value: '24/7', label: locale === 'es' ? 'Soporte' : 'Support', icon: '/icon-countries.svg' },
  ]

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="site-container">
        <div className="resp-2col" style={{ display: 'grid', gap: '4rem', alignItems: 'center' }}>

          {/* ── Left: Text ── */}
          <div>
            <h2
              className={russoOne.className}
              style={{ fontSize: '2.75rem', lineHeight: 1.1, color: '#242426', marginBottom: '1.25rem' }}
            >
              {t('whyChooseTitle')}
            </h2>

            <p style={{ fontSize: '24px', lineHeight: 1.6, color: '#475569', marginBottom: '2rem', maxWidth: '600px' }}>
              {t('whyChooseSubtitle')}
            </p>

            {/* Stats */}
            <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
              {stats.map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Image src={s.icon} alt="" width={56} height={56} style={{ flexShrink: 0 }} />
                  <div>
                    <div className={russoOne.className} style={{ fontSize: '2.75rem', color: '#7C9919', lineHeight: 1 }}>
                      {s.value}
                    </div>
                    <div style={{ marginTop: '0.25rem', fontSize: '1rem', color: '#6b7280' }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Image with 3-strip diagonal mask ── */}
          {/*
            Each strip is a parallelogram: left edge is diagonal (top-left pushed right).
            All 3 divs are positioned absolutely and sized to cover the full container,
            then clipped to show only their respective vertical slice.
            clip-path coords: top-left%, top-right%, bottom-right%, bottom-left%
            Diagonal offset: ~6% of width shifts the top-left inward
          */}
          <div style={{ position: 'relative', height: '480px', width: '100%' }}>

            {/* Strip 1 — very narrow, diagonal inverted (leans left going down) */}
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(5% 0%, 12% 0%, 7% 100%, 0% 100%)',
            }}>
              <Image src="/woman-car.jpg" alt="" fill className="object-cover" sizes="50vw" style={{ objectPosition: 'center center' }} />
            </div>

            {/* Strip 2 — narrow */}
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(20% 0%, 27% 0%, 22% 100%, 15% 100%)',
            }}>
              <Image src="/woman-car.jpg" alt="" fill className="object-cover" sizes="50vw" style={{ objectPosition: 'center center' }} />
            </div>

            {/* Strip 3 — main wide slice on the right */}
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(35% 0%, 100% 0%, 100% 100%, 30% 100%)',
            }}>
              <Image src="/woman-car.jpg" alt="Woman in luxury transfer" fill className="object-cover" sizes="50vw" style={{ objectPosition: 'center center' }} />
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
