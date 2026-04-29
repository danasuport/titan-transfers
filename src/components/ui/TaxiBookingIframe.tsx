'use client'

import { useEffect, useState } from 'react'

// WordPress origin that hosts the Taxi Booking Plugin (custom plugin by M-Rehan).
// While DNS still points to SiteGround the public WP is reachable at the apex
// domain. After the eventual cutover this should point at whatever hostname
// keeps the WP backend public (a subdomain, an alias, etc.) — set via env.
const WP_ORIGIN = (process.env.NEXT_PUBLIC_WP_BOOKING_URL || 'https://titantransfers.com').replace(/\/+$/, '')

export function TaxiBookingIframe() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const qs = sp.toString()
    const url = qs ? `${WP_ORIGIN}/booking/?${qs}` : `${WP_ORIGIN}/booking/`
    setIframeUrl(url)
  }, [])

  return (
    <div style={{ width: '100%' }}>
      {iframeUrl ? (
        <iframe
          src={iframeUrl}
          width="100%"
          style={{ height: '1800px', border: 'none', display: 'block', background: '#ffffff' }}
          title="Booking"
          allow="payment; geolocation"
        />
      ) : (
        <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', borderRadius: '8px' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading...</p>
        </div>
      )}
    </div>
  )
}
