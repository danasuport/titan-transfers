import { getTranslations } from 'next-intl/server'
import { HeroSection } from '@/components/sections/HeroSection'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { ServiceTypes } from '@/components/sections/ServiceTypes'
import { PopularDestinations } from '@/components/sections/PopularDestinations'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { FleetShowcase } from '@/components/sections/FleetShowcase'
import { Testimonials } from '@/components/sections/Testimonials'
import { CtaSection } from '@/components/sections/CtaSection'
import { BrowseCategories } from '@/components/sections/BrowseCategories'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { generateLocalBusinessSchema } from '@/lib/seo/schemaOrg'
import { pick } from '@/lib/i18n/pick'

// ISR: rebuild this page in the background every hour. Reads (e.g. Sanity)
// stay cached so navigation feels instant; new content shows up within 1h
// or immediately via /api/revalidate.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  return {
    title: 'Private Airport Transfers Worldwide | Titan Transfers',
    description: t('heroSubtitle'),
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <>
      <SchemaOrg data={generateLocalBusinessSchema()} />
      <HeroSection />
      {/* Trust signals strip — booking widget itself moved into HeroSection. */}
      <div className="bg-white py-6 resp-booking-section">
        <div className="site-container">
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              {
                icon: '★',
                label: pick(locale, { en: '4.8/5 Rating', es: 'Valoración 4.8/5', ar: 'تقييم ٤٫٨/٥' }),
                sub: pick(locale, { en: 'Based on 2,500+ reviews', es: 'Basado en +2.500 reseñas', ar: 'بناءً على أكثر من ٢٬٥٠٠ تقييم' }),
              },
              {
                icon: '◈',
                label: pick(locale, { en: 'Fixed price', es: 'Precio fijo', ar: 'سعر ثابت' }),
                sub: pick(locale, { en: 'No hidden charges', es: 'Sin cargos ocultos', ar: 'بدون رسوم خفية' }),
              },
              {
                icon: '◷',
                label: pick(locale, { en: '24/7 Support', es: 'Soporte 24/7', ar: 'دعم على مدار الساعة' }),
                sub: pick(locale, { en: 'Always here to help', es: 'Siempre disponibles', ar: 'دائماً هنا للمساعدة' }),
              },
              {
                icon: '✓',
                label: pick(locale, { en: 'Free cancellation', es: 'Cancelación gratuita', ar: 'إلغاء مجاني' }),
                sub: pick(locale, { en: 'Up to 24h before', es: 'Hasta 24h antes', ar: 'حتى ٢٤ ساعة قبل الرحلة' }),
              },
            ].map(({ icon, label, sub }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#6B8313', fontSize: '1rem', lineHeight: 1 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#242426' }}>{label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <WhyChooseUs />
      <ServiceTypes />
      <PopularDestinations locale={locale} />
      <HowItWorks />
      <FleetShowcase />
      <BrowseCategories />
      <Testimonials />
      <CtaSection />
    </>
  )
}
