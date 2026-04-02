'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { LOCALE_TO_ETO_LANG, ETO_CONFIG } from '@/lib/eto/config'

export function ETOBookingIframe() {
  const locale = useLocale()
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const pickup = sp.get('pickup')

    if (pickup) {
      // Params present — translate to ETO iframe params and go to step 2
      const base = ETO_CONFIG.baseUrl.replace(/\/+$/, '') + '/booking'
      const params = new URLSearchParams()
      params.set('lang', LOCALE_TO_ETO_LANG[locale] || LOCALE_TO_ETO_LANG.en)
      params.set('step', '2')
      if (pickup)                params.set('r1ls', pickup)
      if (sp.get('pickup_pid')) params.set('r1cs', sp.get('pickup_pid')!)
      if (sp.get('dest'))       params.set('r1le', sp.get('dest')!)
      if (sp.get('dest_pid'))   params.set('r1ce', sp.get('dest_pid')!)
      if (sp.get('date'))       params.set('r1d', sp.get('date')!)
      if (sp.get('time'))       params.set('r1t', sp.get('time')!)
      if (sp.get('pax'))        params.set('pax', sp.get('pax')!)
      if (sp.get('lug'))        params.set('lug', sp.get('lug')!)
      setIframeUrl(`${base}?${params.toString()}`)
    } else {
      // No params — show blank booking widget
      const u = new URL(ETO_CONFIG.baseUrl.replace(/\/+$/, '') + '/booking')
      u.searchParams.set('lang', LOCALE_TO_ETO_LANG[locale] || LOCALE_TO_ETO_LANG.en)
      setIframeUrl(u.toString())
    }
  }, [locale])

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
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading...</p>
        </div>
      )}
    </div>
  )
}
