import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'
import { getLocale } from 'next-intl/server'
import { russoOne, archivo } from '@/lib/fonts'
import { CookieConsent } from '@/components/ui/CookieConsent'
import { GtagLoader } from '@/components/analytics/GtagLoader'
import '@/app/globals.css'

const GA4_ID = 'G-MNJCJ137ZL'
const GAds_ID = 'AW-17350153035'

export const metadata: Metadata = {
  title: {
    default: 'Titan Transfers | Private Airport Transfers Worldwide',
    template: '%s',
  },
  description:
    'Private airport transfers and taxi service worldwide. 100+ destinations, fixed prices, meet & greet, 24/7 support. Book your door-to-door transfer online.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://titantransfers.com'),
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale()
  return (
    <html lang={locale} className={`${russoOne.variable} ${archivo.variable}`}>
      <head>
        {/* Google Consent Mode v2 — default DENIED until the user accepts the cookie banner */}
        <Script id="gtag-consent-default" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          var stored = (document.cookie.match(/(?:^|; )tt-cookie-consent=([^;]*)/) || [])[1];
          var granted = stored === 'granted' ? 'granted' : 'denied';
          gtag('consent', 'default', {
            ad_storage: granted,
            analytics_storage: granted,
            ad_user_data: granted,
            ad_personalization: granted,
            wait_for_update: 500,
          });
        `}</Script>
        {/* gtag.js itself is loaded by GtagLoader after the user grants consent
            in the banner. The defaults above are just no-op declarations until
            then. AEPD requires that no network request to GTM/GA fires before
            consent — even loading the script is considered tracking. */}
      </head>
      <body className={`${archivo.className} min-h-screen bg-white antialiased`}>
        {children}
        <CookieConsent locale={locale} />
        <GtagLoader ga4Id={GA4_ID} googleAdsId={GAds_ID} />
      </body>
    </html>
  )
}
