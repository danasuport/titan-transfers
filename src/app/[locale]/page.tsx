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
      <div className="bg-white py-10">
        <div className="site-container">
          <BookingForm />
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
