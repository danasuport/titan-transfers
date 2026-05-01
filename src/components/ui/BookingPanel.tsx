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
  onSelect: (address: string, lat: number, lng: number, placeId: string) => void
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
          onSelect(place.formatted_address, lat, lng, place.place_id || '')
        }
      })
    })
  }, [])

  // "Use my location" button — fills the field with the user's current GPS
  // address via reverse geocoding. Mirrors the crosshair button on the WP
  // plugin's original widget.
  function useMyLocation() {
    if (!navigator?.geolocation) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      await loadGooglePlaces()
      const g = window.google?.maps
      if (!g?.Geocoder) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new g.Geocoder().geocode({ location: { lat: latitude, lng: longitude } }, (results: any[], status: string) => {
        if (status === 'OK' && results?.[0]?.formatted_address) {
          onSelect(results[0].formatted_address, latitude, longitude, results[0].place_id || '')
        }
      })
    })
  }

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
      <button
        type="button"
        onClick={useMyLocation}
        aria-label="Use my location"
        title="Use my location"
        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', flexShrink: 0, display: 'flex', alignItems: 'center' }}
        onMouseEnter={e => e.currentTarget.style.color = '#6B8313'}
        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9"/>
          <circle cx="12" cy="12" r="2"/>
          <path d="M12 1v3M12 20v3M1 12h3M20 12h3"/>
        </svg>
      </button>
    </div>
  )
}

function TimeField({ icon, value, onChange, placeholder, ariaLabel }: {
  icon: React.ReactNode
  value: string
  onChange: (v: string) => void
  placeholder: string
  ariaLabel: string
}) {
  // Custom dropdown picker — Firefox and Safari desktop don't render any
  // popup for <input type="time">, so we build our own. Two scrollable
  // columns (hours 00-23, minutes every 5).
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const [h, m] = value ? value.split(':') : ['', '']
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={ariaLabel}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          background: '#F8FAF0', border: '1.5px solid #e5e7eb', borderRadius: '6px',
          padding: '0.85rem 1rem',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <span style={{ color: '#6B8313', flexShrink: 0, display: 'flex' }}>{icon}</span>
        <span style={{ flex: 1, fontSize: '0.875rem', color: value ? '#242426' : '#94a3b8' }}>
          {value || placeholder}
        </span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
          background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          display: 'flex', gap: '0.25rem', padding: '0.4rem',
        }}>
          <div style={{ flex: 1, maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {hours.map(hh => (
              <button
                key={hh}
                type="button"
                onClick={() => onChange(`${hh}:${m || '00'}`)}
                style={{
                  padding: '6px 0', border: 'none',
                  background: hh === h ? '#8BAA1D' : 'transparent',
                  color: hh === h ? '#fff' : '#242426',
                  cursor: 'pointer', borderRadius: '4px',
                  fontSize: '0.875rem', textAlign: 'center',
                  fontFamily: 'inherit',
                }}
              >{hh}</button>
            ))}
          </div>
          <div style={{ flex: 1, maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {minutes.map(mm => (
              <button
                key={mm}
                type="button"
                onClick={() => { onChange(`${h || '12'}:${mm}`); setOpen(false) }}
                style={{
                  padding: '6px 0', border: 'none',
                  background: mm === m ? '#8BAA1D' : 'transparent',
                  color: mm === m ? '#fff' : '#242426',
                  cursor: 'pointer', borderRadius: '4px',
                  fontSize: '0.875rem', textAlign: 'center',
                  fontFamily: 'inherit',
                }}
              >{mm}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PickerField({ icon, type, value, onChange, placeholder, ariaLabel }: {
  icon: React.ReactNode
  type: 'date' | 'time'
  value: string
  onChange: (v: string) => void
  placeholder: string
  displayValue?: string
  ariaLabel: string
}) {
  // Native <input type="date|time"> with the calendar-picker-indicator
  // stretched to cover the whole input, so clicking ANYWHERE on the field
  // opens the picker (Chrome/Safari). Plus showPicker() on the wrapper
  // click as a Firefox fallback. When value is empty the input text is
  // transparent so we can show our own custom placeholder.
  const inputRef = useRef<HTMLInputElement>(null)
  const isEmpty = !value
  function openPicker() {
    const el = inputRef.current
    if (!el) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyEl = el as any
    if (typeof anyEl.showPicker === 'function') {
      try { anyEl.showPicker() } catch {}
    }
  }
  return (
    <div
      onClick={openPicker}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        background: '#F8FAF0', border: '1.5px solid #e5e7eb', borderRadius: '6px',
        padding: '0.85rem 1rem',
        cursor: 'pointer',
      }}
    >
      <span style={{ color: '#6B8313', flexShrink: 0, display: 'flex', pointerEvents: 'none' }}>{icon}</span>
      {isEmpty && (
        <span style={{ position: 'absolute', left: 'calc(1rem + 16px + 0.6rem)', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.875rem', pointerEvents: 'none' }}>
          {placeholder}
        </span>
      )}
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="titan-picker-input"
        style={{
          flex: 1,
          width: '100%',
          minWidth: 0,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: '0.875rem',
          color: isEmpty ? 'transparent' : '#242426',
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      />
      {/* Stretch the native picker indicator to cover the full field.
          Without this the picker only opens when you click the tiny
          icon at the far right of the input. */}
      <style>{`
        .titan-picker-input::-webkit-calendar-picker-indicator {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          opacity: 0;
          cursor: pointer;
        }
      `}</style>
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
  const [pickupPlaceId, setPickupPlaceId] = useState('')
  const [dest, setDest] = useState('')
  const [destLat, setDestLat] = useState<number | null>(null)
  const [destLng, setDestLng] = useState<number | null>(null)
  const [destPlaceId, setDestPlaceId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [pax, setPax] = useState(1)
  const [lug, setLug] = useState(0)
  const [hours, setHours] = useState(3)
  const [bookReturn, setBookReturn] = useState(false)

  function buildUrl(coords: { pLat: number | null; pLng: number | null; dLat: number | null; dLng: number | null }) {
    const params = new URLSearchParams()
    if (pickup) params.set('pickup', pickup)
    if (coords.pLat != null && coords.pLng != null) {
      params.set('pickup_lat', String(coords.pLat))
      params.set('pickup_lng', String(coords.pLng))
    }
    // place_id is required by the WP plugin server-side validation —
    // without it the AJAX returns "Server Error" even with valid lat/lng.
    if (pickupPlaceId) params.set('pickup_pid', pickupPlaceId)
    if (mode === 'transfer') {
      if (dest) params.set('dest', dest)
      if (coords.dLat != null && coords.dLng != null) {
        params.set('dest_lat', String(coords.dLat))
        params.set('dest_lng', String(coords.dLng))
      }
      if (destPlaceId) params.set('dest_pid', destPlaceId)
      if (bookReturn) params.set('return', '1')
    } else {
      // Hourly mode — no destination, just hours
      params.set('mode', 'hourly')
      params.set('hours', String(hours))
    }
    if (date) params.set('date', date)
    params.set('time', time || '12:00')
    if (pax >= 1) params.set('pax', String(pax))
    if (lug >= 0) params.set('lug', String(lug))
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
    if (mode === 'transfer' && dest && (dLat == null || dLng == null)) {
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
      {/* Mobile: hide hero background images, kill the inherited clip-path
          (globals.css:374 cuts the bottom-right corner of .resp-img-panel
          and would slice the Calculate button), and tighten padding so the
          form fits the viewport without horizontal overflow. */}
      <style>{`
        @media (max-width: 768px) {
          .hero-bg-image { display: none !important; }
          .hero-widget-panel {
            padding: 1rem !important;
            min-height: 0 !important;
            clip-path: none !important;
            overflow: hidden;
          }
          .hero-widget-panel form {
            max-width: 100% !important;
          }
          /* Stack pax + bag counters on mobile — each one needs the full
             width of the form to fit the +/- buttons without overflow. */
          .bp-counter-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
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
            onSelect={(addr, lat, lng, pid) => { setPickup(addr); setPickupLat(lat); setPickupLng(lng); setPickupPlaceId(pid) }}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 13-8 13S4 15.25 4 10a8 8 0 0 1 8-8z"/>
              </svg>
            }
          />
        </div>

        {/* Destination (transfer mode) or Hours counter (hourly mode) */}
        {mode === 'transfer' ? (
          <div style={{ marginBottom: '0.65rem' }}>
            <PlaceInput
              placeholder={es ? 'Dirección de destino completa' : 'Enter full destination address'}
              ariaLabel={es ? 'Destino' : 'Destination'}
              value={dest}
              onChange={setDest}
              onSelect={(addr, lat, lng, pid) => { setDest(addr); setDestLat(lat); setDestLng(lng); setDestPlaceId(pid) }}
              icon={
                /* Checkered finish flag */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <line x1="5" y1="2" x2="5" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <rect x="7" y="3" width="3" height="3" fill="currentColor"/>
                  <rect x="13" y="3" width="3" height="3" fill="currentColor"/>
                  <rect x="10" y="6" width="3" height="3" fill="currentColor"/>
                  <rect x="16" y="6" width="3" height="3" fill="currentColor"/>
                  <rect x="7" y="9" width="3" height="3" fill="currentColor"/>
                  <rect x="13" y="9" width="3" height="3" fill="currentColor"/>
                  <rect x="7" y="3" width="12" height="9" stroke="currentColor" strokeWidth="1" fill="none"/>
                </svg>
              }
            />
          </div>
        ) : (
          <div style={{ marginBottom: '0.65rem' }}>
            <CounterField
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
              }
              label={hours === 1 ? (es ? 'Hora' : 'Hour') : (es ? 'Horas' : 'Hours')}
              value={hours}
              onChange={setHours}
              min={2}
              max={12}
            />
          </div>
        )}

        {/* Date + Time
            Native <input type="date|time"> doesn't display the placeholder
            attribute, so we render a <button> overlay that shows the chosen
            value or the placeholder, and a hidden native input does the
            actual picking. Click anywhere on the field opens the picker. */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.65rem' }}>
          <PickerField
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
            }
            type="date"
            value={date}
            onChange={setDate}
            placeholder={es ? 'Fecha' : 'Pickup date'}
            displayValue={date ? new Date(date + 'T00:00:00').toLocaleDateString(es ? 'es-ES' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
            ariaLabel={es ? 'Fecha de recogida' : 'Pickup date'}
          />
          <TimeField
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            }
            value={time}
            onChange={setTime}
            placeholder={es ? 'Hora' : 'Time'}
            ariaLabel={es ? 'Hora de recogida' : 'Pickup time'}
          />
        </div>

        {/* Pax + Bag */}
        <div className="bp-counter-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.85rem' }}>
          <CounterField
            icon={
              /* Two-person "group" icon — matches the WP widget */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="7" r="3"/>
                <path d="M9 12c-3.5 0-6 1.7-6 4v2h12v-2c0-2.3-2.5-4-6-4z"/>
                <circle cx="17" cy="8" r="2.5"/>
                <path d="M17 12.5c-1 0-1.9.2-2.6.5 1.4.9 2.3 2.2 2.6 3.5h5v-1.5c0-1.5-2-2.5-5-2.5z"/>
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
              /* Suitcase with handle — matches the WP widget */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 3a1 1 0 0 0-1 1v2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2V4a1 1 0 0 0-1-1H9zm1 2h4v1h-4V5zM6 8h12v11H6V8z"/>
                <path d="M11 10v7M13 10v7" stroke="#F8FAF0" strokeWidth="1"/>
              </svg>
            }
            label={lug === 1 ? (es ? 'Maleta' : 'Bag') : (es ? 'Maletas' : 'Bags')}
            value={lug}
            onChange={setLug}
            min={0}
            max={10}
          />
        </div>

        {/* Book a return — only in transfer mode */}
        {mode === 'transfer' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#F8FAF0', border: '1.5px solid #e5e7eb', borderRadius: '6px', padding: '0.7rem 1rem', cursor: 'pointer', marginBottom: '1rem' }}>
            <input type="checkbox" checked={bookReturn} onChange={e => setBookReturn(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#8BAA1D', cursor: 'pointer', flexShrink: 0 }} />
            {/* Swap arrows — same shape as the WP plugin */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B8313" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M7 4 3 8l4 4"/>
              <path d="M3 8h14"/>
              <path d="m17 20 4-4-4-4"/>
              <path d="M21 16H7"/>
            </svg>
            <span style={{ fontSize: '0.875rem', color: '#242426', fontWeight: 500 }}>
              {es ? '¿Reservar vuelta?' : 'Book a return?'}
            </span>
          </label>
        )}

        {/* Submit */}
        <button type="submit" style={{ width: '100%', background: '#8BAA1D', color: '#ffffff', border: 'none', padding: '1rem', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', letterSpacing: '0.04em', textTransform: 'uppercase', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#7a9519'}
          onMouseLeave={e => e.currentTarget.style.background = '#8BAA1D'}
        >
          {/* Calculator icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2"/>
            <line x1="8" y1="6" x2="16" y2="6"/>
            <line x1="8" y1="11" x2="8" y2="11"/>
            <line x1="12" y1="11" x2="12" y2="11"/>
            <line x1="16" y1="11" x2="16" y2="11"/>
            <line x1="8" y1="15" x2="8" y2="15"/>
            <line x1="12" y1="15" x2="12" y2="15"/>
            <line x1="16" y1="15" x2="16" y2="15"/>
            <line x1="8" y1="19" x2="8" y2="19"/>
            <line x1="12" y1="19" x2="12" y2="19"/>
            <line x1="16" y1="19" x2="16" y2="19"/>
          </svg>
          {es ? 'Calcular precio' : 'Calculate price'}
        </button>
      </div>
    </form>
  )
}
