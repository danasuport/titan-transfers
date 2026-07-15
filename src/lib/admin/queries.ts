import { getPool, ensureSchema } from '@/lib/db/client'
import type { RouteEnds } from '@/lib/route-key'

// Aggregations behind /admin/searches. Everything is scoped to a date range and
// only ever returns grouped counts — no per-customer view.

export interface Kpis {
  total: number
  countries: number
  unique_routes: number
  pending_enrichment: number
}

export interface RouteRow extends RouteEnds {
  origen: string
  destino: string
  pais: string | null
  searches: number
  avg_pax: number | null
  last_seen: string
}

export interface RankRow {
  label: string
  searches: number
}

// created_at is a timestamptz (a universal instant, which is right), but the
// server's session runs in UTC — so formatting or comparing it raw shows Madrid
// users times two hours behind, and makes "15 July" run 02:00→02:00 instead of
// midnight→midnight. Everything the client reads is therefore converted to
// Spanish local time explicitly.
export const TZ = 'Europe/Madrid'

/** Inclusive from / to as YYYY-MM-DD, interpreted as Spanish local days. */
function range(from: string, to: string) {
  return [from, to]
}

const WHERE_RANGE = `
  created_at >= (($1::date)::timestamp AT TIME ZONE '${TZ}')
  AND created_at < ((($2::date + interval '1 day'))::timestamp AT TIME ZONE '${TZ}')`

/** Formats a timestamptz in Spanish local time. */
function localTs(col: string, fmt: string) {
  return `to_char(${col} AT TIME ZONE '${TZ}', '${fmt}')`
}

// The "do we have it / is it published" counts used to live here as
// count(*) FILTER (WHERE route_exists ...), which counted *searches* under a
// label that promised routes, and read a column frozen at enrichment time.
// They're derived from getRouteGroups() against the live catalogues instead.
export async function getKpis(from: string, to: string): Promise<Kpis> {
  await ensureSchema()
  const { rows } = await getPool().query(
    `SELECT
       count(*)::int                                              AS total,
       count(DISTINCT pickup_country)::int                        AS countries,
       count(DISTINCT (pickup_label || '|' || dest_label))::int   AS unique_routes,
       count(*) FILTER (WHERE enriched_at IS NULL)::int           AS pending_enrichment
     FROM booking_search WHERE ${WHERE_RANGE}`,
    range(from, to)
  )
  return rows[0]
}

/**
 * Every distinct route searched in the range, most-searched first. Unbounded on
 * purpose: the dashboard splits these into its tables and derives its route KPIs
 * from the whole set, so a LIMIT here would quietly understate the counts. The
 * date range bounds it — a month runs to a few hundred rows.
 *
 * Only enriched rows: an unenriched row has no label, so it would show the raw
 * address the visitor typed ("Ibiza Airport, 07820, Balearic Islands, Spain")
 * AND group under a different key than the same route once enriched
 * ("Ibiza Airport") — splitting one route into two rows and understating both
 * counts. Pending rows are surfaced by the KPI banner instead.
 *
 * The IATA code isn't on booking_search; it comes from the place_cache row the
 * enricher already filled in for that place_id.
 */
export async function getRouteGroups(from: string, to: string): Promise<RouteRow[]> {
  const { rows } = await getPool().query(
    `SELECT
       b.pickup_label                        AS origen,
       b.dest_label                          AS destino,
       max(b.pickup_country)                 AS pais,
       count(*)::int                         AS searches,
       round(avg(b.pax), 1)::float           AS avg_pax,
       ${localTs('max(b.created_at)', 'YYYY-MM-DD')} AS last_seen,
       bool_or(b.pickup_is_airport)          AS pickup_is_airport,
       bool_or(b.dest_is_airport)            AS dest_is_airport,
       max(b.pickup_city)                    AS pickup_city,
       max(b.dest_city)                      AS dest_city,
       max(pp.iata)                          AS pickup_iata,
       max(dp.iata)                          AS dest_iata
     FROM booking_search b
     LEFT JOIN place_cache pp ON pp.place_id = b.pickup_pid
     LEFT JOIN place_cache dp ON dp.place_id = b.dest_pid
     WHERE ${WHERE_RANGE}
       AND b.enriched_at IS NOT NULL
       AND b.pickup_label IS NOT NULL AND b.dest_label IS NOT NULL
     GROUP BY 1, 2
     ORDER BY searches DESC, last_seen DESC`,
    range(from, to)
  )
  return rows
}

/** Generic top-N over one enriched column, ignoring rows not yet enriched. */
async function rank(column: string, from: string, to: string, limit: number, extraWhere = ''): Promise<RankRow[]> {
  const { rows } = await getPool().query(
    `SELECT ${column} AS label, count(*)::int AS searches
       FROM booking_search
      WHERE ${WHERE_RANGE} AND ${column} IS NOT NULL ${extraWhere}
      GROUP BY 1 ORDER BY searches DESC LIMIT $3`,
    [...range(from, to), limit]
  )
  return rows
}

export function getTopCountries(from: string, to: string, limit = 15) {
  return rank('pickup_country', from, to, limit)
}

export function getTopCities(from: string, to: string, limit = 15) {
  // Cities as a destination is the interesting signal: where people want to go.
  return rank('dest_label', from, to, limit, 'AND dest_is_airport IS NOT TRUE')
}

export function getTopAirports(from: string, to: string, limit = 15) {
  return rank('pickup_label', from, to, limit, 'AND pickup_is_airport IS TRUE')
}

export interface SearchRow extends RouteEnds {
  id: number
  created_at: string
  origen: string
  destino: string
  pais: string | null
  travel_date: string | null
  travel_time: string | null
  pax: number | null
  lug: number | null
  locale: string | null
}

export async function getRecent(from: string, to: string, limit = 200): Promise<SearchRow[]> {
  const { rows } = await getPool().query(
    `SELECT b.id,
            ${localTs('b.created_at', 'YYYY-MM-DD HH24:MI')} AS created_at,
            COALESCE(b.pickup_label, b.pickup_text)       AS origen,
            COALESCE(b.dest_label, b.dest_text)           AS destino,
            b.pickup_country                              AS pais,
            to_char(b.travel_date, 'YYYY-MM-DD')          AS travel_date,
            b.travel_time, b.pax, b.lug, b.locale,
            b.pickup_is_airport, b.dest_is_airport,
            b.pickup_city, b.dest_city,
            pp.iata AS pickup_iata,
            dp.iata AS dest_iata
       FROM booking_search b
       LEFT JOIN place_cache pp ON pp.place_id = b.pickup_pid
       LEFT JOIN place_cache dp ON dp.place_id = b.dest_pid
      WHERE ${WHERE_RANGE}
      ORDER BY b.created_at DESC
      LIMIT $3`,
    [...range(from, to), limit]
  )
  return rows
}
