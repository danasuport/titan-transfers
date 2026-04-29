import { ReactNode } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

// Wraps any of the three booking-flow pages with the same chrome:
// CSS for the embedded plugin, breadcrumb, headline, then the widget,
// then the JS dependencies in strict order. Pages just render the widget
// and pass the headline / breadcrumb label.
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 6vw' }}>
        <Breadcrumbs items={[{ label: breadcrumbLabel }]} variant="light" />
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#242426', fontWeight: 700, margin: '1rem 0 1.5rem' }}>
          {heading}
        </h1>

        {children}
      </div>

      {/* Strict source order — each script blocks the next, so taxi-booking.js
          starts only after jQuery, Flatpickr and intl-tel-input are on window. */}
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
