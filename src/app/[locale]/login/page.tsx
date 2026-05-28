import { getTranslations } from 'next-intl/server'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CustomerPortal } from '@/components/customer/CustomerPortal'
import { pick } from '@/lib/i18n/pick'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: pick(locale, {
      en: 'Customer Area | Titan Transfers',
      es: 'Area de Cliente | Titan Transfers',
      ar: 'منطقة العميل | تايتن ترانسفرز',
    }),
    description: pick(locale, {
      en: 'Access your bookings and manage your transfers.',
      es: 'Accede a tus reservas y gestiona tus traslados.',
      ar: 'ادخل إلى حجوزاتك وأدر رحلاتك.',
    }),
    robots: { index: false, follow: false },
  }
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'login' })

  return (
    <div className="site-container px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: t('title') }]} />
      <h1 className="mb-4 text-3xl font-bold text-heading sm:text-4xl">{t('title')}</h1>
      <p className="mb-8 text-lg text-body">{t('subtitle')}</p>
      <CustomerPortal />
    </div>
  )
}
