'use client'

import { useEffect, useRef, useState } from 'react'

// Client component: fetches the booking widget HTML through the
// /api/taxi-booking-html proxy, which forwards cookies in both
// directions. WP's PHPSESSID lands in the user's browser, so the
// nonce shipped in the localised script stays valid against
// check_ajax_referer in WP.
//
// Doing this server-side (Server Component) would lose the Set-Cookie
// from WP because Server Components can't write cookies during render.
// So all of this lives in the client.

type Extracted = {
  widgetHtml: string
  styleHtml: string
  ajaxObject: Record<string, unknown> | null
}

const BRAND_REWRITES: Array<[RegExp, string]> = [
  [/--taxi-primary-color:\s*#?[0-9a-f]{3,8};?/gi, '--taxi-primary-color: #8BAA1D;'],
  [/--taxi-primary-rgb:\s*[\d,\s]+;?/gi, '--taxi-primary-rgb: 139, 170, 29;'],
  [/--taxi-secondary-color:\s*#?[0-9a-f]{3,8};?/gi, '--taxi-secondary-color: #6B8313;'],
  [/--taxi-secondary-rgb:\s*[\d,\s]+;?/gi, '--taxi-secondary-rgb: 107, 131, 19;'],
]

function rebrand(s: string): string {
  let out = s
  for (const [re, rep] of BRAND_REWRITES) out = out.replace(re, rep)
  return out
}

function extract(html: string): Extracted {
  let styleHtml = ''
  const styleRe = /<style[^>]*>[\s\S]*?<\/style>/gi
  for (const m of html.matchAll(styleRe)) {
    if (m[0].includes('taxi-booking-widget') || m[0].includes('--taxi-')) {
      styleHtml += rebrand(m[0])
    }
  }

  let widgetHtml = ''
  const openIdx = html.indexOf('id="taxi-booking-widget"')
  if (openIdx !== -1) {
    const divStart = html.lastIndexOf('<div', openIdx)
    if (divStart !== -1) {
      let depth = 0
      let i = divStart
      while (i < html.length) {
        const nextOpen = html.indexOf('<div', i + 1)
        const nextClose = html.indexOf('</div', i + 1)
        if (nextClose === -1) break
        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++
          i = nextOpen
        } else {
          if (depth === 0) {
            const closeEnd = html.indexOf('>', nextClose) + 1
            widgetHtml = html.slice(divStart, closeEnd)
            break
          }
          depth--
          i = nextClose
        }
      }
    }
  }

  let ajaxObject: Record<string, unknown> | null = null
  const cfgMatch = html.match(/var\s+taxi_booking_ajax\s*=\s*(\{[\s\S]*?\});/)
  if (cfgMatch) {
    try {
      ajaxObject = JSON.parse(cfgMatch[1]) as Record<string, unknown>
    } catch {
      ajaxObject = null
    }
  }

  return { widgetHtml, styleHtml, ajaxObject }
}

// Append a <script> and resolve when it loads.
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`failed to load ${src}`))
    document.body.appendChild(s)
  })
}

// Wait until a global is available on window, polling at most `maxMs`.
function waitFor(check: () => boolean, maxMs = 5000): Promise<boolean> {
  return new Promise(resolve => {
    const start = Date.now()
    const tick = () => {
      if (check()) return resolve(true)
      if (Date.now() - start > maxMs) return resolve(false)
      setTimeout(tick, 50)
    }
    tick()
  })
}

export function TaxiBookingWidget() {
  const [content, setContent] = useState<Extracted | null>(null)
  const [error, setError] = useState(false)
  const bootstrappedRef = useRef(false)

  useEffect(() => {
    const search = window.location.search
    fetch(`/api/taxi-booking-html${search}`, { credentials: 'include' })
      .then(r => r.ok ? r.text() : Promise.reject(new Error(String(r.status))))
      .then(html => {
        const data = extract(html)
        if (!data.widgetHtml) throw new Error('widget not found')
        const finalAjax = {
          ...(data.ajaxObject || {}),
          ajax_url: '/api/taxi-booking-ajax',
        }
        ;(window as { taxi_booking_ajax?: unknown }).taxi_booking_ajax = finalAjax
        setContent(data)
      })
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    if (!content || bootstrappedRef.current) return
    bootstrappedRef.current = true

    // Wait for jQuery (loaded by the page shell) before booting the
    // plugin JS — taxi-booking.js is jQuery-based and assumes $ is ready.
    ;(async () => {
      await waitFor(() => Boolean((window as { jQuery?: unknown }).jQuery))
      try {
        await loadScript('/taxi-booking/js/taxi-booking.js')
        await loadScript('/taxi-booking/js/taxi-booking-auth.js').catch(() => undefined)
        await loadScript('/taxi-booking/js/titan-prefill.js').catch(() => undefined)
      } catch {
        // Ignore — page already showed the widget shell. Worst case the
        // user sees an unresponsive form which a refresh will fix.
      }
    })()
  }, [content])

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        <p>Booking system temporarily unavailable. Please refresh the page.</p>
      </div>
    )
  }

  if (!content) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
        <div className="taxi-spinner" style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #e2e8f0', borderTop: '3px solid #8BAA1D', borderRadius: '50%', animation: 'taxiSpin 0.8s linear infinite' }} />
        <style>{`@keyframes taxiSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: content.styleHtml }} />
      <div dangerouslySetInnerHTML={{ __html: content.widgetHtml }} />
    </>
  )
}
