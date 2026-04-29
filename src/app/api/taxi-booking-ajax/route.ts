import { NextRequest, NextResponse } from 'next/server'

// Origin of the WordPress install where the Taxi Booking Plugin runs.
// While DNS still points to SiteGround this is the apex domain. After the
// final DNS cutover this should be set to whatever hostname keeps the WP
// backend reachable (subdomain alias, etc.).
const WP_ORIGIN = (process.env.NEXT_PUBLIC_WP_BOOKING_URL || 'https://titantransfers.com').replace(/\/+$/, '')
const WP_AJAX_URL = `${WP_ORIGIN}/wp-admin/admin-ajax.php`

// Headers we shouldn't forward back to the browser. Hop-by-hop + cookies set
// by WP for its own domain (we re-set them ourselves with the Next.js domain).
const STRIPPED_RESPONSE_HEADERS = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'content-encoding',
  'content-length',
  'set-cookie',
])

async function proxy(request: NextRequest, method: 'POST' | 'GET') {
  // Forward client cookies so WP recognises the user's PHP session and any
  // taxi_user_id cookie set by the plugin login flow.
  const cookieHeader = request.headers.get('cookie') || ''
  const userAgent = request.headers.get('user-agent') || 'titan-next-proxy/1'
  const referer = request.headers.get('referer') || `${WP_ORIGIN}/booking/`

  const init: RequestInit = {
    method,
    headers: {
      cookie: cookieHeader,
      'user-agent': userAgent,
      referer,
      'x-forwarded-for': request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
      accept: request.headers.get('accept') || 'application/json, text/plain, */*',
      'accept-language': request.headers.get('accept-language') || 'en',
    },
    redirect: 'manual',
  }

  let url = WP_AJAX_URL
  if (method === 'POST') {
    const contentType = request.headers.get('content-type') || ''
    ;(init.headers as Record<string, string>)['content-type'] = contentType
    init.body = await request.arrayBuffer()
  } else {
    const search = request.nextUrl.search
    if (search) url += search
  }

  let upstream: Response
  try {
    upstream = await fetch(url, init)
  } catch (err) {
    return NextResponse.json(
      { success: false, data: { message: 'Booking backend unreachable. Try again in a moment.' } },
      { status: 502 },
    )
  }

  const body = await upstream.arrayBuffer()
  const out = new NextResponse(body, { status: upstream.status })

  upstream.headers.forEach((value, key) => {
    if (STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) return
    out.headers.set(key, value)
  })

  // Forward Set-Cookie headers but rewrite the Domain attribute so cookies
  // attach to the Next.js host instead of the WP host. Path stays as-is.
  const setCookies = upstream.headers.getSetCookie?.() || []
  for (const raw of setCookies) {
    const rewritten = raw
      .replace(/;\s*Domain=[^;]+/i, '')
      .replace(/;\s*Secure(\s*;|$)/i, '$1')
    out.headers.append('set-cookie', rewritten)
  }

  return out
}

export async function POST(request: NextRequest) {
  return proxy(request, 'POST')
}

export async function GET(request: NextRequest) {
  return proxy(request, 'GET')
}
