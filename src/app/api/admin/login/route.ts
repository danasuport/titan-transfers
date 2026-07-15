import { NextRequest, NextResponse } from 'next/server'
import { checkPassword, buildSessionValue, SESSION_COOKIE } from '@/lib/admin/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const password = String(form.get('password') || '')

  if (!checkPassword(password)) {
    // Blunt delay to make brute-forcing the shared password tedious.
    await new Promise(r => setTimeout(r, 1000))
    return NextResponse.redirect(new URL('/admin/?error=1', req.url), { status: 303 })
  }

  const { value, maxAge } = buildSessionValue()
  const res = NextResponse.redirect(new URL('/admin/searches/', req.url), { status: 303 })
  res.cookies.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  })
  return res
}
