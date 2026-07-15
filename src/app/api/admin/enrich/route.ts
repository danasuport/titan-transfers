import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { runEnrichment } from '@/lib/db/enrich-runner'
import { isAuthed } from '@/lib/admin/auth'

// Cron target for the enrichment pass. Lives as an endpoint (not a script)
// because production runs the compiled standalone app: no devDependencies, no
// scripts/ folder, so `npx tsx scripts/…` isn't available there.
//
// Coolify Scheduled Task:
//   curl -fsS -X POST https://titantransfers.com/api/admin/enrich/ \
//        -H "Authorization: Bearer $ADMIN_PASSWORD"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

function bearerOk(req: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return false
  const a = Buffer.from(token)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

async function handle(req: NextRequest) {
  // Either a cron with the bearer token, or a logged-in admin hitting "refresh".
  if (!bearerOk(req) && !(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit')) || 200, 1000)
  const force = searchParams.get('force') === '1'

  try {
    const result = await runEnrichment({ limit, force })
    return NextResponse.json({
      ok: true,
      processed: result.processed,
      failed: result.failed,
      missing_routes: result.items.filter(i => i.routeExists === false).length,
    })
  } catch (err) {
    console.error('[enrich] run failed:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

export const POST = handle
// GET too, so it can be triggered from a browser while logged into the panel.
export const GET = handle
