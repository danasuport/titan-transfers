'use client'

import { useEffect, useRef, useState } from 'react'

// Hero booking widget — iframe to the WP plugin's step-1 form, loaded in
// COMPACT mode (?compact=1). The MU-plugin's compact handler intercepts
// Calculate Price clicks inside the iframe and posts the form data here,
// so we can redirect the parent window to /booking/ instead of advancing
// the booking flow inside the home iframe.

const WP_ORIGIN = (process.env.NEXT_PUBLIC_WP_BOOKING_URL || 'https://titantransfers.com').replace(/\/+$/, '')
const WP_ORIGIN_HOST = (() => { try { return new URL(WP_ORIGIN).origin } catch { return '' } })()

const GADS_ID = 'AW-17350153035'
const CONVERSION_LABEL = 'qeFICP6D9aobEMummdFA'

interface SubmitData {
  mode?: string
  pickup?: string
  pickup_lat?: string
  pickup_lng?: string
  dest?: string
  dest_lat?: string
  dest_lng?: string
  date?: string
  time?: string
  pax?: string
  lug?: string
  bookReturn?: string
}

function fireConversion(callback?: () => void) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'conversion', {
        send_to: `${GADS_ID}/${CONVERSION_LABEL}`,
        event_callback: callback,
      })
      if (callback) setTimeout(callback, 1500)
      return
    }
  } catch {}
  if (callback) callback()
}

function buildBookingUrl(d: SubmitData): string {
  const p = new URLSearchParams()
  if (d.pickup) p.set('pickup', d.pickup)
  if (d.dest) p.set('dest', d.dest)
  if (d.pickup_lat) p.set('pickup_lat', d.pickup_lat)
  if (d.pickup_lng) p.set('pickup_lng', d.pickup_lng)
  if (d.dest_lat) p.set('dest_lat', d.dest_lat)
  if (d.dest_lng) p.set('dest_lng', d.dest_lng)
  if (d.date) p.set('date', d.date)
  if (d.time) p.set('time', d.time)
  if (d.pax) p.set('pax', d.pax)
  if (d.lug) p.set('lug', d.lug)
  if (d.bookReturn) p.set('return', '1')
  if (d.mode === 'hourly') p.set('mode', 'hourly')
  return `/booking/?${p.toString()}`
}

export function BookingPanelIframe() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [height, setHeight] = useState<number>(640)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Pass our origin so the iframe can drive a top-window navigation
    // back here when the user submits step 1 (more reliable than
    // postMessage — the iframe doesn't depend on the parent listening).
    const parentOrigin = encodeURIComponent(window.location.origin)
    setIframeUrl(`${WP_ORIGIN}/booking/?embed=1&compact=1&parent_origin=${parentOrigin}`)
  }, [])

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!WP_ORIGIN_HOST || e.origin !== WP_ORIGIN_HOST) return
      const data = e.data
      if (!data || typeof data !== 'object') return

      // Iframe-resize message — adjust the iframe height to fit content.
      if (data.type === 'titanBookingHeight') {
        const h = Number(data.height)
        if (!Number.isFinite(h) || h <= 0) return
        setHeight(Math.min(h, 10000))
        return
      }

      // Compact-mode submit — user clicked Calculate Price inside the
      // iframe; redirect the top window to /booking/ with the form data
      // so step 2 loads on the dedicated booking page.
      if (data.type === 'titanBookingSubmit' && data.data) {
        const url = buildBookingUrl(data.data as SubmitData)
        let redirected = false
        const go = () => {
          if (redirected) return
          redirected = true
          window.location.href = url
        }
        fireConversion(go)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.18)', width: '100%' }}>
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
