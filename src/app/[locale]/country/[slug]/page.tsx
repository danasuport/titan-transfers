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
import { BookingForm } from '@/components/ui/BookingForm'
import { CountryOverview } from '@/components/sections/CountryOverview'
import { FAQ } from '@/components/sections/FAQ'
import { FleetShowcase } from '@/components/sections/FleetShowcase'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Testimonials } from '@/components/sections/Testimonials'
import { CtaSection } from '@/components/sections/CtaSection'
import { PortableText } from '@portabletext/react'
import type { Locale } from '@/lib/i18n/config'
import { russoOne } from '@/lib/fonts'

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
  const tc = await getTranslations({ locale, namespace: 'trust' })
  const es = locale === 'es'

  const countryTitle = (locale !== 'en' && country.translations?.[locale]?.title) || country.title
  const description = (locale !== 'en' && country.translations?.[locale]?.description) || country.description
  const heroImg = urlFor(country.featuredImage)?.width(1920).height(900).quality(90).url()

  const airportCount = country.airports?.length || 0
  const cityCount = country.cities?.length || 0

  const faqItems = [
    { question: `How do I book a private transfer in ${countryTitle}?`, answer: `Use our booking form to search for transfers across ${countryTitle}. Enter your pickup and destination to get an instant quote with fixed prices.` },
    { question: `Which airports in ${countryTitle} do you cover?`, answer: `We cover ${airportCount > 0 ? airportCount : 'all major'} airports in ${countryTitle}, including both international and regional airports. Browse the full list above.` },
    { question: `Is a private taxi available in all cities in ${countryTitle}?`, answer: `We offer private taxi services in the main cities and tourist destinations across ${countryTitle}, with door-to-door service.` },
    { question: `How much does an airport transfer cost in ${countryTitle}?`, answer: `Prices vary by route and vehicle type. Use our booking system for instant quotes with fixed prices and no hidden charges.` },
  ]

  const trustBadges = [
    { icon: '★', label: tc('rating'), desc: tc('ratingDesc') },
    { icon: '◈', label: tc('fixedPrice'), desc: tc('fixedPriceDesc') },
    { icon: '◷', label: tc('support'), desc: tc('supportDesc') },
    { icon: '✓', label: tc('freeCancel'), desc: tc('freeCancelDesc') },
  ]

  return (
    <>
      <SchemaOrg data={generateTaxiServiceSchema({ name: `Private Transfers in ${countryTitle}`, description: `Book transfers across ${countryTitle}`, url: `/country/${slug}/`, areaServed: countryTitle, rating: 4.8 })} />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="resp-2col" style={{ background: '#F8FAF0', display: 'grid', minHeight: '520px' }}>
        {/* Left: content */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '6vw', paddingRight: '4vw', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <Breadcrumbs items={[{ label: countryTitle }]} variant="light" />

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {airportCount > 0 && (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8BAA1D', background: '#e8f0c4', padding: '3px 10px', letterSpacing: '0.06em' }}>
                {airportCount} {es ? 'aeropuertos' : 'airports'}
              </span>
            )}
            {cityCount > 0 && (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8BAA1D', background: '#e8f0c4', padding: '3px 10px', letterSpacing: '0.06em' }}>
                {cityCount} {es ? 'ciudades' : 'cities'}
              </span>
            )}
          </div>

          <h1 className={russoOne.className} style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: '#242426', lineHeight: 1.05, marginBottom: '1.25rem' }}>
            {t('transfers', { country: countryTitle })}
          </h1>

          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.75, maxWidth: '480px' }}>
            {t('privateTaxi', { country: countryTitle })}
          </p>
        </div>

        {/* Right: image with diagonal clip */}
        <div className="resp-img-panel" style={{ position: 'relative', clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)' }}>
          {heroImg ? (
            <Image src={heroImg} alt={`${t('transfers')} ${countryTitle}`} fill priority style={{ objectFit: 'cover', objectPosition: 'center' }} sizes="50vw" />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: '#242426' }} />
          )}
        </div>
      </section>

      {/* ─── BOOKING FORM ─────────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', paddingTop: '2.5rem', paddingBottom: '2.5rem', paddingLeft: '6vw', paddingRight: '6vw' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8BAA1D', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
          {es ? `Reserva tu transfer — ${countryTitle}` : `Book your transfer — ${countryTitle}`}
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

      {/* ─── AIRPORTS ─────────────────────────────────────────────────────── */}
      {country.airports?.length > 0 && (
        <section style={{ background: '#F8FAF0', padding: '5rem 6vw' }}>
          <div style={{ width: '48px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
          <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#242426', marginBottom: '2rem' }}>
            {t('airports', { country: countryTitle })}
          </h2>
          <CountryOverview airports={country.airports} />
        </section>
      )}

      {/* ─── CITIES ───────────────────────────────────────────────────────── */}
      {country.cities?.length > 0 && (
        <section style={{ background: '#ffffff', padding: '5rem 6vw' }}>
          <div style={{ width: '48px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
          <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#242426', marginBottom: '2rem' }}>
            {t('popularCities', { country: countryTitle })}
          </h2>
          <CountryOverview cities={country.cities} />
        </section>
      )}

      {/* ─── REGIONS ──────────────────────────────────────────────────────── */}
      {country.regions?.length > 0 && (
        <section style={{ background: '#F8FAF0', padding: '5rem 6vw' }}>
          <div style={{ width: '48px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
          <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#242426', marginBottom: '2rem' }}>
            {t('regions', { country: countryTitle })}
          </h2>
          <CountryOverview regions={country.regions} />
        </section>
      )}

      {/* ─── FLEET ────────────────────────────────────────────────────────── */}
      <FleetShowcase />

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ─── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <Testimonials />

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
              {es ? `¿Eres conductor profesional en ${countryTitle}?` : `Are you a professional driver in ${countryTitle}?`}
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
