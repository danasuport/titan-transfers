import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CustomerPortal } from '@/components/customer/CustomerPortal'
import { pick } from '@/lib/i18n/pick'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: pick(locale, {
      en: 'Forgot password | Titan Transfers',
      es: 'Recuperar contraseña | Titan Transfers',
      ar: 'استعادة كلمة المرور | تايتن ترانسفرز',
      it: 'Recupera password | Titan Transfers',
    }),
    description: '',
    robots: { index: false, follow: false },
  }
}

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const title = pick(locale, {
    en: 'Forgot password',
    es: 'Recuperar contraseña',
    ar: 'استعادة كلمة المرور',
    it: 'Recupera password',
  })

  return (
    <div className="site-container px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: title }]} />
      <h1 className="mb-4 text-3xl font-bold text-heading sm:text-4xl">{title}</h1>
      <CustomerPortal />
    </div>
  )
}
