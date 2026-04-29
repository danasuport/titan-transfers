'use client'

import { useEffect, useRef, useState } from 'react'

// Embeds the WP Taxi Booking Plugin via iframe pointing at
// /booking/?embed=1 on the WP origin. The matching MU-plugin on WP
// (titan-booking-embed.php) hides the theme chrome (header, footer,
// admin bar, sidebar) and only renders the [taxi_booking] shortcode
// plus iframe-resizer's contentWindow script, so this iframe can
// auto-fit height without scrollbars.
//
// The plugin runs in its native WP environment — same nonce, same
// PHP session, same user context — so check_ajax_referer succeeds
// and every step (calculate, book, login, etc.) just works.

const WP_ORIGIN = (process.env.NEXT_PUBLIC_WP_BOOKING_URL || 'https://titantransfers.com').replace(/\/+$/, '')

declare global {
  interface Window {
    iFrameResize?: (opts: object, target: string | HTMLIFrameElement) => void
  }
}

export function TaxiBookingIframe() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Build the upstream URL once on mount, propagating the user's query
  // string (pickup, dest, lat/lng, date, time, pax, lug) so the WP plugin
  // can prefill step 1 — the matching helper inside the MU-plugin reads
  // those params and writes them into the form before render.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    sp.set('embed', '1')
    setIframeUrl(`${WP_ORIGIN}/booking/?${sp.toString()}`)
  }, [])

  // Initialise iframe-resizer on the parent side once the iframe has
  // loaded — the matching contentWindow script lives inside the WP MU-
  // plugin output. Loaded as a CDN script tag below.
  useEffect(() => {
    if (!iframeUrl || !iframeRef.current) return
    const tryInit = () => {
      if (typeof window.iFrameResize === 'function' && iframeRef.current) {
        window.iFrameResize(
          {
            log: false,
            checkOrigin: false,
            heightCalculationMethod: 'lowestElement',
          },
          iframeRef.current,
        )
        return true
      }
      return false
    }
    if (!tryInit()) {
      const id = window.setInterval(() => {
        if (tryInit()) window.clearInterval(id)
      }, 100)
      return () => window.clearInterval(id)
    }
  }, [iframeUrl])

  return (
    <>
      {/* iframe-resizer parent — the contentWindow counterpart is injected
          server-side by the WP MU-plugin so messages are bidirectional. */}
      <script
        src="https://cdn.jsdelivr.net/npm/@iframe-resizer/parent@5.2.6/index.umd.min.js"
        async
      />
      {iframeUrl ? (
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          title="Booking"
          allow="payment; geolocation"
          style={{
            width: '100%',
            border: 'none',
            display: 'block',
            background: '#ffffff',
            // Initial min-height so the user sees something before
            // iframe-resizer reports the actual content height.
            minHeight: '720px',
          }}
        />
      ) : (
        <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTop: '3px solid #8BAA1D', borderRadius: '50%', animation: 'taxiSpin 0.8s linear infinite' }} />
          <style>{`@keyframes taxiSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </>
  )
}
