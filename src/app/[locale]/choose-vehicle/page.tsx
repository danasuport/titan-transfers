import { BookingPageShell } from '@/components/booking/BookingPageShell'
import { TaxiBookingWidget } from '@/components/booking/TaxiBookingWidget'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'
  return {
    title: es ? 'Elegir vehículo | Titan Transfers' : 'Choose your vehicle | Titan Transfers',
    description: es
      ? 'Selecciona el vehículo para tu traslado. Precio fijo y confirmación inmediata.'
      : 'Pick the vehicle for your transfer. Fixed price and instant confirmation.',
    robots: { index: false, follow: false },
  }
}

export default async function ChooseVehiclePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'

  return (
    <BookingPageShell
      locale={locale}
      breadcrumbLabel={es ? 'Elegir vehículo' : 'Choose vehicle'}
      heading={es ? 'Elige tu vehículo' : 'Choose your vehicle'}
    >
      {await TaxiBookingWidget({ locale, wpPath: '/choose-vehicle/' })}
    </BookingPageShell>
  )
}
