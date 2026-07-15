import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

// Minimal auth for the internal search-demand dashboard: one shared password
// (ADMIN_PASSWORD) exchanged for a signed cookie. The cookie carries no user
// data, just an expiry + HMAC, so it can't be forged without the secret.

const COOKIE_NAME = 'titan_admin'
const MAX_AGE_SECONDS = 60 * 60 * 12 // 12h — a working day, then log in again.

function secret(): string {
  const s = process.env.ADMIN_PASSWORD
  if (!s) throw new Error('ADMIN_PASSWORD is not set')
  return s
}

function sign(expiresAt: number): string {
  return createHmac('sha256', secret()).update(String(expiresAt)).digest('hex')
}

/** Constant-time compare so we don't leak the password through timing. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

export function checkPassword(input: string): boolean {
  if (!process.env.ADMIN_PASSWORD) return false
  return safeEqual(input, process.env.ADMIN_PASSWORD)
}

export function buildSessionValue(): { value: string; maxAge: number } {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000
  return { value: `${expiresAt}.${sign(expiresAt)}`, maxAge: MAX_AGE_SECONDS }
}

export const SESSION_COOKIE = COOKIE_NAME

export async function isAuthed(): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false
  const jar = await cookies()
  const raw = jar.get(COOKIE_NAME)?.value
  if (!raw) return false

  const [expiresRaw, mac] = raw.split('.')
  const expiresAt = Number(expiresRaw)
  if (!expiresAt || !mac) return false
  if (Date.now() > expiresAt) return false

  try {
    return safeEqual(mac, sign(expiresAt))
  } catch {
    return false
  }
}
