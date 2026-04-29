import { NextRequest, NextResponse } from 'next/server'

// Proxy that fetches the WP /booking/ page (where the Taxi Booking
// Plugin shortcode lives) and pipes the HTML back to the browser,
// keeping cookies in sync in BOTH directions:
//   - request: forwards the user's cookies to WP so PHP sessions stick
//   - response: forwards Set-Cookie from WP, with Domain stripped, so
//     the browser stores PHPSESSID under the Next.js host. The browser
//     can then send it back on subsequent /api/taxi-booking-ajax calls,
//     keeping the wp_localize_script nonce valid.
const WP_ORIGIN = (process.env.NEXT_PUBLIC_WP_BOOKING_URL || 'https://titantransfers.com').replace(/\/+$/, '')

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search
  const url = `${WP_ORIGIN}/booking/${search || ''}`

  const cookieHeader = request.headers.get('cookie') || ''

  let upstream: Response
  try {
    upstream = await fetch(url, {
      headers: {
        cookie: cookieHeader,
        'user-agent': request.headers.get('user-agent') || 'titan-next-html-proxy/1',
        accept: 'text/html',
        'accept-language': request.headers.get('accept-language') || 'en',
      },
      redirect: 'manual',
      cache: 'no-store',
    })
  } catch {
    return new NextResponse('Booking system temporarily unavailable.', { status: 502 })
  }

  const html = await upstream.text()
  const out = new NextResponse(html, {
    status: upstream.status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })

  const setCookies = upstream.headers.getSetCookie?.() || []
  for (const raw of setCookies) {
    const rewritten = raw
      .replace(/;\s*Domain=[^;]+/i, '')
      .replace(/;\s*Secure(\s*;|$)/i, '$1')
    out.headers.append('set-cookie', rewritten)
  }

  return out
}
