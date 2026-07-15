import { getPool, ensureSchema } from '@/lib/db/client'

// Aggregations behind /admin/searches. Everything is scoped to a date range and
// only ever returns grouped counts — no per-customer view.

export interface Kpis {
  total: number
  routes_missing: number
  routes_have: number
  countries: number
  unique_routes: number
  pending_enrichment: number
}

export interface RouteRow {
  origen: string
  destino: string
  pais: string | null
  searches: number
  route_exists: boolean | null
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

export async function getKpis(from: string, to: string): Promise<Kpis> {
  await ensureSchema()
  const { rows } = await getPool().query(
    `SELECT
       count(*)::int                                              AS total,
       count(*) FILTER (WHERE route_exists IS FALSE)::int         AS routes_missing,
       count(*) FILTER (WHERE route_exists IS TRUE)::int          AS routes_have,
       count(DISTINCT pickup_country)::int                        AS countries,
       count(DISTINCT (pickup_label || '|' || dest_label))::int   AS unique_routes,
       count(*) FILTER (WHERE enriched_at IS NULL)::int           AS pending_enrichment
     FROM booking_search WHERE ${WHERE_RANGE}`,
    range(from, to)
  )
  return rows[0]
}

/**
 * Most-searched routes. missingOnly => the "we don't have this yet" backlog.
 *
 * Only enriched rows: an unenriched row has no label, so it would show the raw
 * address the visitor typed ("Ibiza Airport, 07820, Balearic Islands, Spain")
 * AND group under a different key than the same route once enriched
 * ("Ibiza Airport") — splitting one route into two rows and understating both
 * counts. Pending rows are surfaced by the KPI banner instead.
 */
export async function getRoutes(from: string, to: string, missingOnly = false, limit = 50): Promise<RouteRow[]> {
  const { rows } = await getPool().query(
    `SELECT
       pickup_label                        AS origen,
       dest_label                          AS destino,
       max(pickup_country)                 AS pais,
       count(*)::int                       AS searches,
       bool_and(route_exists)              AS route_exists,
       round(avg(pax), 1)::float           AS avg_pax,
       ${localTs('max(created_at)', 'YYYY-MM-DD')} AS last_seen
     FROM booking_search
     WHERE ${WHERE_RANGE}
       AND enriched_at IS NOT NULL
       AND pickup_label IS NOT NULL AND dest_label IS NOT NULL
       ${missingOnly ? 'AND route_exists IS FALSE' : ''}
     GROUP BY 1, 2
     ORDER BY searches DESC, last_seen DESC
     LIMIT $3`,
    [...range(from, to), limit]
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

export interface SearchRow {
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
  route_exists: boolean | null
}

export async function getRecent(from: string, to: string, limit = 200): Promise<SearchRow[]> {
  const { rows } = await getPool().query(
    `SELECT id,
            ${localTs('created_at', 'YYYY-MM-DD HH24:MI')} AS created_at,
            COALESCE(pickup_label, pickup_text)         AS origen,
            COALESCE(dest_label, dest_text)             AS destino,
            pickup_country                              AS pais,
            to_char(travel_date, 'YYYY-MM-DD')          AS travel_date,
            travel_time, pax, lug, locale, route_exists
       FROM booking_search
      WHERE ${WHERE_RANGE}
      ORDER BY created_at DESC
      LIMIT $3`,
    [...range(from, to), limit]
  )
  return rows
}
