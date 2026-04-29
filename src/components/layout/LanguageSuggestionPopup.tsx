'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import type { Locale } from '@/lib/i18n/config'

const STORAGE_KEY = 'tt-lang-suggestion-dismissed'

/**
 * Suggests an alternate language if the visitor's browser is in ES but they're viewing EN
 * (or vice versa). Never auto-redirects — the user has to click. Once dismissed, stored in
 * localStorage so it doesn't pester them on every page.
 */
export function LanguageSuggestionPopup() {
  const currentLocale = useLocale() as Locale
  const [show, setShow] = useState(false)
  const [suggestedUrl, setSuggestedUrl] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(STORAGE_KEY) === '1') return

    // Detect browser language
    const browserLang = (navigator.language || 'en').toLowerCase()
    const browserIsEs = browserLang.startsWith('es')
    const browserIsEn = browserLang.startsWith('en')

    let targetLocale: Locale | null = null
    if (browserIsEs && currentLocale !== 'es') targetLocale = 'es'
    else if (browserIsEn && currentLocale !== 'en') targetLocale = 'en'

    if (!targetLocale) return

    // Find the alternate URL declared by the page's metadata
    const link = document.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${targetLocale}"]`
    )
    if (link?.href) {
      try {
        const u = new URL(link.href)
        setSuggestedUrl(u.pathname + u.search + u.hash)
        setShow(true)
      } catch { /* ignore */ }
    } else {
      // Fallback: prefix the current path with the target locale
      const path = window.location.pathname
      const stripped = path.replace(/^\/(en|es)\//, '/')
      setSuggestedUrl(targetLocale === 'es' ? `/es${stripped}` : stripped)
      setShow(true)
    }
  }, [currentLocale])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setShow(false)
  }

  function accept() {
    localStorage.setItem(STORAGE_KEY, '1')
    if (suggestedUrl) window.location.href = suggestedUrl
  }

  if (!show || !suggestedUrl) return null

  const isEs = currentLocale === 'en' // we're suggesting ES because page is EN
  const message = isEs
    ? '¿Prefieres ver la web en español?'
    : 'Would you like to view this site in English?'
  const accept_label = isEs ? 'Sí, español' : 'Yes, English'
  const dismiss_label = isEs ? 'No, gracias' : 'No, thanks'

  return (
    <div
      role="dialog"
      aria-label={message}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        background: '#ffffff',
        border: '2px solid #242426',
        boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
        padding: '1.25rem 1.5rem',
        maxWidth: 'min(380px, calc(100vw - 3rem))',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ width: '36px', height: '3px', background: '#8BAA1D', marginBottom: '0.75rem' }} />
      <p style={{ fontSize: '0.95rem', color: '#242426', marginBottom: '1rem', lineHeight: 1.4, fontWeight: 600 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={accept}
          style={{
            cursor: 'pointer',
            background: '#8BAA1D',
            color: '#ffffff',
            border: 'none',
            padding: '0.55rem 1.1rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            transform: 'skewX(-10deg)',
            fontFamily: 'inherit',
          }}
        >
          <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>{accept_label}</span>
        </button>
        <button
          onClick={dismiss}
          style={{
            cursor: 'pointer',
            background: 'transparent',
            color: '#242426',
            border: '1.5px solid #cbd5e1',
            padding: '0.55rem 1.1rem',
            fontWeight: 600,
            fontSize: '0.85rem',
            transform: 'skewX(-10deg)',
            fontFamily: 'inherit',
          }}
        >
          <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>{dismiss_label}</span>
        </button>
      </div>
      <button
        onClick={dismiss}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          color: '#64748b',
        }}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
