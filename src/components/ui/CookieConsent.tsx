'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { pick } from '@/lib/i18n/pick'

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

  useEffect(() => {
    if (readConsent() === null) setVisible(true)
  }, [])

  function handleAccept() {
    writeConsent('granted')
    updateGtagConsent(true)
    // Tells GtagLoader to mount the gtag.js scripts now that consent is in.
    window.dispatchEvent(new Event('tt-consent-changed'))
    setVisible(false)
  }

  function handleReject() {
    writeConsent('denied')
    updateGtagConsent(false)
    window.dispatchEvent(new Event('tt-consent-changed'))
    setVisible(false)
  }

  if (!visible) return null

  const policyHref = pick(locale, {
    en: '/cookies/',
    es: '/es/cookies/',
    ar: '/ar/siyasat-cookies/',
    it: '/it/cookies/',
  })

  return (
    <div
      role="dialog"
      aria-label={pick(locale, { en: 'Cookie notice', es: 'Aviso de cookies', ar: 'إشعار الكوكيز', it: 'Avviso sui cookie' })}
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
          {pick(locale, {
            en: 'We use necessary technical cookies and, with your consent, analytics and advertising cookies to improve our services. ',
            es: 'Usamos cookies técnicas necesarias y, si lo aceptas, cookies analíticas y publicitarias para mejorar nuestros servicios. ',
            ar: 'نستخدم كوكيز تقنية ضرورية، وبموافقتك، كوكيز تحليلية وإعلانية لتحسين خدماتنا. ',
            it: 'Utilizziamo cookie tecnici necessari e, se accetti, cookie analitici e pubblicitari per migliorare i nostri servizi.',
          })}
          <Link href={policyHref as never} style={{ color: '#6B8313', textDecoration: 'underline' }}>
            {pick(locale, { en: 'Cookie policy', es: 'Política de cookies', ar: 'سياسة الكوكيز', it: 'Politica sui cookie' })}
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
            {pick(locale, { en: 'Reject', es: 'Rechazar', ar: 'رفض', it: 'Rifiuta' })}
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
            {pick(locale, { en: 'Accept', es: 'Aceptar', ar: 'قبول', it: 'Accetta' })}
          </button>
        </div>
      </div>
    </div>
  )
}
