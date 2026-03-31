import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { airportBySlugQuery, allAirportsQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { generatePageMetadata, generateAirportMetadata } from '@/lib/seo/generateMetadata'
import { generateTaxiServiceSchema } from '@/lib/seo/schemaOrg'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { BookingWidgetWrapper } from '@/components/booking/BookingWidgetWrapper'
import { RoutesList } from '@/components/sections/RoutesList'
import { NearbyAirports } from '@/components/sections/NearbyAirports'
import { FAQ } from '@/components/sections/FAQ'
import { LatestNews } from '@/components/sections/LatestNews'
import { PortableText } from '@portabletext/react'
import type { Locale } from '@/lib/i18n/config'

const MULTI_AIRPORT_CITIES = new Set(['Beijing', 'Chicago', 'Dubai', 'Houston', 'Istanbul', 'London', 'Milan', 'New York', 'Panama City', 'Paris', 'Rome', 'Shanghai', 'Washington D.C.'])

export async function generateStaticParams() {
  const airports = await sanityClient.fetch(allAirportsQuery)
  const params: { slug: string }[] = []
  for (const a of airports) {
    params.push({ slug: a.slug.current })
    // For single-airport cities, also register the SEO slug: {city-slug}-airport-transfers
    const citySlug = a.city?.slug?.current
    const cityTitle = a.city?.title || ''
    if (citySlug && !MULTI_AIRPORT_CITIES.has(cityTitle)) {
      const seoSlug = `${citySlug}-airport-transfers`
      if (seoSlug !== a.slug.current) params.push({ slug: seoSlug })
    }
    const esSlug = a.translations?.es?.slug?.current
    if (esSlug && esSlug !== a.slug.current) {
      params.push({ slug: esSlug })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const airport = await sanityClient.fetch(airportBySlugQuery, { slug })
  if (!airport) return {}
  const MULTI = new Set(['Beijing', 'Chicago', 'Dubai', 'Houston', 'Istanbul', 'London', 'Milan', 'New York', 'Panama City', 'Paris', 'Rome', 'Shanghai', 'Washington D.C.'])
  const cityTitle = airport.city?.title || ''
  const airportTitleMeta = (locale !== 'en' && airport.translations?.[locale]?.title) || airport.title
  const cityTitleMeta = (locale !== 'en' && airport.city?.translations?.[locale]?.title) || cityTitle
  const isMulti = MULTI.has(cityTitle)
  const seoKeyword = isMulti ? `${airportTitleMeta} transfers` : `${cityTitleMeta} airport transfers`
  const { description } = generateAirportMetadata(airport, locale as Locale)
  const title = airport.seoTitle || `${seoKeyword} | Private Transfers | Titan Transfers`
  return generatePageMetadata({
    title,
    description,
    path: `/airport/${slug}/`,
    locale: locale as Locale,
    alternates: [
      { locale: 'en' as Locale, path: `/airport/${slug}/` },
      { locale: 'es' as Locale, path: `/es/aeropuerto/${airport.translations?.es?.slug?.current ?? slug}/` },
    ],
  })
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconShield({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
}
function IconClock({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function IconTag({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
}
function IconStar({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
}
function IconUsers({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
}
function IconPlane({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
}
function IconCar({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
}
function IconBaby({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>
}
function IconSparkles({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
}
function IconAnchor({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21V3m0 18a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 3a3 3 0 100 6 3 3 0 000-6z" /></svg>
}
function IconPhone({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
}
function IconCheck({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
}
function IconQuote({ className = 'h-8 w-8' }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" /></svg>
}

// ─── Decorative accent line ──────────────────────────────────────────────────

function BrandLine() {
  return <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-brand-500" />
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AirportPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const airport = await sanityClient.fetch(airportBySlugQuery, { slug })
  if (!airport) notFound()

  const t = await getTranslations({ locale, namespace: 'airport' })
  const tc = await getTranslations({ locale, namespace: 'trust' })
  const airportTitle = (locale !== 'en' && airport.translations?.[locale]?.title) || airport.title
  const description = (locale !== 'en' && airport.translations?.[locale]?.description) || airport.description
  const cityName = (locale !== 'en' && airport.city?.translations?.[locale]?.title) || airport.city?.title || ''

  // Cities with multiple airports — keep specific airport name in H1
  const MULTI_AIRPORT_CITIES = new Set(['Beijing', 'Chicago', 'Dubai', 'Houston', 'Istanbul', 'London', 'Milan', 'New York', 'Panama City', 'Paris', 'Rome', 'Shanghai', 'Washington D.C.'])
  const isMultiAirport = MULTI_AIRPORT_CITIES.has(airport.city?.title || '')
  // For single-airport cities use "City airport transfers" as H1 — higher search volume keyword
  const h1 = airport.seoH1 || (isMultiAirport ? `${airportTitle} transfers` : `${cityName} airport transfers`)

  // Images
  const heroImg = urlFor(airport.featuredImage)?.width(1920).height(900).quality(90).url()
  const gallery = (airport.gallery || []).map((img: { asset?: { _ref?: string }; alt?: string; title?: string }) => ({
    url: urlFor(img)?.width(800).height(500).quality(80).url(),
    alt: img.alt || airportTitle,
    title: img.title || airportTitle,
  })).filter((g: { url: string | null }) => g.url)

  const breadcrumbs = [
    { label: airport.country?.title || '', href: `/country/${airport.country?.slug?.current}/` },
    { label: airportTitle },
  ]

  const faqItems = [
    { question: t('faqVipQ', { airport: airportTitle }), answer: t('faqVipA') },
    { question: t('faqMercedesQ', { city: cityName }), answer: t('faqMercedesA') },
    { question: t('faqChildSeatsQ', { airport: airportTitle }), answer: t('faqChildSeatsA') },
    { question: t('faqVipServiceQ', { city: cityName }), answer: t('faqVipServiceA') },
    { question: t('faqLargeGroupQ', { airport: airportTitle }), answer: t('faqLargeGroupA') },
    { question: t('faqPetsQ', { airport: airportTitle }), answer: t('faqPetsA') },
    { question: t('faqLicensedQ', { city: cityName }), answer: t('faqLicensedA') },
    { question: t('faqServicesQ', { airport: airportTitle }), answer: t('faqServicesA') },
    { question: t('faqWheelchairQ', { airport: airportTitle }), answer: t('faqWheelchairA') },
    { question: t('faqDelayQ', { airport: airportTitle }), answer: t('faqDelayA') },
  ]

  const vehicles = [
    { key: 'privateCar' as const, icon: <IconCar />, pax: '1-3', img: '/vehicles/sedan.jpg' },
    { key: 'mpv' as const, icon: <IconUsers />, pax: '4-6', img: '/vehicles/mpv.jpg' },
    { key: 'executive' as const, icon: <IconSparkles />, pax: '1-3 VIP', img: '/vehicles/executive.jpg' },
    { key: 'minibus' as const, icon: <IconUsers />, pax: '7-16', img: '/vehicles/minibus.jpg' },
  ]

  return (
    <>
      <SchemaOrg data={generateTaxiServiceSchema({ name: `${airportTitle} ${t('transfers')}`, description: t('transferBestPriceDesc', { airport: airportTitle }), url: `/airport/${slug}/`, areaServed: cityName, rating: 4.8, reviewCount: 2500 })} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO — Cinematic full-bleed with layered gradients
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="hero-always-dark relative min-h-[600px] overflow-hidden bg-dark lg:min-h-[680px]">
        {heroImg && (
          <Image
            src={heroImg}
            alt={`${t('transfers')} ${airportTitle}`}
            title={`${t('transfers')} ${airportTitle}`}
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
        )}
        {/* Multi-layer gradient for cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/40 to-dark" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/60 via-transparent to-transparent" />
        {/* Brand accent line at top */}
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-500" />

        <div className="relative flex min-h-[600px] flex-col justify-center pb-20 pt-16 site-container">
          <Breadcrumbs items={breadcrumbs} />

          <div className="mt-auto grid gap-12 lg:grid-cols-5">
            {/* H1 + Trust signals */}
            <div className="lg:col-span-3">
              {/* IATA chip */}
              <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-5 py-2 text-sm font-semibold tracking-wide text-brand-400 backdrop-blur-sm">
                <IconPlane className="h-4 w-4" />
                <span className="uppercase">{airport.iataCode}</span>
                <span className="h-3 w-px bg-brand-500/40" />
                <span>{cityName}</span>
              </div>

              <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {h1}
              </h1>

              <p className="mb-10 max-w-2xl text-lg leading-relaxed text-gray-300/90">
                {t('transferBestPriceDesc', { airport: airportTitle })}
              </p>

              {/* Trust badges — glassmorphism */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: <IconStar className="h-5 w-5" />, label: tc('rating'), desc: tc('ratingDesc') },
                  { icon: <IconTag className="h-5 w-5" />, label: tc('fixedPrice'), desc: tc('fixedPriceDesc') },
                  { icon: <IconClock className="h-5 w-5" />, label: tc('support'), desc: tc('supportDesc') },
                  { icon: <IconShield className="h-5 w-5" />, label: tc('freeCancel'), desc: tc('freeCancelDesc') },
                ].map((badge, i) => (
                  <div key={i} className="group rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-md transition-all duration-300 hover:border-brand-500/20 hover:bg-white/[0.08]">
                    <div className="mb-2.5 inline-flex rounded-lg bg-brand-500/15 p-2 text-brand-400 transition-colors group-hover:bg-brand-500/25">
                      {badge.icon}
                    </div>
                    <div className="text-[13px] font-semibold leading-tight text-white">{badge.label}</div>
                    <div className="mt-0.5 text-[11px] leading-tight text-gray-400">{badge.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking widget */}
            <div className="lg:col-span-2">
              <BookingWidgetWrapper
                context={{
                  type: 'airport',
                  airportName: airportTitle,
                  etoFromLocation: airport.routes?.[0]?.etoFromLocation,
                  etoFromCategory: airport.routes?.[0]?.etoFromCategory,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          INTRO — Centered headline on subtle gray bg
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="border-b border-white/[0.06] bg-dark-light py-20">
        <div className="site-container">
          <div className="site-container text-center">
            <BrandLine />
            <h2 className="mb-5 text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
              {t('transferBestPrice', { airport: airportTitle })}
            </h2>
            <p className="text-lg leading-relaxed text-body">
              {t('transferBestPriceDesc', { airport: airportTitle })}
            </p>
            {/* Trust pills */}
            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              {[
                { icon: <IconTag className="h-4 w-4" />, label: tc('fixedPrice') },
                { icon: <IconShield className="h-4 w-4" />, label: tc('freeCancel') },
                { icon: <IconClock className="h-4 w-4" />, label: tc('support') },
                { icon: <IconStar className="h-4 w-4" />, label: tc('meetGreet') },
              ].map((pill, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-glass-bg px-4 py-2 text-[13px] font-medium text-body ring-1 ring-glass-ring">
                  <span className="text-brand-400">{pill.icon}</span>
                  {pill.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ABOUT — Gallery mosaic + description, balanced layout
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {(description || gallery.length > 0) && (
        <section className="bg-dark py-24">
          <div className="site-container">
            {/* Gallery mosaic — full width, visually rich */}
            {gallery.length > 0 && (
              <div className="mb-16 grid gap-4 md:grid-cols-4 md:grid-rows-2">
                {/* Hero image — spans 2 cols + 2 rows */}
                <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl md:col-span-2 md:row-span-2 md:aspect-auto">
                  <Image src={gallery[0].url} alt={gallery[0].alt} title={gallery[0].title} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
                {/* Secondary images — 4 smaller cells */}
                {gallery.slice(1, 5).map((img: { url: string; alt: string; title: string }, i: number) => (
                  <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-md">
                    <Image src={img.url} alt={img.alt} title={img.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                ))}
              </div>
            )}

            {/* Description — clean single-column prose */}
            {description && (
              <div className="prose prose-lg prose-invert site-container text-body prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-heading prose-p:leading-relaxed prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline">
                <PortableText value={description} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PRICES & RATES — Asymmetric layout with floating card
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-dark-light py-24">
        <div className="site-container">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <BrandLine />
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
                {t('pricesAndRates', { airport: airportTitle })}
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-body">{t('pricesAndRatesDesc')}</p>
              <div className="space-y-4">
                {[
                  { icon: <IconTag />, title: tc('fixedPrice'), desc: tc('fixedPriceDesc') },
                  { icon: <IconShield />, title: tc('freeCancel'), desc: tc('freeCancelDesc') },
                  { icon: <IconStar />, title: tc('meetGreet'), desc: tc('meetGreetDesc') },
                ].map((item, i) => (
                  <div key={i} className="group flex items-start gap-4 rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.06] transition-all duration-300 hover:ring-brand-500/30">
                    <div className="shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 text-white shadow-sm shadow-brand-500/25">
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-bold text-heading">{item.title}</div>
                      <div className="mt-1 text-sm leading-relaxed text-body">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {gallery.length > 0 && (
              <div className="relative lg:pl-8">
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-black/30">
                  <Image
                    src={gallery[gallery.length > 2 ? 2 : 0].url}
                    alt={`${t('pricesAndRates', { airport: airportTitle })}`}
                    title={`${t('pricesAndRates', { airport: airportTitle })}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/20 to-transparent" />
                </div>
                {/* Floating rating card */}
                <div className="absolute -bottom-8 -left-4 flex items-center gap-4 rounded-2xl bg-dark-card px-6 py-5 shadow-xl shadow-black/30 ring-1 ring-white/[0.08] lg:left-0">
                  <div className="flex gap-0.5 text-yellow-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    ))}
                  </div>
                  <div className="h-8 w-px bg-white/[0.08]" />
                  <div>
                    <div className="text-xl font-extrabold text-heading">4.8<span className="text-sm font-normal text-muted">/5</span></div>
                    <div className="text-xs text-muted">{tc('ratingDesc')}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          VEHICLES — Alternating horizontal cards
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-dark py-24">
        <div className="site-container">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <BrandLine />
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
              {t('vehicles', { airport: airportTitle })}
            </h2>
            <p className="text-lg text-body">{t('vehiclesDesc')}</p>
          </div>
          <div className="space-y-8">
            {vehicles.map((v, i) => (
              <div
                key={v.key}
                className="group grid overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/[0.06] transition-all duration-500 hover:ring-brand-500/30 lg:grid-cols-2"
              >
                {/* Image */}
                <div className={`relative h-72 overflow-hidden lg:h-auto lg:min-h-[380px] ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <Image
                    src={v.img}
                    alt={t(v.key)}
                    title={`${t(v.key)} - ${airportTitle}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className={`absolute inset-0 ${i % 2 === 1 ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-black/5 to-transparent`} />
                  {/* Pax badge */}
                  <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-dark-card px-4 py-2 text-sm font-bold text-white shadow-lg ring-1 ring-white/[0.08] backdrop-blur-sm">
                    <IconUsers className="h-4 w-4 text-brand-400" />
                    {v.pax}
                  </div>
                </div>
                {/* Content */}
                <div className={`flex flex-col justify-center p-10 lg:p-14 ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-brand-500/10 px-4 py-1.5 text-[13px] font-semibold text-brand-400 ring-1 ring-brand-500/20">
                    {v.icon}
                    {v.pax} {locale === 'es' ? 'pasajeros' : 'passengers'}
                  </div>
                  <h3 className="mb-3 text-2xl font-extrabold tracking-tight text-heading">{t(v.key)}</h3>
                  <p className="mb-8 leading-relaxed text-body">{t(`${v.key}Desc`)}</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {[
                      { icon: <IconCheck className="h-4 w-4" />, text: tc('fixedPrice') },
                      { icon: <IconCheck className="h-4 w-4" />, text: tc('freeCancel') },
                      { icon: <IconCheck className="h-4 w-4" />, text: tc('meetGreet') },
                    ].map((feat, fi) => (
                      <span key={fi} className="inline-flex items-center gap-1.5 text-sm text-body">
                        <span className="text-brand-400">{feat.icon}</span>
                        {feat.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SERVICES — Dark section with glowing icon cards
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative overflow-hidden bg-dark py-24">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative w-full">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-brand-500" />
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
              {t('additionalServices', { airport: airportTitle })}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <IconBaby className="h-7 w-7" />, title: t('childSeats', { airport: airportTitle }), desc: t('childSeatsDesc') },
              { icon: <IconSparkles className="h-7 w-7" />, title: t('vipTransfer', { city: cityName }), desc: t('vipTransferDesc') },
              { icon: <IconTag className="h-7 w-7" />, title: t('lowCost', { airport: airportTitle }), desc: t('lowCostDesc') },
              { icon: <IconAnchor className="h-7 w-7" />, title: t('portTransfer', { airport: airportTitle }), desc: t('portTransferDesc', { city: cityName }) },
              { icon: <IconUsers className="h-7 w-7" />, title: t('ourDrivers', { city: cityName }), desc: t('ourDriversDesc') },
              { icon: <IconPlane className="h-7 w-7" />, title: t('flightDelay', { airport: airportTitle }), desc: t('flightDelayDesc') },
            ].map((service, i) => (
              <div key={i} className="group rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent p-7 transition-all duration-300 hover:border-brand-500/20 hover:from-white/[0.08]">
                <div className="mb-5 inline-flex rounded-2xl bg-brand-500/10 p-3.5 text-brand-400 ring-1 ring-brand-500/20 transition-all duration-300 group-hover:bg-brand-500/20 group-hover:shadow-lg group-hover:shadow-brand-500/10">
                  {service.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold leading-tight text-heading">{service.title}</h3>
                <p className="text-sm leading-relaxed text-body">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TESTIMONIALS — Real testimonial cards
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 py-24">
        <div className="site-container">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-white/30" />
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {t('testimonials', { airport: airportTitle })}
            </h2>
            <p className="text-lg text-brand-100/80">{t('testimonialsDesc', { airport: airportTitle })}</p>
          </div>

          {/* Testimonial cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: 'Carlos M.', loc: 'Madrid', text: locale === 'es' ? 'Servicio impecable. El conductor nos esperaba con un cartel, el coche estaba inmaculado y el precio fue exactamente el que nos indicaron. Repetiremos seguro.' : 'Impeccable service. The driver was waiting with a sign, the car was spotless and the price was exactly as quoted. Will book again.' },
              { name: 'Sarah L.', loc: 'London', text: locale === 'es' ? 'Reservamos el transfer VIP para una ocasión especial. El Mercedes Clase S era espectacular y el conductor muy profesional. Una experiencia de 10.' : 'We booked the VIP transfer for a special occasion. The Mercedes S-Class was spectacular and the driver very professional. A 10/10 experience.' },
              { name: 'Marco R.', loc: 'Roma', text: locale === 'es' ? 'Nuestro vuelo se retrasó 2 horas y el conductor ajustó la recogida sin ningún problema ni coste extra. Eso es profesionalidad.' : 'Our flight was delayed 2 hours and the driver adjusted pickup with no issue or extra cost. That is professionalism.' },
            ].map((review, i) => (
              <div key={i} className="rounded-2xl bg-white/10 p-7 backdrop-blur-sm ring-1 ring-white/10">
                <IconQuote className="mb-4 h-8 w-8 text-white/20" />
                <p className="mb-6 text-[15px] leading-relaxed text-white/90">{review.text}</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{review.name}</div>
                    <div className="text-xs text-brand-200">{review.loc}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5 text-yellow-300">
                    {[1, 2, 3, 4, 5].map(s => (
                      <svg key={s} className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall rating */}
          <div className="mt-12 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-extrabold text-white">4.8</span>
              <span className="text-lg text-brand-200">/5</span>
            </div>
            <div className="mt-1 flex gap-0.5 text-yellow-300">
              {[1, 2, 3, 4, 5].map(s => (
                <svg key={s} className={`h-6 w-6 ${s === 5 ? 'opacity-70' : ''}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              ))}
            </div>
            <div className="mt-2 text-sm text-brand-200">{tc('ratingDesc')}</div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ROUTES — Subtle gray background for visual rhythm
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-dark-light py-24">
        <div className="site-container">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <BrandLine />
            <p className="text-sm font-semibold text-brand-500">{locale === 'es' ? 'Destinos populares' : 'Popular destinations'}</p>
          </div>
          <RoutesList
            routes={airport.routes || []}
            airportSlug={slug}
            cityName={cityName}
            title={t('routes', { city: cityName })}
          />
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FAQ — Clean white with generous spacing
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-dark py-24">
        <div className="site-container">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <BrandLine />
            <p className="text-sm font-semibold text-brand-500">{locale === 'es' ? 'Resolvemos tus dudas' : 'We answer your questions'}</p>
          </div>
          <FAQ items={faqItems} title={t('faq', { city: cityName })} />
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          DRIVER CTA — Full-width dark with image
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="hero-always-dark relative overflow-hidden bg-dark py-24">
        {gallery.length > 0 && (
          <Image
            src={gallery[gallery.length > 3 ? 3 : 0].url}
            alt=""
            fill
            className="object-cover opacity-15"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/95 to-dark/80" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative w-full">
          <div className="flex flex-col items-center gap-10 text-center lg:flex-row lg:justify-between lg:text-left">
            <div>
              <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-brand-500 lg:mx-0" />
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {t('joinDrivers', { airport: airportTitle })}
              </h2>
              <p className="max-w-xl leading-relaxed text-gray-400">{t('joinDriversDesc')}</p>
            </div>
            <a href="/contact/" className="inline-flex shrink-0 items-center gap-3 rounded-2xl bg-brand-500 px-8 py-5 text-lg font-bold text-white shadow-xl shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-400 hover:shadow-2xl hover:shadow-brand-500/30">
              <IconPhone className="h-6 w-6" />
              {tc('support')}
            </a>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          NEARBY AIRPORTS — Gray bg for rhythm
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-dark-light py-24">
        <div className="site-container">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <BrandLine />
            <p className="text-sm font-semibold text-brand-500">{locale === 'es' ? 'Más aeropuertos' : 'More airports'}</p>
          </div>
          <NearbyAirports airports={airport.nearbyAirports || []} title={t('nearbyAirports')} />
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          LATEST NEWS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-dark py-24">
        <div className="site-container">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <BrandLine />
          </div>
          <LatestNews type="airport" id={airport._id} title={t('latestNews', { airport: airportTitle })} />
        </div>
      </section>
    </>
  )
}
