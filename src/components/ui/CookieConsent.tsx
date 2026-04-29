'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const COOKIE_NAME = 'tt-cookie-consent'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function readConsent(): 'granted' | 'denied' | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  if (!match) return null
  return match[1] === 'granted' ? 'granted' : 'denied'
}

function writeConsent(value: 'granted' | 'denied') {
  document.cookie = `${COOKIE_NAME}=${value}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`
}

function updateGtagConsent(granted: boolean) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  const value = granted ? 'granted' : 'denied'
  window.gtag('consent', 'update', {
    ad_storage: value,
    analytics_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  })
}

export function CookieConsent({ locale }: { locale: string }) {
  const [visible, setVisible] = useState(false)
  const es = locale === 'es'

  useEffect(() => {
    if (readConsent() === null) setVisible(true)
  }, [])

  function handleAccept() {
    writeConsent('granted')
    updateGtagConsent(true)
    setVisible(false)
  }

  function handleReject() {
    writeConsent('denied')
    updateGtagConsent(false)
    setVisible(false)
  }

  if (!visible) return null

  const policyHref = es ? '/es/cookies/' : '/cookies/'

  return (
    <div
      role="dialog"
      aria-label={es ? 'Aviso de cookies' : 'Cookie notice'}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <p style={{ flex: '1 1 320px', margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
          {es
            ? 'Usamos cookies técnicas necesarias y, si lo aceptas, cookies analíticas y publicitarias para mejorar nuestros servicios. '
            : 'We use necessary technical cookies and, with your consent, analytics and advertising cookies to improve our services. '}
          <Link href={policyHref as never} style={{ color: '#6B8313', textDecoration: 'underline' }}>
            {es ? 'Política de cookies' : 'Cookie policy'}
          </Link>
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleReject}
            style={{
              padding: '0.6rem 1.1rem',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            {es ? 'Rechazar' : 'Reject'}
          </button>
          <button
            type="button"
            onClick={handleAccept}
            style={{
              padding: '0.6rem 1.1rem',
              border: '1px solid #6B8313',
              background: '#6B8313',
              color: '#ffffff',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {es ? 'Aceptar' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  )
}
