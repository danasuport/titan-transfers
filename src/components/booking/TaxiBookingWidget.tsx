// Server component: fetches the rendered booking widget HTML from the
// WordPress install (where the Taxi Booking Plugin lives) and embeds it
// inline. AJAX URLs are rewritten so the widget calls the Next.js proxy
// instead of admin-ajax.php directly. Strings, custom fields, currency
// list and pricing logic stay in the WP plugin so the client can keep
// editing them in their familiar admin.
import { cookies } from 'next/headers'

const WP_ORIGIN = (process.env.NEXT_PUBLIC_WP_BOOKING_URL || 'https://titantransfers.com').replace(/\/+$/, '')

type Extracted = {
  widgetHtml: string
  styleTags: string[]
  inlineConfig: string | null
  ajaxObject: Record<string, unknown> | null
}

function extractWidget(html: string): Extracted {
  // Inline <style> blocks that the plugin emits right above the widget
  const styleTags: string[] = []
  const styleRe = /<style[^>]*>[\s\S]*?<\/style>/gi
  for (const m of html.matchAll(styleRe)) {
    if (m[0].includes('taxi-booking-widget') || m[0].includes('--taxi-')) {
      styleTags.push(m[0])
    }
  }

  // Main widget container — span from the opening tag with id="taxi-booking-widget"
  // down to its closing div. WordPress / Yoast may inject siblings so we look
  // for the specific id attribute.
  let widgetHtml = ''
  const openIdx = html.indexOf('id="taxi-booking-widget"')
  if (openIdx !== -1) {
    // Walk back to the opening <div ...
    const divStart = html.lastIndexOf('<div', openIdx)
    if (divStart !== -1) {
      // Walk forward, counting nested <div> until balanced
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

  // Inline <script> with taxi_booking_ajax = {...}; (wp_localize_script output)
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

function rewriteUrls(widgetHtml: string): string {
  // Any inline asset references in the widget HTML (mostly image src) point at
  // the WP server. We let them keep pointing there — they're public assets.
  return widgetHtml
}

export async function TaxiBookingWidget({
  locale = 'en',
  wpPath = '/booking/',
}: {
  locale?: string
  wpPath?: '/booking/' | '/choose-vehicle/' | '/confirm-booking/'
}) {
  const langSuffix = locale === 'es' ? (wpPath.includes('?') ? '&lang=es' : '?lang=es') : ''
  const wpUrl = `${WP_ORIGIN}${wpPath}${langSuffix}`
  let extracted: Extracted = { widgetHtml: '', styleTags: [], inlineConfig: null, ajaxObject: null }

  // Forward the user's WP-specific cookies to the upstream fetch so the
  // plugin renders the widget in the correct session state (booking ID,
  // logged-in user, currency choice, etc.). Without this, WP would render
  // a fresh empty step-1 widget and the JS would rebound the user to /booking/.
  const cookieJar = await cookies()
  const cookieHeader = cookieJar
    .getAll()
    .map(c => `${c.name}=${c.value}`)
    .join('; ')

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

  // Override the AJAX target so the browser hits the Next.js proxy instead of
  // talking to the WP origin directly (avoids CORS, keeps cookies on the
  // primary domain). Also force step2_url / step3_url to relative paths so
  // navigation stays inside the Next.js app — WP delivers these as absolute
  // URLs against the WP host, which would bounce the user out of the new site.
  const localePrefix = locale === 'es' ? '/es' : ''
  const finalAjax = {
    ...(extracted.ajaxObject || {}),
    ajax_url: '/api/taxi-booking-ajax',
    step2_url: `${localePrefix}/choose-vehicle/`,
    step3_url: `${localePrefix}/confirm-booking/`,
  }

  return (
    <>
      {extracted.styleTags.map((s, i) => (
        <div key={i} dangerouslySetInnerHTML={{ __html: s }} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: rewriteUrls(extracted.widgetHtml) }} />
      <script
        // Preserve the rest of the localized config (nonce, api_url,
        // language, currency, step URLs, google_ads, strings).
        dangerouslySetInnerHTML={{
          __html: `var taxi_booking_ajax = ${JSON.stringify(finalAjax)};`,
        }}
      />
    </>
  )
}
