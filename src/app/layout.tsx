import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'
import { russoOne, archivo } from '@/lib/fonts'
import '@/app/globals.css'

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={`${russoOne.variable} ${archivo.variable}`}>
      <head>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GAds_ID}`} strategy="afterInteractive" />
        <Script id="google-ads" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GAds_ID}');
        `}</Script>
      </head>
      <body className={`${archivo.className} min-h-screen bg-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
