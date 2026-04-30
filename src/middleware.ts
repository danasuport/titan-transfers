import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from '@/lib/i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Production hosts. Anything else (sslip.io, IP, preview domains, localhost)
// is treated as non-canonical and gets a strict noindex so Google never
// indexes a staging URL as a duplicate of the live site.
const PROD_HOSTS = new Set(['titantransfers.com', 'www.titantransfers.com'])

function isProdHost(host: string): boolean {
  // Strip the port if present (e.g. "titantransfers.com:443").
  const bare = host.split(':')[0].toLowerCase()
  return PROD_HOSTS.has(bare)
}

export default function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const prod = isProdHost(host)

  // Override /robots.txt on non-prod hosts BEFORE the intl middleware runs,
  // so the staging deployment never serves an "Allow: /" robots.
  if (!prod && req.nextUrl.pathname === '/robots.txt') {
    return new NextResponse('User-agent: *\nDisallow: /\n', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }

  const response = intlMiddleware(req)

  // Belt-and-braces: also send X-Robots-Tag on every page response from
  // non-prod hosts. Even if the bot ignores robots.txt, this header is
  // honoured by Google as a per-page noindex directive.
  if (!prod) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return response
}

export const config = {
  matcher: ['/', '/(es)/:path*', '/((?!api|_next|_vercel|studio|.*\\..*).*)', '/robots.txt'],
}
