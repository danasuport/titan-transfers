'use client'

import { useLocale, useTranslations } from 'next-intl'
import { buildETOUrl, LOCALE_TO_ETO_LANG } from '@/lib/eto/config'

interface BookingWidgetProps {
  title?: string
  fromLocation?: string
  fromCategory?: string
  toLocation?: string
  toCategory?: string
  showTrustSignals?: boolean
}

export function BookingWidget({
  fromLocation,
  fromCategory,
  toLocation,
  toCategory,
}: BookingWidgetProps) {
  const locale = useLocale()
  const tTrust = useTranslations('trust')

  const iframeUrl = buildETOUrl('booking-widget', {
    lang: LOCALE_TO_ETO_LANG[locale] || LOCALE_TO_ETO_LANG.en,
    fromLocation: fromLocation || undefined,
    fromCategory: fromCategory || undefined,
    toLocation: toLocation || undefined,
    toCategory: toCategory || undefined,
  })

  return (
    <div id="booking" className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <iframe
        src={iframeUrl}
        className="w-full border-0"
        style={{ minHeight: '120px' }}
        allow="geolocation"
        title="Booking Widget"
      />
    </div>
  )
}
