import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { russoOne, archivo } from '@/lib/fonts'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Titan Transfers | Private Airport Transfers Worldwide',
    template: '%s | Titan Transfers',
  },
  description:
    'Private airport transfers and taxi service worldwide. 100+ destinations, fixed prices, meet & greet, 24/7 support. Book your door-to-door transfer online.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://titantransfers.com'),
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={`${russoOne.variable} ${archivo.variable}`}>
      <body className={`${archivo.className} min-h-screen bg-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
