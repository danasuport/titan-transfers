import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { BookingPanel } from '@/components/ui/BookingPanel'
import { sanityClient } from '@/lib/sanity/client'
import { allServicesQuery } from '@/lib/sanity/queries'
import { ServicesClient } from '@/components/listings/ServicesClient'
import { FleetShowcase } from '@/components/sections/FleetShowcase'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Testimonials } from '@/components/sections/Testimonials'
import { CtaSection } from '@/components/sections/CtaSection'
import { russoOne } from '@/lib/fonts'
import type { Locale } from '@/lib/i18n/config'
import { pick } from '@/lib/i18n/pick'

// ISR: rebuild this page in the background every hour. Reads (e.g. Sanity)
// stay cached so navigation feels instant; new content shows up within 1h
// or immediately via /api/revalidate.
export const revalidate = 3600

type LocaleString = { en: string; es: string; ar: string }

const serviceConfig: Record<string, { img: string; iconPath: string; stats: { value: string; label: LocaleString }[] }> = {
  airport: {
    img: '/services/airport-transfers.jpg',
    iconPath: 'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5',
    stats: [
      { value: '120+', label: { en: 'airports', es: 'aeropuertos', ar: 'مطار' } },
      { value: '350+', label: { en: 'routes', es: 'rutas', ar: 'مسار' } },
      { value: '24/7', label: { en: 'support', es: 'soporte', ar: 'دعم' } },
    ],
  },
  port: {
    img: '/services/port-transfers.jpg',
    iconPath: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21',
    stats: [
      { value: '30+', label: { en: 'ports', es: 'puertos', ar: 'ميناء' } },
      { value: '50+', label: { en: 'routes', es: 'rutas', ar: 'مسار' } },
      { value: '24/7', label: { en: 'support', es: 'soporte', ar: 'دعم' } },
    ],
  },
  trainStation: {
    img: '/services/train-transfers.jpg',
    iconPath: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121l-1.431-1.431A2.999 2.999 0 0017.466 9.5H15.75m-6 0V6.375m0 0a2.625 2.625 0 115.25 0M9.75 6.375v3.125',
    stats: [
      { value: '40+', label: { en: 'stations', es: 'estaciones', ar: 'محطة' } },
      { value: '80+', label: { en: 'routes', es: 'rutas', ar: 'مسار' } },
      { value: '24/7', label: { en: 'support', es: 'soporte', ar: 'دعم' } },
    ],
  },
  cityToCity: {
    img: '/services/city-to-city.jpg',
    iconPath: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21',
    stats: [
      { value: '100+', label: { en: 'cities', es: 'ciudades', ar: 'مدينة' } },
      { value: '200+', label: { en: 'routes', es: 'rutas', ar: 'مسار' } },
      { value: '24/7', label: { en: 'support', es: 'soporte', ar: 'دعم' } },
    ],
  },
}

const descriptions: Record<string, LocaleString> = {
  airport: {
    en: 'Door-to-door private transfers from 120+ airports worldwide. Meet & greet with real-time flight monitoring.',
    es: 'Traslados privados puerta a puerta desde más de 120 aeropuertos. Meet & greet con seguimiento de vuelo en tiempo real.',
    ar: 'نقل خاص من الباب إلى الباب من أكثر من ١٢٠ مطاراً حول العالم. استقبال شخصي مع متابعة الرحلات في الوقت الفعلي.',
  },
  port: {
    en: 'Comfortable transfers to and from major cruise ports. Driver meets you right at the terminal.',
    es: 'Traslados cómodos hacia y desde los principales puertos de crucero. Tu conductor te espera en la terminal.',
    ar: 'نقل مريح من وإلى موانئ السفن السياحية الكبرى. سيقابلك السائق مباشرة عند المحطة.',
  },
  trainStation: {
    en: 'Reliable pre-booked transfers from major train stations. Fixed price, always on time.',
    es: 'Traslados fiables desde las principales estaciones de tren. Precio fijo, siempre a tiempo.',
    ar: 'نقل موثوق بالحجز المسبق من محطات القطار الرئيسية. سعر ثابت ودائماً في الموعد.',
  },
  cityToCity: {
    en: 'Private intercity transfers between major cities. Comfortable vehicles for longer journeys.',
    es: 'Traslados privados interurbanos entre las principales ciudades. Vehículos cómodos para viajes largos.',
    ar: 'نقل خاص بين المدن الكبرى. مركبات مريحة للرحلات الطويلة.',
  },
}

function localeKey(locale: string): keyof LocaleString {
  if (locale === 'es') return 'es'
  if (locale === 'ar') return 'ar'
  return 'en'
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: pick(locale, {
      en: 'Private transfer services | Titan Transfers',
      es: 'Servicios de traslados privados | Titan Transfers',
      ar: 'خدمات النقل الخاص | تايتن ترانسفرز',
    }),
    description: pick(locale, {
      en: 'Airport, port, train station and city-to-city private transfers. Fixed prices, professional drivers and 24/7 support.',
      es: 'Aeropuerto, puerto, estación de tren y ciudad a ciudad. Precios fijos, conductores profesionales y soporte 24/7.',
      ar: 'نقل خاص من المطار والميناء ومحطة القطار وبين المدن. أسعار ثابتة وسائقون محترفون ودعم على مدار الساعة.',
    }),
  }
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  const lk = localeKey(locale)
  const services = await sanityClient.fetch(allServicesQuery)

  const items = services.map((s: any) => {
    const tr = s.translations?.[locale]
    const slug = tr?.slug?.current || s.slug.current
    const title = tr?.title || s.title
    const config = serviceConfig[s.serviceType] || serviceConfig.airport
    const desc = descriptions[s.serviceType]
    return {
      slug,
      title,
      img: config.img,
      iconPath: config.iconPath,
      stats: config.stats.map(st => ({ value: st.value, label: st.label[lk] })),
      desc: desc?.[lk] || desc?.en,
    }
  })

  const labels = {
    h1: pick(locale, { en: 'Our services', es: 'Nuestros servicios', ar: 'خدماتنا' }),
    intro: pick(locale, {
      en: 'Private transfers for every need. Fixed prices, professional drivers and 24/7 support across all our services.',
      es: 'Traslados privados para cada necesidad. Precios fijos, conductores profesionales y soporte 24/7 en todos nuestros servicios.',
      ar: 'نقل خاص لكل احتياج. أسعار ثابتة، سائقون محترفون، ودعم على مدار الساعة لكل خدماتنا.',
    }),
    statServices: pick(locale, { en: 'services', es: 'servicios', ar: 'خدمات' }),
    statDestinations: pick(locale, { en: 'destinations', es: 'destinos', ar: 'وجهة' }),
    statSupport: pick(locale, { en: 'support', es: 'soporte', ar: 'دعم' }),
    heroAlt: pick(locale, {
      en: 'Private transfer services',
      es: 'Servicios de traslados privados',
      ar: 'خدمات النقل الخاص',
    }),
  }

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="resp-2col" style={{ background: '#F8FAF0', display: 'grid', minHeight: '720px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '6vw', paddingRight: '4vw', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <Breadcrumbs items={[{ label: t('services') }]} variant="light" />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[
              { n: '4', label: labels.statServices },
              { n: '100+', label: labels.statDestinations },
              { n: '24/7', label: labels.statSupport },
            ].map(s => (
              <span key={s.label} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B8313', background: '#e8f0c4', padding: '3px 10px', letterSpacing: '0.06em' }}>
                {s.n} {s.label}
              </span>
            ))}
          </div>

          <h1 className={russoOne.className} style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: '#242426', lineHeight: 1.05, marginBottom: '1.25rem', textTransform: 'none' }}>
            {labels.h1}
          </h1>

          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.75, maxWidth: '480px' }}>
            {labels.intro}
          </p>
        </div>

        <div className="resp-img-panel hero-widget-panel" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <div className="hero-bg-image" style={{ position: 'absolute', inset: 0, clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)', overflow: 'hidden' }}>
            <Image src="/services/airport-transfers.jpg" alt={labels.heroAlt} fill priority style={{ objectFit: 'cover', objectPosition: 'center' }} sizes="50vw" />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '550px', display: 'flex', justifyContent: 'center' }}>
            <BookingPanel />
          </div>
        </div>
      </section>

      {/* ─── LISTING ──────────────────────────────────────────────────── */}
      <ServicesClient items={items} locale={locale as Locale} />

      {/* ─── FLEET ────────────────────────────────────────────────────── */}
      <FleetShowcase />

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ─── TESTIMONIALS ─────────────────────────────────────────────── */}
      <Testimonials />

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <CtaSection />
    </>
  )
}
