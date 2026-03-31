'use client'

import { BookingWidget } from './BookingWidget'

interface BookingFullProps {
  title?: string
  fromLocation?: string
  fromCategory?: string
  toLocation?: string
  toCategory?: string
}

export function BookingFull(props: BookingFullProps) {
  return <BookingWidget {...props} />
}
