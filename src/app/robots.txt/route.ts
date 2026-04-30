import { NextRequest, NextResponse } from 'next/server'

// Dynamic robots.txt: serves a real robots policy on the production host
// and a hard "Disallow: /" everywhere else (sslip.io, raw IP, preview
// hostnames). Living here as a route handler instead of in middleware so
// that no other page is forced into dynamic rendering — pages keep their
// ISR cache.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PROD_HOSTS = new Set(['titantransfers.com', 'www.titantransfers.com'])

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://titantransfers.com'

const PROD_BODY = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /studio/
Disallow: /_next/
Disallow: /login/
Disallow: /es/acceso/

Sitemap: ${SITE_URL}/sitemap.xml
`

const NON_PROD_BODY = `User-agent: *
Disallow: /
`

export function GET(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase()
  const isProd = PROD_HOSTS.has(host)
  return new NextResponse(isProd ? PROD_BODY : NON_PROD_BODY, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': isProd ? 'public, max-age=3600' : 'public, max-age=300',
      ...(isProd ? {} : { 'X-Robots-Tag': 'noindex, nofollow' }),
    },
  })
}
