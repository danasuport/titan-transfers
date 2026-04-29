import { ReactNode } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

// Slim shell for the booking page. The widget embeds the WP plugin
// via iframe (see TaxiBookingIframe), so we no longer need to load
// jQuery, Flatpickr, intl-tel-input, the plugin JS or the plugin CSS
// here — those run inside the iframe served by WP.
export function BookingPageShell({
  breadcrumbLabel,
  heading,
  children,
}: {
  breadcrumbLabel: string
  heading: string
  children: ReactNode
}) {
  return (
    <div style={{ minHeight: '80vh', background: '#F8FAF0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 6vw' }}>
        <Breadcrumbs items={[{ label: breadcrumbLabel }]} variant="light" />
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#242426', fontWeight: 700, margin: '1rem 0 1.5rem' }}>
          {heading}
        </h1>
        {children}
      </div>
    </div>
  )
}
