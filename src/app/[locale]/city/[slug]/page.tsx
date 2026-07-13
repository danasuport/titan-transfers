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
import { BookingPanel } from '@/components/ui/BookingPanel'
import { NearbyAirports } from '@/components/sections/NearbyAirports'
import { RoutesList } from '@/components/sections/RoutesList'
import { FAQ } from '@/components/sections/FAQ'
import { FleetShowcase } from '@/components/sections/FleetShowcase'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Testimonials } from '@/components/sections/Testimonials'
import { CtaSection } from '@/components/sections/CtaSection'
import { PortableText } from '@portabletext/react'
import type { Locale } from '@/lib/i18n/config'
import { getCityUrl, getCountryUrl } from '@/lib/utils/slugHelpers'
import { pick } from '@/lib/i18n/pick'
import { russoOne } from '@/lib/fonts'

// ISR: rebuild this page in the background every hour. Reads (e.g. Sanity)
// stay cached so navigation feels instant; new content shows up within 1h
// or immediately via /api/revalidate.
export const revalidate = 3600

export async function generateStaticParams() {
  const cities = await sanityClient.fetch(allCitiesQuery)
  return cities.map((c: { slug: { current: string } }) => ({ slug: c.slug.current }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const city = await sanityClient.fetch(cityBySlugQuery, { slug })
  if (!city) return {}
  const { title, description } = generateCityMetadata(city, locale as Locale)
  const currentPath = `${locale === 'en' ? '' : `/${locale}`}${getCityUrl(city, locale as Locale)}`
  const alternates: { locale: Locale; path: string }[] = [
    { locale: 'en', path: getCityUrl(city, 'en') },
    { locale: 'es', path: `/es${getCityUrl(city, 'es')}` },
    { locale: 'ar', path: `/ar${getCityUrl(city, 'ar')}` },
    { locale: 'it', path: `/it${getCityUrl(city, 'it')}` },
    { locale: 'de', path: `/de${getCityUrl(city, 'de')}` },
  ]
  return generatePageMetadata({ title, description, path: currentPath, locale: locale as Locale, alternates })
}

export default async function CityPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const city = await sanityClient.fetch(cityBySlugQuery, { slug })
  if (!city) notFound()

  const t = await getTranslations({ locale, namespace: 'city' })
  const tc = await getTranslations({ locale, namespace: 'trust' })

  const cityTitle = (locale !== 'en' && city.translations?.[locale]?.title) || city.title
  const description = (locale !== 'en' && city.translations?.[locale]?.description) || city.description
  const heroImg = urlFor(city.featuredImage)?.width(1920).height(900).quality(80).auto('format').url()

  const breadcrumbs = [
    ...(city.country ? [{ label: city.country.title || '', href: getCountryUrl(city.country, locale as Locale) }] : []),
    { label: cityTitle },
  ]

  const faqItems = pick(locale, {
    en: [
      { question: `How do I book a private transfer in ${cityTitle}?`, answer: `Use our booking form to instantly search and book your private transfer. Select your pickup and drop-off locations, choose your vehicle, and confirm at a fixed price.` },
      { question: `How do I book a private taxi in ${cityTitle}?`, answer: `Booking a private taxi in ${cityTitle} is easy. Enter your pickup and destination, choose from our vehicle options, and book at a fixed price with no surprises.` },
      { question: 'Do you offer round-trip transfers?', answer: 'Yes, you can book both one-way and round-trip transfers through our booking system.' },
      { question: `What areas of ${cityTitle} do you cover?`, answer: `We cover all areas of ${cityTitle} and surrounding regions including airports, ports, train stations, and hotels. If your destination is not listed, contact us for a custom quote.` },
    ],
    es: [
      { question: `¿Cómo reservo un traslado privado en ${cityTitle}?`, answer: `Usa nuestro formulario de reserva para buscar y confirmar tu traslado al instante. Elige recogida y destino, selecciona tu vehículo y confirma a precio fijo.` },
      { question: `¿Cuánto cuesta un taxi privado en ${cityTitle}?`, answer: `Nuestros traslados privados en ${cityTitle} tienen precio fijo cerrado antes de salir. Sin cargos ocultos ni sorpresas. Consulta tu precio al instante en el formulario.` },
      { question: '¿Ofrecéis traslados de ida y vuelta?', answer: 'Sí, puedes reservar traslados de solo ida o ida y vuelta directamente desde nuestro sistema de reservas.' },
      { question: `¿Qué zonas de ${cityTitle} cubrís?`, answer: `Cubrimos todas las zonas de ${cityTitle} y alrededores: aeropuertos, puertos, estaciones de tren y hoteles. Si tu destino no aparece, contáctanos para un presupuesto personalizado.` },
    ],
    ar: [
      { question: `كيف أحجز نقلاً خاصاً في ${cityTitle}؟`, answer: `استخدم نموذج الحجز لدينا للبحث وحجز نقلك الخاص فوراً. اختر نقطة الاستلام والوجهة، اختر مركبتك، وأكد بسعر ثابت.` },
      { question: `كم تكلفة سيارة الأجرة الخاصة في ${cityTitle}؟`, answer: `رحلاتنا الخاصة في ${cityTitle} لها سعر ثابت متفق عليه قبل الانطلاق. بدون رسوم خفية أو مفاجآت. اطلع على سعرك فوراً في النموذج.` },
      { question: 'هل تقدمون رحلات ذهاب وعودة؟', answer: 'نعم، يمكنك حجز رحلات ذهاب فقط أو ذهاب وعودة مباشرة عبر نظام الحجز لدينا.' },
      { question: `ما المناطق التي تغطونها في ${cityTitle}؟`, answer: `نغطي جميع مناطق ${cityTitle} والمناطق المحيطة بما في ذلك المطارات والموانئ ومحطات القطار والفنادق. إذا لم تكن وجهتك مدرجة، تواصل معنا للحصول على عرض سعر مخصص.` },
    ],
  })

  const trustBadges = [
    { icon: '★', label: tc('rating'), desc: tc('ratingDesc') },
    { icon: '◈', label: tc('fixedPrice'), desc: tc('fixedPriceDesc') },
    { icon: '◷', label: tc('support'), desc: tc('supportDesc') },
    { icon: '✓', label: tc('freeCancel'), desc: tc('freeCancelDesc') },
  ]

  // Only include routes that have a real origin airport/port — otherwise we'd
  // produce URLs like /airport-transfers-private-taxi/<city>/... which 404.
  const allRoutes = [
    ...(city.routesTo || []).filter((r: { origin?: { slug?: { current?: string } } }) => r.origin?.slug?.current),
  ]

  return (
    <>
      <SchemaOrg data={generateTaxiServiceSchema({ name: `Private Transfers in ${cityTitle}`, description: `Book private transfers in ${cityTitle}`, url: getCityUrl(city, 'en'), areaServed: cityTitle, rating: 4.8 })} />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="resp-2col" style={{ background: '#F8FAF0', display: 'grid', minHeight: '720px' }}>
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

        {/* Right: image with diagonal clip + booking widget overlay */}
        <div className="resp-img-panel hero-widget-panel" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <div className="hero-bg-image" style={{ position: 'absolute', inset: 0, clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)', overflow: 'hidden' }}>
            {heroImg ? (
              <Image src={heroImg} alt={t('transfers', { city: cityTitle })} fill priority style={{ objectFit: 'cover', objectPosition: 'center' }} sizes="50vw" />
            ) : (
              <div style={{ position: 'absolute', inset: 0, background: '#242426' }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '550px', display: 'flex', justifyContent: 'center' }}>
            <BookingPanel />
          </div>
        </div>
      </section>

      {/* ─── TRUST BADGES ─────────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', paddingTop: '2rem', paddingBottom: '2rem', paddingLeft: '6vw', paddingRight: '6vw' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {trustBadges.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#6B8313', fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>{b.icon}</span>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#242426' }}>{b.label}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.desc}</div>
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
            title={pick(locale, {
              en: `Popular routes from ${cityTitle}`,
              es: `Rutas populares desde ${cityTitle}`,
              ar: `مسارات شهيرة من ${cityTitle}`,
              it: `Percorsi popolari da ${cityTitle}`,
              de: `Beliebte Routen von ${cityTitle}`,
            })}
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
              {pick(locale, {
                en: `Are you a professional driver in ${cityTitle}?`,
                es: `¿Eres conductor profesional en ${cityTitle}?`,
                ar: `هل أنت سائق محترف في ${cityTitle}؟`,
                it: `Sei un autista professionale a ${cityTitle}?`,
                de: `Sind Sie ein professioneller Fahrer in ${cityTitle}?`,
              })}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, marginBottom: '2rem', maxWidth: '440px' }}>
              {pick(locale, {
                en: 'Join our driver network and receive direct bookings with no excessive commissions.',
                es: 'Únete a nuestra red de conductores y recibe reservas directas sin comisiones abusivas.',
                ar: 'انضم إلى شبكة سائقينا واحصل على حجوزات مباشرة دون عمولات مرتفعة.',
                it: 'Unisciti alla nostra rete di autisti e ricevi prenotazioni dirette senza commissioni abusive.',
                de: 'Treten Sie unserem Fahrernetzwerk bei und erhalten Sie direkte Buchungen ohne übermäßige Provisionen.',
              })}
            </p>
            <a href={`${locale === 'en' ? '' : `/${locale}`}/${pick(locale, { en: 'contact', es: 'contacto', ar: 'tawasul', it: 'contatto', de: 'kontakt' })}/`} style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '0.5rem', background: '#242426', color: '#ffffff', padding: '0.85rem 2rem', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', transform: 'skewX(-12deg)', transition: 'background 0.2s' }}>
              <span style={{ transform: 'skewX(12deg)', display: 'inline-block' }}>{pick(locale, { en: 'Get in touch →', es: 'Contactar →', ar: '← تواصل معنا', it: 'Contattare →', de: 'Nehmen Sie Kontakt auf →' })}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <CtaSection />
    </>
  )
}
