'use client'

import { useState, useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''
const ETO_BASE = 'https://titantransfers.com/booking/'
const GADS_ID = 'AW-17350153035'
const CONVERSION_LABEL = 'qeFlCP6D9aobEMummdFA'

function fireConversion() {
  try {
    const w = window as any
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'conversion', {
        send_to: `${GADS_ID}/${CONVERSION_LABEL}`,
      })
    }
  } catch {}
}

declare global {
  interface Window {
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

function PlaceInput({ placeholder, onSelect, value, onChange }: {
  placeholder: string
  onSelect: (address: string, placeId: string) => void
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
        if (place?.formatted_address && place?.place_id) {
          onSelect(place.formatted_address, place.place_id)
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
      style={{
        width: '100%', border: 'none', outline: 'none',
        background: 'transparent', fontSize: '0.9rem',
        color: '#242426', fontFamily: 'inherit',
      }}
    />
  )
}

export function BookingForm() {
  const locale = useLocale()
  const es = locale === 'es'

  const [pickup, setPickup] = useState('')
  const [pickupPid, setPickupPid] = useState('')
  const [dest, setDest] = useState('')
  const [destPid, setDestPid] = useState('')
  const [datetime, setDatetime] = useState('')
  const [pax, setPax] = useState(1)
  const [lug, setLug] = useState(0)

  const fieldStyle = {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    border: '2px solid #e5e7eb', background: '#ffffff',
    padding: '0.6rem 0.85rem', flex: 1,
  }

  const iconColor = '#242426'

  function buildUrl() {
    const [datePart, timePart] = datetime ? datetime.split('T') : ['', '12:00']
    const d = datePart ? datePart.split('-').reverse().join('/') : ''
    const params = new URLSearchParams({
      type: 'transfer', step: '2',
      pickup, pickup_pid: pickupPid,
      dest, dest_pid: destPid,
      date: d, time: timePart ?? '12:00',
      pax: String(pax), lug: String(lug),
    })
    return `${ETO_BASE}?${params.toString()}`
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    window.location.href = buildUrl()
  }

  const skewWrap: React.CSSProperties = { transform: 'skewX(-8deg)', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '2px solid #e5e7eb', background: '#ffffff', padding: '0.6rem 0.85rem' }
  const skewInner: React.CSSProperties = { transform: 'skewX(8deg)', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }

  return (
    <>
      <form onSubmit={handleSubmit} style={{ background: '#8BAA1D', border: '2px solid #8BAA1D', transform: 'skewX(-8deg)', padding: '1.25rem 1.75rem' }}>

        {/* Single row */}
        <div style={{ transform: 'skewX(8deg)', display: 'flex', gap: '0.6rem', alignItems: 'stretch' }}>

          {/* Pickup */}
          <div style={{ ...skewWrap, flex: 3 }}>
            <div style={skewInner}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 13-8 13S4 15.25 4 10a8 8 0 0 1 8-8z"/>
              </svg>
              <PlaceInput
                placeholder={es ? 'Origen — aeropuerto, hotel...' : 'Pickup — airport, hotel...'}
                value={pickup}
                onChange={setPickup}
                onSelect={(addr, pid) => { setPickup(addr); setPickupPid(pid) }}
              />
            </div>
          </div>

          {/* Dest */}
          <div style={{ ...skewWrap, flex: 3 }}>
            <div style={skewInner}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 13-8 13S4 15.25 4 10a8 8 0 0 1 8-8z"/>
              </svg>
              <PlaceInput
                placeholder={es ? 'Destino — hotel, aeropuerto...' : 'Drop-off — hotel, airport...'}
                value={dest}
                onChange={setDest}
                onSelect={(addr, pid) => { setDest(addr); setDestPid(pid) }}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div style={{ ...skewWrap, flex: 2 }}>
            <div style={skewInner}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" style={{ flexShrink: 0 }}>
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              <input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: datetime ? '#242426' : '#94a3b8', fontFamily: 'inherit', width: '100%' }} />
            </div>
          </div>

          {/* Passengers */}
          <div style={{ ...skewWrap, flex: '0 0 auto' }}>
            <div style={skewInner}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <select value={pax} onChange={e => setPax(Number(e.target.value))} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: '#242426', fontFamily: 'inherit', cursor: 'pointer' }}>
                {[...Array(16)].map((_, i) => <option key={i+1} value={i+1}>{i+1} pax</option>)}
              </select>
            </div>
          </div>

          {/* Luggage */}
          <div style={{ ...skewWrap, flex: '0 0 auto' }}>
            <div style={skewInner}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" style={{ flexShrink: 0 }}>
                <rect x="6" y="4" width="12" height="16" rx="2"/><path d="M10 4V2h4v2M8 11h8"/>
              </svg>
              <select value={lug} onChange={e => setLug(Number(e.target.value))} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: '#242426', fontFamily: 'inherit', cursor: 'pointer' }}>
                {[...Array(11)].map((_, i) => <option key={i} value={i}>{i} {es ? (i === 1 ? 'maleta' : 'maletas') : (i === 1 ? 'bag' : 'bags')}</option>)}
              </select>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" style={{ background: '#242426', border: 'none', cursor: 'pointer', padding: '0 1.5rem', transform: 'skewX(-8deg)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" style={{ transform: 'skewX(8deg)' }}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

        </div>
      </form>

    </>
  )
}
