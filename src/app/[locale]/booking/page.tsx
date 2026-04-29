import { BookingPageShell } from '@/components/booking/BookingPageShell'
import { TaxiBookingWidget } from '@/components/booking/TaxiBookingWidget'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'
  return {
    title: es ? 'Reservar traslado privado | Titan Transfers' : 'Book a private transfer | Titan Transfers',
    description: es
      ? 'Reserva tu traslado privado al instante. Precio fijo, conductor profesional, servicio puerta a puerta 24/7.'
      : 'Book your private transfer instantly. Fixed price, professional driver, door-to-door service 24/7.',
    robots: { index: true, follow: true },
  }
}

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'

  return (
    <BookingPageShell
      locale={locale}
      breadcrumbLabel={es ? 'Reservar' : 'Book'}
      heading={es ? 'Reserva tu traslado privado' : 'Book your private transfer'}
    >
      <TaxiBookingWidget />
    </BookingPageShell>
  )
}
