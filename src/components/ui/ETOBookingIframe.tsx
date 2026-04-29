'use client'

import { useEffect, useRef, useState } from 'react'
export function ETOBookingIframe() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const qs = sp.toString()
    const url = qs
      ? `https://titantransfers.com/booking/?${qs}`
      : `https://titantransfers.com/booking/`
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
