import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CustomerPortal } from '@/components/customer/CustomerPortal'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Crear cuenta | Titan Transfers' : 'Create account | Titan Transfers',
    description: locale === 'es' ? 'Crea tu cuenta en Titan Transfers y gestiona tus reservas fácilmente.' : 'Create your Titan Transfers account and manage your bookings easily.',
    robots: { index: false, follow: false },
  }
}

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'

  return (
    <div className="site-container px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: es ? 'Crear cuenta' : 'Create account' }]} />
      <h1 className="mb-4 text-3xl font-bold text-heading sm:text-4xl">
        {es ? 'Crear cuenta' : 'Create account'}
      </h1>
      <p className="mb-8 text-lg text-body">
        {es ? 'Regístrate para gestionar tus reservas y acceder a tu historial de traslados.' : 'Register to manage your bookings and access your transfer history.'}
      </p>
      <CustomerPortal />
    </div>
  )
}
