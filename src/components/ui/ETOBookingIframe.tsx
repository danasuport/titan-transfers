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

  const base = ETO_CONFIG.baseUrl.replace(/\/+$/, '') + '/booking'
  const params = new URLSearchParams({
    lang: LOCALE_TO_ETO_LANG[locale] || LOCALE_TO_ETO_LANG.en,
    ...searchParams,
  })
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
