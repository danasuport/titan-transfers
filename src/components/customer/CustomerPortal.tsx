'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { buildETOUrl, LOCALE_TO_ETO_LANG } from '@/lib/eto/config'

export function CustomerPortal() {
  const locale = useLocale()
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const iframeUrl = buildETOUrl('customer', {
    lang: LOCALE_TO_ETO_LANG[locale] || LOCALE_TO_ETO_LANG.en,
  })

  return (
    <div ref={containerRef} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
      <div className="p-6">
        {isVisible ? (
          <iframe
            src={iframeUrl}
            width="100%"
            style={{ height: '600px', border: 'none' }}
            title="Customer portal"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            allow="payment"
          />
        ) : (
          <div className="flex h-96 items-center justify-center rounded-lg bg-gray-50">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        )}
      </div>
    </div>
  )
}
