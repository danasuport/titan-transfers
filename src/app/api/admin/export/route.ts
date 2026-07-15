import { NextRequest, NextResponse } from 'next/server'
import { isAuthed } from '@/lib/admin/auth'
import { getPool, ensureSchema } from '@/lib/db/client'
import { TZ } from '@/lib/admin/queries'
import { getSheetIndex, getWebIndex, verdictFor } from '@/lib/admin/catalog'
import { searchRouteKey } from '@/lib/route-key'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  // Excel splits on the delimiter unless the cell is quoted; quotes are doubled.
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(req: NextRequest) {
  if (!(await isAuthed())) {
    // Relative Location: behind the proxy req.url is the internal 0.0.0.0:3000.
    return new NextResponse(null, { status: 303, headers: { Location: '/admin/' } })
  }

  const { searchParams } = new URL(req.url)
  const dateRe = /^\d{4}-\d{2}-\d{2}$/
  const from = dateRe.test(searchParams.get('from') || '') ? searchParams.get('from')! : '2000-01-01'
  const to = dateRe.test(searchParams.get('to') || '') ? searchParams.get('to')! : '2999-12-31'

  await ensureSchema()
  const [{ rows }, sheet, web] = await Promise.all([
    getPool().query(
      // created_at is a timestamptz and the server session is UTC, so it's
      // rendered in Spanish local time — otherwise the client's export would be
      // two hours behind the times they see everywhere else. travel_date is a
      // plain DATE and needs no conversion.
      `SELECT to_char(b.created_at AT TIME ZONE '${TZ}', 'YYYY-MM-DD HH24:MI')  AS fecha_busqueda,
              COALESCE(b.pickup_label, b.pickup_text)      AS origen,
              COALESCE(b.dest_label, b.dest_text)          AS destino,
              b.pickup_country, b.dest_country,
              b.pickup_is_airport, b.dest_is_airport,
              b.pickup_city, b.dest_city,
              pp.iata AS pickup_iata,
              dp.iata AS dest_iata,
              to_char(b.travel_date, 'YYYY-MM-DD')         AS fecha_viaje,
              b.travel_time, b.pax, b.lug, b.locale,
              b.pickup_text, b.dest_text
         FROM booking_search b
         LEFT JOIN place_cache pp ON pp.place_id = b.pickup_pid
         LEFT JOIN place_cache dp ON dp.place_id = b.dest_pid
        WHERE b.created_at >= (($1::date)::timestamp AT TIME ZONE '${TZ}')
          AND b.created_at < ((($2::date + interval '1 day'))::timestamp AT TIME ZONE '${TZ}')
        ORDER BY b.created_at DESC`,
      [from, to]
    ),
    getSheetIndex(),
    getWebIndex(),
  ])

  // Same two questions, same answers as the dashboard — the export used to carry
  // a single "Tenemos la ruta" read straight off the stored route_exists, which
  // says No for the 1.095 routes that are priced but not published yet.
  const tri = (v: boolean | null) => (v === true ? 'Si' : v === false ? 'No' : 'n/a')
  const records = rows.map(r => {
    const v = verdictFor(searchRouteKey(r), sheet, web)
    return {
      'Fecha busqueda': r.fecha_busqueda,
      'Origen': r.origen,
      'Destino': r.destino,
      'IATA': r.pickup_is_airport ? r.pickup_iata : r.dest_is_airport ? r.dest_iata : null,
      'Pais origen': r.pickup_country,
      'Pais destino': r.dest_country,
      'Origen es aeropuerto': r.pickup_is_airport,
      'Destino es aeropuerto': r.dest_is_airport,
      'La tenemos': tri(v.haveIt),
      'En la web': tri(v.onWeb),
      'Fecha viaje': r.fecha_viaje,
      'Hora viaje': r.travel_time,
      'Pasajeros': r.pax,
      'Maletas': r.lug,
      'Idioma': r.locale,
      'Origen (texto original)': r.pickup_text,
      'Destino (texto original)': r.dest_text,
    }
  })

  const headers = Object.keys(
    records[0] ?? {
      'Fecha busqueda': '', 'Origen': '', 'Destino': '', 'IATA': '',
      'La tenemos': '', 'En la web': '',
    }
  )

  // Semicolon + BOM: what Excel on a Spanish locale opens cleanly on a double click.
  const body = [
    headers.join(';'),
    ...records.map(r => headers.map(h => csvCell(r[h as keyof typeof r])).join(';')),
  ].join('\r\n')

  return new NextResponse('﻿' + body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="busquedas-titan-${from}_${to}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
