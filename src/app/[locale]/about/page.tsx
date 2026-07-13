import { getTranslations } from 'next-intl/server'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { TrustSignals } from '@/components/sections/TrustSignals'
import { pick } from '@/lib/i18n/pick'

// ISR: rebuild this page in the background every hour. Reads (e.g. Sanity)
// stay cached so navigation feels instant; new content shows up within 1h
// or immediately via /api/revalidate.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: pick(locale, {
      en: 'About Us | Titan Transfers',
      es: 'Sobre Nosotros | Titan Transfers',
      ar: 'من نحن | تايتن ترانسفرز',
      it: 'Chi Siamo | Titan Transfers',
      de: 'Über uns | Titan Transfers',
    }),
    description: pick(locale, {
      en: 'Learn about Titan Transfers, your trusted partner for private transfers worldwide.',
      es: 'Conoce Titan Transfers, tu socio de confianza para traslados privados en todo el mundo.',
      ar: 'تعرّف على تايتن ترانسفرز، شريكك الموثوق لخدمات النقل الخاصة حول العالم.',
      it: 'Scopri Titan Transfers, il tuo partner di fiducia per trasferimenti privati in tutto il mondo.',
      de: 'Erfahren Sie mehr über Titan Transfers, Ihren vertrauenswürdigen Partner für private Transfers weltweit.',
    }),
  }
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  const body = {
    p1: pick(locale, {
      en: 'Titan Transfers is a leading private transfer service operating in over 100 destinations worldwide. We specialize in airport transfers, port transfers, train station transfers, and city-to-city transport.',
      es: 'Titan Transfers es un servicio líder de traslados privados que opera en más de 100 destinos en todo el mundo. Nos especializamos en traslados al aeropuerto, traslados al puerto, traslados desde estaciones de tren y transporte entre ciudades.',
      ar: 'تايتن ترانسفرز خدمة رائدة للنقل الخاص تعمل في أكثر من ١٠٠ وجهة حول العالم. نتخصص في نقل المطارات وموانئ السفن السياحية ومحطات القطار والنقل بين المدن.',
      it: 'Titan Transfers è un servizio leader di trasferimenti privati che opera in oltre 100 destinazioni in tutto il mondo. Ci specializziamo in trasferimenti aeroportuali, trasferimenti portuali, trasferimenti da stazioni ferroviarie e trasporto tra città.',
      de: 'Titan Transfers ist ein führender privater Transferdienst, der in über 100 Zielen weltweit tätig ist. Wir spezialisieren uns auf Flughafen-Transfers, Hafen-Transfers, Bahnhof-Transfers und Stadt-zu-Stadt-Transport.',
    }),
    p2: pick(locale, {
      en: 'Our mission is to provide a premium, reliable, and affordable transfer experience for every traveler. With fixed prices, professional drivers, and 24/7 support, we ensure your journey is comfortable and stress-free.',
      es: 'Nuestra misión es ofrecer una experiencia de traslado premium, fiable y asequible a cada viajero. Con precios fijos, conductores profesionales y soporte 24/7, garantizamos un viaje cómodo y sin estrés.',
      ar: 'مهمتنا تقديم تجربة نقل متميزة وموثوقة وبأسعار معقولة لكل مسافر. بأسعار ثابتة وسائقين محترفين ودعم على مدار الساعة، نضمن أن تكون رحلتك مريحة وخالية من التوتر.',
      it: 'La nostra missione è offrire un\'esperienza di trasferimento premium, affidabile e conveniente a ogni viaggiatore. Con tariffe fisse, autisti professionisti e supporto 24/7, garantiamo un viaggio confortevole e senza stress.',
      de: 'Unsere Mission ist es, jedem Reisenden ein erstklassiges, zuverlässiges und erschwingliches Transfererlebnis zu bieten. Mit Festpreisen, professionellen Fahrern und 24/7 Unterstützung sorgen wir dafür, dass Ihre Reise komfortabel und stressfrei ist.',
    }),
    valuesTitle: pick(locale, { en: 'Our Values', es: 'Nuestros Valores', ar: 'قيمنا', it: 'I nostri valori', de: 'Unsere Werte' }),
    values: [
      pick(locale, {
        en: ['Reliability', 'We monitor all flights and adjust pickup times automatically'] as const,
        es: ['Fiabilidad', 'Monitorizamos todos los vuelos y ajustamos automáticamente las horas de recogida'] as const,
        ar: ['الموثوقية', 'نتابع جميع الرحلات ونعدّل أوقات الاستلام تلقائياً'] as const,
      }),
      pick(locale, {
        en: ['Transparency', 'Fixed prices with no hidden charges'] as const,
        es: ['Transparencia', 'Precios fijos sin cargos ocultos'] as const,
        ar: ['الشفافية', 'أسعار ثابتة بدون رسوم خفية'] as const,
      }),
      pick(locale, {
        en: ['Comfort', 'Modern, air-conditioned vehicles'] as const,
        es: ['Confort', 'Vehículos modernos con aire acondicionado'] as const,
        ar: ['الراحة', 'مركبات حديثة مكيفة الهواء'] as const,
      }),
      pick(locale, {
        en: ['Service', 'Professional, English-speaking drivers'] as const,
        es: ['Servicio', 'Conductores profesionales que hablan inglés'] as const,
        ar: ['الخدمة', 'سائقون محترفون يتحدثون الإنجليزية'] as const,
      }),
    ],
  }

  return (
    <>
      <div className="site-container px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: t('title') }]} />
        <h1 className="mb-4 text-3xl font-bold text-heading sm:text-4xl">{t('title')}</h1>
        <p className="mb-8 text-lg text-body">{t('subtitle')}</p>

        <div className="prose max-w-none prose-headings:text-heading prose-p:text-body prose-li:text-body prose-strong:text-heading">
          <p>{body.p1}</p>
          <p>{body.p2}</p>
          <h2>{body.valuesTitle}</h2>
          <ul>
            {body.values.map(([term, def]) => (
              <li key={term}><strong>{term}</strong> — {def}</li>
            ))}
          </ul>
        </div>
      </div>
      <TrustSignals />
    </>
  )
}
