import { NextRequest, NextResponse } from 'next/server'
import { checkPassword, buildSessionValue, SESSION_COOKIE } from '@/lib/admin/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Relative Location, never NextResponse.redirect(new URL(..., req.url)): behind
// Coolify's proxy the app only sees its internal bind address, so req.url is
// http://0.0.0.0:3000/… and the browser would be sent somewhere unreachable.
// A relative redirect is resolved by the browser against the real public URL.
function seeOther(path: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { Location: path } })
}

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const password = String(form.get('password') || '')

  if (!checkPassword(password)) {
    // Blunt delay to make brute-forcing the shared password tedious.
    await new Promise(r => setTimeout(r, 1000))
    return seeOther('/admin/?error=1')
  }

  const { value, maxAge } = buildSessionValue()
  const res = seeOther('/admin/searches/')
  res.cookies.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  })
  return res
}
