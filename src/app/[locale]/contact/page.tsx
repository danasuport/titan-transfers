import { getTranslations } from 'next-intl/server'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: t('title') }]} />
      <h1 className="mb-4 text-3xl font-bold text-heading sm:text-4xl">{t('title')}</h1>
      <p className="mb-8 text-lg text-body">{t('subtitle')}</p>

      <div className="grid gap-8 md:grid-cols-2">
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-body">{t('name')}</label>
            <input id="name" type="text" className="w-full rounded-lg border border-glass-ring bg-dark-card px-4 py-2.5 text-sm text-heading focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-body">{t('email')}</label>
            <input id="email" type="email" className="w-full rounded-lg border border-glass-ring bg-dark-card px-4 py-2.5 text-sm text-heading focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-body">{t('message')}</label>
            <textarea id="message" rows={5} className="w-full rounded-lg border border-glass-ring bg-dark-card px-4 py-2.5 text-sm text-heading focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <button type="submit" className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
            {t('send')}
          </button>
        </form>

        <div className="space-y-6">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-heading">{t('phone')}</h2>
            <p className="text-body">+34 900 000 000</p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-heading">{t('emailAddress')}</h2>
            <p className="text-body">info@titantransfers.com</p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-heading">{t('address')}</h2>
            <p className="text-body">Barcelona, Spain</p>
          </div>
        </div>
      </div>
    </div>
  )
}
