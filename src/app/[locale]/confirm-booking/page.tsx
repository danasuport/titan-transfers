import { BookingPageShell } from '@/components/booking/BookingPageShell'
import { TaxiBookingWidget } from '@/components/booking/TaxiBookingWidget'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'
  return {
    title: es ? 'Confirmar reserva | Titan Transfers' : 'Confirm booking | Titan Transfers',
    description: es
      ? 'Revisa los datos de tu reserva y completa el pago de forma segura.'
      : 'Review your booking details and complete the payment securely.',
    robots: { index: false, follow: false },
  }
}

export default async function ConfirmBookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'

  return (
    <BookingPageShell
      locale={locale}
      breadcrumbLabel={es ? 'Confirmar reserva' : 'Confirm booking'}
      heading={es ? 'Confirma tu reserva' : 'Confirm your booking'}
    >
      {await TaxiBookingWidget({ locale, wpPath: '/confirm-booking/' })}
    </BookingPageShell>
  )
}
