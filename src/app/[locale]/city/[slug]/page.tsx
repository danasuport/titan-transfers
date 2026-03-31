import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { cityBySlugQuery, allCitiesQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { generatePageMetadata, generateCityMetadata } from '@/lib/seo/generateMetadata'
import { generateTaxiServiceSchema } from '@/lib/seo/schemaOrg'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { InlineBooking } from '@/components/sections/InlineBooking'
import { NearbyAirports } from '@/components/sections/NearbyAirports'
import { RelatedCities } from '@/components/sections/RelatedCities'
import { Link } from '@/lib/i18n/navigation'
import { formatDistance, formatDuration } from '@/lib/utils/formatters'
import { FAQ } from '@/components/sections/FAQ'
import { LatestNews } from '@/components/sections/LatestNews'
import { TrustNumbers } from '@/components/sections/TrustNumbers'
import { PortableText } from '@portabletext/react'
import type { Locale } from '@/lib/i18n/config'
import { getServiceUrl } from '@/lib/utils/slugHelpers'

export async function generateStaticParams() {
  const cities = await sanityClient.fetch(allCitiesQuery)
  return cities.map((c: { slug: { current: string } }) => ({ slug: c.slug.current }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const city = await sanityClient.fetch(cityBySlugQuery, { slug })
  if (!city) return {}
  const { title, description } = generateCityMetadata(city, locale as Locale)
  return generatePageMetadata({ title, description, path: `/city/${slug}/`, locale: locale as Locale, alternates: [{ locale: 'en' as Locale, path: `/city/${slug}/` }, { locale: 'es' as Locale, path: `/es/ciudad/${city.translations?.es?.slug?.current || slug}/` }] })
}

export default async function CityPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const city = await sanityClient.fetch(cityBySlugQuery, { slug })
  if (!city) notFound()

  const t = await getTranslations({ locale, namespace: 'city' })
  const cityTitle = (locale !== 'en' && city.translations?.[locale]?.title) || city.title
  const description = (locale !== 'en' && city.translations?.[locale]?.description) || city.description
  const imgUrl = urlFor(city.featuredImage)?.width(1920).height(600).quality(80).url()

  const breadcrumbs = [
    { label: city.country?.title || '', href: `/country/${city.country?.slug?.current}/` },
    { label: cityTitle },
  ]

  const faqItems = [
    { question: `How do I book a private transfer in ${cityTitle}?`, answer: `Use our booking form to instantly search and book your private transfer. Select your pickup and drop-off locations, choose your vehicle, and confirm at a fixed price.` },
    { question: `How do I book a private taxi in ${cityTitle}?`, answer: `Booking a private taxi in ${cityTitle} is easy. Enter your pickup and destination, choose from our vehicle options, and book at a fixed price with no surprises.` },
    { question: 'Do you offer round-trip transfers?', answer: 'Yes, you can book both one-way and round-trip transfers through our booking system.' },
    { question: `What areas of ${cityTitle} do you cover?`, answer: `We cover all areas of ${cityTitle} and surrounding regions including airports, ports, train stations, and hotels. If your destination is not listed, contact us for a custom quote.` },
  ]

  // Combine routesTo and routesFrom
  const allRoutes = [...(city.routesTo || []), ...(city.routesFrom || [])]

  return (
    <>
      <SchemaOrg data={generateTaxiServiceSchema({ name: `Private Transfers in ${cityTitle}`, description: `Book private transfers in ${cityTitle}`, url: `/city/${slug}/`, areaServed: cityTitle, rating: 4.8 })} />

      {/* Hero */}
      <section className="hero-always-dark relative overflow-hidden bg-dark">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={`Private transfers in ${cityTitle}`}
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

        <div className="relative w-full px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />
          {city.country && (
            <span className="mb-4 mt-6 inline-block rounded-full bg-brand-500/20 px-4 py-1 text-sm font-medium text-brand-400">
              {city.country.title}
            </span>
          )}
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t('transfers', { city: cityTitle })}
          </h1>
          <p className="max-w-2xl text-lg text-gray-400">
            {t('privateTaxi', { city: cityTitle })}
          </p>
        </div>
      </section>

      {/* Trust Numbers compact */}
      <TrustNumbers compact />

      {/* Inline Booking */}
      <InlineBooking title={t('bookTransfer', { city: cityTitle })} toLocation={cityTitle} toCategory="city" />

      {/* Description */}
      {description && (
        <section className="bg-dark py-16">
          <div className="site-container">
            <div className="prose prose-lg mx-auto max-w-none prose-headings:font-normal prose-headings:text-heading prose-p:leading-relaxed prose-p:text-body">
              <PortableText value={description} />
            </div>
          </div>
        </section>
      )}

      {/* Nearby Airports */}
      {city.nearbyAirports?.length > 0 && (
        <div className="bg-dark-light">
          <div className="w-full px-4 py-16 sm:px-6 lg:px-8">
            <NearbyAirports airports={city.nearbyAirports} title={t('airportTransfers', { city: cityTitle })} />
          </div>
        </div>
      )}

      {/* Routes */}
      {allRoutes.length > 0 && (
        <section className="bg-surface-100 py-16">
          <div className="site-container">
            <div className="mb-8">
              <div className="mb-4 h-1 w-16 rounded-full bg-brand-500" />
              <h2 className="text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
                {t('cityToCity', { city: cityTitle })}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {allRoutes.map((route: { _id: string; title: string; slug: { current: string }; distance?: number; estimatedDuration?: number; origin?: { _id: string; _type: string; title: string; slug: { current: string }; iataCode?: string; translations?: Record<string, { title?: string; slug?: { current: string } }> }; destination?: { _id: string; title: string; slug: { current: string }; translations?: Record<string, { title?: string; slug?: { current: string } }> }; translations?: Record<string, { slug?: { current: string } }> }) => {
                const originSlug = route.origin?.slug?.current
                const routeSlug = (locale !== 'en' && route.translations?.[locale]?.slug?.current) || route.slug.current
                const originName = (locale !== 'en' && route.origin?.translations?.[locale]?.title) || route.origin?.title || ''
                const destName = (locale !== 'en' && route.destination?.translations?.[locale]?.title) || route.destination?.title || ''
                if (!originSlug) return null
                return (
                  <Link
                    key={route._id}
                    href={`/airport/${originSlug}/${routeSlug}/` as any}
                    className="group relative overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:ring-brand-500/30 hover:shadow-lg"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-brand-500 to-brand-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {/* Origin → Destination */}
                    <div className="mb-3 flex items-center gap-2">
                      <span className="shrink-0 text-sm font-bold text-heading">{originName}</span>
                      <svg className="h-4 w-4 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                      <span className="shrink-0 text-sm font-bold text-brand-400">{destName}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted">
                      {route.distance && (
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                          {formatDistance(route.distance)}
                        </span>
                      )}
                      {route.estimatedDuration && (
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {formatDuration(route.estimatedDuration)}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Related Cities */}
      {city.relatedCities?.length > 0 && (
        <div className="bg-dark-light">
          <div className="w-full px-4 py-16 sm:px-6 lg:px-8">
            <RelatedCities cities={city.relatedCities} title={t('whyChoose', { city: cityTitle })} />
          </div>
        </div>
      )}

      {/* Available Services — Internal Linking */}
      <section className="bg-dark py-16">
        <div className="site-container">
          <div className="mb-8">
            <div className="mb-4 h-1 w-16 rounded-full bg-brand-500" />
            <h2 className="text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
              {locale === 'es' ? `Servicios disponibles en ${cityTitle}` : `Services available in ${cityTitle}`}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: getServiceUrl(locale === 'es' ? 'traslados-aeropuerto' : 'airport-transfers', locale as Locale), label: locale === 'es' ? 'Traslados Aeropuerto' : 'Airport Transfers', icon: 'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5' },
              { href: getServiceUrl(locale === 'es' ? 'traslados-puerto' : 'port-transfers', locale as Locale), label: locale === 'es' ? 'Traslados Puerto' : 'Port Transfers', icon: 'M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' },
              { href: getServiceUrl(locale === 'es' ? 'traslados-estacion-tren' : 'train-station-transfers', locale as Locale), label: locale === 'es' ? 'Traslados Estación' : 'Station Transfers', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121l-1.431-1.431A2.999 2.999 0 0017.466 9.5H15.75m-6 0V6.375m0 0a2.625 2.625 0 115.25 0M9.75 6.375v3.125' },
              { href: getServiceUrl(locale === 'es' ? 'ciudad-a-ciudad' : 'city-to-city', locale as Locale), label: locale === 'es' ? 'Ciudad a Ciudad' : 'City to City', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121L16.5 10.5M6 6.5h10.5' },
            ].map((svc) => (
              <Link
                key={svc.href}
                href={svc.href}
                className="group flex items-center gap-4 rounded-2xl bg-glass-bg p-5 ring-1 ring-glass-ring transition-all duration-300 hover:ring-brand-500/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={svc.icon} />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-heading transition-colors group-hover:text-brand-400">{svc.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-dark-light py-16">
        <div className="site-container">
          <FAQ items={faqItems} title={t('faq')} />
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-dark py-20">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative site-container px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
            {t('bookTransfer', { city: cityTitle })}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-body">
            {t('privateTaxi', { city: cityTitle })}
          </p>
        </div>
      </section>

      {/* Latest News */}
      <section className="bg-dark-light py-16">
        <div className="site-container">
          <LatestNews type="city" id={city._id} title={t('latestNews', { city: cityTitle })} />
        </div>
      </section>
    </>
  )
}
