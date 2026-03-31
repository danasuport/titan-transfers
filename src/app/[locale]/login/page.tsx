import { getTranslations } from 'next-intl/server'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CustomerPortal } from '@/components/customer/CustomerPortal'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Area de Cliente | Titan Transfers' : 'Customer Area | Titan Transfers',
    description: 'Access your bookings and manage your transfers.',
    robots: { index: false, follow: false },
  }
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'login' })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: t('title') }]} />
      <h1 className="mb-4 text-3xl font-bold text-heading sm:text-4xl">{t('title')}</h1>
      <p className="mb-8 text-lg text-body">{t('subtitle')}</p>
      <CustomerPortal />
    </div>
  )
}
