import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Payload {
  name?: string
  email?: string
  message?: string
  locale?: string
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

export async function POST(req: NextRequest) {
  let body: Payload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const name = (body.name || '').toString().trim().slice(0, 200)
  const email = (body.email || '').toString().trim().slice(0, 200)
  const message = (body.message || '').toString().trim().slice(0, 5000)
  const locale = (body.locale || 'en').toString().slice(0, 5)

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
