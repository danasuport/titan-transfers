import { NextRequest, NextResponse } from 'next/server'

// Hardening: this endpoint hits a paid OpenAI API and is only meant to be
// called from the Sanity Studio "Generate Translation" action. Without these
// gates anyone could POST to it and run up the OPENAI_API_KEY bill.
//
//   - Strict targetLang allowlist (no free-form strings)
//   - 5000-char cap on text + 200-char cap on context
//   - In-memory IP rate limit (10 req / 60s)
//   - Origin/Referer must come from /studio (rejected otherwise)

export const runtime = 'nodejs'

const ALLOWED_LANGS: Record<string, string> = {
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  ru: 'Russian',
}

const MAX_TEXT = 5000
const MAX_CONTEXT = 200
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10

const ipHits = new Map<string, { count: number; resetAt: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || entry.resetAt < now) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  entry.count++
  if (entry.count > RATE_LIMIT_MAX) return true
  return false
}

function fromStudio(req: NextRequest): boolean {
  const referer = req.headers.get('referer') || ''
  const origin = req.headers.get('origin') || ''
  // Accept either the production studio path or local dev variants.
  const looksLikeStudio = referer.includes('/studio') || origin.includes('/studio')
  if (looksLikeStudio) return true
  // Also accept calls from the same host (when Sanity Studio is mounted
  // at /studio of titantransfers.com itself, the referer header includes
  // the full URL with the /studio path).
  return false
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(req: NextRequest) {
  if (!fromStudio(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const ip = clientIp(req)
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
  }

  let body: { text?: unknown; targetLang?: unknown; context?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const text = typeof body.text === 'string' ? body.text.slice(0, MAX_TEXT) : ''
  const targetLang = typeof body.targetLang === 'string' ? body.targetLang : ''
  const context = typeof body.context === 'string' ? body.context.slice(0, MAX_CONTEXT) : ''

  if (!text || !targetLang) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }
  const langName = ALLOWED_LANGS[targetLang]
  if (!langName) {
    return NextResponse.json({ error: 'unsupported_lang' }, { status: 400 })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specializing in travel and transport content. Translate the following text to ${langName}. Maintain the same tone, SEO keywords, and formatting. Do not translate brand names like "Titan Transfers".${context ? ` Context: ${context}` : ''}`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      console.error('[translate] OpenAI returned', response.status)
      return NextResponse.json({ error: 'upstream_failed' }, { status: 502 })
    }
    const data = await response.json()
    const translation = data.choices?.[0]?.message?.content
    return NextResponse.json({ translation })
  } catch (error) {
    console.error('[translate] fetch error:', error)
    return NextResponse.json({ error: 'translation_failed' }, { status: 500 })
  }
}
