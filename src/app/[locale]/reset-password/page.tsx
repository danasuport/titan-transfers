import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CustomerPortal } from '@/components/customer/CustomerPortal'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Restablecer contraseña | Titan Transfers' : 'Reset password | Titan Transfers',
    description: '',
    robots: { index: false, follow: false },
  }
}

export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'

  return (
    <div className="site-container px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: es ? 'Restablecer contraseña' : 'Reset password' }]} />
      <h1 className="mb-4 text-3xl font-bold text-heading sm:text-4xl">
        {es ? 'Restablecer contraseña' : 'Reset password'}
      </h1>
      <CustomerPortal />
    </div>
  )
}
