import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Payload {
  name?: string
  email?: string
  message?: string
  locale?: string
  // Hidden honeypot field. Browsers don't fill it, bots usually do.
  website?: string
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

// Strip control chars (incl. CR/LF) so attacker-controlled values can't inject
// extra SMTP headers via Subject / Reply-To (CRLF injection -> open relay).
function stripControl(s: string) {
  return s.replace(/\p{Cc}/gu, ' ').trim()
}

// In-memory rate limit: 5 messages per IP per hour. Lives only as long as
// the Node process — fine for a single-replica Coolify deploy. Move to
// Upstash / Redis if we ever scale horizontally.
const RATE_WINDOW_MS = 60 * 60 * 1000
const RATE_MAX = 5
const ipHits = new Map<string, { count: number; resetAt: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || entry.resetAt < now) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > RATE_MAX
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(req: NextRequest) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  let body: Payload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  // Honeypot — silently accept then drop, so bots don't realise they were
  // filtered and keep wasting their cycles on us.
  if (body.website && body.website.trim()) {
    return NextResponse.json({ ok: true })
  }

  const name = stripControl((body.name || '').toString()).slice(0, 200)
  const email = stripControl((body.email || '').toString()).slice(0, 200)
  const message = (body.message || '').toString().trim().slice(0, 5000)
  const locale = stripControl((body.locale || 'en').toString()).slice(0, 5)

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const to = process.env.CONTACT_TO || 'info@titantransfers.com'
  const from = process.env.SMTP_FROM || user

  if (!host || !user || !pass) {
    console.error('[contact] Missing SMTP env vars')
    return NextResponse.json({ error: 'smtp_not_configured' }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  const subject = `[Titan Transfers] New contact form message from ${name}`
  const text = `From: ${name} <${email}>
Locale: ${locale}

${message}
`
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="color:#242426">New message from titantransfers.com</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p><strong>Locale:</strong> ${escapeHtml(locale)}</p>
      <p><strong>Message:</strong></p>
      <div style="white-space:pre-wrap;background:#F8FAF0;border-left:3px solid #8BAA1D;padding:12px 16px">${escapeHtml(message)}</div>
    </div>
  `

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: `${name} <${email}>`,
      subject,
      text,
      html,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact] sendMail failed:', err)
    return NextResponse.json({ error: 'send_failed' }, { status: 500 })
  }
}
