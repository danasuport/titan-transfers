import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CustomerPortal } from '@/components/customer/CustomerPortal'
import { pick } from '@/lib/i18n/pick'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: pick(locale, {
      en: 'My account | Titan Transfers',
      es: 'Mi cuenta | Titan Transfers',
      ar: 'حسابي | تايتن ترانسفرز',
      it: 'Il mio account | Titan Transfers',
    }),
    description: pick(locale, {
      en: 'Manage your bookings, view your history and update your details.',
      es: 'Gestiona tus reservas, consulta tu historial y modifica tus datos.',
      ar: 'أدر حجوزاتك، اطلع على تاريخ رحلاتك، وحدّث بياناتك.',
      it: 'Gestisci le tue prenotazioni, consulta la tua cronologia e modifica i tuoi dati.',
    }),
    robots: { index: false, follow: false },
  }
}

export default async function UserDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const labels = {
    title: pick(locale, { en: 'My account', es: 'Mi cuenta', ar: 'حسابي', it: 'Il mio account' }),
    subtitle: pick(locale, {
      en: 'Manage your bookings and view your transfer history.',
      es: 'Gestiona tus reservas y consulta el historial de tus traslados.',
      ar: 'أدر حجوزاتك واطلع على تاريخ رحلاتك.',
      it: 'Gestisci le tue prenotazioni e consulta la cronologia dei tuoi trasferimenti.',
    }),
  }

  return (
    <div className="site-container px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: labels.title }]} />
      <h1 className="mb-4 text-3xl font-bold text-heading sm:text-4xl">{labels.title}</h1>
      <p className="mb-8 text-lg text-body">{labels.subtitle}</p>
      <CustomerPortal />
    </div>
  )
}
