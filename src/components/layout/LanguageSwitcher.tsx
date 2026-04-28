'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { locales, type Locale } from '@/lib/i18n/config'

const flags: Record<Locale, string> = {
  en: 'https://flagcdn.com/gb.svg',
  es: 'https://flagcdn.com/es.svg',
}

/**
 * Reads the <link rel="alternate" hreflang="..."> tag injected by metadata.alternates
 * so that pages with translated slugs (routes, cities, countries, etc.) jump to the exact
 * equivalent URL instead of the same slug under a wrong prefix.
 */
function getAlternateUrl(targetLocale: Locale): string | null {
  if (typeof window === 'undefined') return null
  const link = document.querySelector<HTMLLinkElement>(
    `link[rel="alternate"][hreflang="${targetLocale}"]`
  )
  if (!link?.href) return null
  try {
    const url = new URL(link.href)
    return url.pathname + url.search + url.hash
  } catch {
    return null
  }
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function handleChange(newLocale: Locale) {
    const alt = getAlternateUrl(newLocale)
    if (alt) {
      // Navigate directly to the translated URL declared by the page's metadata
      window.location.href = alt
    } else {
      // Fallback to next-intl auto-translation by pathname pattern
      router.replace(pathname, { locale: newLocale })
    }
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          cursor: 'pointer',
          background: 'transparent',
          border: '2px solid #242426',
          color: '#242426',
          padding: '0.4rem 0.9rem',
          fontSize: '0.875rem',
          fontWeight: 700,
          transform: 'skewX(-12deg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontFamily: 'inherit',
        }}
      >
        <img src={flags[locale]} alt={locale} style={{ display: 'inline-block', transform: 'skewX(12deg)', width: '18px', height: '13px', objectFit: 'cover', borderRadius: '2px' }} />
        <span style={{ display: 'inline-block', transform: 'skewX(12deg)' }}>
          {locale.toUpperCase()}
        </span>
        <svg
          style={{ transform: `skewX(12deg) rotate(${open ? 180 : 0}deg)`, transition: 'transform 0.2s', width: '12px', height: '12px', flexShrink: 0 }}
          fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          minWidth: '70px',
        }}>
          {locales.filter(l => l !== locale).map(l => (
            <button
              key={l}
              onClick={() => handleChange(l as Locale)}
              style={{
                cursor: 'pointer',
                background: '#242426',
                color: '#ffffff',
                border: 'none',
                padding: '0.4rem 0.9rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                transform: 'skewX(-12deg)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                width: '100%',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <img src={flags[l]} alt={l} style={{ display: 'inline-block', transform: 'skewX(12deg)', width: '18px', height: '13px', objectFit: 'cover', borderRadius: '2px' }} />
              <span style={{ display: 'inline-block', transform: 'skewX(12deg)' }}>
                {l.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
