'use client'

import { useTranslations } from 'next-intl'
import { BookingWidget } from '@/components/booking/BookingWidget'
import { Button } from '@/components/ui/Button'

interface BookingCTABlockProps {
  ctaText?: string
  linkedAirport?: { title: string; slug: { current: string } }
  linkedCity?: { title: string; slug: { current: string } }
  linkedRoute?: {
    title: string
    slug: { current: string }
    origin?: { slug: { current: string } }
    etoFromLocation?: string
    etoToLocation?: string
  }
  type?: 'auto' | 'manual'
  autoCity?: string
  autoAirport?: string
}

export function BookingCTABlock({
  ctaText,
  linkedAirport,
  linkedCity,
  linkedRoute,
  type = 'auto',
  autoCity,
  autoAirport,
}: BookingCTABlockProps) {
  const t = useTranslations('common')

  const title = ctaText || t('bookNow')

  let fromLocation: string | undefined
  let toLocation: string | undefined
  let linkHref: string | undefined

  if (type === 'manual') {
    if (linkedRoute) {
      fromLocation = linkedRoute.etoFromLocation
      toLocation = linkedRoute.etoToLocation
      linkHref = `/airport-transfers-private-taxi/${linkedRoute.origin?.slug?.current}/${linkedRoute.slug.current}/`
    } else if (linkedAirport) {
      fromLocation = linkedAirport.title
      linkHref = `/airport-transfers-private-taxi/${linkedAirport.slug.current}/`
    } else if (linkedCity) {
      toLocation = linkedCity.title
      linkHref = `/private-transfers/city/${linkedCity.slug.current}/`
    }
  } else {
    if (autoAirport) fromLocation = autoAirport
    if (autoCity) toLocation = autoCity
  }

  return (
    <div className="my-8 overflow-hidden rounded-2xl border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-white p-6">
      <BookingWidget
        title={title}
        fromLocation={fromLocation}
        toLocation={toLocation}
        showTrustSignals={false}
      />
      {linkHref && (
        <div className="mt-4 text-center">
          <Button href={linkHref} variant="outline" size="sm">
            {t('learnMore')}
          </Button>
        </div>
      )}
    </div>
  )
}
