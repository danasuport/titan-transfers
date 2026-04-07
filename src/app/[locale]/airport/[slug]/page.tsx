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
import { RoutesList } from '@/components/sections/RoutesList'
import { NearbyAirports } from '@/components/sections/NearbyAirports'
import { FAQ } from '@/components/sections/FAQ'
import { FleetShowcase } from '@/components/sections/FleetShowcase'
import { CtaSection } from '@/components/sections/CtaSection'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Testimonials } from '@/components/sections/Testimonials'
import { BookingForm } from '@/components/ui/BookingForm'
import { PortableText } from '@portabletext/react'
import type { Locale } from '@/lib/i18n/config'
import { russoOne } from '@/lib/fonts'

const MULTI_AIRPORT_CITIES = new Set(['Beijing', 'Chicago', 'Dubai', 'Houston', 'Istanbul', 'London', 'Milan', 'New York', 'Panama City', 'Paris', 'Rome', 'Shanghai', 'Washington D.C.'])

export async function generateStaticParams() {
  const airports = await sanityClient.fetch(allAirportsQuery)
  const params: { slug: string }[] = []
  for (const a of airports) {
    params.push({ slug: a.slug.current })
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
  const cityTitle = airport.city?.title || ''
  const cityTitleMeta = (locale !== 'en' && airport.city?.translations?.[locale]?.title) || cityTitle
  const { title, description } = generateAirportMetadata(airport, locale as Locale, cityTitleMeta)
  return generatePageMetadata({
    title,
    description,
    path: `/airport-transfers-private-taxi/${slug}/`,
    locale: locale as Locale,
    alternates: [
      { locale: 'en' as Locale, path: `/airport-transfers-private-taxi/${slug}/` },
      { locale: 'es' as Locale, path: `/es/traslados-aeropuerto-privados-taxi/${airport.translations?.es?.slug?.current ?? slug}/` },
    ],
  })
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconShield() {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
}
function IconClock() {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function IconTag() {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
}
function IconStar() {
  return <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
}
function IconPlane() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
}
function IconCheck() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#8BAA1D"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
}
function IconBaby() {
  return <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>
}
function IconSparkles() {
  return <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
}
function IconAnchor() {
  return <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21V3m0 18a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 3a3 3 0 100 6 3 3 0 000-6z" /></svg>
}
function IconUsers() {
  return <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
}
function IconQuote() {
  return <svg width="32" height="32" fill="#8BAA1D" viewBox="0 0 24 24" style={{ opacity: 0.25 }}><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" /></svg>
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AirportPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const airport = await sanityClient.fetch(airportBySlugQuery, { slug })
  if (!airport) notFound()

  const t = await getTranslations({ locale, namespace: 'airport' })
  const tc = await getTranslations({ locale, namespace: 'trust' })
  const es = locale === 'es'

  const airportTitle = (locale !== 'en' && airport.translations?.[locale]?.title) || airport.title
  const description = (locale !== 'en' && airport.translations?.[locale]?.description) || airport.description
  const cityName = (locale !== 'en' && airport.city?.translations?.[locale]?.title) || airport.city?.title || ''

  const isMultiAirport = MULTI_AIRPORT_CITIES.has(airport.city?.title || '')
  const h1 = airport.seoH1 || (isMultiAirport ? `${airportTitle} transfers` : `${cityName} airport transfers`)

  const heroImg = urlFor(airport.featuredImage)?.width(1920).height(900).quality(90).url()
  const gallery = (airport.gallery || []).map((img: { asset?: { _ref?: string }; alt?: string; title?: string }) => ({
    url: urlFor(img)?.width(800).height(500).quality(80).url(),
    alt: img.alt || airportTitle,
    title: img.title || airportTitle,
  })).filter((g: { url: string | null }) => g.url)

  const breadcrumbs = [
    { label: airport.country?.title || '', href: es ? `/traslados-privados-pais/${airport.country?.slug?.current}/` : `/private-transfers-country/${airport.country?.slug?.current}/` },
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


  const trustBadges = [
    { icon: <IconStar />, label: tc('rating'), desc: tc('ratingDesc') },
    { icon: <IconTag />, label: tc('fixedPrice'), desc: tc('fixedPriceDesc') },
    { icon: <IconClock />, label: tc('support'), desc: tc('supportDesc') },
    { icon: <IconShield />, label: tc('freeCancel'), desc: tc('freeCancelDesc') },
  ]

  const services = [
    { icon: <IconBaby />, title: t('childSeats', { airport: airportTitle }), desc: t('childSeatsDesc') },
    { icon: <IconSparkles />, title: t('vipTransfer', { city: cityName }), desc: t('vipTransferDesc') },
    { icon: <IconTag />, title: t('lowCost', { airport: airportTitle }), desc: t('lowCostDesc') },
    { icon: <IconAnchor />, title: t('portTransfer', { airport: airportTitle }), desc: t('portTransferDesc', { city: cityName }) },
    { icon: <IconUsers />, title: t('ourDrivers', { city: cityName }), desc: t('ourDriversDesc') },
    { icon: <IconPlane />, title: t('flightDelay', { airport: airportTitle }), desc: t('flightDelayDesc') },
  ]

  return (
    <>
      <SchemaOrg data={generateTaxiServiceSchema({ name: `${airportTitle} ${t('transfers')}`, description: t('transferBestPriceDesc', { airport: airportTitle }), url: `/airport-transfers-private-taxi/${slug}/`, areaServed: cityName, rating: 4.8, reviewCount: 2500 })} />

      {/* ─── HERO ───────────────────────────────────────────────────────── */}
      <section className="resp-2col" style={{ background: '#F8FAF0', display: 'grid', minHeight: '520px' }}>

        {/* Left: content */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '6vw', paddingRight: '4vw', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <Breadcrumbs items={breadcrumbs} variant="light" />

          <h1 className={russoOne.className} style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: '#242426', lineHeight: 1.05, marginBottom: '1.25rem', marginTop: '0.75rem', textTransform: 'none' }}>
            {h1}
          </h1>

          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.75, maxWidth: '480px' }}>
            {t('transferBestPriceDesc', { airport: airportTitle })}
          </p>
        </div>

        {/* Right: image with diagonal left mask */}
        <div className="resp-img-panel" style={{ position: 'relative', clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)' }}>
          {heroImg ? (
            <Image
              src={heroImg}
              alt={`${t('transfers')} ${airportTitle}`}
              fill
              priority
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              sizes="50vw"
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: '#242426' }} />
          )}
        </div>

      </section>

      {/* ─── BOOKING FORM ──────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', paddingTop: '2.5rem', paddingBottom: '2.5rem', paddingLeft: '6vw', paddingRight: '6vw' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8BAA1D', textTransform: 'none', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
          {es ? `Reserva tu transfer — ${airportTitle}` : `Book your transfer — ${airportTitle}`}
        </p>
        <BookingForm />

        {/* Trust badges inline below form */}
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          {trustBadges.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#8BAA1D', fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>{b.icon}</span>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#242426' }}>{b.label}</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ─── ABOUT / DESCRIPTION + GALLERY ────────────────────────────── */}
      {(description || gallery.length > 0) && (
        <section style={{ background: '#ffffff', padding: '5rem 6vw' }}>
          {/* Gallery mosaic */}
          {gallery.length > 0 && (
            <div className="resp-photo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(2, 220px)', gap: '12px', marginBottom: '3.5rem' }}>
              {/* Large hero image */}
              <div style={{ gridColumn: '1 / 3', gridRow: '1 / 3', position: 'relative', overflow: 'hidden', borderRadius: '4px' }}>
                <Image src={gallery[0].url} alt={gallery[0].alt} title={gallery[0].title} fill style={{ objectFit: 'cover' }} />
                {/* bottom mask */}
                <svg style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', zIndex: 1 }} viewBox="0 0 400 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,40 L0,20 Q100,0 200,20 Q300,40 400,15 L400,40 Z" fill="rgba(36,36,38,0.15)" />
                </svg>
              </div>
              {/* Smaller images */}
              {gallery.slice(1, 5).map((img: { url: string; alt: string; title: string }, i: number) => (
                <div key={i} style={{ position: 'relative', overflow: 'hidden', borderRadius: '4px' }}>
                  <Image src={img.url} alt={img.alt} title={img.title} fill style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

          {/* Description prose */}
          {description && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }} className="prose prose-lg prose-headings:font-normal prose-h2:font-normal prose-h3:font-normal prose-headings:text-[#242426] prose-p:text-[#475569] prose-p:leading-relaxed prose-a:text-[#8BAA1D] prose-a:no-underline">
              <PortableText value={description} />
            </div>
          )}
        </section>
      )}

      {/* ─── WHY CHOOSE US — prices & features ─────────────────────────── */}
      <section style={{ background: '#F8FAF0', padding: '5rem 6vw' }}>
        <div className="resp-2col" style={{ display: 'grid', gap: '4rem', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <div style={{ width: '48px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
            <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)', color: '#242426', marginBottom: '1rem', textTransform: 'none' }}>
              {t('pricesAndRates', { airport: airportTitle })}
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.75, marginBottom: '2rem' }}>{t('pricesAndRatesDesc')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { icon: <IconTag />, title: tc('fixedPrice'), desc: tc('fixedPriceDesc') },
                  { icon: <IconShield />, title: tc('freeCancel'), desc: tc('freeCancelDesc') },
                  { icon: <IconStar />, title: tc('meetGreet'), desc: tc('meetGreetDesc') },
                  { icon: <IconClock />, title: tc('support'), desc: tc('supportDesc') },
                  { icon: <IconCheck />, title: tc('rating'), desc: tc('ratingDesc') },
                  { icon: <IconPlane />, title: es ? 'Conductor profesional' : 'Professional driver', desc: es ? 'Con cartel con tu nombre' : 'With name sign at arrivals' },
                ].map((item, i) => (
                  <div key={i} style={{ background: '#ffffff', border: '1.5px solid #e5e7eb', padding: '1rem', transform: 'skewX(-6deg)' }}>
                    <div style={{ transform: 'skewX(6deg)' }}>
                      <span style={{ color: '#8BAA1D', display: 'block', marginBottom: '0.4rem' }}>{item.icon}</span>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#242426', lineHeight: 1.3 }}>{item.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.4 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Mockup image */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Image
              src="/mockup.png"
              alt=""
              aria-hidden="true"
              width={555}
              height={605}
              style={{ objectFit: 'contain', maxHeight: '535px', width: 'auto', marginTop: '2rem' }}
            />
          </div>
        </div>
      </section>

      {/* ─── FLEET (reuse home section) ────────────────────────────────── */}
      <FleetShowcase />

      {/* ─── HOW IT WORKS (reuse home section) ─────────────────────────── */}
      <HowItWorks />

      {/* ─── ADDITIONAL SERVICES ───────────────────────────────────────── */}
      <section style={{ background: '#ffffff', padding: '5rem 6vw' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ width: '48px', height: '3px', background: '#8BAA1D', margin: '0 auto 1.25rem' }} />
          <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)', color: '#242426', textTransform: 'none', maxWidth: '900px', margin: '0 auto' }}>
            {t('additionalServices', { airport: airportTitle })}
          </h2>
        </div>
        <div className="resp-3col-sm" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', maxWidth: '1200px', margin: '0 auto' }}>
          {services.map((s, i) => (
            <div key={i} style={{ background: '#F8FAF0', border: '1.5px solid #e5e7eb', padding: '1.75rem', borderRadius: '4px', transition: 'border-color 0.15s' }}>
              <div style={{ display: 'inline-flex', background: '#8BAA1D', color: '#ffffff', padding: '10px', marginBottom: '1rem', transform: 'skewX(-8deg)' }}>
                <span style={{ transform: 'skewX(8deg)', display: 'block' }}>{s.icon}</span>
              </div>
              <h3 style={{ color: '#242426', fontSize: '1rem', marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ──────────────────────────────────────────────── */}
      <Testimonials />

      {/* ─── ROUTES ────────────────────────────────────────────────────── */}
      {airport.routes?.length > 0 && (
        <section style={{ background: '#F8FAF0', padding: '5rem 6vw' }}>
          <RoutesList
            routes={airport.routes}
            airportSlug={slug}
            cityName={cityName}
            title={es ? `Rutas populares desde ${airportTitle}` : `Popular routes from ${airportTitle}`}
          />
        </section>
      )}

      {/* ─── FAQ ───────────────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', padding: '5rem 6vw' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <FAQ items={faqItems} title={t('faq', { city: cityName })} />
        </div>
      </section>

      {/* ─── CTA BANNER ────────────────────────────────────────────────── */}
      <section style={{ background: '#8BAA1D', overflow: 'hidden' }}>
        <div className="resp-2col" style={{ display: 'grid', minHeight: '380px' }}>
          {/* Left: image with diagonal clip */}
          <div className="resp-img-panel" style={{ position: 'relative', clipPath: 'polygon(0% 0%, 92% 0%, 100% 100%, 0% 100%)' }}>
            <Image
              src="/services/city-to-city.png"
              alt={es ? `Conductor profesional ${airportTitle}` : `Professional driver ${airportTitle}`}
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              sizes="50vw"
            />
          </div>
          {/* Right: text */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 6vw 4rem 5vw' }}>
            <div style={{ width: '48px', height: '3px', background: '#ffffff', marginBottom: '1.25rem' }} />
            <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: '#ffffff', marginBottom: '1rem' }}>
              {t('joinDrivers', { airport: airportTitle })}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, marginBottom: '2rem', maxWidth: '440px' }}>{t('joinDriversDesc')}</p>
            <a href="/contact/" style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '0.5rem', background: '#242426', color: '#ffffff', padding: '0.85rem 2rem', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', transform: 'skewX(-12deg)', transition: 'background 0.2s' }}>
              <span style={{ transform: 'skewX(12deg)', display: 'inline-block' }}>{tc('support')} →</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── NEARBY AIRPORTS ───────────────────────────────────────────── */}
      <section style={{ background: '#F8FAF0', padding: '5rem 6vw' }}>
        <NearbyAirports airports={airport.nearbyAirports || []} title={t('nearbyAirports')} />
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────────── */}
      <CtaSection />
    </>
  )
}
