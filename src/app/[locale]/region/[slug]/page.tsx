import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { regionBySlugQuery, allRegionsQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { generatePageMetadata, generateRegionMetadata } from '@/lib/seo/generateMetadata'
import { generateTaxiServiceSchema } from '@/lib/seo/schemaOrg'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { BookingForm } from '@/components/ui/BookingForm'
import { RegionOverview } from '@/components/sections/RegionOverview'
import { FAQ } from '@/components/sections/FAQ'
import { FleetShowcase } from '@/components/sections/FleetShowcase'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Testimonials } from '@/components/sections/Testimonials'
import { CtaSection } from '@/components/sections/CtaSection'
import { PortableText } from '@portabletext/react'
import type { Locale } from '@/lib/i18n/config'
import { russoOne } from '@/lib/fonts'

export async function generateStaticParams() {
  const regions = await sanityClient.fetch(allRegionsQuery)
  return regions.map((r: { slug: { current: string } }) => ({ slug: r.slug.current }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const region = await sanityClient.fetch(regionBySlugQuery, { slug })
  if (!region) return {}
  const { title, description } = generateRegionMetadata(region, locale as Locale)
  const enSlug = region.slug?.current || slug
  const esSlug = region.translations?.es?.slug?.current || enSlug
  const currentPath = locale === 'es' ? `/es/traslados-privados-region/${esSlug}/` : `/private-transfers-region/${enSlug}/`
  return generatePageMetadata({ title, description, path: currentPath, locale: locale as Locale, alternates: [{ locale: 'en' as Locale, path: `/private-transfers-region/${enSlug}/` }, { locale: 'es' as Locale, path: `/es/traslados-privados-region/${esSlug}/` }] })
}

export default async function RegionPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const region = await sanityClient.fetch(regionBySlugQuery, { slug })
  if (!region) notFound()

  const t = await getTranslations({ locale, namespace: 'region' })
  const tc = await getTranslations({ locale, namespace: 'trust' })
  const es = locale === 'es'

  const regionTitle = (locale !== 'en' && region.translations?.[locale]?.title) || region.title
  const description = (locale !== 'en' && region.translations?.[locale]?.description) || region.description
  const heroImg = urlFor(region.featuredImage)?.width(1920).height(900).quality(90).url()

  const breadcrumbs = [
    { label: region.country?.title || '', href: es ? `/traslados-privados-pais/${region.country?.slug?.current}/` : `/private-transfers-country/${region.country?.slug?.current}/` },
    { label: regionTitle },
  ]

  const faqItems = es ? [
    { question: `¿Cómo llego a ${regionTitle} desde el aeropuerto?`, answer: `Ofrecemos traslados privados desde todos los aeropuertos que dan servicio a ${regionTitle}. Usa nuestro formulario de reserva para encontrar las rutas disponibles.` },
    { question: `¿Hay servicio de taxi privado en ${regionTitle}?`, answer: `Sí, ofrecemos servicio de taxi privado en toda la zona de ${regionTitle} con precios fijos y conductores profesionales.` },
    { question: `¿Cuál es el aeropuerto más cercano a ${regionTitle}?`, answer: `Consulta la sección de aeropuertos más arriba para ver los aeropuertos más cercanos con servicio a ${regionTitle}.` },
    { question: `¿Cuánto cuesta un traslado privado en ${regionTitle}?`, answer: `El precio depende de la ruta y el vehículo elegido. Consulta precios fijos al instante en nuestro formulario. Sin cargos ocultos ni sorpresas.` },
  ] : [
    { question: `How do I get to ${regionTitle} from the nearest airport?`, answer: `We offer private transfers from all airports serving ${regionTitle}. Use our booking form to find available routes.` },
    { question: `Is there a private taxi service in ${regionTitle}?`, answer: `Yes, we offer private taxi services across ${regionTitle} with fixed prices and professional drivers.` },
    { question: `Which airport is closest to ${regionTitle}?`, answer: `Check the airports section above for the nearest airports serving ${regionTitle}.` },
    { question: `How much does a private transfer in ${regionTitle} cost?`, answer: `Prices depend on the route and vehicle selected. Get an instant fixed-price quote in our booking form. No hidden charges.` },
  ]

  const trustBadges = [
    { icon: '★', label: tc('rating'), desc: tc('ratingDesc') },
    { icon: '◈', label: tc('fixedPrice'), desc: tc('fixedPriceDesc') },
    { icon: '◷', label: tc('support'), desc: tc('supportDesc') },
    { icon: '✓', label: tc('freeCancel'), desc: tc('freeCancelDesc') },
  ]

  return (
    <>
      <SchemaOrg data={generateTaxiServiceSchema({ name: `${regionTitle} Transfers`, description: `Private transfers in ${regionTitle}`, url: `/private-transfers/${slug}/`, areaServed: regionTitle, rating: 4.8 })} />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="resp-2col" style={{ background: '#F8FAF0', display: 'grid', minHeight: '520px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '6vw', paddingRight: '4vw', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <Breadcrumbs items={breadcrumbs} variant="light" />
          <h1 className={russoOne.className} style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: '#242426', lineHeight: 1.05, marginBottom: '1.25rem', marginTop: '0.75rem' }}>
            {t('transfers', { region: regionTitle })}
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.75, maxWidth: '480px' }}>
            {es ? `Traslados privados en ${regionTitle} con precio fijo y conductor profesional.` : `Private transfers in ${regionTitle} at fixed prices with professional drivers.`}
          </p>
        </div>

        <div className="resp-img-panel" style={{ position: 'relative', clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)' }}>
          {heroImg ? (
            <Image src={heroImg} alt={`Transfers ${regionTitle}`} fill priority style={{ objectFit: 'cover', objectPosition: 'center' }} sizes="50vw" />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: '#242426' }} />
          )}
        </div>
      </section>

      {/* ─── BOOKING FORM ─────────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', paddingTop: '2.5rem', paddingBottom: '2.5rem', paddingLeft: '6vw', paddingRight: '6vw' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8BAA1D', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
          {es ? `Reserva tu transfer — ${regionTitle}` : `Book your transfer — ${regionTitle}`}
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
      {region.airports?.length > 0 && (
        <section style={{ background: '#F8FAF0', padding: '5rem 6vw' }}>
          <div style={{ width: '48px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
          <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#242426', marginBottom: '2rem' }}>
            {t('airports', { region: regionTitle })}
          </h2>
          <RegionOverview airports={region.airports} />
        </section>
      )}

      {/* ─── CITIES ───────────────────────────────────────────────────────── */}
      {region.cities?.length > 0 && (
        <section style={{ background: '#ffffff', padding: '5rem 6vw' }}>
          <div style={{ width: '48px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
          <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#242426', marginBottom: '2rem' }}>
            {t('destinations', { region: regionTitle })}
          </h2>
          <RegionOverview cities={region.cities} />
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
              {es ? `¿Eres conductor profesional en ${regionTitle}?` : `Are you a professional driver in ${regionTitle}?`}
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
