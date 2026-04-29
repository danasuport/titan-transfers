import { ReactNode } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

// Wraps the booking page with shared chrome:
//   - all the CSS the plugin needs (FontAwesome, Flatpickr, intl-tel,
//     plugin own CSS, brand overrides — in this exact order so the
//     overrides win the cascade)
//   - the third-party JS dependencies (jQuery, Flatpickr, intl-tel,
//     Google Maps Places). These are loaded as plain <script> tags so
//     the browser executes them in source order and they sit on
//     window before the plugin JS runs.
//
// The plugin JS itself (taxi-booking.js, taxi-booking-auth.js,
// titan-prefill.js) is NOT included here — TaxiBookingWidget appends
// those scripts at runtime, after it has fetched the widget HTML and
// inserted it into the DOM, otherwise the plugin's $(document).ready
// callback would fire against an empty page and fail to bind handlers.
export function BookingPageShell({
  locale,
  breadcrumbLabel,
  heading,
  children,
}: {
  locale: string
  breadcrumbLabel: string
  heading: string
  children: ReactNode
}) {
  return (
    <div style={{ minHeight: '80vh', background: '#F8FAF0' }}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/themes/airbnb.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/intl-tel-input@25.11.2/build/css/intlTelInput.css" />
      <link rel="stylesheet" href="/taxi-booking/css/taxi-booking.min.css" />
      <link rel="stylesheet" href="/taxi-booking/css/titan-overrides.css" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 6vw' }}>
        <Breadcrumbs items={[{ label: breadcrumbLabel }]} variant="light" />
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#242426', fontWeight: 700, margin: '1rem 0 1.5rem' }}>
          {heading}
        </h1>

        {children}
      </div>

      <script src="https://code.jquery.com/jquery-3.7.1.min.js" />
      <script src="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js" />
      <script src="https://cdn.jsdelivr.net/npm/intl-tel-input@25.11.2/build/js/intlTelInput.min.js" />
      {GOOGLE_MAPS_KEY && (
        <script src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&language=${locale}`} async />
      )}
    </div>
  )
}
