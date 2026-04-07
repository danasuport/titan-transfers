import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { routeBySlugQuery } from '@/lib/sanity/queries'
import { generatePageMetadata, generateRouteMetadata } from '@/lib/seo/generateMetadata'
import { generateTaxiServiceSchema } from '@/lib/seo/schemaOrg'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { BookingForm } from '@/components/ui/BookingForm'
import { FleetShowcase } from '@/components/sections/FleetShowcase'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Testimonials } from '@/components/sections/Testimonials'
import { FAQ } from '@/components/sections/FAQ'
import { CtaSection } from '@/components/sections/CtaSection'
import { PortableText } from '@portabletext/react'
import { Link } from '@/lib/i18n/navigation'
import { formatDistance, formatDuration } from '@/lib/utils/formatters'
import { urlFor } from '@/lib/sanity/image'
import type { Locale } from '@/lib/i18n/config'
import { russoOne } from '@/lib/fonts'

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
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
}
function IconCheck() {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
}
function IconMap() {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string; routeSlug: string }> }) {
  const { locale, slug, routeSlug } = await params
  const route = await sanityClient.fetch(routeBySlugQuery, { originSlug: slug, routeSlug })
  if (!route) return {}
  const { title, description } = generateRouteMetadata(route, locale as Locale)
  return generatePageMetadata({
    title,
    description,
    path: `/airport-transfers-private-taxi/${slug}/${routeSlug}/`,
    locale: locale as Locale,
    alternates: [
      { locale: 'en' as Locale, path: `/airport-transfers-private-taxi/${slug}/${routeSlug}/` },
      { locale: 'es' as Locale, path: `/es/traslados-aeropuerto-privados-taxi/${slug}/${route.translations?.es?.slug?.current || routeSlug}/` },
    ],
  })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RoutePage({ params }: { params: Promise<{ locale: string; slug: string; routeSlug: string }> }) {
  const { locale, slug, routeSlug } = await params
  const route = await sanityClient.fetch(routeBySlugQuery, { originSlug: slug, routeSlug })
  if (!route) notFound()

  const t = await getTranslations({ locale, namespace: 'route' })
  const tc = await getTranslations({ locale, namespace: 'trust' })
  const es = locale === 'es'

  const originTitle = (locale !== 'en' && route.origin?.translations?.[locale]?.title) || route.origin?.title || ''
  const destTitle = (locale !== 'en' && route.destination?.translations?.[locale]?.title) || route.destination?.title || ''
  const description = (locale !== 'en' && route.translations?.[locale]?.description) || route.description

  const heroImg = route.featuredImage?.asset?.url || null

  const contentSections: { title: string; body: any[]; imagePosition: 'left' | 'right'; imageAlt: string; image?: { asset?: { url?: string } } }[] =
    ((locale !== 'en' && route.translations?.[locale]?.contentSections) || route.contentSections || []).slice(0, 3)

  const breadcrumbs = [
    { label: route.country?.title || '', href: es ? `/traslados-privados-pais/${route.country?.slug?.current}/` : `/private-transfers-country/${route.country?.slug?.current}/` },
    { label: originTitle, href: es ? `/traslados-aeropuerto-privados-taxi/${route.origin?.slug?.current}/` : `/airport-transfers-private-taxi/${route.origin?.slug?.current}/` },
    { label: destTitle },
  ]

  const trustBadges = [
    { icon: <IconStar />, label: tc('rating'), desc: tc('ratingDesc') },
    { icon: <IconTag />, label: tc('fixedPrice'), desc: tc('fixedPriceDesc') },
    { icon: <IconClock />, label: tc('support'), desc: tc('supportDesc') },
    { icon: <IconShield />, label: tc('freeCancel'), desc: tc('freeCancelDesc') },
  ]

  const whyItems = [
    { icon: <IconTag />, title: es ? 'Precio fijo' : 'Fixed price', desc: es ? 'Sin sorpresas — precio cerrado antes de viajar' : 'No surprises — price agreed before you travel' },
    { icon: <IconPlane />, title: es ? 'Meet & greet' : 'Meet & greet', desc: es ? 'Conductor con cartel con tu nombre en llegadas' : 'Driver with name sign at arrivals' },
    { icon: <IconClock />, title: es ? 'Seguimiento de vuelo' : 'Flight monitoring', desc: es ? 'Ajustamos la recogida si tu vuelo se retrasa' : 'We adjust pickup if your flight is delayed' },
    { icon: <IconShield />, title: es ? 'Cancelación gratuita' : 'Free cancellation', desc: es ? 'Cancela gratis hasta 24h antes' : 'Cancel free up to 24 hours before pickup' },
    { icon: <IconMap />, title: es ? 'Puerta a puerta' : 'Door-to-door', desc: es ? 'Servicio directo desde recogida hasta destino' : 'Direct service from pickup to your destination' },
    { icon: <IconCheck />, title: es ? 'Vehículos modernos' : 'Modern vehicles', desc: es ? 'Flota climatizada para cada necesidad' : 'Air-conditioned fleet for every group size' },
  ]

  const faqItems = [
    {
      question: es ? `¿Cuánto tarda el traslado de ${originTitle} a ${destTitle}?` : `How long is the transfer from ${originTitle} to ${destTitle}?`,
      answer: route.estimatedDuration
        ? (es ? `El traslado dura aproximadamente ${formatDuration(route.estimatedDuration)}.` : `The transfer takes approximately ${formatDuration(route.estimatedDuration)}.`)
        : (es ? 'Contáctanos para una estimación del tiempo.' : 'Contact us for estimated travel time.'),
    },
    {
      question: es ? `¿Cuánto cuesta un traslado privado a ${destTitle}?` : `How much does a private transfer to ${destTitle} cost?`,
      answer: es ? 'Usa nuestro formulario de reserva para obtener un precio fijo al instante. Sin cargos ocultos.' : 'Use our booking form for an instant quote with fixed prices. No hidden charges.',
    },
    {
      question: es ? '¿Qué pasa si mi vuelo se retrasa?' : 'What happens if my flight is delayed?',
      answer: es ? 'Monitorizamos todos los vuelos en tiempo real. Tu conductor ajustará automáticamente la hora de recogida sin coste adicional.' : 'We monitor all flights in real time. Your driver will adjust the pickup time automatically at no extra cost.',
    },
    {
      question: es ? '¿Puedo cancelar la reserva?' : 'Can I cancel my booking?',
      answer: es ? 'Sí, puedes cancelar gratis hasta 24 horas antes de la recogida.' : 'Yes, you can cancel free of charge up to 24 hours before pickup.',
    },
    {
      question: es ? '¿Hay servicio disponible las 24 horas?' : 'Is the service available 24/7?',
      answer: es ? 'Sí, operamos las 24 horas del día, los 7 días de la semana, incluyendo festivos.' : 'Yes, we operate 24 hours a day, 7 days a week, including public holidays.',
    },
  ]

  return (
    <>
      <SchemaOrg data={generateTaxiServiceSchema({
        name: `${originTitle} to ${destTitle} Transfer`,
        description: `Private transfer from ${originTitle} to ${destTitle}`,
        url: `/airport-transfers-private-taxi/${slug}/${routeSlug}/`,
        areaServed: destTitle,
        rating: 4.8,
      })} />

      {/* ─── HERO ───────────────────────────────────────────────────────── */}
      <section className="resp-2col" style={{ background: '#F8FAF0', display: 'grid', minHeight: '520px' }}>

        {/* Left: content */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '6vw', paddingRight: '4vw', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <Breadcrumbs items={breadcrumbs} variant="light" />

          {/* Distance + duration badges */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {route.distance && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: '1.5px solid #e5e7eb', padding: '4px 12px', fontSize: '0.78rem', color: '#475569', transform: 'skewX(-6deg)' }}>
                <span style={{ transform: 'skewX(6deg)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#8BAA1D"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  {formatDistance(route.distance)}
                </span>
              </span>
            )}
            {route.estimatedDuration && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: '1.5px solid #e5e7eb', padding: '4px 12px', fontSize: '0.78rem', color: '#475569', transform: 'skewX(-6deg)' }}>
                <span style={{ transform: 'skewX(6deg)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#8BAA1D"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {formatDuration(route.estimatedDuration)}
                </span>
              </span>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', background: '#8BAA1D', color: '#ffffff', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700, transform: 'skewX(-6deg)' }}>
              <span style={{ transform: 'skewX(6deg)' }}>24/7</span>
            </span>
          </div>

          <h1 className={russoOne.className} style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: '#242426', lineHeight: 1.05, marginBottom: '1.25rem' }}>
            {es ? `Traslado privado de ${originTitle} a ${destTitle}` : `Private transfer from ${originTitle} to ${destTitle}`}
          </h1>

          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.75, maxWidth: '480px' }}>
            {es
              ? `Traslado puerta a puerta desde ${originTitle} hasta ${destTitle} con conductor profesional, precio fijo y seguimiento de vuelo incluido.`
              : `Door-to-door transfer from ${originTitle} to ${destTitle} with professional driver, fixed price and flight monitoring included.`}
          </p>
        </div>

        {/* Right: image with diagonal left mask */}
        <div className="resp-img-panel" style={{ position: 'relative', clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)' }}>
          {heroImg ? (
            <Image
              src={heroImg}
              alt={`${es ? 'Traslado de' : 'Transfer from'} ${originTitle} ${es ? 'a' : 'to'} ${destTitle}`}
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
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8BAA1D', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
          {es ? `Reserva tu transfer — ${originTitle} → ${destTitle}` : `Book your transfer — ${originTitle} → ${destTitle}`}
        </p>
        <BookingForm />

        {/* Trust badges */}
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

      {/* ─── GALLERY + DESCRIPTION ─────────────────────────────────────── */}
      {(description || contentSections.length > 0) && (
        <section style={{ background: '#ffffff', padding: '5rem 6vw', borderTop: '1px solid #e5e7eb' }}>

          {/* Collage mosaic — featuredImage large + 3 section images small */}
          {(() => {
            // Build ordered image list: featured first, then section images
            const allImgs: { url: string; alt: string }[] = []
            if (heroImg) allImgs.push({ url: heroImg, alt: route.featuredImage?.alt || `Private transfer from ${originTitle} to ${destTitle} — ${destTitle}` })
            for (const s of contentSections) {
              if (s.image?.asset?.url) allImgs.push({ url: s.image.asset.url, alt: s.imageAlt || `${originTitle} to ${destTitle} transfer — ${s.title || destTitle}` })
            }
            if (allImgs.length === 0) return null
            const large = allImgs[0]
            const smalls = allImgs.slice(1, 4)
            return (
              <div className="resp-photo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(2, 220px)', gap: '12px', marginBottom: '3.5rem' }}>
                {/* Large image — spans 2 cols × 2 rows */}
                <div style={{ gridColumn: '1 / 3', gridRow: '1 / 3', position: 'relative', overflow: 'hidden', borderRadius: '4px' }}>
                  <Image src={large.url} alt={large.alt} fill style={{ objectFit: 'cover' }} sizes="50vw" />
                  <svg style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', zIndex: 1 }} viewBox="0 0 400 40" preserveAspectRatio="none">
                    <path d="M0,40 L0,20 Q100,0 200,20 Q300,40 400,15 L400,40 Z" fill="rgba(36,36,38,0.15)" />
                  </svg>
                </div>
                {/* Small images */}
                {smalls.map((img, i) => (
                  <div key={i} style={{ position: 'relative', overflow: 'hidden', borderRadius: '4px' }}>
                    <Image src={img.url} alt={img.alt} fill style={{ objectFit: 'cover' }} sizes="25vw" />
                  </div>
                ))}
                {/* Placeholder slots if < 3 small images */}
                {Array.from({ length: Math.max(0, 3 - smalls.length) }).map((_, i) => (
                  <div key={`ph-${i}`} style={{ background: '#e5e7eb', borderRadius: '4px' }} />
                ))}
              </div>
            )
          })()}

          {/* Description prose */}
          {description && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }} className="prose prose-lg prose-headings:font-normal prose-headings:text-[#242426] prose-p:text-[#475569] prose-p:leading-relaxed prose-a:text-[#8BAA1D] prose-a:no-underline">
              <PortableText value={description} />
            </div>
          )}

        </section>
      )}

      {/* ─── CONTENT SECTIONS ──────────────────────────────────────────── */}
      {contentSections.map((section, i) => {
        const imgLeft = section.imagePosition !== 'right'
        const imgUrl = section.image?.asset?.url
        const bg = i % 2 === 0 ? '#ffffff' : '#F8FAF0'
        return (
          <section key={i} style={{ background: bg, padding: '5rem 6vw' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5vw', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>

              {/* Image */}
              {imgLeft && imgUrl && (
                <div style={{ position: 'relative', height: '420px', clipPath: 'polygon(0% 0%, 92% 0%, 100% 100%, 0% 100%)', overflow: 'hidden' }}>
                  <Image src={imgUrl} alt={section.imageAlt || section.title || ''} fill style={{ objectFit: 'cover', objectPosition: 'center' }} sizes="50vw" />
                </div>
              )}
              {imgLeft && !imgUrl && (
                <div style={{ height: '420px', background: '#e5e7eb', clipPath: 'polygon(0% 0%, 92% 0%, 100% 100%, 0% 100%)' }} />
              )}

              {/* Text */}
              <div>
                <div style={{ width: '40px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
                {section.title && (
                  <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#242426', marginBottom: '1.25rem' }}>
                    {section.title}
                  </h2>
                )}
                {section.body && (
                  <div className="prose prose-lg prose-headings:font-normal prose-headings:text-[#242426] prose-p:text-[#475569] prose-p:leading-relaxed prose-a:text-[#8BAA1D] prose-a:no-underline prose-li:text-[#475569]">
                    <PortableText value={section.body} />
                  </div>
                )}
              </div>

              {/* Image right */}
              {!imgLeft && imgUrl && (
                <div style={{ position: 'relative', height: '420px', clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)', overflow: 'hidden' }}>
                  <Image src={imgUrl} alt={section.imageAlt || section.title || ''} fill style={{ objectFit: 'cover', objectPosition: 'center' }} sizes="50vw" />
                </div>
              )}
              {!imgLeft && !imgUrl && (
                <div style={{ height: '420px', background: '#e5e7eb', clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)' }} />
              )}

            </div>
          </section>
        )
      })}

      {/* ─── WHY BOOK ──────────────────────────────────────────────────── */}
      <section style={{ background: '#F8FAF0', padding: '5rem 6vw' }}>
        <div style={{ display: 'grid', gap: '4rem', gridTemplateColumns: '1fr 1fr', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <div style={{ width: '48px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
            <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)', color: '#242426', marginBottom: '1rem' }}>
              {es ? `¿Por qué reservar con nosotros?` : `Why book with us?`}
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.75, marginBottom: '2rem' }}>
              {es
                ? `Todos nuestros traslados incluyen precio fijo, conductor profesional y seguimiento de vuelo sin coste adicional.`
                : `All our transfers include fixed price, professional driver and flight monitoring at no extra cost.`}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {whyItems.map((item, i) => (
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Image
              src="/mockup.png"
              alt=""
              aria-hidden="true"
              width={555}
              height={605}
              style={{ objectFit: 'contain', maxHeight: '480px', width: 'auto' }}
            />
          </div>
        </div>
      </section>

      {/* ─── FLEET ─────────────────────────────────────────────────────── */}
      <FleetShowcase />

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ─── TESTIMONIALS ──────────────────────────────────────────────── */}
      <Testimonials />

      {/* ─── FAQ ───────────────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', padding: '5rem 6vw' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <FAQ items={faqItems} title={es ? `Preguntas frecuentes` : `Frequently asked questions`} />
        </div>
      </section>

      {/* ─── INTERNAL LINKS ────────────────────────────────────────────── */}
      <section style={{ background: '#F8FAF0', padding: '3rem 6vw' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            {es ? 'Explorar más' : 'Explore more'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {route.origin?.slug?.current && (
              <Link href={(es ? `/traslados-aeropuerto-privados-taxi/${route.origin.slug.current}/` : `/airport-transfers-private-taxi/${route.origin.slug.current}/`) as any} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#ffffff', border: '1.5px solid #e5e7eb', transform: 'skewX(-8deg)', overflow: 'hidden', transition: 'border-color 0.15s' }}>
                  <div style={{ transform: 'skewX(8deg)', padding: '0.6rem 1.25rem' }}>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
                      {es ? 'Aeropuerto' : 'Airport'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#242426' }}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#8BAA1D"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                      {originTitle}
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {route.destination?.slug?.current && (
              <Link href={(es ? `/traslados-privados-taxi/${route.destination.slug.current}/` : `/private-transfers/${route.destination.slug.current}/`) as any /* city link */} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#ffffff', border: '1.5px solid #e5e7eb', transform: 'skewX(-8deg)', overflow: 'hidden', transition: 'border-color 0.15s' }}>
                  <div style={{ transform: 'skewX(8deg)', padding: '0.6rem 1.25rem' }}>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
                      {es ? 'Ciudad destino' : 'Destination'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#242426' }}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#8BAA1D"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                      {destTitle}
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {route.country?.slug?.current && (
              <Link href={(es ? `/traslados-privados-pais/${route.country.slug.current}/` : `/private-transfers-country/${route.country.slug.current}/`) as any} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#ffffff', border: '1.5px solid #e5e7eb', transform: 'skewX(-8deg)', overflow: 'hidden' }}>
                  <div style={{ transform: 'skewX(8deg)', padding: '0.6rem 1.25rem' }}>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
                      {es ? 'País' : 'Country'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#242426' }}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#8BAA1D"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                      {route.country.title}
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────────── */}
      <CtaSection />
    </>
  )
}
