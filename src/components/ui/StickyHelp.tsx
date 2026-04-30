'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'

const WHATSAPP = 'https://wa.me/16465030394'
const PHONE = 'tel:+34930477712'
const EMAIL = 'mailto:info@titantransfers.com'

export function StickyHelp() {
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  const label = locale === 'es' ? 'Ayuda' : 'Help'

  const options = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      href: WHATSAPP,
      bg: '#25D366',
      hoverBg: '#1da851',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
    {
      key: 'phone',
      label: locale === 'es' ? 'Teléfono' : 'Phone',
      href: PHONE,
      bg: '#242426',
      hoverBg: '#8BAA1D',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      href: EMAIL,
      bg: '#242426',
      hoverBg: '#8BAA1D',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      ),
    },
  ]

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '0.5rem',
    }}>

      {/* Options */}
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end', marginBottom: '0.25rem' }}>
          {options.map(opt => (
            <a
              key={opt.key}
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHovered(opt.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: hovered === opt.key ? opt.hoverBg : opt.bg,
                color: '#ffffff',
                textDecoration: 'none',
                padding: '0 1.25rem 0 1rem',
                height: '44px',
                transform: 'skewX(-8deg)',
                fontSize: '0.9rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                transition: 'background 0.15s',
                boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
              }}
            >
              <span style={{ transform: 'skewX(8deg)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {opt.icon}
                {opt.label}
              </span>
            </a>
          ))}
        </div>
      )}

      {/* Main trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered('main')}
        onMouseLeave={() => setHovered(null)}
        aria-label={label}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          background: hovered === 'main' ? '#8BAA1D' : '#242426',
          border: 'none',
          height: '50px',
          padding: '0 1.5rem 0 0',
          cursor: 'pointer',
          transform: 'skewX(-8deg)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.28)',
          transition: 'background 0.15s',
        }}
      >
        <span style={{
          width: '50px',
          height: '50px',
          background: '#8BAA1D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 55 56" fill="none">
              <path fill="#FFF" d="M29.57 20.65c.32 0 .457.13.457.43v20.707c0 .301-.137.43-.457.43H25c-.319 0-.456-.129-.456-.43V25.289H21.32c-.319 0-.456-.128-.456-.429v-3.78c0-.3.137-.43.456-.43h8.25zm.009-8.433c.316 0 .452.132.452.44v5.009c0 .308-.136.44-.452.44h-5.167c-.317 0-.454-.132-.454-.44v-5.01c0-.307.137-.44.454-.44h5.167z"/>
            </svg>
          )}
        </span>
        <span style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, paddingLeft: '0.75rem', transform: 'skewX(8deg)' }}>
          {label}
        </span>
      </button>

    </div>
  )
}
