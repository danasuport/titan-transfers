import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { routeBySlugQuery } from '@/lib/sanity/queries'
import { generatePageMetadata, generateRouteMetadata } from '@/lib/seo/generateMetadata'
import { generateTaxiServiceSchema } from '@/lib/seo/schemaOrg'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { InlineBooking } from '@/components/sections/InlineBooking'
import { FAQ } from '@/components/sections/FAQ'
import { LatestNews } from '@/components/sections/LatestNews'
import { TrustNumbers } from '@/components/sections/TrustNumbers'
import { PortableText } from '@portabletext/react'
import { Link } from '@/lib/i18n/navigation'
import { formatDistance, formatDuration } from '@/lib/utils/formatters'
import type { Locale } from '@/lib/i18n/config'
import { getServiceUrl } from '@/lib/utils/slugHelpers'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string; routeSlug: string }> }) {
  const { locale, slug, routeSlug } = await params
  const route = await sanityClient.fetch(routeBySlugQuery, { originSlug: slug, routeSlug })
  if (!route) return {}
  const { title, description } = generateRouteMetadata(route, locale as Locale)
  return generatePageMetadata({
    title,
    description,
    path: `/airport/${slug}/${routeSlug}/`,
    locale: locale as Locale,
    alternates: [
      { locale: 'en' as Locale, path: `/airport/${slug}/${routeSlug}/` },
      { locale: 'es' as Locale, path: `/es/aeropuerto/${slug}/${route.translations?.es?.slug?.current || routeSlug}/` },
    ],
  })
}

export default async function RoutePage({ params }: { params: Promise<{ locale: string; slug: string; routeSlug: string }> }) {
  const { locale, slug, routeSlug } = await params
  const route = await sanityClient.fetch(routeBySlugQuery, { originSlug: slug, routeSlug })
  if (!route) notFound()

  const t = await getTranslations({ locale, namespace: 'route' })
  const originTitle = (locale !== 'en' && route.origin?.translations?.[locale]?.title) || route.origin?.title || ''
  const destTitle = (locale !== 'en' && route.destination?.translations?.[locale]?.title) || route.destination?.title || ''
  const description = (locale !== 'en' && route.translations?.[locale]?.description) || route.description

  const breadcrumbs = [
    { label: route.country?.title || '', href: `/country/${route.country?.slug?.current}/` },
    { label: originTitle, href: `/airport/${slug}/` },
    { label: destTitle },
  ]

  const faqItems = [
    { question: `How long is the transfer from ${originTitle} to ${destTitle}?`, answer: route.estimatedDuration ? `The transfer takes approximately ${formatDuration(route.estimatedDuration)}.` : `Contact us for estimated travel time.` },
    { question: `How much does a private transfer to ${destTitle} cost?`, answer: `Use our booking form for an instant quote with fixed prices. No hidden charges.` },
    { question: `How much is a private taxi from ${originTitle} to ${destTitle}?`, answer: `Our private taxi service offers competitive fixed prices. Book online to see the exact price for your journey.` },
    { question: 'Can the driver wait if my flight is delayed?', answer: 'Yes, we monitor all flights and your driver will adjust the pickup time automatically at no extra cost.' },
    { question: 'Is it cheaper than a taxi?', answer: 'Our prices are competitive with regular taxis, and you get a guaranteed fixed price, professional driver, and comfortable vehicle.' },
  ]

  const whyBookItems = [
    { title: 'Fixed Price', desc: 'No surprises — price agreed before you travel', icon: 'shield' },
    { title: 'Meet & Greet', desc: 'Professional driver with name sign at arrivals', icon: 'user' },
    { title: 'Flight Monitoring', desc: 'We track your flight and adjust pickup time', icon: 'clock' },
    { title: 'Free Cancellation', desc: 'Cancel free up to 24 hours before pickup', icon: 'check' },
    { title: 'Comfortable Vehicles', desc: 'Modern, air-conditioned fleet for every need', icon: 'car' },
    { title: 'Door-to-Door', desc: 'Direct service from pickup to your destination', icon: 'map' },
  ]

  return (
    <>
      <SchemaOrg data={generateTaxiServiceSchema({ name: `${originTitle} to ${destTitle} Transfer`, description: `Private transfer from ${originTitle} to ${destTitle}`, url: `/airport/${slug}/${routeSlug}/`, areaServed: destTitle, rating: 4.8 })} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-dark">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark to-brand-900/10" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-500/5 blur-3xl" />

        <div className="relative w-full px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />

          {/* Route badges */}
          <div className="mb-6 mt-6 flex flex-wrap gap-3">
            {route.distance && (
              <span className="inline-flex items-center gap-2 rounded-full bg-glass-bg px-4 py-2 text-sm font-medium text-heading ring-1 ring-glass-ring backdrop-blur-sm">
                <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                {formatDistance(route.distance)}
              </span>
            )}
            {route.estimatedDuration && (
              <span className="inline-flex items-center gap-2 rounded-full bg-glass-bg px-4 py-2 text-sm font-medium text-heading ring-1 ring-glass-ring backdrop-blur-sm">
                <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {formatDuration(route.estimatedDuration)}
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-4 py-2 text-sm font-medium text-brand-400 backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
              24/7
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-heading sm:text-5xl lg:text-6xl">
            {t('privateTransfer', { origin: originTitle, destination: destTitle })}
          </h1>
          <p className="max-w-2xl text-lg text-body">
            {t('privateTaxi', { origin: originTitle, destination: destTitle })}
          </p>
        </div>
      </section>

      {/* Trust Numbers compact */}
      <TrustNumbers compact />

      {/* Inline Booking */}
      <InlineBooking
        title={t('bookTransfer', { destination: destTitle })}
        fromLocation={originTitle}
        fromCategory="airport"
        toLocation={destTitle}
        toCategory="city"
      />

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

      {/* Why Book — 6 cards with SVG icons */}
      <section className="bg-dark-light py-16">
        <div className="site-container">
          <div className="mb-10">
            <div className="mb-4 h-1 w-16 rounded-full bg-brand-500" />
            <h2 className="text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
              {t('whyBook', { destination: destTitle })}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyBookItems.map((item) => (
              <div key={item.title} className="group rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-brand-500/30">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400 transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mb-1 font-bold text-heading">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-dark py-16">
        <div className="site-container">
          <FAQ items={faqItems} title={t('faq')} />
        </div>
      </section>

      {/* Internal Links */}
      <section className="bg-dark py-16">
        <div className="site-container">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {route.destination?.slug?.current && (
              <Link
                href={`/city/${route.destination.slug.current}/` as any}
                className="group rounded-2xl bg-glass-bg p-6 ring-1 ring-glass-ring transition-all duration-300 hover:ring-brand-500/40"
              >
                <div className="mb-2 text-sm font-medium text-muted">{locale === 'es' ? 'Ciudad destino' : 'Destination city'}</div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-heading group-hover:text-brand-400">{destTitle}</span>
                  <svg className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </div>
              </Link>
            )}
            <Link
              href={`/airport/${slug}/` as any}
              className="group rounded-2xl bg-glass-bg p-6 ring-1 ring-glass-ring transition-all duration-300 hover:ring-brand-500/40"
            >
              <div className="mb-2 text-sm font-medium text-muted">{locale === 'es' ? 'Aeropuerto origen' : 'Origin airport'}</div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-heading group-hover:text-brand-400">{originTitle}</span>
                <svg className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </div>
            </Link>
            {route.country?.slug?.current && (
              <Link
                href={`/country/${route.country.slug.current}/` as any}
                className="group rounded-2xl bg-glass-bg p-6 ring-1 ring-glass-ring transition-all duration-300 hover:ring-brand-500/40"
              >
                <div className="mb-2 text-sm font-medium text-muted">{locale === 'es' ? 'País' : 'Country'}</div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-heading group-hover:text-brand-400">{route.country.title}</span>
                  <svg className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </div>
              </Link>
            )}
            <Link
              href={getServiceUrl(locale === 'es' ? 'traslados-aeropuerto' : 'airport-transfers', locale as Locale) as any}
              className="group rounded-2xl bg-glass-bg p-6 ring-1 ring-glass-ring transition-all duration-300 hover:ring-brand-500/40"
            >
              <div className="mb-2 text-sm font-medium text-muted">{locale === 'es' ? 'Nuestro servicio' : 'Our service'}</div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-heading group-hover:text-brand-400">{locale === 'es' ? 'Traslados Aeropuerto' : 'Airport Transfers'}</span>
                <svg className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-dark-light py-20">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative site-container px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
            {t('bookTransfer', { destination: destTitle })}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-body">
            {t('privateTaxi', { origin: originTitle, destination: destTitle })}
          </p>
        </div>
      </section>

      {/* Latest News */}
      {route.destination && (
        <section className="bg-dark-light py-16">
          <div className="site-container">
            <LatestNews type="city" id={route.destination._id} title={t('news', { destination: destTitle })} limit={3} />
          </div>
        </section>
      )}
    </>
  )
}
