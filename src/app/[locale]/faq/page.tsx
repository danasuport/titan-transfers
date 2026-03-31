import { getTranslations } from 'next-intl/server'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { FAQ } from '@/components/sections/FAQ'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Preguntas Frecuentes | Titan Transfers' : 'FAQ | Titan Transfers',
    description: 'Frequently asked questions about Titan Transfers private transfer services.',
  }
}

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })

  const faqItems = [
    { question: 'How do I book a private transfer?', answer: 'You can book directly through our website. Enter your pickup and destination locations, select your vehicle, and confirm your booking. You will receive instant confirmation by email.' },
    { question: 'What is a private transfer?', answer: 'A private transfer is a pre-booked, door-to-door transport service with a professional driver. Unlike shared shuttles or public transport, the vehicle is exclusively for you and your group.' },
    { question: 'How do I find my driver at the airport?', answer: 'Your driver will be waiting in the arrivals hall with a name sign. You will receive the driver details and meeting instructions via email before your trip.' },
    { question: 'What if my flight is delayed?', answer: 'We monitor all flight arrivals. If your flight is delayed, your driver will adjust the pickup time automatically at no extra charge.' },
    { question: 'Can I cancel my booking?', answer: 'Yes, you can cancel free of charge up to 24 hours before your scheduled pickup time.' },
    { question: 'What payment methods do you accept?', answer: 'We accept all major credit and debit cards, PayPal, and bank transfers.' },
    { question: 'Are your prices fixed?', answer: 'Yes, all prices are fixed at the time of booking. There are no hidden charges, no meter, and no surge pricing.' },
    { question: 'Can I book a round-trip transfer?', answer: 'Yes, you can book both one-way and round-trip transfers through our booking system.' },
    { question: 'What types of vehicles are available?', answer: 'We offer a range of vehicles including private cars (1-3 passengers), MPV/minivans (4-6 passengers), executive cars, and minibuses (7-16 passengers).' },
    { question: 'Do you offer child seats?', answer: 'Yes, child seats and booster seats are available on request. Please specify your needs when booking.' },
    { question: 'Is a private taxi from the airport better than a regular taxi?', answer: 'A private taxi offers guaranteed fixed prices, a professional driver waiting with a name sign, no queuing, and comfortable pre-selected vehicles.' },
    { question: 'How much does an airport transfer cost?', answer: 'Prices vary depending on the route and vehicle type. Use our booking tool for an instant quote with the exact price for your journey.' },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: t('title') }]} />
      <h1 className="mb-4 text-3xl font-bold text-heading sm:text-4xl">{t('title')}</h1>
      <p className="mb-8 text-lg text-body">{t('subtitle')}</p>
      <FAQ items={faqItems} />
    </div>
  )
}
