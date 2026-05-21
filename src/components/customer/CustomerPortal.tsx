'use client'

import { useEffect, useRef, useState } from 'react'

// The customer account (login + booking history) lives on the WordPress
// install — that is where the Taxi Booking plugin stores user sessions and
// orders. We embed wp.titantransfers.com/login/?embed=1 in an iframe so the
// user stays under our domain and chrome. The MU-plugin on WP strips the
// theme around the login form when ?embed=1 is present and posts back the
// document height so we can autogrow without inner scrollbars.

const WP_ORIGIN = (process.env.NEXT_PUBLIC_WP_BOOKING_URL || 'https://wp.titantransfers.com').replace(/\/+$/, '')
const WP_ORIGIN_HOST = (() => { try { return new URL(WP_ORIGIN).origin } catch { return '' } })()

export function CustomerPortal() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [height, setHeight] = useState<number>(600)

  useEffect(() => {
    setIframeUrl(`${WP_ORIGIN}/login/?embed=1`)
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
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
      {iframeUrl ? (
        <iframe
          src={iframeUrl}
          title="Customer login"
          allow="payment *"
          style={{ width: '100%', height: `${height}px`, border: 'none', display: 'block', background: '#F8FAF0' }}
        />
      ) : (
        <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAF0' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTop: '3px solid #8BAA1D', borderRadius: '50%', animation: 'taxiSpin 0.8s linear infinite' }} />
          <style>{`@keyframes taxiSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  )
}
