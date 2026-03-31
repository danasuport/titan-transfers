import { getTranslations } from 'next-intl/server'
import { HeroSection } from '@/components/sections/HeroSection'
import { BookingWidget } from '@/components/booking/BookingWidget'
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
      {/* 1. Hero */}
      <HeroSection />
      {/* 2. Booking widget */}
      <div className="bg-white pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BookingWidget />
        </div>
      </div>
      {/* 3. Why choose us */}
      <WhyChooseUs />
      {/* 4. Services */}
      <ServiceTypes />
      {/* 5. Popular Destinations */}
      <PopularDestinations locale={locale} />
      {/* 6. How It Works */}
      <HowItWorks />
      {/* 7. Fleet */}
      <FleetShowcase />
      {/* 8. Browse Categories */}
      <BrowseCategories />
      {/* 9. Testimonials */}
      <Testimonials />
      {/* 10. CTA */}
      <CtaSection />
    </>
  )
}
