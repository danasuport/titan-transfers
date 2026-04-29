import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'
import { getLocale } from 'next-intl/server'
import { russoOne, archivo } from '@/lib/fonts'
import { CookieConsent } from '@/components/ui/CookieConsent'
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
        {/* Google tag (gtag.js) — loads once, configures GA4 + Google Ads */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          gtag('js', new Date());
          gtag('config', '${GA4_ID}');
          gtag('config', '${GAds_ID}');
        `}</Script>
      </head>
      <body className={`${archivo.className} min-h-screen bg-white antialiased`}>
        {children}
        <CookieConsent locale={locale} />
      </body>
    </html>
  )
}
