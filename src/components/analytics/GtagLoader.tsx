'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

// Loads googletagmanager.com / GA4 + Google Ads ONLY after the user grants
// consent in the cookie banner. Spain's AEPD treats the network request to
// googletagmanager.com itself as a tracking act that requires prior consent,
// so even though Consent Mode v2 already gates storage, we must not fire
// that request on first paint.

const COOKIE_NAME = 'tt-cookie-consent'

interface Props {
  ga4Id: string
  googleAdsId: string
}

function readConsentGranted(): boolean {
  if (typeof document === 'undefined') return false
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  return match?.[1] === 'granted'
}

export function GtagLoader({ ga4Id, googleAdsId }: Props) {
  const [granted, setGranted] = useState(false)

  useEffect(() => {
    setGranted(readConsentGranted())
    function onChange() { setGranted(readConsentGranted()) }
    // CookieConsent fires this when the user clicks Accept / Reject.
    window.addEventListener('tt-consent-changed', onChange)
    return () => window.removeEventListener('tt-consent-changed', onChange)
  }, [])

  if (!granted) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">{`
        gtag('js', new Date());
        gtag('config', '${ga4Id}');
        gtag('config', '${googleAdsId}');
      `}</Script>
    </>
  )
}
