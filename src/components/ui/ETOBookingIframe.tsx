'use client'

import { useEffect, useRef, useState } from 'react'

// Real ETO booking server. Must NOT be this Next.js app's /booking/
// because the iframe would just load itself (infinite recursion).
const ETO_URL = (process.env.NEXT_PUBLIC_ETO_URL || 'https://www.titantransfers.es/eto/').replace(/\/+$/, '')

export function ETOBookingIframe() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const qs = sp.toString()
    // ETO booking page lives under /booking (matches the original WP plugin)
    const url = qs ? `${ETO_URL}/booking?${qs}` : `${ETO_URL}/booking`
    setIframeUrl(url)
  }, [])

  const iframeUrlFinal = iframeUrl

  return (
    <div ref={containerRef}>
      {iframeUrlFinal ? (
        <iframe
          src={iframeUrlFinal}
          width="100%"
          style={{ height: '800px', border: 'none', display: 'block' }}
          title="Booking"
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          allow="payment"
        />
      ) : (
        <div style={{ height: '800px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', borderRadius: '8px' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading...</p>
        </div>
      )}
    </div>
  )
}
