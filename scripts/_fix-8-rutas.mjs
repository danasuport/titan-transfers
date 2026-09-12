/**
 * Cierra las 8 rutas que quedaron ocultas del lote de 30 aeropuertos:
 *
 * 1. Cartagena. Solo existía un documento de ciudad con ese nombre, el de
 *    Cartagena de Indias, así que la ruta desde Murcia se enganchó a Colombia.
 *    El texto y el país de la ruta sí son los españoles; lo único mal es la
 *    referencia al destino. Se crea la ciudad murciana y se reapunta la ruta.
 *    La URL de la ruta no cambia: su slug es suyo, no depende del destino.
 *
 * 2. Las fotos que ha elegido el usuario a mano, una por ruta.
 *
 * Uso:
 *   node scripts/_fix-8-rutas.mjs            # simulación
 *   node scripts/_fix-8-rutas.mjs --apply
 */
import { readFileSync } from 'fs'
import { createClient } from '@sanity/client'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim()
}
const APPLY = process.argv.includes('--apply')
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN_WRITE || process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const DESCARGAS = `${process.env.HOME}/Downloads`
const SCRATCH = '/private/tmp/claude-501/-Users-WEBKMABCN-Documents-titan/2e5f7298-ca79-4dff-83f7-e3e002be3419/scratchpad/img'

// iata + destino → fichero y textos alternativos de la imagen
const FOTOS = [
  { iata: 'BIO', destino: 'Santander',   file: `${DESCARGAS}/santander.jpg`,            en: 'View over Santander and its bay',            es: 'Vista de Santander y su bahía' },
  { iata: 'KEF', destino: 'Blue Lagoon', file: `${DESCARGAS}/Blue-Lagoon.jpg`,          en: 'The Blue Lagoon geothermal spa near Grindavík', es: 'La laguna geotérmica Blue Lagoon, cerca de Grindavík' },
  { iata: 'KEF', destino: 'Hveragerdi',  file: `${DESCARGAS}/Hveragerdi.jpg`,           en: 'Waterfall on the river at Hveragerði',       es: 'Cascada del río a su paso por Hveragerði' },
  { iata: 'LPA', destino: 'Amadores',    file: `${DESCARGAS}/playa-de-amadores.jpg`,    en: 'Playa de Amadores beach in Mogán, Gran Canaria', es: 'Playa de Amadores, en Mogán (Gran Canaria)' },
  { iata: 'RMU', destino: 'Cartagena',   file: `${SCRATCH}/cartagena.jpg`,              en: 'Roman Theatre of Cartagena above the harbour', es: 'El Teatro Romano de Cartagena sobre el puerto' },
  { iata: 'SKG', destino: 'Kassandreia', file: `${DESCARGAS}/Kassandreia.jpeg`,         en: 'Fishing boats on the Kassandra peninsula',   es: 'Barcas de pesca en la península de Casandra' },
  { iata: 'TNG', destino: 'Arcila',      file: `${DESCARGAS}/arcila.jpg`,               en: "Asilah's white medina on the Atlantic",      es: 'La medina blanca de Asilah sobre el Atlántico' },
  { iata: 'TSF', destino: 'Padova',      file: `${DESCARGAS}/padova.jpg`,               en: 'Prato della Valle square in Padua',          es: 'La plaza Prato della Valle, en Padua' },
]

// ── 1. Cartagena ─────────────────────────────────────────────────────────────
const CIUDAD_ES = {
  _id: 'city-cartagena-murcia',
  _type: 'city',
  title: 'Cartagena',
  slug: { _type: 'slug', current: 'cartagena-murcia' },
  country: { _type: 'reference', _ref: 'country-spain' },
}

const ruta = await client.fetch(
  `*[_type=="route" && origin->iataCode=="RMU" && destination->title=="Cartagena"][0]{_id, "destino":destination->{_id, title, "pais":country->title}}`
)
if (!ruta) {
  console.log('  ! no encuentro la ruta RMU → Cartagena')
} else if (ruta.destino._id === CIUDAD_ES._id) {
  console.log('  = Cartagena: ya apunta a la ciudad murciana')
} else {
  console.log(`  → Cartagena: la ruta ${ruta._id} apunta a «${ruta.destino.title}» (${ruta.destino.pais}); la paso a la ciudad murciana`)
  if (APPLY) {
    await client.createIfNotExists(CIUDAD_ES)
    await client.patch(ruta._id).set({ destination: { _type: 'reference', _ref: CIUDAD_ES._id } }).commit()
  }
}

// ── 2. Las fotos ─────────────────────────────────────────────────────────────
console.log('')
let puestas = 0
for (const f of FOTOS) {
  const r = await client.fetch(
    `*[_type=="route" && origin->iataCode==$i && destination->title==$d][0]{_id, "tiene":defined(featuredImage.asset)}`,
    { i: f.iata, d: f.destino }
  )
  if (!r) { console.log(`  ! ${f.iata} → ${f.destino}: no encuentro la ruta`); continue }
  if (r.tiene) { console.log(`  = ${f.iata} → ${f.destino}: ya tenía imagen, la dejo`); continue }

  let buf
  try { buf = readFileSync(f.file) } catch { console.log(`  ! ${f.iata} → ${f.destino}: no encuentro ${f.file}`); continue }
  console.log(`  → ${f.iata} → ${f.destino}: ${(buf.length / 1024).toFixed(0)} KB · «${f.en}»`)
  puestas++
  if (!APPLY) continue

  const asset = await client.assets.upload('image', buf, {
    filename: `${r._id}-featured.jpg`,
    contentType: 'image/jpeg',
  })
  await client.patch(r._id).set({
    featuredImage: { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, alt: f.en },
    'translations.es.featuredImageAlt': f.es,
  }).commit()
}

console.log(`\n${puestas} imágenes${APPLY ? ' subidas' : ' por subir (simulación, pasa --apply)'}`)
