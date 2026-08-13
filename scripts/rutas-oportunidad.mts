// Rutas vendibles (con precio en el Drive) que NO están publicadas, ordenadas
// por demanda ya demostrada en Search Console.
//
//   npx tsx --env-file=.env.local scripts/rutas-oportunidad.mts [--top=40] [--csv]
//
// El cruce: para cada ruta sin publicar, busca su destino (y su aeropuerto) en
// las consultas reales del export de GSC y suma las impresiones. Una ruta que
// ya acumula impresiones sin tener página es demanda que hoy se pierde entera.

import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'

const CATALOG = '../src/lib/admin/catalog.ts'
const KEY = '../src/lib/route-key.ts'
const { getVehiclePrices } = await import(CATALOG)
const { norm } = await import(KEY)

const args = process.argv.slice(2)
const TOP = Number(args.find(a => a.startsWith('--top='))?.split('=')[1] || 40)
const AS_CSV = args.includes('--csv')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

/**
 * Palabras demasiado genéricas para atribuir demanda a un sitio concreto.
 * Sin esto, "airport" (que sale en casi todos los nombres de aeropuerto y en
 * casi todas las consultas) hace que todo case con todo.
 */
const STOP = new Set([
  'airport','airports','aeropuerto','aeropuertos','aeroporto','aéroport','flughafen',
  'international','internacional','intl','city','centre','center','ciudad','centro',
  'transfer','transfers','transfert','traslado','traslados','taxi','taxis','privado',
  'private','prive','shuttle','pickup','port','puerto','from','desde','hasta','para',
  'del','las','los','the','and','con','por','que','service','servicio','precio','price',
])

/** Palabras significativas de un texto, como tokens exactos (no subcadenas). */
function tokens(s: string): Set<string> {
  return new Set(
    norm(s).split(/[^a-z0-9]+/).filter(t => t.length > 3 && !STOP.has(t))
  )
}

// ── Consultas con demanda (export GSC 12 meses) ──────────────────────────────
const queries = readFileSync('docs/gsc-consultas-ruta-2026-08-12.csv', 'utf-8')
  .split('\n').slice(1).filter(Boolean)
  .map(l => {
    const i = l.lastIndexOf(',')
    return { q: norm(l.slice(0, i)), impr: Number(l.slice(i + 1)) }
  })
  .filter(x => x.impr > 0)
  .map(x => ({ ...x, qt: tokens(x.q) }))

// ── Lo que ya está publicado ─────────────────────────────────────────────────
const published: { iata: string; dest: string }[] = await client.fetch(
  `*[_type == "route" && defined(origin->iataCode)]{ "iata": origin->iataCode, "dest": destination->title }`
)
const publishedKeys = new Set(
  published.filter(r => r.dest).map(r => `${String(r.iata).toUpperCase()}|${norm(r.dest)}`)
)

// ── Aeropuertos: nombre y ciudad, para poder buscarlos en las consultas ──────
const airports: { iata: string; title: string; city: string; country: string }[] =
  await client.fetch(`*[_type == "airport" && defined(iataCode)]{
    "iata": iataCode, title, "city": city->title, "country": country->title }`)
const airportByIata = new Map(airports.map(a => [String(a.iata).toUpperCase(), a]))

// ── La hoja: todo lo vendible ────────────────────────────────────────────────
const table = await getVehiclePrices()
if (!table) { console.error('La hoja no responde; reintenta o sube ROUTES_SHEET_TIMEOUT_MS.'); process.exit(1) }

interface Opp {
  iata: string; airport: string; country: string; dest: string
  price: number; impressions: number; matched: string[]
}

const opps: Opp[] = []
for (const [key, vehicles] of table) {
  const [iata, dest] = key.split('|')
  if (!iata || !dest || !vehicles.length) continue
  if (publishedKeys.has(`${iata}|${dest}`)) continue        // ya publicada
  const air = airportByIata.get(iata)
  if (!air) continue                                         // aeropuerto no está en Sanity

  // ¿Alguna consulta real pide esta ruta? Se exige que la consulta nombre el
  // destino COMPLETO y además la plaza de origen (aeropuerto o su ciudad), con
  // tokens exactos. Sin la doble condición, "Salou" de Reus se atribuiría a
  // Barcelona; sin tokens exactos, "alma" casaría con "palma" y "port" con
  // "airport".
  const destTokens = [...tokens(dest)]
  if (!destTokens.length) continue
  const plazaTokens = new Set([...tokens(air.title), ...tokens(air.city || '')])
  if (!plazaTokens.size) continue

  let impressions = 0
  const matched: string[] = []
  for (const { q, impr, qt } of queries) {
    if (!destTokens.every(t => qt.has(t))) continue        // el destino, entero
    let hitsPlaza = false
    for (const p of plazaTokens) if (qt.has(p)) { hitsPlaza = true; break }
    if (!hitsPlaza) continue
    impressions += impr
    matched.push(q)
  }
  if (impressions > 0) {
    opps.push({
      iata, airport: air.title, country: air.country || '—',
      dest, price: vehicles[0].price, impressions, matched,
    })
  }
}

opps.sort((a, b) => b.impressions * b.price - a.impressions * a.price)

if (AS_CSV) {
  console.log('IATA,Aeropuerto,Pais,Destino,Precio desde,Impresiones GSC,Consultas que la piden')
  for (const o of opps) {
    console.log([o.iata, `"${o.airport}"`, `"${o.country}"`, `"${o.dest}"`,
      o.price.toFixed(2), o.impressions, `"${o.matched.slice(0, 3).join(' | ')}"`].join(','))
  }
} else {
  console.log(`\n${opps.length} rutas vendibles SIN publicar con demanda medida en Search Console.`)
  console.log(`(de ${table.size} rutas con precio en la hoja y ${publishedKeys.size} publicadas)\n`)
  console.log('IATA  Destino                        Desde    Impr/año  Consultas que la piden')
  console.log('─'.repeat(104))
  for (const o of opps.slice(0, TOP)) {
    console.log(
      o.iata.padEnd(6) +
      o.dest.slice(0, 28).padEnd(31) +
      `${o.price.toFixed(0)}€`.padStart(6) +
      String(o.impressions).padStart(10) + '   ' +
      o.matched.slice(0, 2).join(' · ').slice(0, 48)
    )
  }
  const totalImpr = opps.reduce((s, o) => s + o.impressions, 0)
  console.log('─'.repeat(104))
  console.log(`Demanda total hoy sin página: ${totalImpr.toLocaleString('es-ES')} impresiones/año`)
}
