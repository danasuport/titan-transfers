'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { locales, type Locale } from '@/lib/i18n/config'

// Inline SVG flags — render reliably on every OS, even if emoji flags are not supported (Windows)
function FlagGB() {
  return (
    <svg viewBox="0 0 60 30" width="18" height="13" style={{ display: 'block', borderRadius: '2px', overflow: 'hidden' }} aria-hidden="true">
      <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  )
}

function FlagES() {
  return (
    <svg viewBox="0 0 60 40" width="18" height="13" style={{ display: 'block', borderRadius: '2px', overflow: 'hidden' }} aria-hidden="true">
      <rect width="60" height="40" fill="#AA151B"/>
      <rect y="10" width="60" height="20" fill="#F1BF00"/>
    </svg>
  )
}

const Flag: Record<Locale, () => React.ReactElement> = {
  en: FlagGB,
  es: FlagES,
}

/**
 * Reads the <link rel="alternate" hreflang="..."> tag injected by metadata.alternates
 * so that pages with translated slugs jump to the exact equivalent URL.
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
      window.location.href = alt
    } else {
      router.replace(pathname, { locale: newLocale })
    }
    setOpen(false)
  }

  const CurrentFlag = Flag[locale]

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
          gap: '0.5rem',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ display: 'inline-flex', transform: 'skewX(12deg)' }}>
          <CurrentFlag />
        </span>
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
          {locales.filter(l => l !== locale).map(l => {
            const F = Flag[l as Locale]
            return (
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
                  gap: '0.5rem',
                  width: '100%',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ display: 'inline-flex', transform: 'skewX(12deg)' }}><F /></span>
                <span style={{ display: 'inline-block', transform: 'skewX(12deg)' }}>{l.toUpperCase()}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
