'use client'

import { useEffect, useRef, useState } from 'react'

// Embeds the WP Taxi Booking Plugin via iframe pointing at
// /booking/?embed=1 on the WP origin. The matching MU-plugin on WP
// (titan-booking-embed.php) hides the theme chrome and posts the
// document height back to us on every layout change, so the iframe
// grows to fit content without inner scrollbars.

const WP_ORIGIN = (process.env.NEXT_PUBLIC_WP_BOOKING_URL || 'https://titantransfers.com').replace(/\/+$/, '')
const WP_ORIGIN_HOST = (() => { try { return new URL(WP_ORIGIN).origin } catch { return '' } })()

export function TaxiBookingIframe() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [height, setHeight] = useState<number>(720)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    sp.set('embed', '1')
    setIframeUrl(`${WP_ORIGIN}/booking/?${sp.toString()}`)
  }, [])

  // Listen for height messages posted by the MU-plugin's child snippet.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      // Reject if origin couldn't be parsed (env var unset) or doesn't match.
      // Closing this avoids any frame on the page DoSing layout via huge heights.
      if (!WP_ORIGIN_HOST || e.origin !== WP_ORIGIN_HOST) return
      const data = e.data
      if (!data || typeof data !== 'object' || data.type !== 'titanBookingHeight') return
      const h = Number(data.height)
      if (!Number.isFinite(h) || h <= 0) return
      setHeight(Math.min(h, 10000))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <>
      {iframeUrl ? (
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          title="Booking"
          // sandbox keeps the WP origin in its own trust zone — if WP gets
          // popped (separate stack, separate patch cadence), it can't pivot
          // onto titantransfers.com via the iframe. allow-same-origin is
          // required so the WP session cookie still flows.
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          allow="payment; geolocation"
          style={{
            width: '100%',
            height: `${height}px`,
            border: 'none',
            display: 'block',
            background: '#F8FAF0',
          }}
        />
      ) : (
        <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAF0' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTop: '3px solid #8BAA1D', borderRadius: '50%', animation: 'taxiSpin 0.8s linear infinite' }} />
          <style>{`@keyframes taxiSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </>
  )
}
