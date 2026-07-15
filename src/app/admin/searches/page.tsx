import { redirect } from 'next/navigation'
import { isAuthed } from '@/lib/admin/auth'
import {
  getKpis, getRoutes, getTopCountries, getTopCities, getTopAirports, getRecent,
  type RankRow, type RouteRow,
} from '@/lib/admin/queries'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Búsquedas — Panel Titan', robots: { index: false, follow: false } }

// ─── date helpers ────────────────────────────────────────────────────────────

function iso(d: Date) { return d.toISOString().slice(0, 10) }
function defaultFrom() { const d = new Date(); d.setDate(d.getDate() - 30); return iso(d) }

// ─── styles ──────────────────────────────────────────────────────────────────

const C = { ink: '#242426', muted: '#64748b', line: '#e5e7eb', green: '#8BAA1D', bg: '#F8FAF0' }
const card: React.CSSProperties = { background: '#fff', border: `1px solid ${C.line}`, borderRadius: '10px', padding: '1.1rem 1.25rem' }
const th: React.CSSProperties = { textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: C.muted, padding: '0.5rem 0.6rem', borderBottom: `1px solid ${C.line}`, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '0.5rem 0.6rem', borderBottom: `1px solid #f1f5f9`, fontSize: '0.85rem', color: C.ink }
const scroll: React.CSSProperties = { overflowX: 'auto' }

function Kpi({ label, value, tone }: { label: string; value: number | string; tone?: 'bad' | 'good' }) {
  const color = tone === 'bad' ? '#b91c1c' : tone === 'good' ? '#15803d' : C.ink
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

function RouteBadge({ v }: { v: boolean | null }) {
  if (v === true) return <span style={{ color: '#15803d', fontWeight: 700, fontSize: '0.78rem' }}>✓ Sí</span>
  if (v === false) return <span style={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.78rem' }}>✗ No</span>
  return <span style={{ color: C.muted, fontSize: '0.78rem' }} title="Ninguno de los extremos es un aeropuerto, así que no corresponde a una ruta del catálogo">—</span>
}

function RoutesTable({ rows }: { rows: RouteRow[] }) {
  return (
    <div style={scroll}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
        <thead>
          <tr>
            <th style={th}>Origen</th><th style={th}>Destino</th><th style={th}>País</th>
            <th style={{ ...th, textAlign: 'right' }}>Búsquedas</th>
            <th style={{ ...th, textAlign: 'right' }}>Pax medio</th>
            <th style={th}>¿La tenemos?</th><th style={th}>Última</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={td}>{r.origen}</td>
              <td style={td}>{r.destino}</td>
              <td style={{ ...td, color: C.muted }}>{r.pais || '—'}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{r.searches}</td>
              <td style={{ ...td, textAlign: 'right', color: C.muted }}>{r.avg_pax ?? '—'}</td>
              <td style={td}><RouteBadge v={r.route_exists} /></td>
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
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  if (!(await isAuthed())) redirect('/admin/')

  const sp = await searchParams
  const from = /^\d{4}-\d{2}-\d{2}$/.test(sp.from || '') ? sp.from! : defaultFrom()
  const to = /^\d{4}-\d{2}-\d{2}$/.test(sp.to || '') ? sp.to! : iso(new Date())

  const [kpis, missing, top, countries, cities, airports, recent] = await Promise.all([
    getKpis(from, to),
    getRoutes(from, to, true, 50),
    getRoutes(from, to, false, 25),
    getTopCountries(from, to),
    getTopCities(from, to),
    getTopAirports(from, to),
    getRecent(from, to, 100),
  ])

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

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Kpi label="Búsquedas totales" value={kpis.total} />
          <Kpi label="Rutas distintas" value={kpis.unique_routes} />
          <Kpi label="Rutas que NO tenemos" value={kpis.routes_missing} tone="bad" />
          <Kpi label="Rutas que sí tenemos" value={kpis.routes_have} tone="good" />
          <Kpi label="Países" value={kpis.countries} />
        </section>

        {kpis.pending_enrichment > 0 && (
          <p style={{ ...card, fontSize: '0.8rem', color: '#92400e', background: '#fffbeb', borderColor: '#fde68a', marginBottom: '1.5rem' }}>
            {kpis.pending_enrichment} búsqueda(s) aún sin procesar — sus país/ciudad/ruta se rellenarán en la próxima pasada.
          </p>
        )}

        {/* The point of the whole thing: demand we don't serve yet. */}
        <section style={{ ...card, marginBottom: '1.5rem', borderColor: '#fecaca' }}>
          <h2 style={{ margin: '0 0 0.2rem', fontSize: '1.05rem', color: '#b91c1c' }}>Rutas que piden y NO tenemos</h2>
          <p style={{ margin: '0 0 0.9rem', fontSize: '0.8rem', color: C.muted }}>
            Demanda real sin cobertura en la web. Ordenadas por número de búsquedas: por aquí conviene empezar a añadir rutas.
          </p>
          {missing.length === 0
            ? <p style={{ fontSize: '0.85rem', color: C.muted, margin: 0 }}>Ninguna todavía. Cuando alguien busque una ruta de aeropuerto que no tenéis en el catálogo, aparecerá aquí.</p>
            : <RoutesTable rows={missing} />}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <RankTable title="Países más buscados" rows={countries} empty="Sin datos todavía." />
          <RankTable title="Aeropuertos de origen" rows={airports} empty="Sin datos todavía." />
          <RankTable title="Destinos más buscados" rows={cities} empty="Sin datos todavía." />
        </section>

        <section style={{ ...card, marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.9rem', fontSize: '1.05rem', color: C.ink }}>Rutas más buscadas</h2>
          {top.length === 0
            ? <p style={{ fontSize: '0.85rem', color: C.muted, margin: 0 }}>Sin datos en este rango de fechas.</p>
            : <RoutesTable rows={top} />}
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
                    <th style={{ ...th, textAlign: 'right' }}>Maletas</th><th style={th}>Idioma</th><th style={th}>¿Ruta?</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(r => (
                    <tr key={r.id}>
                      <td style={{ ...td, color: C.muted, whiteSpace: 'nowrap' }}>{r.created_at}</td>
                      <td style={td}>{r.origen}</td>
                      <td style={td}>{r.destino}</td>
                      <td style={{ ...td, color: C.muted, whiteSpace: 'nowrap' }}>{r.travel_date || '—'} {r.travel_time || ''}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{r.pax ?? '—'}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{r.lug ?? '—'}</td>
                      <td style={{ ...td, textTransform: 'uppercase', color: C.muted }}>{r.locale || '—'}</td>
                      <td style={td}><RouteBadge v={r.route_exists} /></td>
                    </tr>
                  ))}
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
