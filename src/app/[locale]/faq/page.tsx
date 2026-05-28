import { getTranslations } from 'next-intl/server'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { FAQ } from '@/components/sections/FAQ'
import { pick } from '@/lib/i18n/pick'

// ISR: rebuild this page in the background every hour. Reads (e.g. Sanity)
// stay cached so navigation feels instant; new content shows up within 1h
// or immediately via /api/revalidate.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: pick(locale, {
      en: 'FAQ | Titan Transfers',
      es: 'Preguntas Frecuentes | Titan Transfers',
      ar: 'الأسئلة الشائعة | تايتن ترانسفرز',
    }),
    description: pick(locale, {
      en: 'Frequently asked questions about Titan Transfers private transfer services.',
      es: 'Preguntas frecuentes sobre los servicios de traslados privados de Titan Transfers.',
      ar: 'الأسئلة الشائعة حول خدمات النقل الخاص في تايتن ترانسفرز.',
    }),
  }
}

const FAQ_ITEMS: { en: { q: string; a: string }; es: { q: string; a: string }; ar: { q: string; a: string } }[] = [
  {
    en: { q: 'How do I book a private transfer?', a: 'You can book directly through our website. Enter your pickup and destination locations, select your vehicle, and confirm your booking. You will receive instant confirmation by email.' },
    es: { q: '¿Cómo reservo un traslado privado?', a: 'Puedes reservar directamente en nuestra web. Introduce el punto de recogida y destino, selecciona tu vehículo y confirma tu reserva. Recibirás confirmación instantánea por email.' },
    ar: { q: 'كيف أحجز نقلاً خاصاً؟', a: 'يمكنك الحجز مباشرة عبر موقعنا. أدخل نقطة الاستلام والوجهة، اختر مركبتك، وأكد حجزك. ستتلقى تأكيداً فورياً عبر البريد الإلكتروني.' },
  },
  {
    en: { q: 'What is a private transfer?', a: 'A private transfer is a pre-booked, door-to-door transport service with a professional driver. Unlike shared shuttles or public transport, the vehicle is exclusively for you and your group.' },
    es: { q: '¿Qué es un traslado privado?', a: 'Un traslado privado es un servicio de transporte puerta a puerta reservado con antelación, con conductor profesional. A diferencia de los traslados compartidos o el transporte público, el vehículo es exclusivo para ti y tu grupo.' },
    ar: { q: 'ما هو النقل الخاص؟', a: 'النقل الخاص هو خدمة نقل من الباب إلى الباب محجوزة مسبقاً مع سائق محترف. على عكس النقل المشترك أو العام، المركبة حصرية لك ولمجموعتك.' },
  },
  {
    en: { q: 'How do I find my driver at the airport?', a: 'Your driver will be waiting in the arrivals hall with a name sign. You will receive the driver details and meeting instructions via email before your trip.' },
    es: { q: '¿Cómo encuentro a mi conductor en el aeropuerto?', a: 'Tu conductor te esperará en la sala de llegadas con una pancarta con tu nombre. Recibirás los datos del conductor y las instrucciones de encuentro por email antes de tu viaje.' },
    ar: { q: 'كيف أجد سائقي في المطار؟', a: 'سينتظرك سائقك في صالة الوصول حاملاً لافتة باسمك. ستتلقى بيانات السائق وتعليمات اللقاء عبر البريد الإلكتروني قبل رحلتك.' },
  },
  {
    en: { q: 'What if my flight is delayed?', a: 'We monitor all flight arrivals. If your flight is delayed, your driver will adjust the pickup time automatically at no extra charge.' },
    es: { q: '¿Y si mi vuelo se retrasa?', a: 'Monitorizamos todas las llegadas de vuelos. Si tu vuelo se retrasa, tu conductor ajustará automáticamente la hora de recogida sin coste adicional.' },
    ar: { q: 'ماذا لو تأخرت رحلتي؟', a: 'نتابع جميع الرحلات الواصلة. إذا تأخرت رحلتك، سيعدّل سائقك وقت الاستلام تلقائياً دون أي تكلفة إضافية.' },
  },
  {
    en: { q: 'Can I cancel my booking?', a: 'Yes, you can cancel free of charge up to 24 hours before your scheduled pickup time.' },
    es: { q: '¿Puedo cancelar mi reserva?', a: 'Sí, puedes cancelar gratuitamente hasta 24 horas antes de la hora de recogida programada.' },
    ar: { q: 'هل يمكنني إلغاء حجزي؟', a: 'نعم، يمكنك الإلغاء مجاناً حتى ٢٤ ساعة قبل وقت الاستلام المحدد.' },
  },
  {
    en: { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards, PayPal, and bank transfers.' },
    es: { q: '¿Qué métodos de pago aceptáis?', a: 'Aceptamos las principales tarjetas de crédito y débito, PayPal y transferencia bancaria.' },
    ar: { q: 'ما طرق الدفع التي تقبلونها؟', a: 'نقبل جميع بطاقات الائتمان والخصم الرئيسية، باي بال، والتحويلات البنكية.' },
  },
  {
    en: { q: 'Are your prices fixed?', a: 'Yes, all prices are fixed at the time of booking. There are no hidden charges, no meter, and no surge pricing.' },
    es: { q: '¿Vuestros precios son fijos?', a: 'Sí, todos los precios son fijos en el momento de la reserva. No hay cargos ocultos, ni taxímetro, ni tarifas dinámicas.' },
    ar: { q: 'هل أسعاركم ثابتة؟', a: 'نعم، جميع الأسعار ثابتة عند الحجز. لا توجد رسوم خفية، ولا عداد، ولا تسعير ديناميكي.' },
  },
  {
    en: { q: 'Can I book a round-trip transfer?', a: 'Yes, you can book both one-way and round-trip transfers through our booking system.' },
    es: { q: '¿Puedo reservar un traslado de ida y vuelta?', a: 'Sí, puedes reservar tanto traslados solo ida como ida y vuelta a través de nuestro sistema de reservas.' },
    ar: { q: 'هل يمكنني حجز رحلة ذهاب وعودة؟', a: 'نعم، يمكنك حجز رحلات ذهاب فقط أو ذهاب وعودة عبر نظام الحجز لدينا.' },
  },
  {
    en: { q: 'What types of vehicles are available?', a: 'We offer a range of vehicles including private cars (1-3 passengers), MPV/minivans (4-6 passengers), executive cars, and minibuses (7-16 passengers).' },
    es: { q: '¿Qué tipos de vehículos hay disponibles?', a: 'Ofrecemos una gama de vehículos: coches privados (1-3 pasajeros), MPV/minivans (4-6 pasajeros), coches ejecutivos y microbuses (7-16 pasajeros).' },
    ar: { q: 'ما أنواع المركبات المتاحة؟', a: 'نقدم مجموعة من المركبات: سيارات خاصة (١-٣ ركاب)، MPV/ميني فان (٤-٦ ركاب)، سيارات تنفيذية، وحافلات صغيرة (٧-١٦ راكباً).' },
  },
  {
    en: { q: 'Do you offer child seats?', a: 'Yes, child seats and booster seats are available on request. Please specify your needs when booking.' },
    es: { q: '¿Ofrecéis sillas para niños?', a: 'Sí, hay sillas para niños y elevadores disponibles bajo petición. Por favor, indícalo al hacer la reserva.' },
    ar: { q: 'هل تقدمون مقاعد للأطفال؟', a: 'نعم، تتوفر مقاعد الأطفال ومقاعد التعزيز عند الطلب. يرجى ذكر احتياجاتك عند الحجز.' },
  },
  {
    en: { q: 'Is a private taxi from the airport better than a regular taxi?', a: 'A private taxi offers guaranteed fixed prices, a professional driver waiting with a name sign, no queuing, and comfortable pre-selected vehicles.' },
    es: { q: '¿Un taxi privado desde el aeropuerto es mejor que un taxi normal?', a: 'Un taxi privado ofrece precios fijos garantizados, un conductor profesional esperando con un cartel con tu nombre, sin colas y vehículos cómodos preseleccionados.' },
    ar: { q: 'هل سيارة الأجرة الخاصة من المطار أفضل من سيارة الأجرة العادية؟', a: 'تقدم سيارة الأجرة الخاصة أسعاراً ثابتة مضمونة، سائقاً محترفاً ينتظر بلافتة باسمك، بدون طوابير، ومركبات مريحة مختارة مسبقاً.' },
  },
  {
    en: { q: 'How much does an airport transfer cost?', a: 'Prices vary depending on the route and vehicle type. Use our booking tool for an instant quote with the exact price for your journey.' },
    es: { q: '¿Cuánto cuesta un traslado al aeropuerto?', a: 'Los precios varían según la ruta y el tipo de vehículo. Usa nuestra herramienta de reserva para obtener un presupuesto instantáneo con el precio exacto de tu viaje.' },
    ar: { q: 'كم تكلفة نقل المطار؟', a: 'تختلف الأسعار حسب المسار ونوع المركبة. استخدم أداة الحجز لدينا للحصول على عرض سعر فوري بالسعر الدقيق لرحلتك.' },
  },
]

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })

  const faqItems = FAQ_ITEMS.map(item => {
    const localized = pick(locale, { en: item.en, es: item.es, ar: item.ar })
    return { question: localized.q, answer: localized.a }
  })

  return (
    <div className="site-container px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: t('title') }]} />
      <h1 className="mb-4 text-3xl font-bold text-heading sm:text-4xl">{t('title')}</h1>
      <p className="mb-8 text-lg text-body">{t('subtitle')}</p>
      <FAQ items={faqItems} />
    </div>
  )
}
