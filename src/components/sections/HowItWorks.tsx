'use client'

import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { russoOne } from '@/lib/fonts'

function Isotipo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 137 / 160)} viewBox="0 0 160 137" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M107.141 0L26.4593 136.725H0L49.2004 53.3331L18.1139 53.2584L18.643 30.4995H62.6797L80.6744 0H107.141Z" fill="#8BAA1D"/>
      <path d="M160 30.4995V53.3331L113.035 53.2584L63.9016 136.524L37.3157 136.725L118.005 0H144.472L126.47 30.4995H160Z" fill="#8BAA1D"/>
    </svg>
  )
}

export function HowItWorks() {
  const t = useTranslations('home')
  const tHiw = useTranslations('howItWorks')
  const locale = useLocale()

  const steps = [
    { num: '01', titleKey: 'step1Title', descKey: 'step1Desc' },
    { num: '02', titleKey: 'step2Title', descKey: 'step2Desc' },
    { num: '03', titleKey: 'step3Title', descKey: 'step3Desc' },
  ]

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="site-container">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 className={russoOne.className} style={{ fontSize: '3rem', color: '#242426', marginBottom: '0.75rem' }}>
            {t('howItWorks')}
          </h2>
          <p style={{ fontSize: '1rem', color: '#475569' }}>
            {tHiw('subtitle')}
          </p>
        </div>

        {/* Grid: image left, steps right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>

          {/* ── Left: image with 3-strip mask (same as WhyChooseUs) ── */}
          <div style={{ position: 'relative', height: '480px' }}>
            {/* Strip 1 — very narrow */}
            <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(5% 0%, 12% 0%, 7% 100%, 0% 100%)' }}>
              <Image src="/how-it-works.jpg" alt="" fill className="object-cover" sizes="50vw" />
            </div>
            {/* Strip 2 — narrow */}
            <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(20% 0%, 27% 0%, 22% 100%, 15% 100%)' }}>
              <Image src="/how-it-works.jpg" alt="" fill className="object-cover" sizes="50vw" />
            </div>
            {/* Strip 3 — main wide */}
            <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(35% 0%, 100% 0%, 100% 100%, 30% 100%)' }}>
              <Image src="/how-it-works.jpg" alt="Cómo funciona Titan Transfers" fill className="object-cover" sizes="50vw" />
            </div>
          </div>

          {/* ── Right: steps ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {steps.map((step) => (
              <div key={step.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>

                {/* Icon: isotipo + number overlapping */}
                <div style={{ position: 'relative', flexShrink: 0, width: '120px', height: '72px' }}>
                  {/* Number in front, bottom-left, large */}
                  <span
                    className={russoOne.className}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      fontSize: '3.5rem',
                      color: '#242426',
                      lineHeight: 1,
                      zIndex: 2,
                    }}
                  >
                    {step.num}
                  </span>
                  {/* Isotipo behind, aligned to same baseline, slightly overlapping number */}
                  <div style={{ position: 'absolute', bottom: '10px', right: '42px', zIndex: 1 }}>
                    <Isotipo size={72} />
                  </div>
                </div>

                {/* Text */}
                <div style={{ paddingTop: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 400, color: '#242426', marginBottom: '0.5rem' }}>
                    {t(step.titleKey as any)}
                  </h3>
                  <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.7, maxWidth: '360px' }}>
                    {t(step.descKey as any)}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
