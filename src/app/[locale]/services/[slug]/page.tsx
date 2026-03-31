import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { serviceBySlugQuery, allServicesQuery } from '@/lib/sanity/queries'
import { generateTaxiServiceSchema } from '@/lib/seo/schemaOrg'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { TrustNumbers } from '@/components/sections/TrustNumbers'
import { InlineBooking } from '@/components/sections/InlineBooking'
import { FAQ } from '@/components/sections/FAQ'
import { LatestNews } from '@/components/sections/LatestNews'
import { PortableText } from '@portabletext/react'
import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/config'

const serviceImages: Record<string, string> = {
  airport: '/services/airport-transfers.jpg',
  port: '/services/port-transfers.jpg',
  trainStation: '/services/train-transfers.jpg',
  cityToCity: '/services/city-to-city.jpg',
}

const serviceIcons: Record<string, string> = {
  airport: 'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5',
  port: 'M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z',
  trainStation: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121l-1.431-1.431A2.999 2.999 0 0017.466 9.5H15.75m-6 0V6.375m0 0a2.625 2.625 0 115.25 0M9.75 6.375v3.125',
  cityToCity: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121L16.5 10.5M6 6.5h10.5',
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
  return { title: seoTitle, description: seoDesc }
}

export default async function ServicePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const service = await sanityClient.fetch(serviceBySlugQuery, { slug })
  if (!service) notFound()

  const t = await getTranslations({ locale, namespace: 'nav' })
  const serviceTitle = (locale !== 'en' && service.translations?.[locale]?.title) || service.title
  const description = (locale !== 'en' && service.translations?.[locale]?.description) || service.description
  const heroImg = serviceImages[service.serviceType] || '/services/airport-transfers.jpg'
  const icon = serviceIcons[service.serviceType] || serviceIcons.airport

  const benefits = locale === 'es' ? [
    { title: 'Precios Fijos', desc: 'Sin sorpresas ni cargos ocultos. El precio que ves es el que pagas.', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z' },
    { title: 'Conductores Profesionales', desc: 'Conductores con licencia, experimentados y con revisión de antecedentes.', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
    { title: 'Cancelación Gratuita', desc: 'Cancela hasta 24 horas antes sin coste alguno.', icon: 'M6 18L18 6M6 6l12 12' },
    { title: 'Soporte 24/7', desc: 'Nuestro equipo está disponible las 24 horas, los 7 días de la semana.', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'Vehículos Premium', desc: 'Flota moderna con aire acondicionado, Wi-Fi y espacio para equipaje.', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121l-1.431-1.431' },
    { title: 'Reserva Fácil', desc: 'Reserva online en minutos. Confirmación instantánea por email.', icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3' },
  ] : [
    { title: 'Fixed Prices', desc: 'No surprises or hidden charges. The price you see is the price you pay.', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z' },
    { title: 'Professional Drivers', desc: 'Licensed, experienced and background-checked professional drivers.', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
    { title: 'Free Cancellation', desc: 'Cancel up to 24 hours before your trip at no extra cost.', icon: 'M6 18L18 6M6 6l12 12' },
    { title: '24/7 Support', desc: 'Our team is available around the clock, 7 days a week.', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'Premium Vehicles', desc: 'Modern fleet with A/C, Wi-Fi and luggage space for every need.', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121l-1.431-1.431' },
    { title: 'Easy Booking', desc: 'Book online in minutes. Instant email confirmation.', icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3' },
  ]

  const faqItems = locale === 'es' ? [
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

      {/* Hero with image */}
      <section className="hero-always-dark relative overflow-hidden bg-dark pb-20 pt-32">
        {/* Background image */}
        <Image
          src={heroImg}
          alt=""
          fill
          className="object-cover opacity-30"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e13] via-[#0a0e13]/80 to-[#0a0e13]/60" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative w-full">
          <Breadcrumbs items={[{ label: t('services'), href: '/services/' }, { label: serviceTitle }]} />

          <div className="mt-8 max-w-3xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-400 ring-1 ring-brand-500/20">
                {locale === 'es' ? 'Servicio premium' : 'Premium service'}
              </div>
            </div>

            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {serviceTitle}
            </h1>
            <p className="max-w-xl text-lg text-gray-400">
              {(locale === 'es' && service.translations?.es?.seoDescription) || service.seoDescription || `Book private ${serviceTitle.toLowerCase()} with fixed prices and professional drivers.`}
            </p>
          </div>
        </div>
      </section>

      <TrustNumbers compact />

      {/* Inline Booking */}
      <InlineBooking />

      {/* Description */}
      {description && (
        <section className="bg-dark-light py-20">
          <div className="prose prose-headings:text-heading prose-p:text-body site-container">
            <PortableText value={description} />
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="bg-dark py-20">
        <div className="site-container">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
              {locale === 'es' ? `¿Por qué elegir nuestro servicio de ${serviceTitle.toLowerCase()}?` : `Why choose our ${serviceTitle.toLowerCase()} service?`}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="group rounded-2xl bg-glass-bg p-6 ring-1 ring-glass-ring transition-all duration-500 hover:-translate-y-1 hover:ring-brand-500/30 hover:shadow-xl hover:shadow-brand-500/5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20 transition-all duration-300 group-hover:bg-brand-500/20">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-bold text-heading">{b.title}</h3>
                <p className="text-sm leading-relaxed text-body">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="bg-dark-light py-16">
        <div className="site-container">
          <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-heading">
            {locale === 'es' ? 'Explora más' : 'Explore more'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/airports/" className="group rounded-xl bg-glass-bg p-5 ring-1 ring-glass-ring transition-all duration-300 hover:ring-brand-500/30">
              <div className="mb-2 text-sm font-bold text-heading group-hover:text-brand-400">120+ {locale === 'es' ? 'Aeropuertos' : 'Airports'}</div>
              <p className="text-xs text-muted">{locale === 'es' ? 'Ver todos los aeropuertos' : 'Browse all airports'}</p>
            </Link>
            <Link href="/cities/" className="group rounded-xl bg-glass-bg p-5 ring-1 ring-glass-ring transition-all duration-300 hover:ring-brand-500/30">
              <div className="mb-2 text-sm font-bold text-heading group-hover:text-brand-400">145+ {locale === 'es' ? 'Ciudades' : 'Cities'}</div>
              <p className="text-xs text-muted">{locale === 'es' ? 'Ver todas las ciudades' : 'Browse all cities'}</p>
            </Link>
            <Link href="/countries/" className="group rounded-xl bg-glass-bg p-5 ring-1 ring-glass-ring transition-all duration-300 hover:ring-brand-500/30">
              <div className="mb-2 text-sm font-bold text-heading group-hover:text-brand-400">30+ {locale === 'es' ? 'Países' : 'Countries'}</div>
              <p className="text-xs text-muted">{locale === 'es' ? 'Ver todos los países' : 'Browse all countries'}</p>
            </Link>
            <Link href="/services/" className="group rounded-xl bg-glass-bg p-5 ring-1 ring-glass-ring transition-all duration-300 hover:ring-brand-500/30">
              <div className="mb-2 text-sm font-bold text-heading group-hover:text-brand-400">4 {locale === 'es' ? 'Servicios' : 'Services'}</div>
              <p className="text-xs text-muted">{locale === 'es' ? 'Ver todos los servicios' : 'Browse all services'}</p>
            </Link>
          </div>
        </div>
      </section>

      <FAQ items={faqItems} title={locale === 'es' ? 'Preguntas frecuentes' : 'Frequently asked questions'} />

      <LatestNews type="service" id="" serviceType={service.serviceType} title={locale === 'es' ? `Noticias sobre ${serviceTitle.toLowerCase()}` : `Latest ${serviceTitle.toLowerCase()} news`} />
    </>
  )
}
