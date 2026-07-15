import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getPool, ensureSchema } from '@/lib/db/client'

// Records one booking search (the params the booking panel sends to /booking/)
// so we can report on demand by country / city / airport / route.
//
// Deliberately stores NO user identifier: no IP, no user-agent, no cookie. The
// rows are only ever read in aggregate. See /admin/searches.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// A reload of /booking/?... or a double submit is the same search, not a new
// one. Same hash inside this window => ignored.
const DEDUPE_WINDOW_MINUTES = 30

type Body = {
  pickup?: string
  pickup_lat?: string | number
  pickup_lng?: string | number
  pickup_pid?: string
  dest?: string
  dest_lat?: string | number
  dest_lng?: string | number
  dest_pid?: string
  date?: string
  time?: string
  pax?: string | number
  lug?: string | number
  locale?: string
}

function num(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function str(v: unknown, max = 500): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  return s ? s.slice(0, max) : null
}

/** YYYY-MM-DD or null — guards against junk reaching a DATE column. */
function isoDate(v: unknown): string | null {
  const s = str(v, 10)
  return s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null
}

export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const pickupText = str(body.pickup)
  const destText = str(body.dest)
  // A search without both ends is not a search.
  if (!pickupText || !destText) {
    return NextResponse.json({ error: 'pickup and dest required' }, { status: 400 })
  }

  const row = {
    locale: str(body.locale, 5),
    pickup_text: pickupText,
    pickup_lat: num(body.pickup_lat),
    pickup_lng: num(body.pickup_lng),
    pickup_pid: str(body.pickup_pid, 200),
    dest_text: destText,
    dest_lat: num(body.dest_lat),
    dest_lng: num(body.dest_lng),
    dest_pid: str(body.dest_pid, 200),
    travel_date: isoDate(body.date),
    travel_time: str(body.time, 5),
    pax: num(body.pax),
    lug: num(body.lug),
  }

  // Prefer the stable Google place_id; fall back to the raw text when the user
  // typed a free-form address the autocomplete didn't resolve.
  const dedupeHash = createHash('sha256')
    .update([
      row.pickup_pid || row.pickup_text,
      row.dest_pid || row.dest_text,
      row.travel_date || '',
      row.travel_time || '',
      row.pax ?? '',
      row.lug ?? '',
    ].join('|'))
    .digest('hex')

  try {
    await ensureSchema()
    const pool = getPool()

    const { rowCount } = await pool.query(
      `INSERT INTO booking_search (
         locale, pickup_text, pickup_lat, pickup_lng, pickup_pid,
         dest_text, dest_lat, dest_lng, dest_pid,
         travel_date, travel_time, pax, lug, dedupe_hash
       )
       SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
       WHERE NOT EXISTS (
         SELECT 1 FROM booking_search
         WHERE dedupe_hash = $14
           AND created_at > now() - ($15 || ' minutes')::interval
       )`,
      [
        row.locale, row.pickup_text, row.pickup_lat, row.pickup_lng, row.pickup_pid,
        row.dest_text, row.dest_lat, row.dest_lng, row.dest_pid,
        row.travel_date, row.travel_time, row.pax, row.lug, dedupeHash,
        String(DEDUPE_WINDOW_MINUTES),
      ]
    )

    return NextResponse.json({ ok: true, recorded: rowCount === 1 })
  } catch (err) {
    // Analytics must never break the booking flow: log and return 200 so the
    // client never surfaces an error to the user.
    console.error('[search-log] failed to record search:', err)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
