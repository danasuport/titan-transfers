// Ticket medio y cobertura por plaza (aeropuerto de origen), para dimensionar
// cuánto CPC aguanta cada localización en Google Ads.
//
//   npx tsx --env-file=.env.local scripts/plazas-report.mts [--min-rutas=5] [--csv]
//
// Fuentes: la hoja de precios del cliente (lo que se cobra de verdad) y Sanity
// (lo que está publicado). El rendimiento en buscador NO sale de aquí: viene
// del export de Search Console.

import { createClient } from '@sanity/client'
const CATALOG = '../src/lib/admin/catalog.ts'
const { getVehiclePrices } = await import(CATALOG)

const args = process.argv.slice(2)
const MIN_ROUTES = Number(args.find((a) => a.startsWith('--min-rutas='))?.split('=')[1] || 3)
const AS_CSV = args.includes('--csv')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// Aeropuertos publicados + cuántas rutas visibles cuelgan de cada uno.
const airports: { iata: string; title: string; country: string; publicadas: number }[] =
  await client.fetch(`*[_type == "airport" && defined(iataCode)]{
    "iata": iataCode,
    title,
    "country": country->title,
    "publicadas": count(*[_type == "route" && origin._ref == ^._id && hidden != true])
  }`)

const table = await getVehiclePrices()
if (!table) {
  console.error('La hoja de precios no responde. Reintenta (o sube ROUTES_SHEET_TIMEOUT_MS).')
  process.exit(1)
}

// La clave de la hoja es "IATA|ciudad": agrupamos por el lado del aeropuerto.
const byIata = new Map<string, number[]>()
for (const [key, vehicles] of table) {
  const iata = key.split('|')[0]
  if (!vehicles.length) continue
  const list = byIata.get(iata) || []
  list.push(vehicles[0].price) // vehículo más barato = el "desde" de esa ruta
  byIata.set(iata, list)
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
const eur = (n: number) => `${n.toFixed(0)} €`

const rows = airports
  .map((a) => {
    const prices = byIata.get(a.iata.toUpperCase()) || []
    return {
      iata: a.iata.toUpperCase(),
      aeropuerto: a.title,
      pais: a.country || '—',
      publicadas: a.publicadas,
      vendibles: prices.length,
      ticketMedio: prices.length ? prices.reduce((s, p) => s + p, 0) / prices.length : 0,
      ticketMediana: prices.length ? median(prices) : 0,
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    }
  })
  .filter((r) => r.publicadas >= MIN_ROUTES && r.vendibles > 0)
  .sort((a, b) => b.ticketMediana - a.ticketMediana)

if (AS_CSV) {
  console.log('IATA,Aeropuerto,Pais,Rutas publicadas,Rutas con precio,Ticket medio,Ticket mediana,Min,Max')
  for (const r of rows) {
    console.log(
      [r.iata, `"${r.aeropuerto}"`, `"${r.pais}"`, r.publicadas, r.vendibles,
       r.ticketMedio.toFixed(2), r.ticketMediana.toFixed(2), r.min.toFixed(2), r.max.toFixed(2)].join(',')
    )
  }
} else {
  console.log(`\nPlazas con ${MIN_ROUTES}+ rutas publicadas y precio en la hoja (${rows.length}), por ticket mediano:\n`)
  console.log('IATA  Aeropuerto                                Rutas  Precio  Mediana   Rango')
  console.log('─'.repeat(92))
  for (const r of rows.slice(0, 40)) {
    console.log(
      r.iata.padEnd(6) +
      r.aeropuerto.slice(0, 40).padEnd(42) +
      String(r.publicadas).padStart(4) + '   ' +
      eur(r.ticketMedio).padStart(6) + '  ' +
      eur(r.ticketMediana).padStart(6) + '   ' +
      `${eur(r.min)}–${eur(r.max)}`
    )
  }
  const total = rows.reduce((s, r) => s + r.vendibles, 0)
  console.log('─'.repeat(92))
  console.log(`${rows.length} plazas · ${total} rutas con precio · ticket mediano global ${eur(median(rows.map(r => r.ticketMediana)))}`)
}
