// Aplica a Sanity el contenido de ciudad revisado en docs/CONTENIDO-<CIUDAD>-<fecha>.md
//
// Por defecto NO escribe: hay que pasar --apply explícitamente. Antes de escribir
// guarda el contenido anterior en docs/backup-city-content/, así que siempre se
// puede volver atrás.
//
//   node --env-file=.env.local scripts/apply-city-content.mjs --city=barcelona
//   node --env-file=.env.local scripts/apply-city-content.mjs --city=barcelona --apply
//   node --env-file=.env.local scripts/apply-city-content.mjs --list-no-accents
//
// Los textos viven en CONTENT abajo: se revisan en el .md y se pegan aquí.

import { createClient } from '@sanity/client'
import { writeFileSync, mkdirSync } from 'node:fs'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const args = process.argv.slice(2)
const arg = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1]
const has = (name) => args.includes(`--${name}`)

// ─── Contenido revisado ──────────────────────────────────────────────────────
// "## " = encabezado h2. Línea en blanco = nuevo párrafo.

const CONTENT = {
  barcelona: {
    _id: 'city-barcelona',
    en: {
      seoDescription:
        'Book a private transfer to central Barcelona. Meet & greet at Barcelona El Prat Airport. Fixed price, comfortable vehicles, 24/7 service.',
      body: `Barcelona is one of the best-connected cities in the Mediterranean, and also one of the trickiest to arrive in: three airports, a huge cruise port, and a city centre where parking is close to impossible. A private transfer takes the hard part out of the trip — you're picked up where you land and dropped at your door, at a price agreed before you set off.

## From El Prat Airport to the city centre

El Prat sits 18 kilometres from central Barcelona, around 25 minutes in normal traffic. Your driver meets you in the arrivals hall with a name sign, at both T1 and T2, and helps with the luggage to the vehicle.

What separates this from the taxi rank is certainty: the price is fixed when you book, with no surcharge for luggage, terminal or night-time pickup. If your flight is delayed, we track the flight number and move the pickup to your actual landing time — you don't have to call anyone.

## If you fly into Girona or Reus

Plenty of low-cost airlines don't land at El Prat but at Girona-Costa Brava or Reus. Both are easy airports, but they're a long way from Barcelona, and public transport means chaining a bus to a train on timetables that rarely match your flight.

We cover both routes with a direct private transfer into Barcelona, same fixed price, same meet & greet. For a group or a family with luggage it usually works out better than several bus tickets plus a taxi at the end.

## Cruises: the Port of Barcelona

Barcelona's port is one of Europe's major cruise hubs, and the Moll Adossat terminals are a long way from a city-centre taxi rank. We run airport-to-terminal and hotel-to-terminal transfers with enough margin to board without rushing, and the return leg on disembarkation day, when thousands of passengers leave at once and taxis get scarce.

## Day trips from Barcelona

Barcelona also makes an excellent base for the rest of Catalonia. Among the trips we're asked for most: Sitges (30 km, about 30 minutes), the Costa Brava, PortAventura, the Penedès wineries, Montserrat and the Pyrenees ski resorts. Because it's a private service, the car is yours alone and you leave when it suits you, with no bus timetable to work around.

## What's included

A fixed price per vehicle, not per person, agreed at booking. Meet & greet at arrivals, real-time flight tracking and a professional driver. Approved child seats free of charge when requested at booking, and free cancellation up to 24 hours before. Pick the vehicle to match the group and the luggage: sedan, people carrier or minibus for larger groups.`,
    },
    es: {
      seoDescription:
        'Reserva tu transfer privado al centro de Barcelona. Recogida con cartel en el Aeropuerto de Barcelona-El Prat. Precio fijo, vehículos cómodos y servicio 24/7.',
      body: `Barcelona es una de las ciudades mejor conectadas del Mediterráneo, y también una de las que más quebraderos de cabeza da al llegar: tres aeropuertos, un puerto de cruceros enorme y un centro donde aparcar es casi imposible. Un traslado privado resuelve la parte complicada del viaje — te recogen donde aterrizas y te dejan en la puerta de tu alojamiento, con el precio cerrado antes de salir.

## Del aeropuerto de El Prat al centro

El Prat está a 18 kilómetros del centro de Barcelona, unos 25 minutos de trayecto con tráfico normal. Tu conductor te espera en la sala de llegadas con un cartel con tu nombre, tanto en la T1 como en la T2, y te ayuda con el equipaje hasta el vehículo.

La diferencia con el taxi de la parada está en la certeza: el precio se cierra al reservar, sin recargos por maleta, por terminal ni por hora nocturna. Y si el vuelo se retrasa, monitorizamos el número de vuelo y ajustamos la recogida a la hora real de aterrizaje, sin que tengas que llamar a nadie.

## Si vuelas a Girona o Reus

Muchas compañías de bajo coste no aterrizan en El Prat, sino en Girona-Costa Brava o en Reus. Son aeropuertos cómodos, pero quedan lejos de Barcelona y la conexión en transporte público obliga a encadenar autobús y tren con horarios que no siempre encajan con el vuelo.

Cubrimos las dos rutas con traslado privado directo a Barcelona, con el mismo precio cerrado y la misma recogida con cartel. Para un grupo o una familia con equipaje suele salir a cuenta frente a comprar varios billetes de bus más el taxi final.

## Cruceros: puerto de Barcelona

El puerto de Barcelona es uno de los grandes puertos de cruceros de Europa, y sus terminales del Moll Adossat quedan lejos de la parada de taxis del centro. Hacemos el trayecto aeropuerto-terminal de crucero y hotel-terminal, con margen para embarcar sin prisas, y también la vuelta el día del desembarque, cuando miles de pasajeros salen a la vez y encontrar taxi se complica.

## Escapadas desde Barcelona

Barcelona es además una base excelente para moverse por Cataluña. Algunos de los trayectos que más nos piden: Sitges (30 km, unos 30 minutos), la Costa Brava, PortAventura, las bodegas del Penedès, Montserrat y las estaciones de esquí del Pirineo. Al ser un servicio privado, el coche es solo para tu grupo y puedes salir a la hora que te convenga, sin depender de horarios de bus.

## Qué incluye tu traslado

Precio fijo por vehículo, no por persona, cerrado al reservar. Recogida con cartel en llegadas, seguimiento del vuelo en tiempo real y conductor profesional. Sillas infantiles homologadas gratuitas si las pides al reservar, y cancelación gratuita hasta 24 horas antes. Elige el vehículo según el grupo y el equipaje: turismo, monovolumen o microbús para grupos grandes.`,
    },
  },
}

// ─── Markdown mínimo → bloques PortableText ──────────────────────────────────

let keyCounter = 0
const key = () => `b${Date.now().toString(36)}${(keyCounter++).toString(36)}`

function toPortableText(text) {
  return text
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const heading = chunk.startsWith('## ')
      return {
        _type: 'block',
        _key: key(),
        style: heading ? 'h2' : 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: key(), text: heading ? chunk.slice(3).trim() : chunk, marks: [] }],
      }
    })
}

const wordCount = (blocks) =>
  (blocks || [])
    .filter((b) => b._type === 'block')
    .flatMap((b) => (b.children || []).map((c) => c.text || ''))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length

// ─── Listado de textos ES sin tildes ─────────────────────────────────────────

if (has('list-no-accents')) {
  const cities = await client.fetch(
    `*[_type == "city" && defined(translations.es.description)]{ "slug": slug.current, title, "es": translations.es.description }`
  )
  const bad = []
  for (const c of cities) {
    const text = (c.es || [])
      .filter((b) => b._type === 'block')
      .flatMap((b) => (b.children || []).map((ch) => ch.text || ''))
      .join(' ')
    if (text.split(/\s+/).filter(Boolean).length >= 25 && !/[áéíóúñÁÉÍÓÚÑ]/.test(text)) {
      bad.push(`${c.slug} — ${c.title}`)
    }
  }
  console.log(`Ciudades con texto ES de 25+ palabras SIN NINGUNA TILDE (${bad.length}):`)
  bad.forEach((b) => console.log('  ·', b))
  process.exit(0)
}

// ─── Aplicar ─────────────────────────────────────────────────────────────────

const cityKey = arg('city')
if (!cityKey || !CONTENT[cityKey]) {
  console.error(`Uso: --city=<${Object.keys(CONTENT).join('|')}> [--apply]`)
  process.exit(1)
}

const entry = CONTENT[cityKey]
const current = await client.fetch(`*[_id == $id][0]{ description, seoDescription, translations }`, { id: entry._id })
if (!current) {
  console.error(`No existe el documento ${entry._id}`)
  process.exit(1)
}

const nextEn = toPortableText(entry.en.body)
const nextEs = toPortableText(entry.es.body)

console.log(`\n${cityKey} (${entry._id})`)
console.log(`  EN: ${wordCount(current.description)} → ${wordCount(nextEn)} palabras`)
console.log(`  ES: ${wordCount(current.translations?.es?.description)} → ${wordCount(nextEs)} palabras`)
console.log(`  meta EN: ${current.seoDescription?.length ?? 0} → ${entry.en.seoDescription.length} chars`)
console.log(`  meta ES: ${current.translations?.es?.seoDescription?.length ?? 0} → ${entry.es.seoDescription.length} chars`)

if (!has('apply')) {
  console.log('\nDRY-RUN. Nada escrito. Añade --apply para aplicarlo de verdad.')
  process.exit(0)
}

mkdirSync('docs/backup-city-content', { recursive: true })
const backupPath = `docs/backup-city-content/${cityKey}-${new Date().toISOString().slice(0, 10)}.json`
writeFileSync(backupPath, JSON.stringify(current, null, 2))
console.log(`\nBackup del contenido anterior → ${backupPath}`)

await client
  .patch(entry._id)
  .set({
    description: nextEn,
    seoDescription: entry.en.seoDescription,
    'translations.es.description': nextEs,
    'translations.es.seoDescription': entry.es.seoDescription,
  })
  .commit()

console.log('Aplicado. La página se refresca en ≤1h (ISR) o al instante vía /api/revalidate.')
console.log('Ojo: las traducciones ar/it/de/fr siguen con el texto viejo — hay que relanzar los scripts de traducción.')
