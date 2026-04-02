import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CustomerPortal } from '@/components/customer/CustomerPortal'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Mi cuenta | Titan Transfers' : 'My account | Titan Transfers',
    description: locale === 'es' ? 'Gestiona tus reservas, consulta tu historial y modifica tus datos.' : 'Manage your bookings, view your history and update your details.',
    robots: { index: false, follow: false },
  }
}

export default async function UserDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'

  return (
    <div className="site-container px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: es ? 'Mi cuenta' : 'My account' }]} />
      <h1 className="mb-4 text-3xl font-bold text-heading sm:text-4xl">
        {es ? 'Mi cuenta' : 'My account'}
      </h1>
      <p className="mb-8 text-lg text-body">
        {es ? 'Gestiona tus reservas y consulta el historial de tus traslados.' : 'Manage your bookings and view your transfer history.'}
      </p>
      <CustomerPortal />
    </div>
  )
}
