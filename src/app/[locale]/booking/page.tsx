import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
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

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'

  return (
    <div style={{ minHeight: '80vh', background: '#F8FAF0' }}>
      {/* CSS — load before HTML so the widget renders styled */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/themes/airbnb.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/intl-tel-input@25.11.2/build/css/intlTelInput.css" />
      <link rel="stylesheet" href="/taxi-booking/css/taxi-booking.min.css" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 6vw' }}>
        <Breadcrumbs items={[{ label: es ? 'Reservar' : 'Book' }]} variant="light" />
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#242426', fontWeight: 700, margin: '1rem 0 1.5rem' }}>
          {es ? 'Reserva tu traslado privado' : 'Book your private transfer'}
        </h1>

        {await TaxiBookingWidget({ locale })}
      </div>

      {/*
        Plain <script> tags — keeping them sequential and synchronous matters
        because taxi-booking.js depends on jQuery being on `window` already.
        Next.js's <Script> with afterInteractive does not guarantee order
        across separate Script components, so we drop them as inline HTML.
      */}
      <script src="https://code.jquery.com/jquery-3.7.1.min.js" />
      <script src="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js" />
      <script src="https://cdn.jsdelivr.net/npm/intl-tel-input@25.11.2/build/js/intlTelInput.min.js" />
      {GOOGLE_MAPS_KEY && (
        <script src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&language=${locale}`} async />
      )}
      <script src="/taxi-booking/js/taxi-booking.js" />
      <script src="/taxi-booking/js/taxi-booking-auth.js" />
    </div>
  )
}
