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

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  const sp = await searchParams
  const es = locale === 'es'
  const stepFromUrl = typeof sp.step === 'string' ? sp.step : '1'

  const heading = es
    ? stepFromUrl === '2' ? 'Elige tu vehículo'
    : stepFromUrl === '3' ? 'Confirma tu reserva'
    : 'Reserva tu traslado privado'
    : stepFromUrl === '2' ? 'Choose your vehicle'
    : stepFromUrl === '3' ? 'Confirm your booking'
    : 'Book your private transfer'

  return (
    <BookingPageShell
      locale={locale}
      breadcrumbLabel={es ? 'Reservar' : 'Book'}
      heading={heading}
    >
      {await TaxiBookingWidget({ locale, searchParams: sp })}
    </BookingPageShell>
  )
}
