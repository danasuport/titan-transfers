'use client'

import Image from 'next/image'
import { useLocale } from 'next-intl'
import { russoOne } from '@/lib/fonts'
import { SkewButton } from '@/components/ui/SkewButton'

export function CtaSection() {
  const locale = useLocale()
  const es = locale === 'es'

  return (
    <section style={{ background: '#ffffff', position: 'relative', paddingBottom: '8rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '45fr 55fr', minHeight: '500px' }}>

        {/* LEFT: phones */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '6vw', zIndex: 3 }}>
          <Image
            src="/mockup.png"
            alt="Titan Transfers app"
            width={600}
            height={650}
            style={{ objectFit: 'contain', maxHeight: '620px', position: 'relative', zIndex: 4 }}
          />
        </div>

        {/* RIGHT: two stacked blocks */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Top: CTA */}
          <div style={{ flex: 1, padding: '3.5rem 5vw 3rem 4vw' }}>
            <h2 className={russoOne.className} style={{ fontSize: '3.5rem', color: '#242426', lineHeight: 1.05, marginBottom: '1rem' }}>
              {es ? '¿Listo para reservar tu transfer?' : 'Ready to book your transfer?'}
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: '480px' }}>
              {es
                ? 'Consulta tu precio al instante con tarifas fijas, recogida personalizada y cancelación gratuita hasta 24 horas antes.'
                : 'Get your instant price with fixed rates, personalised pick-up and free cancellation up to 24 hours before.'}
            </p>

            {/* Checkmarks */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {[
                es ? 'Precio fijo' : 'Fixed price',
                es ? 'Soporte 24/7' : '24/7 support',
                es ? 'Pago seguro' : 'Secure payment',
              ].map(label => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8BAA1D" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#242426' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <SkewButton href="/#booking" variant="primary">{es ? 'Reserva tu transfer ahora' : 'Book your transfer now'}</SkewButton>
              <SkewButton href="/contact/" variant="outline">{es ? 'Contáctanos' : 'Contact us'}</SkewButton>
            </div>
          </div>

          {/* Bottom: App download */}
          <div style={{ padding: '2.5rem 4vw', border: '1px solid #e5e7eb', margin: '0 2vw 4rem -8vw', position: 'relative', zIndex: 2, background: '#ffffff' }}>
            <h3 className={russoOne.className} style={{ fontSize: '2rem', color: '#8BAA1D', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              {es ? 'Descarga la app y reserva tu transfer ahora' : 'Download the app and book your transfer now'}
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a href="#" style={{ display: 'inline-block' }}>
                <Image src="/app-store-btn.png" alt="Download on the App Store" width={148} height={44} style={{ height: '44px', width: 'auto' }} />
              </a>
              <a href="#" style={{ display: 'inline-block' }}>
                <Image src="/play-store-btn.png" alt="Get it on Google Play" width={148} height={44} style={{ height: '44px', width: 'auto' }} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
