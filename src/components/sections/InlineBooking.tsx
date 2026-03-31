'use client'

import { useTranslations } from 'next-intl'
import { BookingWidget } from '@/components/booking/BookingWidget'

interface InlineBookingProps {
  title?: string
  fromLocation?: string
  fromCategory?: string
  toLocation?: string
  toCategory?: string
}

export function InlineBooking({ title, fromLocation, fromCategory, toLocation, toCategory }: InlineBookingProps) {
  const t = useTranslations('booking')

  return (
    <section className="relative overflow-hidden bg-dark py-12">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-brand-500/5 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full bg-brand-500/5 blur-3xl" />
      <div className="site-container relative">
        <BookingWidget
          title={title || t('bookYourTransfer')}
          fromLocation={fromLocation}
          fromCategory={fromCategory}
          toLocation={toLocation}
          toCategory={toCategory}
        />
      </div>
    </section>
  )
}
