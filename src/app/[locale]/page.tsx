import { getTranslations } from 'next-intl/server'
import { HeroSection } from '@/components/sections/HeroSection'
import { BookingForm } from '@/components/ui/BookingForm'
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
      <div className="bg-white py-10 resp-booking-section">
        <div className="site-container">
          <BookingForm />
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { icon: '★', label: '4.8/5 Rating', sub: 'Based on 2,500+ reviews' },
              { icon: '◈', label: 'Fixed price', sub: 'No hidden charges' },
              { icon: '◷', label: '24/7 Support', sub: 'Always here to help' },
              { icon: '✓', label: 'Free cancellation', sub: 'Up to 24h before' },
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
