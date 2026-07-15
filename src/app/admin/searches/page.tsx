import { redirect } from 'next/navigation'
import { isAuthed } from '@/lib/admin/auth'
import {
  getKpis, getRouteGroups, getTopCountries, getTopCities, getTopAirports, getRecent, TZ,
  type RankRow, type RouteRow,
} from '@/lib/admin/queries'
import {
  getSheetIndex, getWebIndex, verdictFor,
  type RouteStatus, type RouteVerdict,
} from '@/lib/admin/catalog'
import { airportIata, searchRouteKey } from '@/lib/route-key'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Búsquedas — Panel Titan', robots: { index: false, follow: false } }

// ─── date helpers ────────────────────────────────────────────────────────────

// The server runs in UTC, so toISOString() would call it "yesterday" between
// midnight and 02:00 Spanish time. Dates the client sees are always Spanish.
function iso(d: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d)
}
function defaultFrom() { const d = new Date(); d.setDate(d.getDate() - 30); return iso(d) }

// ─── styles ──────────────────────────────────────────────────────────────────

const C = { ink: '#242426', muted: '#64748b', line: '#e5e7eb', green: '#8BAA1D', bg: '#F8FAF0' }
const card: React.CSSProperties = { background: '#fff', border: `1px solid ${C.line}`, borderRadius: '10px', padding: '1.1rem 1.25rem' }
const th: React.CSSProperties = { textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: C.muted, padding: '0.5rem 0.6rem', borderBottom: `1px solid ${C.line}`, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '0.5rem 0.6rem', borderBottom: `1px solid #f1f5f9`, fontSize: '0.85rem', color: C.ink }
const scroll: React.CSSProperties = { overflowX: 'auto' }

function Kpi({ label, value, tone }: { label: string; value: number | string; tone?: 'bad' | 'good' | 'warn' }) {
  const color = tone === 'bad' ? '#b91c1c' : tone === 'good' ? '#15803d' : tone === 'warn' ? '#b45309' : C.ink
  return (
    <div style={card}>
      <div style={{ fontSize: '1.7rem', fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: C.muted, marginTop: '0.2rem' }}>{label}</div>
    </div>
  )
}

function RankTable({ title, rows, empty }: { title: string; rows: RankRow[]; empty: string }) {
  const max = rows[0]?.searches || 1
  return (
    <div style={card}>
      <h2 style={{ margin: '0 0 0.8rem', fontSize: '0.95rem', color: C.ink }}>{title}</h2>
      {rows.length === 0 ? (
        <p style={{ fontSize: '0.8rem', color: C.muted, margin: 0 }}>{empty}</p>
      ) : (
        <div>
          {rows.map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <div style={{ flex: 1, minWidth: 0, fontSize: '0.82rem', color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
              <div style={{ width: '90px', background: '#f1f5f9', borderRadius: '3px', height: '7px', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ width: `${Math.round((r.searches / max) * 100)}%`, height: '100%', background: C.green }} />
              </div>
              <div style={{ width: '32px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: C.ink, flexShrink: 0 }}>{r.searches}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// A route the visitor searched, answered against both live catalogues.
type Row = RouteRow & { iata: string | null; v: RouteVerdict }

const NOT_A_ROUTE = 'Ninguno de los extremos es un aeropuerto, así que no corresponde a una ruta del catálogo'
const NO_SHEET = 'No se ha podido leer la hoja de tarifas, así que no sabemos si la ruta está vendida'

function Badge({ v, yes, no, unknown, tone = 'bad' }: {
  v: boolean | null; yes: string; no: string; unknown: string; tone?: 'bad' | 'warn'
}) {
  const s = { fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap' as const }
  if (v === true) return <span style={{ ...s, color: '#15803d' }}>✓ {yes}</span>
  if (v === false) return <span style={{ ...s, color: tone === 'warn' ? '#b45309' : '#b91c1c' }}>✗ {no}</span>
  return <span style={{ color: C.muted, fontSize: '0.78rem' }} title={unknown}>—</span>
}

/**
 * "Falta subir" only when we actually sell it — that phrasing promises the route
 * is a publish away. When we don't have it either, the honest answer is just No,
 * and the red "we don't have it" table is where it belongs.
 */
function WebBadge({ v }: { v: RouteVerdict }) {
  const pending = v.haveIt === true
  return (
    <Badge
      v={v.onWeb}
      yes="Sí"
      no={pending ? 'Falta subir' : 'No'}
      tone={pending ? 'warn' : 'bad'}
      unknown={NOT_A_ROUTE}
    />
  )
}

/** What's still missing from a published route, or a tick when nothing is. */
function StatusCell({ s }: { s: RouteStatus | null }) {
  if (!s) return <span style={{ color: C.muted, fontSize: '0.78rem' }}>—</span>

  const gaps: string[] = []
  if (!s.hasImage) gaps.push('sin imagen')
  if (!s.hasContent) gaps.push('sin contenido')
  if (s.missingLangs.length) gaps.push(`falta ${s.missingLangs.join(', ').toUpperCase()}`)

  if (gaps.length === 0) return <span style={{ color: '#15803d', fontSize: '0.78rem', fontWeight: 700 }}>✓ Completa</span>
  return <span style={{ color: '#b45309', fontSize: '0.75rem' }}>{gaps.join(' · ')}</span>
}

function RoutesTable({ rows, showStatus = false }: { rows: Row[]; showStatus?: boolean }) {
  return (
    <div style={scroll}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: showStatus ? '860px' : '720px' }}>
        <thead>
          <tr>
            <th style={th}>Origen</th><th style={th}>Destino</th>
            <th style={th}>IATA</th><th style={th}>País</th>
            <th style={{ ...th, textAlign: 'right' }}>Búsquedas</th>
            <th style={{ ...th, textAlign: 'right' }}>Pax medio</th>
            <th style={th}>¿La tenemos?</th>
            <th style={th}>¿En la web?</th>
            {showStatus && <th style={th}>Estado en la web</th>}
            <th style={th}>Última</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={td}>{r.origen}</td>
              <td style={td}>{r.destino}</td>
              <td style={{ ...td, fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>{r.iata || '—'}</td>
              <td style={{ ...td, color: C.muted }}>{r.pais || '—'}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{r.searches}</td>
              <td style={{ ...td, textAlign: 'right', color: C.muted }}>{r.avg_pax ?? '—'}</td>
              <td style={td}>
                <Badge v={r.v.haveIt} yes="Sí" no="No" unknown={r.iata ? NO_SHEET : NOT_A_ROUTE} />
              </td>
              <td style={td}>
                <WebBadge v={r.v} />
              </td>
              {showStatus && <td style={td}><StatusCell s={r.v.status} /></td>}
              <td style={{ ...td, color: C.muted, whiteSpace: 'nowrap' }}>{r.last_seen}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── page ────────────────────────────────────────────────────────────────────

export default async function SearchesDashboard({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; enrich_error?: string }>
}) {
  if (!(await isAuthed())) redirect('/admin/')

  const sp = await searchParams
  const from = /^\d{4}-\d{2}-\d{2}$/.test(sp.from || '') ? sp.from! : defaultFrom()
  const to = /^\d{4}-\d{2}-\d{2}$/.test(sp.to || '') ? sp.to! : iso(new Date())

  const [kpis, groups, countries, cities, airports, recent, sheet, web] = await Promise.all([
    getKpis(from, to),
    getRouteGroups(from, to),
    getTopCountries(from, to),
    getTopCities(from, to),
    getTopAirports(from, to),
    getRecent(from, to, 100),
    getSheetIndex(),
    getWebIndex(),
  ])

  const rows: Row[] = groups.map(r => ({
    ...r,
    iata: airportIata(r),
    v: verdictFor(searchRouteKey(r), sheet, web),
  }))

  // The three states a searched route can be in. "Priced but not published" is
  // the one that used to show up as a flat "No".
  const missing = rows.filter(r => r.v.haveIt === false)
  const toPublish = rows.filter(r => r.v.haveIt === true && r.v.onWeb === false)
  const published = rows.filter(r => r.v.onWeb === true)

  const qs = `from=${from}&to=${to}`

  return (
    <main style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui, -apple-system, sans-serif', padding: '1.5rem clamp(1rem, 4vw, 2.5rem) 4rem' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>

        <header style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: C.ink }}>Búsquedas de traslados</h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: C.muted }}>
              Qué piden los visitantes en el buscador — para ajustar precios y detectar rutas que faltan.
            </p>
          </div>
          <form method="GET" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label htmlFor="from" style={{ display: 'block', fontSize: '0.7rem', color: C.muted, marginBottom: '0.2rem' }}>Desde</label>
              <input id="from" type="date" name="from" defaultValue={from} style={{ padding: '0.4rem 0.5rem', border: `1px solid ${C.line}`, borderRadius: '6px', fontSize: '0.85rem' }} />
            </div>
            <div>
              <label htmlFor="to" style={{ display: 'block', fontSize: '0.7rem', color: C.muted, marginBottom: '0.2rem' }}>Hasta</label>
              <input id="to" type="date" name="to" defaultValue={to} style={{ padding: '0.4rem 0.5rem', border: `1px solid ${C.line}`, borderRadius: '6px', fontSize: '0.85rem' }} />
            </div>
            <button type="submit" style={{ padding: '0.45rem 1rem', background: C.ink, color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Aplicar</button>
            <a href={`/api/admin/export/?${qs}`} style={{ padding: '0.45rem 1rem', background: '#fff', color: C.ink, border: `1px solid ${C.line}`, borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>Exportar CSV</a>
          </form>
        </header>

        {/* Route KPIs count distinct routes, not searches — that's what the labels promise. */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Kpi label="Búsquedas totales" value={kpis.total} />
          <Kpi label="Rutas distintas" value={kpis.unique_routes} />
          <Kpi label="Rutas que NO tenemos" value={missing.length} tone="bad" />
          <Kpi label="Las tenemos, faltan en la web" value={toPublish.length} tone="warn" />
          <Kpi label="Publicadas en la web" value={published.length} tone="good" />
          <Kpi label="Países" value={kpis.countries} />
        </section>

        {!sheet && (
          <p style={{ ...card, fontSize: '0.82rem', color: '#991b1b', background: '#fef2f2', borderColor: '#fecaca', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            <strong>No se ha podido leer la hoja de tarifas de Drive.</strong>{' '}
            La columna <em>¿La tenemos?</em> aparece como «—» en vez de arriesgar un «No» equivocado.
            Suele significar que la hoja ha dejado de compartirse por enlace o que le han cambiado
            el nombre a las columnas <em>Airport</em> o <em>Resort</em>.
          </p>
        )}

        {sp.enrich_error && (
          <p style={{ ...card, fontSize: '0.82rem', color: '#991b1b', background: '#fef2f2', borderColor: '#fecaca', marginBottom: '1.5rem' }}>
            La clasificación falló. Vuelve a intentarlo; si persiste, avisa a soporte técnico.
          </p>
        )}

        {kpis.pending_enrichment > 0 && (
          <div style={{ ...card, background: '#fffbeb', borderColor: '#fde68a', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.82rem', color: '#92400e', lineHeight: 1.5 }}>
              <strong>{kpis.pending_enrichment} búsqueda(s) pendientes de clasificar.</strong>{' '}
              Aún no sabemos su país, ciudad ni si tenemos la ruta, así que <strong>todavía no aparecen
              en las tablas de abajo</strong>. Se clasifican solas cada 15 minutos.
            </div>
            {/* POST, not a link: this mutates data, and a browser could fire a
                link on prefetch. Returns to the panel instead of raw JSON. */}
            <form method="POST" action={`/api/admin/enrich/?limit=500&${qs}`} style={{ margin: 0 }}>
              <button
                type="submit"
                style={{ padding: '0.45rem 1rem', background: '#92400e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Clasificar ahora
              </button>
            </form>
          </div>
        )}

        {/* The point of the whole thing: demand we don't serve at all. */}
        <section style={{ ...card, marginBottom: '1.5rem', borderColor: '#fecaca' }}>
          <h2 style={{ margin: '0 0 0.2rem', fontSize: '1.05rem', color: '#b91c1c' }}>Rutas que piden y NO tenemos</h2>
          <p style={{ margin: '0 0 0.9rem', fontSize: '0.8rem', color: C.muted }}>
            Demanda real que no está ni en la hoja de tarifas ni en la web. Ordenadas por número de
            búsquedas: aquí es donde hace falta crear tarifa nueva.
          </p>
          {missing.length === 0
            ? <p style={{ fontSize: '0.85rem', color: C.muted, margin: 0 }}>
                {kpis.pending_enrichment > 0
                  ? 'Hay búsquedas pendientes de clasificar (ver aviso arriba). Cuando se procesen, las rutas que falten aparecerán aquí.'
                  : 'Ninguna todavía. Cuando alguien busque una ruta de aeropuerto que no esté en la hoja ni en la web, aparecerá aquí.'}
              </p>
            : <RoutesTable rows={missing.slice(0, 50)} />}
        </section>

        {/* The work queue: sold, searched, and still not on the site. */}
        <section style={{ ...card, marginBottom: '1.5rem', borderColor: '#fde68a' }}>
          <h2 style={{ margin: '0 0 0.2rem', fontSize: '1.05rem', color: '#b45309' }}>Las tenemos, pero faltan en la web</h2>
          <p style={{ margin: '0 0 0.9rem', fontSize: '0.8rem', color: C.muted }}>
            Están en la hoja de tarifas pero todavía no publicadas, y la gente ya las busca.
            De mayor a menor demanda: este es el orden en el que conviene subirlas.
          </p>
          {toPublish.length === 0
            ? <p style={{ fontSize: '0.85rem', color: C.muted, margin: 0 }}>
                Ninguna: todas las rutas buscadas que están en la hoja ya están publicadas.
              </p>
            : <RoutesTable rows={toPublish.slice(0, 50)} />}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <RankTable title="Países más buscados" rows={countries} empty="Sin datos todavía." />
          <RankTable title="Aeropuertos de origen" rows={airports} empty="Sin datos todavía." />
          <RankTable title="Destinos más buscados" rows={cities} empty="Sin datos todavía." />
        </section>

        <section style={{ ...card, marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.2rem', fontSize: '1.05rem', color: C.ink }}>Rutas más buscadas</h2>
          <p style={{ margin: '0 0 0.9rem', fontSize: '0.8rem', color: C.muted }}>
            «Estado en la web» mira las rutas ya publicadas: si les falta imagen, contenido o alguna
            traducción, la página existe pero rinde por debajo de lo que esta demanda merece.
          </p>
          {rows.length === 0
            ? <p style={{ fontSize: '0.85rem', color: C.muted, margin: 0 }}>
                {kpis.pending_enrichment > 0
                  ? 'Hay búsquedas pendientes de clasificar (ver aviso arriba). Aparecerán aquí en cuanto se procesen.'
                  : 'Sin datos en este rango de fechas.'}
              </p>
            : <RoutesTable rows={rows.slice(0, 25)} showStatus />}
        </section>

        <section style={card}>
          <h2 style={{ margin: '0 0 0.9rem', fontSize: '1.05rem', color: C.ink }}>Últimas búsquedas</h2>
          {recent.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: C.muted, margin: 0 }}>Sin datos en este rango de fechas.</p>
          ) : (
            <div style={scroll}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
                <thead>
                  <tr>
                    <th style={th}>Cuándo</th><th style={th}>Origen</th><th style={th}>Destino</th>
                    <th style={th}>Viaje</th><th style={{ ...th, textAlign: 'right' }}>Pax</th>
                    <th style={{ ...th, textAlign: 'right' }}>Maletas</th><th style={th}>Idioma</th>
                    <th style={th}>¿La tenemos?</th><th style={th}>¿En la web?</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(r => {
                    const v = verdictFor(searchRouteKey(r), sheet, web)
                    return (
                      <tr key={r.id}>
                        <td style={{ ...td, color: C.muted, whiteSpace: 'nowrap' }}>{r.created_at}</td>
                        <td style={td}>{r.origen}</td>
                        <td style={td}>{r.destino}</td>
                        <td style={{ ...td, color: C.muted, whiteSpace: 'nowrap' }}>{r.travel_date || '—'} {r.travel_time || ''}</td>
                        <td style={{ ...td, textAlign: 'right' }}>{r.pax ?? '—'}</td>
                        <td style={{ ...td, textAlign: 'right' }}>{r.lug ?? '—'}</td>
                        <td style={{ ...td, textTransform: 'uppercase', color: C.muted }}>{r.locale || '—'}</td>
                        <td style={td}>
                          <Badge v={v.haveIt} yes="Sí" no="No" unknown={airportIata(r) ? NO_SHEET : NOT_A_ROUTE} />
                        </td>
                        <td style={td}><WebBadge v={v} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p style={{ fontSize: '0.72rem', color: C.muted, marginTop: '1.5rem', lineHeight: 1.6 }}>
          Datos agregados de búsquedas del buscador de traslados. No se registra ninguna identificación
          del visitante (ni IP, ni navegador, ni cookies). Rango mostrado: {from} → {to}.
        </p>
      </div>
    </main>
  )
}
