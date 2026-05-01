'use client'

import { useEffect, useRef, useState } from 'react'

// Hero booking widget — iframe to the WP plugin's step-1 form. Same widget
// the client has used for years; lives at wp.titantransfers.com so any tweak
// is done once in the WP plugin and reflected here AND on /booking/.
//
// We render the iframe inside a rounded white card so it sits cleanly on
// top of the hero car background. The MU-plugin (titan-booking-embed.php)
// strips the WP theme chrome when ?embed=1 is passed and posts back the
// document height on every layout change so the iframe grows to fit.

const WP_ORIGIN = (process.env.NEXT_PUBLIC_WP_BOOKING_URL || 'https://titantransfers.com').replace(/\/+$/, '')
const WP_ORIGIN_HOST = (() => { try { return new URL(WP_ORIGIN).origin } catch { return '' } })()

export function BookingPanelIframe() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [height, setHeight] = useState<number>(640)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setIframeUrl(`${WP_ORIGIN}/booking/?embed=1`)
  }, [])

  useEffect(() => {
    function onMessage(e: MessageEvent) {
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
    <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.18)', maxWidth: '760px', width: '100%' }}>
      {iframeUrl ? (
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          title="Booking"
          allow="payment *; geolocation *"
          style={{
            width: '100%',
            height: `${height}px`,
            border: 'none',
            display: 'block',
            background: '#ffffff',
          }}
        />
      ) : (
        <div style={{ height: '640px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTop: '3px solid #8BAA1D', borderRadius: '50%', animation: 'taxiPanelSpin 0.8s linear infinite' }} />
          <style>{`@keyframes taxiPanelSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  )
}
