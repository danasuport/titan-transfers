'use client'

import { useState, useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'
import { russoOne } from '@/lib/fonts'

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''
const ETO_BASE = '/booking/'
const GADS_ID = 'AW-17350153035'
const CONVERSION_LABEL = 'qeFICP6D9aobEMummdFA'

function fireConversion(callback?: () => void) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'conversion', {
        send_to: `${GADS_ID}/${CONVERSION_LABEL}`,
        event_callback: callback,
      })
      if (callback) setTimeout(callback, 1500)
      return
    }
  } catch {}
  if (callback) callback()
}

declare global {
  interface Window {
    // Same shape as the existing BookingForm declaration to avoid duplicate-decl conflicts.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any
    initGooglePlaces: () => void
  }
}

function loadGooglePlaces(): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.maps?.places) { resolve(); return }
    const existing = document.getElementById('google-places-script')
    if (existing) { existing.addEventListener('load', () => resolve()); return }
    window.initGooglePlaces = () => resolve()
    const script = document.createElement('script')
    script.id = 'google-places-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&callback=initGooglePlaces`
    script.async = true
    document.head.appendChild(script)
  })
}

function PlaceInput({ placeholder, ariaLabel, onSelect, value, onChange, icon }: {
  placeholder: string
  ariaLabel: string
  onSelect: (address: string, lat: number, lng: number) => void
  value: string
  onChange: (v: string) => void
  icon: React.ReactNode
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null)

  useEffect(() => {
    loadGooglePlaces().then(() => {
      if (!inputRef.current || autocompleteRef.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      autocompleteRef.current = new (window.google.maps.places.Autocomplete as any)(inputRef.current, { types: ['geocode', 'establishment'] })
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()
        if (place?.formatted_address && place?.geometry?.location) {
          const lat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat
          const lng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng
          onSelect(place.formatted_address, lat, lng)
        }
      })
    })
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#F8FAF0', border: '1.5px solid #e5e7eb', borderRadius: '6px', padding: '0.85rem 1rem', width: '100%' }}>
      <span style={{ color: '#6B8313', flexShrink: 0, display: 'flex' }}>{icon}</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: '#242426', fontFamily: 'inherit' }}
      />
    </div>
  )
}

function CounterField({ icon, label, value, onChange, min = 0, max = 16 }: {
  icon: React.ReactNode
  label: string
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#F8FAF0', border: '1.5px solid #e5e7eb', borderRadius: '6px', padding: '0.6rem 0.75rem' }}>
      <span style={{ color: '#6B8313', flexShrink: 0, display: 'flex' }}>{icon}</span>
      <div style={{ flex: 1, fontSize: '0.875rem', color: '#242426', fontFamily: 'inherit' }}>{value} {label}</div>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease"
        style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '1rem', lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >−</button>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase"
        style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1.5px solid #6B8313', background: '#ffffff', color: '#6B8313', fontSize: '1rem', lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >+</button>
    </div>
  )
}

export function BookingPanel() {
  const locale = useLocale()
  const es = locale === 'es'

  const [mode, setMode] = useState<'transfer' | 'hourly'>('transfer')
  const [pickup, setPickup] = useState('')
  const [pickupLat, setPickupLat] = useState<number | null>(null)
  const [pickupLng, setPickupLng] = useState<number | null>(null)
  const [dest, setDest] = useState('')
  const [destLat, setDestLat] = useState<number | null>(null)
  const [destLng, setDestLng] = useState<number | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [pax, setPax] = useState(1)
  const [lug, setLug] = useState(0)
  const [bookReturn, setBookReturn] = useState(false)

  function buildUrl(coords: { pLat: number | null; pLng: number | null; dLat: number | null; dLng: number | null }) {
    const params = new URLSearchParams()
    if (pickup) params.set('pickup', pickup)
    if (dest) params.set('dest', dest)
    if (coords.pLat != null && coords.pLng != null) {
      params.set('pickup_lat', String(coords.pLat))
      params.set('pickup_lng', String(coords.pLng))
    }
    if (coords.dLat != null && coords.dLng != null) {
      params.set('dest_lat', String(coords.dLat))
      params.set('dest_lng', String(coords.dLng))
    }
    if (date) params.set('date', date)
    params.set('time', time || '12:00')
    if (pax >= 1) params.set('pax', String(pax))
    if (lug >= 0) params.set('lug', String(lug))
    if (bookReturn) params.set('return', '1')
    if (mode === 'hourly') params.set('mode', 'hourly')
    return `${ETO_BASE}?${params.toString()}`
  }

  async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
    await loadGooglePlaces()
    const g = window.google?.maps
    if (!g?.Geocoder) return null
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new g.Geocoder().geocode({ address }, (results: any[], status: string) => {
        if (status === 'OK' && results?.[0]?.geometry?.location) {
          const loc = results[0].geometry.location
          resolve({
            lat: typeof loc.lat === 'function' ? loc.lat() : loc.lat,
            lng: typeof loc.lng === 'function' ? loc.lng() : loc.lng,
          })
        } else resolve(null)
      })
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let pLat = pickupLat, pLng = pickupLng, dLat = destLat, dLng = destLng
    if (pickup && (pLat == null || pLng == null)) {
      const r = await geocode(pickup); if (r) { pLat = r.lat; pLng = r.lng }
    }
    if (dest && (dLat == null || dLng == null)) {
      const r = await geocode(dest); if (r) { dLat = r.lat; dLng = r.lng }
    }
    const url = buildUrl({ pLat, pLng, dLat, dLng })
    let redirected = false
    const go = () => {
      if (redirected) return
      redirected = true
      window.location.href = url
    }
    fireConversion(go)
  }

  const tabActive = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '0.85rem 1rem', textAlign: 'center', cursor: 'pointer',
    background: active ? '#8BAA1D' : 'transparent',
    color: active ? '#ffffff' : '#475569',
    fontWeight: 600, fontSize: '0.9rem',
    border: 'none', fontFamily: 'inherit',
    transition: 'background 0.15s, color 0.15s',
  })

  const inputBoxStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    background: '#F8FAF0', border: '1.5px solid #e5e7eb', borderRadius: '6px',
    padding: '0.85rem 1rem',
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', maxWidth: '440px', width: '100%' }}>
      {/* Header */}
      <div style={{ background: '#8BAA1D', padding: '1.1rem 1.5rem', textAlign: 'center' }}>
        <h2 className={russoOne.className} style={{ color: '#ffffff', fontSize: '1.25rem', margin: 0, letterSpacing: '0.02em' }}>
          {es ? 'Reserva tu transfer' : 'Make a booking'}
        </h2>
      </div>

      {/* Body */}
      <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', marginBottom: '1.1rem', overflow: 'hidden' }}>
          <button type="button" onClick={() => setMode('transfer')} style={tabActive(mode === 'transfer')}>
            {es ? 'Transfer' : 'Transfer'}
          </button>
          <button type="button" onClick={() => setMode('hourly')} style={tabActive(mode === 'hourly')}>
            {es ? 'Por hora' : 'By Hour'}
          </button>
        </div>

        {/* Pickup */}
        <div style={{ marginBottom: '0.65rem' }}>
          <PlaceInput
            placeholder={es ? 'Dirección de origen completa' : 'Enter full pickup address'}
            ariaLabel={es ? 'Origen' : 'Pickup'}
            value={pickup}
            onChange={setPickup}
            onSelect={(addr, lat, lng) => { setPickup(addr); setPickupLat(lat); setPickupLng(lng) }}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 13-8 13S4 15.25 4 10a8 8 0 0 1 8-8z"/>
              </svg>
            }
          />
        </div>

        {/* Destination */}
        <div style={{ marginBottom: '0.65rem' }}>
          <PlaceInput
            placeholder={es ? 'Dirección de destino completa' : 'Enter full destination address'}
            ariaLabel={es ? 'Destino' : 'Destination'}
            value={dest}
            onChange={setDest}
            onSelect={(addr, lat, lng) => { setDest(addr); setDestLat(lat); setDestLng(lng) }}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 22V4M4 4h12l-2 4 2 4H4"/>
              </svg>
            }
          />
        </div>

        {/* Date + Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.65rem' }}>
          <div style={inputBoxStyle}>
            <span style={{ color: '#6B8313', flexShrink: 0, display: 'flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
            </span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} aria-label={es ? 'Fecha' : 'Date'} placeholder={es ? 'Fecha' : 'Pickup date'} style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: date ? '#242426' : '#94a3b8', fontFamily: 'inherit' }} />
          </div>
          <div style={inputBoxStyle}>
            <span style={{ color: '#6B8313', flexShrink: 0, display: 'flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </span>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} aria-label={es ? 'Hora' : 'Time'} placeholder="Time" style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: time ? '#242426' : '#94a3b8', fontFamily: 'inherit' }} />
          </div>
        </div>

        {/* Pax + Bag */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.85rem' }}>
          <CounterField
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            }
            label={pax === 1 ? (es ? 'Pasajero' : 'Passenger') : (es ? 'Pasajeros' : 'Passengers')}
            value={pax}
            onChange={setPax}
            min={1}
            max={16}
          />
          <CounterField
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="4" width="12" height="16" rx="2"/><path d="M10 4V2h4v2M8 11h8"/>
              </svg>
            }
            label={lug === 1 ? (es ? 'Maleta' : 'Bag') : (es ? 'Maletas' : 'Bags')}
            value={lug}
            onChange={setLug}
            min={0}
            max={10}
          />
        </div>

        {/* Book a return */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#F8FAF0', border: '1.5px solid #e5e7eb', borderRadius: '6px', padding: '0.7rem 1rem', cursor: 'pointer', marginBottom: '1rem' }}>
          <input type="checkbox" checked={bookReturn} onChange={e => setBookReturn(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#8BAA1D', cursor: 'pointer' }} />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
            <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
          <span style={{ fontSize: '0.875rem', color: '#242426', fontWeight: 500 }}>
            {es ? '¿Reservar vuelta?' : 'Book a return?'}
          </span>
        </label>

        {/* Submit */}
        <button type="submit" style={{ width: '100%', background: '#8BAA1D', color: '#ffffff', border: 'none', padding: '1rem', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', letterSpacing: '0.04em', textTransform: 'uppercase', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#7a9519'}
          onMouseLeave={e => e.currentTarget.style.background = '#8BAA1D'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>
          </svg>
          {es ? 'Calcular precio' : 'Calculate price'}
        </button>
      </div>
    </form>
  )
}
