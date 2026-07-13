import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CustomerPortal } from '@/components/customer/CustomerPortal'
import { pick } from '@/lib/i18n/pick'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: pick(locale, {
      en: 'Reset password | Titan Transfers',
      es: 'Restablecer contraseña | Titan Transfers',
      ar: 'إعادة تعيين كلمة المرور | تايتن ترانسفرز',
      it: 'Reimposta password | Titan Transfers',
      de: 'Passwort zurücksetzen | Titan Transfers',
    }),
    description: '',
    robots: { index: false, follow: false },
  }
}

export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const title = pick(locale, {
    en: 'Reset password',
    es: 'Restablecer contraseña',
    ar: 'إعادة تعيين كلمة المرور',
    it: 'Reimposta password',
    de: 'Passwort zurücksetzen',
  })

  return (
    <div className="site-container px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: title }]} />
      <h1 className="mb-4 text-3xl font-bold text-heading sm:text-4xl">{title}</h1>
      <CustomerPortal />
    </div>
  )
}
