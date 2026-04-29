import Script from 'next/script'
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
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.5/css/all.min.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/themes/airbnb.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/intl-tel-input@25.11.2/build/css/intlTelInput.css" />
      <link rel="stylesheet" href="/taxi-booking/css/taxi-booking.min.css" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 6vw' }}>
        <Breadcrumbs items={[{ label: es ? 'Reservar' : 'Book' }]} variant="light" />
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#242426', fontWeight: 700, margin: '1rem 0 1.5rem' }}>
          {es ? 'Reserva tu traslado privado' : 'Book your private transfer'}
        </h1>

        {await TaxiBookingWidget({ locale })}
      </div>

      {/* jQuery — the plugin's JS is jQuery-based */}
      <Script src="https://code.jquery.com/jquery-3.7.1.min.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/flatpickr" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/intl-tel-input@25.11.2/build/js/intlTelInput.min.js" strategy="afterInteractive" />
      {GOOGLE_MAPS_KEY && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&language=${locale}`}
          strategy="afterInteractive"
        />
      )}
      <Script src="/taxi-booking/js/taxi-booking.js" strategy="afterInteractive" />
      <Script src="/taxi-booking/js/taxi-booking-auth.js" strategy="afterInteractive" />
    </div>
  )
}
