'use client'

import { useState, useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''
// Submit lands on this Next.js app's /booking/ page; the iframe inside
// then loads the real ETO server (see ETOBookingIframe.tsx).
const ETO_BASE = '/booking/'
const GADS_ID = 'AW-17350153035'
const CONVERSION_LABEL = 'qeFICP6D9aobEMummdFA'

function fireConversion() {
  try {
    const w = window as any
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'conversion', { send_to: `${GADS_ID}/${CONVERSION_LABEL}` })
    }
  } catch {}
}

declare global {
  interface Window { google: any; initGooglePlaces: () => void }
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

function PlaceInput({ placeholder, ariaLabel, onSelect, value, onChange }: {
  placeholder: string
  ariaLabel: string
  onSelect: (address: string, placeId: string, lat: number, lng: number) => void
  value: string
  onChange: (v: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)

  useEffect(() => {
    loadGooglePlaces().then(() => {
      if (!inputRef.current || autocompleteRef.current) return
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, { types: ['geocode', 'establishment'] })
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()
        if (place?.formatted_address && place?.place_id && place?.geometry?.location) {
          const lat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat
          const lng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng
          onSelect(place.formatted_address, place.place_id, lat, lng)
        }
      })
    })
  }, [])

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', color: '#242426', fontFamily: 'inherit' }}
    />
  )
}

export function BlogBookingForm() {
  const locale = useLocale()
  const es = locale === 'es'

  const [pickup, setPickup] = useState('')
  const [pickupLat, setPickupLat] = useState<number | null>(null)
  const [pickupLng, setPickupLng] = useState<number | null>(null)
  const [dest, setDest] = useState('')
  const [destLat, setDestLat] = useState<number | null>(null)
  const [destLng, setDestLng] = useState<number | null>(null)
  const [datetime, setDatetime] = useState('')
  const [pax, setPax] = useState(1)
  const [lug, setLug] = useState(0)

  const iconColor = '#242426'
  const skewWrap: React.CSSProperties = { transform: 'skewX(-8deg)', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '2px solid #e5e7eb', background: '#ffffff', padding: '0.6rem 0.85rem' }
  const skewInner: React.CSSProperties = { transform: 'skewX(8deg)', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }

  function buildUrl() {
    // Custom params consumed by /public/taxi-booking/js/titan-prefill.js,
    // which fills the WP plugin's step-1 inputs after it boots.
    const [datePart, timePart] = datetime ? datetime.split('T') : ['', '12:00']
    const params = new URLSearchParams()
    if (pickup) params.set('pickup', pickup)
    if (dest) params.set('dest', dest)
    if (pickupLat != null && pickupLng != null) {
      params.set('pickup_lat', String(pickupLat))
      params.set('pickup_lng', String(pickupLng))
    }
    if (destLat != null && destLng != null) {
      params.set('dest_lat', String(destLat))
      params.set('dest_lng', String(destLng))
    }
    if (datePart) params.set('date', datePart)
    if (timePart) params.set('time', timePart || '12:00')
    if (pax >= 1) params.set('pax', String(pax))
    if (lug >= 0) params.set('lug', String(lug))
    return `${ETO_BASE}?${params.toString()}`
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    fireConversion()
    window.location.href = buildUrl()
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#8BAA1D', border: '2px solid #8BAA1D', transform: 'skewX(-8deg)', padding: '1.25rem 1.75rem' }}>
      <div style={{ transform: 'skewX(8deg)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

        {/* Row 1: Pickup + Dest */}
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <div style={{ ...skewWrap, flex: 1 }}>
            <div style={skewInner}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 13-8 13S4 15.25 4 10a8 8 0 0 1 8-8z"/>
              </svg>
              <PlaceInput
                placeholder={es ? 'Origen — aeropuerto, hotel...' : 'Pickup — airport, hotel...'}
                ariaLabel={es ? 'Lugar de origen' : 'Pickup location'}
                value={pickup}
                onChange={setPickup}
                onSelect={(addr, _pid, lat, lng) => { setPickup(addr); setPickupLat(lat); setPickupLng(lng) }}
              />
            </div>
          </div>

          <div style={{ ...skewWrap, flex: 1 }}>
            <div style={skewInner}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 13-8 13S4 15.25 4 10a8 8 0 0 1 8-8z"/>
              </svg>
              <PlaceInput
                placeholder={es ? 'Destino — hotel, aeropuerto...' : 'Drop-off — hotel, airport...'}
                ariaLabel={es ? 'Lugar de destino' : 'Drop-off location'}
                value={dest}
                onChange={setDest}
                onSelect={(addr, _pid, lat, lng) => { setDest(addr); setDestLat(lat); setDestLng(lng) }}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Date + Pax + Luggage + Submit */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'stretch' }}>
          <div style={{ ...skewWrap, flex: 2 }}>
            <div style={skewInner}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" style={{ flexShrink: 0 }}>
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              <input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} aria-label={es ? 'Fecha y hora de recogida' : 'Pickup date and time'} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: datetime ? '#242426' : '#64748b', fontFamily: 'inherit', width: '100%' }} />
            </div>
          </div>

          <div style={{ ...skewWrap, flex: '0 0 auto' }}>
            <div style={skewInner}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <select value={pax} onChange={e => setPax(Number(e.target.value))} aria-label={es ? 'Número de pasajeros' : 'Number of passengers'} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: '#242426', fontFamily: 'inherit', cursor: 'pointer' }}>
                {[...Array(16)].map((_, i) => <option key={i+1} value={i+1}>{i+1} pax</option>)}
              </select>
            </div>
          </div>

          <div style={{ ...skewWrap, flex: '0 0 auto' }}>
            <div style={skewInner}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" style={{ flexShrink: 0 }}>
                <rect x="6" y="4" width="12" height="16" rx="2"/><path d="M10 4V2h4v2M8 11h8"/>
              </svg>
              <select value={lug} onChange={e => setLug(Number(e.target.value))} aria-label={es ? 'Número de maletas' : 'Number of bags'} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: '#242426', fontFamily: 'inherit', cursor: 'pointer' }}>
                {[...Array(11)].map((_, i) => <option key={i} value={i}>{i} {es ? (i === 1 ? 'maleta' : 'maletas') : (i === 1 ? 'bag' : 'bags')}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" aria-label={es ? 'Calcular precio' : 'Get a price'} style={{ background: '#242426', border: 'none', cursor: 'pointer', padding: '0 1.5rem', transform: 'skewX(-8deg)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" style={{ transform: 'skewX(8deg)' }}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

      </div>
    </form>
  )
}
