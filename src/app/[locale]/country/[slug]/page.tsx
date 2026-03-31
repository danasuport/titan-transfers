import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { countryBySlugQuery, allCountriesQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { generatePageMetadata, generateCountryMetadata } from '@/lib/seo/generateMetadata'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { generateTaxiServiceSchema } from '@/lib/seo/schemaOrg'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { InlineBooking } from '@/components/sections/InlineBooking'
import { CountryOverview } from '@/components/sections/CountryOverview'
import { FAQ } from '@/components/sections/FAQ'
import { LatestNews } from '@/components/sections/LatestNews'
import { TrustNumbers } from '@/components/sections/TrustNumbers'
import { PortableText } from '@portabletext/react'
import type { Locale } from '@/lib/i18n/config'

export async function generateStaticParams() {
  const countries = await sanityClient.fetch(allCountriesQuery)
  return countries.map((c: { slug: { current: string } }) => ({ slug: c.slug.current }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const country = await sanityClient.fetch(countryBySlugQuery, { slug })
  if (!country) return {}
  const { title, description } = generateCountryMetadata(country, locale as Locale)
  return generatePageMetadata({ title, description, path: `/country/${slug}/`, locale: locale as Locale, alternates: [{ locale: 'en' as Locale, path: `/country/${slug}/` }, { locale: 'es' as Locale, path: `/es/pais/${country.translations?.es?.slug?.current || slug}/` }] })
}

export default async function CountryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const country = await sanityClient.fetch(countryBySlugQuery, { slug })
  if (!country) notFound()

  const t = await getTranslations({ locale, namespace: 'country' })
  const countryTitle = (locale !== 'en' && country.translations?.[locale]?.title) || country.title
  const description = (locale !== 'en' && country.translations?.[locale]?.description) || country.description
  const imgUrl = urlFor(country.featuredImage)?.width(1920).height(600).quality(80).url()

  const airportCount = country.airports?.length || 0
  const cityCount = country.cities?.length || 0

  const faqItems = [
    { question: `How do I book a private transfer in ${countryTitle}?`, answer: `Use our booking form to search for transfers across ${countryTitle}. Enter your pickup and destination to get an instant quote with fixed prices.` },
    { question: `Which airports in ${countryTitle} do you cover?`, answer: `We cover ${airportCount > 0 ? airportCount : 'all major'} airports in ${countryTitle}, including both international and regional airports. Browse the full list above.` },
    { question: `Is a private taxi available in all cities in ${countryTitle}?`, answer: `We offer private taxi services in the main cities and tourist destinations across ${countryTitle}, with door-to-door service.` },
    { question: `How much does an airport transfer cost in ${countryTitle}?`, answer: `Prices vary by route and vehicle type. Use our booking system for instant quotes with fixed prices and no hidden charges.` },
  ]

  return (
    <>
      <SchemaOrg data={generateTaxiServiceSchema({ name: `Private Transfers in ${countryTitle}`, description: `Book transfers across ${countryTitle}`, url: `/country/${slug}/`, areaServed: countryTitle, rating: 4.8 })} />

      {/* Hero */}
      <section className="hero-always-dark relative overflow-hidden bg-dark">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={`Private transfers in ${countryTitle}`}
            fill
            className="object-cover opacity-30"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark to-brand-900/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-dark/40" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: countryTitle }]} />
          <h1 className="mb-4 mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t('transfers', { country: countryTitle })}
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-gray-400">
            {t('privateTaxi', { country: countryTitle })}
          </p>
          {/* Stats badges */}
          <div className="flex flex-wrap gap-3">
            {airportCount > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                {airportCount} {t('airports', { country: '' }).trim()}
              </span>
            )}
            {cityCount > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
                {cityCount} {t('popularCities', { country: '' }).trim()}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Trust Numbers compact */}
      <TrustNumbers compact />

      {/* Description */}
      {description && (
        <section className="bg-dark py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg mx-auto max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-heading prose-p:leading-relaxed prose-p:text-body">
              <PortableText value={description} />
            </div>
          </div>
        </section>
      )}

      {/* Airports */}
      {country.airports?.length > 0 && (
        <section className="bg-dark-light py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="mb-4 h-1 w-16 rounded-full bg-brand-500" />
              <h2 className="text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
                {t('airports', { country: countryTitle })}
              </h2>
            </div>
            <CountryOverview airports={country.airports} />
          </div>
        </section>
      )}

      {/* Cities */}
      {country.cities?.length > 0 && (
        <section className="bg-surface-100 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="mb-4 h-1 w-16 rounded-full bg-brand-500" />
              <h2 className="text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
                {t('popularCities', { country: countryTitle })}
              </h2>
            </div>
            <CountryOverview cities={country.cities} />
          </div>
        </section>
      )}

      {/* Regions */}
      {country.regions?.length > 0 && (
        <section className="bg-dark-light py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="mb-4 h-1 w-16 rounded-full bg-brand-500" />
              <h2 className="text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
                {t('regions', { country: countryTitle })}
              </h2>
            </div>
            <CountryOverview regions={country.regions} />
          </div>
        </section>
      )}

      {/* Inline Booking */}
      <InlineBooking title={t('bookTransfer', { country: countryTitle })} />

      {/* FAQ */}
      <section className="bg-dark py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FAQ items={faqItems} title={t('faq')} />
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-dark py-20">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
            {t('bookTransfer', { country: countryTitle })}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-body">
            {t('privateTaxi', { country: countryTitle })}
          </p>
        </div>
      </section>

      {/* Latest News */}
      <section className="bg-dark-light py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LatestNews type="country" id={country._id} title={t('latestNews', { country: countryTitle })} limit={6} />
        </div>
      </section>
    </>
  )
}
