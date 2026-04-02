'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { LOCALE_TO_ETO_LANG, ETO_CONFIG } from '@/lib/eto/config'

interface Props {
  searchParams?: Record<string, string>
}

export function ETOBookingIframe({ searchParams = {} }: Props) {
  const locale = useLocale()
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Translate form params (pickup/dest/date) to ETO iframe params (r1ls/r1le/r1d)
  const base = ETO_CONFIG.baseUrl.replace(/\/+$/, '') + '/booking'
  const params = new URLSearchParams()
  params.set('lang', LOCALE_TO_ETO_LANG[locale] || LOCALE_TO_ETO_LANG.en)
  if (searchParams.pickup)     params.set('r1ls', searchParams.pickup)
  if (searchParams.pickup_pid) params.set('r1cs', searchParams.pickup_pid)
  if (searchParams.dest)       params.set('r1le', searchParams.dest)
  if (searchParams.dest_pid)   params.set('r1ce', searchParams.dest_pid)
  if (searchParams.date)       params.set('r1d', searchParams.date)
  if (searchParams.time)       params.set('r1t', searchParams.time)
  if (searchParams.pax)        params.set('r1p', searchParams.pax)
  if (searchParams.lug)        params.set('r1l', searchParams.lug)
  if (searchParams.type)       params.set('type', searchParams.type)
  if (searchParams.step)       params.set('step', searchParams.step)
  const iframeUrl = `${base}?${params.toString()}`

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
