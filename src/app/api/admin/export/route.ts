import { NextRequest, NextResponse } from 'next/server'
import { isAuthed } from '@/lib/admin/auth'
import { getPool, ensureSchema } from '@/lib/db/client'
import { TZ } from '@/lib/admin/queries'

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
  const { rows } = await getPool().query(
    // created_at is a timestamptz and the server session is UTC, so it's
    // rendered in Spanish local time — otherwise the client's export would be
    // two hours behind the times they see everywhere else. travel_date is a
    // plain DATE and needs no conversion.
    `SELECT to_char(created_at AT TIME ZONE '${TZ}', 'YYYY-MM-DD HH24:MI')  AS "Fecha busqueda",
            COALESCE(pickup_label, pickup_text)        AS "Origen",
            COALESCE(dest_label, dest_text)            AS "Destino",
            pickup_country                             AS "Pais origen",
            dest_country                               AS "Pais destino",
            pickup_is_airport                          AS "Origen es aeropuerto",
            dest_is_airport                            AS "Destino es aeropuerto",
            CASE route_exists WHEN true THEN 'Si' WHEN false THEN 'No' ELSE 'n/a' END AS "Tenemos la ruta",
            to_char(travel_date, 'YYYY-MM-DD')         AS "Fecha viaje",
            travel_time                                AS "Hora viaje",
            pax                                        AS "Pasajeros",
            lug                                        AS "Maletas",
            locale                                     AS "Idioma",
            pickup_text                                AS "Origen (texto original)",
            dest_text                                  AS "Destino (texto original)"
       FROM booking_search
      WHERE created_at >= (($1::date)::timestamp AT TIME ZONE '${TZ}')
        AND created_at < ((($2::date + interval '1 day'))::timestamp AT TIME ZONE '${TZ}')
      ORDER BY created_at DESC`,
    [from, to]
  )

  const headers = rows.length
    ? Object.keys(rows[0])
    : ['Fecha busqueda', 'Origen', 'Destino', 'Pais origen', 'Tenemos la ruta']

  // Semicolon + BOM: what Excel on a Spanish locale opens cleanly on a double click.
  const body = [
    headers.join(';'),
    ...rows.map(r => headers.map(h => csvCell(r[h])).join(';')),
  ].join('\r\n')

  return new NextResponse('﻿' + body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="busquedas-titan-${from}_${to}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
