// Server component: fetches the rendered booking widget HTML from the
// WordPress install (where the Taxi Booking Plugin lives) and embeds it
// inline. AJAX URLs are rewritten so the widget calls the Next.js proxy
// instead of admin-ajax.php directly. Strings, custom fields, currency
// list and pricing logic stay in the WP plugin so the client can keep
// editing them in their familiar admin.
//
// The plugin runs the full three-step flow on a single URL ("/booking/")
// and uses query string params (?step=2, ?step=3, plus pickup/dest/etc)
// to drive the wizard. Whatever query params arrive at the Next.js page
// are forwarded to the WP fetch so the upstream renders the right step.
import { cookies } from 'next/headers'

const WP_ORIGIN = (process.env.NEXT_PUBLIC_WP_BOOKING_URL || 'https://titantransfers.com').replace(/\/+$/, '')

type Extracted = {
  widgetHtml: string
  styleTags: string[]
  inlineConfig: string | null
  ajaxObject: Record<string, unknown> | null
}

function extractWidget(html: string): Extracted {
  const styleTags: string[] = []
  const styleRe = /<style[^>]*>[\s\S]*?<\/style>/gi
  for (const m of html.matchAll(styleRe)) {
    if (m[0].includes('taxi-booking-widget') || m[0].includes('--taxi-')) {
      styleTags.push(m[0])
    }
  }

  let widgetHtml = ''
  const openIdx = html.indexOf('id="taxi-booking-widget"')
  if (openIdx !== -1) {
    const divStart = html.lastIndexOf('<div', openIdx)
    if (divStart !== -1) {
      let depth = 0
      let i = divStart
      while (i < html.length) {
        const nextOpen = html.indexOf('<div', i + 1)
        const nextClose = html.indexOf('</div', i + 1)
        if (nextClose === -1) break
        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++
          i = nextOpen
        } else {
          if (depth === 0) {
            const closeEnd = html.indexOf('>', nextClose) + 1
            widgetHtml = html.slice(divStart, closeEnd)
            break
          }
          depth--
          i = nextClose
        }
      }
    }
  }

  let inlineConfig: string | null = null
  let ajaxObject: Record<string, unknown> | null = null
  const cfgMatch = html.match(/var\s+taxi_booking_ajax\s*=\s*(\{[\s\S]*?\});/)
  if (cfgMatch) {
    inlineConfig = cfgMatch[1]
    try {
      ajaxObject = JSON.parse(cfgMatch[1]) as Record<string, unknown>
    } catch {
      ajaxObject = null
    }
  }

  return { widgetHtml, styleTags, inlineConfig, ajaxObject }
}

export async function TaxiBookingWidget({
  locale = 'en',
  searchParams = {},
}: {
  locale?: string
  searchParams?: Record<string, string | string[] | undefined>
}) {
  // Build the upstream URL with the same query string the user hit. The
  // plugin reads ?step= / ?bid= / ?pickup= etc to render the appropriate
  // step. Drop empty/array values; WP expects flat strings.
  const upstreamParams = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const v of value) upstreamParams.append(key, v)
    } else {
      upstreamParams.set(key, value)
    }
  }
  if (locale === 'es' && !upstreamParams.has('lang')) upstreamParams.set('lang', 'es')
  const qs = upstreamParams.toString()
  const wpUrl = `${WP_ORIGIN}/booking/${qs ? `?${qs}` : ''}`

  // Forward the user's cookies so WP keeps the same PHP session state
  // (booking id, logged-in user, currency choice, etc.) across step
  // navigation triggered by window.location.href in the plugin JS.
  const cookieJar = await cookies()
  const cookieHeader = cookieJar
    .getAll()
    .map(c => `${c.name}=${c.value}`)
    .join('; ')

  let extracted: Extracted = { widgetHtml: '', styleTags: [], inlineConfig: null, ajaxObject: null }
  try {
    const res = await fetch(wpUrl, {
      headers: {
        'user-agent': 'titan-next-ssr/1',
        accept: 'text/html',
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
      cache: 'no-store',
    })
    if (res.ok) {
      const html = await res.text()
      extracted = extractWidget(html)
    }
  } catch {
    // Render fallback below
  }

  if (!extracted.widgetHtml) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        <p>Booking system temporarily unavailable. Please refresh the page.</p>
      </div>
    )
  }

  // Only override the AJAX target — the plugin's JS does its step navigation
  // with TBKParams.buildUrl('/booking', ...) so the step2_url / step3_url
  // fields in the localized config aren't actually consulted. Leave them.
  const finalAjax = {
    ...(extracted.ajaxObject || {}),
    ajax_url: '/api/taxi-booking-ajax',
  }

  return (
    <>
      {extracted.styleTags.map((s, i) => (
        <div key={i} dangerouslySetInnerHTML={{ __html: s }} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: extracted.widgetHtml }} />
      <script
        dangerouslySetInnerHTML={{
          __html: `var taxi_booking_ajax = ${JSON.stringify(finalAjax)};`,
        }}
      />
    </>
  )
}
