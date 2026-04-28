import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { serviceBySlugQuery, allServicesQuery } from '@/lib/sanity/queries'
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
import type { Locale } from '@/lib/i18n/config'
import { russoOne } from '@/lib/fonts'

const serviceImages: Record<string, string> = {
  airport: '/services/airport-transfers.jpg',
  port: '/services/port-transfers.jpg',
  trainStation: '/services/train-transfers.jpg',
  cityToCity: '/services/city-to-city.jpg',
}

const serviceIcons: Record<string, string> = {
  airport: 'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5',
  port: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21',
  trainStation: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121l-1.431-1.431A2.999 2.999 0 0017.466 9.5H15.75m-6 0V6.375m0 0a2.625 2.625 0 115.25 0M9.75 6.375v3.125',
  cityToCity: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21',
}

function IconTag() {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
}
function IconShield() {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
}
function IconClock() {
  return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function IconStar() {
  return <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
}
function IconCheck() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#8BAA1D"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
}
function IconPlane() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
}

export async function generateStaticParams() {
  const services = await sanityClient.fetch(allServicesQuery)
  return services.map((s: { slug: { current: string } }) => ({ slug: s.slug.current }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const service = await sanityClient.fetch(serviceBySlugQuery, { slug })
  if (!service) return {}
  const seoTitle = (locale === 'es' && service.translations?.es?.seoTitle) || service.seoTitle || `Private ${service.title} Worldwide | Titan Transfers`
  const seoDesc = (locale === 'es' && service.translations?.es?.seoDescription) || service.seoDescription || `Book private ${service.title.toLowerCase()} with fixed prices and 24/7 support.`
  const esSlug = service.translations?.es?.slug?.current || slug
  const enSlug = service.slug?.current || slug
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://titantransfers.com'
  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical: locale === 'es' ? `${SITE_URL}/es/servicios/${esSlug}/` : `${SITE_URL}/services/${enSlug}/`,
      languages: {
        en: `${SITE_URL}/services/${enSlug}/`,
        es: `${SITE_URL}/es/servicios/${esSlug}/`,
        'x-default': `${SITE_URL}/services/${enSlug}/`,
      },
    },
  }
}

export default async function ServicePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const service = await sanityClient.fetch(serviceBySlugQuery, { slug })
  if (!service) notFound()

  const t = await getTranslations({ locale, namespace: 'nav' })
  const tc = await getTranslations({ locale, namespace: 'trust' })
  const es = locale === 'es'

  const serviceTitle = (locale !== 'en' && service.translations?.[locale]?.title) || service.title
  const description = (locale !== 'en' && service.translations?.[locale]?.description) || service.description
  const heroImg = serviceImages[service.serviceType] || '/services/airport-transfers.jpg'
  const icon = serviceIcons[service.serviceType] || serviceIcons.airport

  const trustBadges = [
    { icon: <IconStar />, label: tc('rating'), desc: tc('ratingDesc') },
    { icon: <IconTag />, label: tc('fixedPrice'), desc: tc('fixedPriceDesc') },
    { icon: <IconClock />, label: tc('support'), desc: tc('supportDesc') },
    { icon: <IconShield />, label: tc('freeCancel'), desc: tc('freeCancelDesc') },
  ]

  const benefits = es ? [
    { icon: <IconTag />, title: 'Precios fijos', desc: 'Sin sorpresas ni cargos ocultos. El precio que ves es el que pagas.' },
    { icon: <IconShield />, title: 'Cancelación gratuita', desc: 'Cancela hasta 24 horas antes sin coste alguno.' },
    { icon: <IconStar />, title: 'Meet & greet', desc: 'Tu conductor te espera con un cartel con tu nombre.' },
    { icon: <IconClock />, title: 'Soporte 24/7', desc: 'Nuestro equipo está disponible las 24 horas.' },
    { icon: <IconCheck />, title: 'Conductores profesionales', desc: 'Licenciados, con experiencia y revisión de antecedentes.' },
    { icon: <IconPlane />, title: 'Reserva fácil', desc: 'Reserva online en minutos. Confirmación instantánea.' },
  ] : [
    { icon: <IconTag />, title: 'Fixed prices', desc: 'No surprises or hidden charges. The price you see is the price you pay.' },
    { icon: <IconShield />, title: 'Free cancellation', desc: 'Cancel up to 24 hours before your trip at no cost.' },
    { icon: <IconStar />, title: 'Meet & greet', desc: 'Your driver waits with a name sign at arrivals.' },
    { icon: <IconClock />, title: '24/7 support', desc: 'Our team is available around the clock.' },
    { icon: <IconCheck />, title: 'Professional drivers', desc: 'Licensed, experienced and background-checked.' },
    { icon: <IconPlane />, title: 'Easy booking', desc: 'Book online in minutes. Instant email confirmation.' },
  ]

  const faqItems = es ? [
    { question: `¿Cómo reservo un ${serviceTitle.toLowerCase()}?`, answer: 'Usa nuestro buscador para encontrar tu ruta, selecciona tu vehículo y confirma tu reserva. Recibirás confirmación instantánea por email.' },
    { question: '¿Cuál es la diferencia con un taxi?', answer: 'Un traslado privado ofrece precios fijos, un conductor profesional esperándote con un cartel, y un vehículo cómodo pre-reservado. Sin colas ni taxímetros.' },
    { question: '¿Puedo cancelar mi reserva?', answer: 'Sí, ofrecemos cancelación gratuita hasta 24 horas antes de tu viaje.' },
    { question: '¿Qué pasa si mi vuelo se retrasa?', answer: 'Monitoreamos tu vuelo en tiempo real. Tu conductor ajustará su horario según la hora real de llegada sin coste adicional.' },
  ] : [
    { question: `How do I book a ${serviceTitle.toLowerCase()}?`, answer: 'Use our search tool to find your route, select your vehicle, and confirm your booking. You\'ll receive instant email confirmation.' },
    { question: 'What\'s the difference from a regular taxi?', answer: 'A private transfer offers fixed prices, a professional driver waiting with a name sign, and a comfortable pre-booked vehicle. No queuing, no meters.' },
    { question: 'Can I cancel my booking?', answer: 'Yes, we offer free cancellation up to 24 hours before your trip.' },
    { question: 'What if my flight is delayed?', answer: 'We monitor your flight in real time. Your driver will adjust their schedule to your actual arrival time at no extra cost.' },
  ]

  return (
    <>
      <SchemaOrg data={generateTaxiServiceSchema({ name: `Private ${service.title}`, description: service.seoDescription || `Book private ${service.title.toLowerCase()}`, url: `/services/${slug}/`, rating: 4.8 })} />

      {/* ─── HERO ───────────────────────────────────────────────────────── */}
      <section className="resp-2col" style={{ background: '#F8FAF0', display: 'grid', minHeight: '520px' }}>
        <div className="resp-img-panel" style={{ position: 'relative', clipPath: 'polygon(0% 0%, 100% 0%, 92% 100%, 0% 100%)' }}>
          <Image src={heroImg} alt={serviceTitle} fill priority style={{ objectFit: 'cover', objectPosition: 'center right' }} sizes="50vw" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '4vw', paddingRight: '6vw', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <Breadcrumbs items={[{ label: t('services'), href: '/services/' }, { label: serviceTitle }]} variant="light" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'inline-flex', background: '#8BAA1D', color: '#ffffff', padding: '10px', transform: 'skewX(-8deg)' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#ffffff" style={{ transform: 'skewX(8deg)', display: 'block' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8BAA1D', background: '#e8f0c4', padding: '3px 10px', letterSpacing: '0.06em' }}>
              {es ? 'Servicio premium' : 'Premium service'}
            </span>
          </div>

          <h1 className={russoOne.className} style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: '#242426', lineHeight: 1.05, marginBottom: '1.25rem', textTransform: 'none' }}>
            {serviceTitle}
          </h1>

          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.75, maxWidth: '480px' }}>
            {(es && service.translations?.es?.seoDescription) || service.seoDescription || `Book private ${serviceTitle.toLowerCase()} with fixed prices and professional drivers.`}
          </p>
        </div>

      </section>

      {/* ─── BOOKING FORM ──────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', paddingTop: '2.5rem', paddingBottom: '2.5rem', paddingLeft: '6vw', paddingRight: '6vw' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8BAA1D', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
          {es ? `Reserva tu ${serviceTitle.toLowerCase()}` : `Book your ${serviceTitle.toLowerCase()}`}
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

      {/* ─── DESCRIPTION ──────────────────────────────────────────────── */}
      {description && (
        <section style={{ background: '#ffffff', padding: '5rem 6vw' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }} className="prose prose-lg prose-headings:font-normal prose-headings:text-[#242426] prose-p:text-[#475569] prose-p:leading-relaxed prose-a:text-[#8BAA1D] prose-a:no-underline">
            <PortableText value={description} />
          </div>
        </section>
      )}

      {/* ─── WHY CHOOSE US ────────────────────────────────────────────── */}
      <section style={{ background: '#F8FAF0', padding: '5rem 6vw' }}>
        <div className="resp-2col" style={{ display: 'grid', gap: '4rem', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <div style={{ width: '48px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
            <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)', color: '#242426', marginBottom: '1rem', textTransform: 'none' }}>
              {es ? `¿Por qué elegir nuestro servicio de ${serviceTitle.toLowerCase()}?` : `Why choose our ${serviceTitle.toLowerCase()} service?`}
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.75, marginBottom: '2rem' }}>
              {es ? 'Todos nuestros servicios incluyen precio fijo, conductor profesional y cancelación gratuita.' : 'All our services include fixed prices, professional drivers and free cancellation.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {benefits.map((item, i) => (
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
            <Image src="/mockup.png" alt="" aria-hidden="true" width={555} height={605} style={{ objectFit: 'contain', maxHeight: '535px', width: 'auto', marginTop: '2rem' }} />
          </div>
        </div>
      </section>

      {/* ─── FLEET ────────────────────────────────────────────────────── */}
      <FleetShowcase />

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ─── TESTIMONIALS ─────────────────────────────────────────────── */}
      <Testimonials />

      {/* ─── FAQ ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', padding: '5rem 6vw' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <FAQ items={faqItems} title={es ? 'Preguntas frecuentes' : 'Frequently asked questions'} />
        </div>
      </section>

      {/* ─── EXPLORE MORE ─────────────────────────────────────────────── */}
      <section style={{ background: '#F8FAF0', padding: '5rem 6vw' }}>
        <div style={{ width: '48px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
        <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#242426', marginBottom: '2rem' }}>
          {es ? 'Explora más' : 'Explore more'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { href: '/airports/', n: '120+', label: es ? 'Aeropuertos' : 'Airports', desc: es ? 'Ver todos los aeropuertos' : 'Browse all airports' },
            { href: '/cities/', n: '145+', label: es ? 'Ciudades' : 'Cities', desc: es ? 'Ver todas las ciudades' : 'Browse all cities' },
            { href: '/countries/', n: '30+', label: es ? 'Países' : 'Countries', desc: es ? 'Ver todos los países' : 'Browse all countries' },
            { href: '/services/', n: '4', label: es ? 'Servicios' : 'Services', desc: es ? 'Ver todos los servicios' : 'Browse all services' },
          ].map(item => (
            <Link key={item.href} href={item.href as any} style={{ textDecoration: 'none', background: '#ffffff', border: '1.5px solid #e5e7eb', padding: '1.25rem', display: 'block', transition: 'border-color 0.15s' }}>
              <div className={russoOne.className} style={{ fontSize: '1.5rem', color: '#8BAA1D', lineHeight: 1 }}>{item.n}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#242426', marginTop: '0.25rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{item.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── CTA BANNER ────────────────────────────────────────────────── */}
      <section style={{ background: '#8BAA1D', overflow: 'hidden' }}>
        <div className="resp-2col" style={{ display: 'grid', minHeight: '380px' }}>
          <div className="resp-img-panel" style={{ position: 'relative', clipPath: 'polygon(0% 0%, 92% 0%, 100% 100%, 0% 100%)' }}>
            <Image src="/services/city-to-city.png" alt="" fill style={{ objectFit: 'cover', objectPosition: 'center' }} sizes="50vw" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 6vw 4rem 5vw' }}>
            <div style={{ width: '48px', height: '3px', background: '#ffffff', marginBottom: '1.25rem' }} />
            <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: '#ffffff', marginBottom: '1rem' }}>
              {es ? '¿Eres conductor profesional?' : 'Are you a professional driver?'}
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

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <CtaSection />
    </>
  )
}
