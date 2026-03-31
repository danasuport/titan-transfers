import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  trailingSlash: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
    ],
  },
  async redirects() {
    const airportRedirects = [
      ['barcelona-el-prat-airport', 'barcelona-airport-transfers'],
      ['girona-costa-brava-airport', 'girona-airport-transfers'],
      ['reus-airport', 'reus-airport-transfers'],
      ['prague-airport-prg-airport-transfers', 'prague-airport-transfers'],
      ['dallas-fort-worth-airport-transfers', 'dallas-airport-transfers'],
      ['los-angeles-lax-airport-transfers', 'los-angeles-airport-transfers'],
      ['marrakesh-airport-transfers', 'marrakech-airport-transfers'],
    ].flatMap(([from, to]) => [
      { source: `/airport/${from}/`, destination: `/airport/${to}/`, permanent: true },
      { source: `/es/aeropuerto/${from}/`, destination: `/es/aeropuerto/${to}/`, permanent: true },
    ])
    return airportRedirects
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)\\.(jpg|jpeg|png|webp|avif|svg|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
