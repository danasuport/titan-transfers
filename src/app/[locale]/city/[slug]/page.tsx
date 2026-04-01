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
import { BookingForm } from '@/components/ui/BookingForm'
import { NearbyAirports } from '@/components/sections/NearbyAirports'
import { RoutesList } from '@/components/sections/RoutesList'
import { FAQ } from '@/components/sections/FAQ'
import { FleetShowcase } from '@/components/sections/FleetShowcase'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Testimonials } from '@/components/sections/Testimonials'
import { CtaSection } from '@/components/sections/CtaSection'
import { PortableText } from '@portabletext/react'
import type { Locale } from '@/lib/i18n/config'
import { russoOne } from '@/lib/fonts'

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
  const tc = await getTranslations({ locale, namespace: 'trust' })
  const es = locale === 'es'

  const cityTitle = (locale !== 'en' && city.translations?.[locale]?.title) || city.title
  const description = (locale !== 'en' && city.translations?.[locale]?.description) || city.description
  const heroImg = urlFor(city.featuredImage)?.width(1920).height(900).quality(90).url()

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

  const trustBadges = [
    { icon: '★', label: tc('rating'), desc: tc('ratingDesc') },
    { icon: '◈', label: tc('fixedPrice'), desc: tc('fixedPriceDesc') },
    { icon: '◷', label: tc('support'), desc: tc('supportDesc') },
    { icon: '✓', label: tc('freeCancel'), desc: tc('freeCancelDesc') },
  ]

  const allRoutes = [...(city.routesTo || []), ...(city.routesFrom || [])]

  return (
    <>
      <SchemaOrg data={generateTaxiServiceSchema({ name: `Private Transfers in ${cityTitle}`, description: `Book private transfers in ${cityTitle}`, url: `/city/${slug}/`, areaServed: cityTitle, rating: 4.8 })} />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="resp-2col" style={{ background: '#F8FAF0', display: 'grid', minHeight: '520px' }}>
        {/* Left: content */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '6vw', paddingRight: '4vw', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <Breadcrumbs items={breadcrumbs} variant="light" />

          <h1 className={russoOne.className} style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: '#242426', lineHeight: 1.05, marginBottom: '1.25rem', marginTop: '0.75rem' }}>
            {t('transfers', { city: cityTitle })}
          </h1>

          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.75, maxWidth: '480px' }}>
            {t('privateTaxi', { city: cityTitle })}
          </p>
        </div>

        {/* Right: image with diagonal clip */}
        <div className="resp-img-panel" style={{ position: 'relative', clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)' }}>
          {heroImg ? (
            <Image src={heroImg} alt={`${t('transfers')} ${cityTitle}`} fill priority style={{ objectFit: 'cover', objectPosition: 'center' }} sizes="50vw" />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: '#242426' }} />
          )}
        </div>
      </section>

      {/* ─── BOOKING FORM ─────────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', paddingTop: '2.5rem', paddingBottom: '2.5rem', paddingLeft: '6vw', paddingRight: '6vw' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8BAA1D', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
          {es ? `Reserva tu transfer — ${cityTitle}` : `Book your transfer — ${cityTitle}`}
        </p>
        <BookingForm />
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

      {/* ─── DESCRIPTION ──────────────────────────────────────────────────── */}
      {description && (
        <section style={{ background: '#ffffff', padding: '5rem 6vw' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }} className="prose prose-lg prose-headings:font-normal prose-headings:text-[#242426] prose-p:text-[#475569] prose-p:leading-relaxed prose-a:text-[#8BAA1D] prose-a:no-underline">
            <PortableText value={description} />
          </div>
        </section>
      )}

      {/* ─── FLEET ────────────────────────────────────────────────────────── */}
      <FleetShowcase />

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ─── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <Testimonials />

      {/* ─── NEARBY AIRPORTS ──────────────────────────────────────────────── */}
      {city.nearbyAirports?.length > 0 && (
        <section style={{ background: '#F8FAF0', padding: '5rem 6vw' }}>
          <NearbyAirports airports={city.nearbyAirports} title={t('airportTransfers', { city: cityTitle })} />
        </section>
      )}

      {/* ─── ROUTES ───────────────────────────────────────────────────────── */}
      {allRoutes.length > 0 && (
        <section style={{ background: '#ffffff', padding: '5rem 6vw' }}>
          <RoutesList
            routes={allRoutes}
            airportSlug={city.nearbyAirports?.[0]?.slug?.current || slug}
            cityName={cityTitle}
            title={es ? `Rutas populares desde ${cityTitle}` : `Popular routes from ${cityTitle}`}
          />
        </section>
      )}

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <section style={{ background: '#F8FAF0', padding: '5rem 6vw' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <FAQ items={faqItems} title={t('faq')} />
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────────────────── */}
      <section style={{ background: '#8BAA1D', overflow: 'hidden' }}>
        <div className="resp-2col" style={{ display: 'grid', minHeight: '380px' }}>
          <div className="resp-img-panel" style={{ position: 'relative', clipPath: 'polygon(0% 0%, 92% 0%, 100% 100%, 0% 100%)' }}>
            <Image src="/services/city-to-city.png" alt="" fill style={{ objectFit: 'cover', objectPosition: 'center' }} sizes="50vw" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 6vw 4rem 5vw' }}>
            <div style={{ width: '48px', height: '3px', background: '#ffffff', marginBottom: '1.25rem' }} />
            <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: '#ffffff', marginBottom: '1rem' }}>
              {es ? `¿Eres conductor profesional en ${cityTitle}?` : `Are you a professional driver in ${cityTitle}?`}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, marginBottom: '2rem', maxWidth: '440px' }}>
              {es ? 'Únete a nuestra red de conductores y recibe reservas directas sin comisiones abusivas.' : 'Join our driver network and receive direct bookings with no excessive commissions.'}
            </p>
            <a href="/contact/" style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '0.5rem', background: '#242426', color: '#ffffff', padding: '0.85rem 2rem', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', transform: 'skewX(-12deg)', transition: 'background 0.2s' }}>
              <span style={{ transform: 'skewX(12deg)', display: 'inline-block' }}>{es ? 'Contactar →' : 'Get in touch →'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <CtaSection />
    </>
  )
}
