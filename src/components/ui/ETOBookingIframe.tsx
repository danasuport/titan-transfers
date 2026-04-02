'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { buildETOUrl, LOCALE_TO_ETO_LANG } from '@/lib/eto/config'

interface Props {
  pickup?: string
  pickupPid?: string
  dest?: string
  destPid?: string
  date?: string
  time?: string
  pax?: string
  lug?: string
}

export function ETOBookingIframe({ pickup, pickupPid, dest, destPid, date, time, pax, lug }: Props) {
  const locale = useLocale()
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const iframeUrl = buildETOUrl('booking', {
    lang: LOCALE_TO_ETO_LANG[locale] || LOCALE_TO_ETO_LANG.en,
    ...(pickup && { fromLocation: pickup }),
    ...(pickupPid && { fromCategory: pickupPid }),
    ...(dest && { toLocation: dest }),
    ...(destPid && { toCategory: destPid }),
    ...(date && { date }),
    ...(pax && { bookingType: pax }),
  })

  return (
    <div ref={containerRef}>
      {isVisible ? (
        <iframe
          src={iframeUrl}
          width="100%"
          style={{ height: '800px', border: 'none', display: 'block' }}
          title="Booking"
          allow="payment"
        />
      ) : (
        <div style={{ height: '800px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', borderRadius: '8px' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading...</p>
        </div>
      )}
    </div>
  )
}
