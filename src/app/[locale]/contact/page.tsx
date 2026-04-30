import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { ContactForm } from '@/components/contact/ContactForm'

// ISR: rebuild this page in the background every hour. Reads (e.g. Sanity)
// stay cached so navigation feels instant; new content shows up within 1h
// or immediately via /api/revalidate.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Contacto | Titan Transfers' : 'Contact | Titan Transfers',
    description: 'Contact Titan Transfers. We are available 24/7 for bookings and inquiries.',
  }
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })

  return (
    <div className="site-container px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: t('title') }]} />
      <h1 className="mb-4 text-3xl font-bold text-heading sm:text-4xl">{t('title')}</h1>
      <p className="mb-8 text-lg text-body">{t('subtitle')}</p>

      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <ContactForm t={{ name: t('name'), email: t('email'), message: t('message'), send: t('send') }} />

        <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', minHeight: '320px' }}>
          <Image
            src="/contact-hero.jpg"
            alt={t('title')}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>
    </div>
  )
}
