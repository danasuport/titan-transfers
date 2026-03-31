'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { buildETOUrl, LOCALE_TO_ETO_LANG } from '@/lib/eto/config'

function IconUser() {
  return (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}

function IconLuggage() {
  return (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2.5 pr-7 text-sm text-gray-700 focus:outline-none focus:border-brand-500 cursor-pointer"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

export function BookingForm() {
  const locale = useLocale()
  const t = useTranslations('booking')

  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState(today)
  const [hour, setHour] = useState('15:00')
  const [passengers, setPassengers] = useState('1')
  const [luggage, setLuggage] = useState('1')

  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  const counts = Array.from({ length: 9 }, (_, i) => String(i + 1))

  function handleReserve() {
    const url = buildETOUrl('booking', {
      lang: LOCALE_TO_ETO_LANG[locale] || LOCALE_TO_ETO_LANG.en,
      fromLocation: from || undefined,
      toLocation: to || undefined,
    })
    window.open(url, '_blank')
  }

  function handleReturn() {
    const url = buildETOUrl('booking', {
      lang: LOCALE_TO_ETO_LANG[locale] || LOCALE_TO_ETO_LANG.en,
      fromLocation: from || undefined,
      toLocation: to || undefined,
      returnTrip: true,
    })
    window.open(url, '_blank')
  }

  return (
    <div
      className="rounded-2xl border border-[#dde8c4] p-5"
      style={{ backgroundColor: '#f4f8e8' }}
    >
      {/* Fields row */}
      <div className="flex flex-wrap items-end gap-3">

        {/* Pickup */}
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-sm font-semibold text-gray-700">{t('pickup')}</label>
          <input
            type="text"
            value={from}
            onChange={e => setFrom(e.target.value)}
            placeholder={t('pickupPlaceholder')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Destination */}
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-sm font-semibold text-gray-700">{t('dropoff')}</label>
          <input
            type="text"
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder={t('dropoffPlaceholder')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">{t('date')}</label>
          <input
            type="text"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-brand-500 w-32"
          />
        </div>

        {/* Time */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">{t('time')}</label>
          <SelectField value={hour} onChange={setHour} options={hours} />
        </div>

        {/* Passengers */}
        <div className="flex flex-col gap-1 items-center">
          <IconUser />
          <SelectField value={passengers} onChange={setPassengers} options={counts} />
        </div>

        {/* Luggage */}
        <div className="flex flex-col gap-1 items-center">
          <IconLuggage />
          <SelectField value={luggage} onChange={setLuggage} options={counts} />
        </div>

        {/* Reserve button */}
        <button
          onClick={handleReserve}
          className="rounded-lg bg-brand-500 px-7 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 self-end"
        >
          Reservar
        </button>
      </div>

      {/* Return link */}
      <button
        onClick={handleReturn}
        className="mt-3 text-sm font-medium text-gray-600 underline hover:text-brand-600"
      >
        ¿Reservar retorno?
      </button>
    </div>
  )
}
