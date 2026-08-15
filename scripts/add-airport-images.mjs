/**
 * Real photos for airport pages that have none.
 *
 * 88 of the 211 airports had no featuredImage, so the /airports/ listing showed
 * a solid black card for each of them and their own page lost its hero.
 *
 * What it searches for is the PLACE, not the terminal: the airport's city when
 * it's linked, otherwise the airport's own name with the generic words stripped
 * ("Dalaman Airport" → "Dalaman"). That matches the rule the client set — an
 * airport's image must show its city, never a generic stock photo — and it's
 * why the shared search filter rejects filenames containing "airport": a photo
 * of a terminal is not a photo of the destination.
 *
 * Reuses findPhoto/uploadToSanity from add-route-images-intl.mjs, so the licence
 * and quality filters (no coats of arms, no maps, no buses, no satellite) are
 * exactly the same ones already proven on the route batches.
 *
 * Usage:
 *   node scripts/add-airport-images.mjs                  # dry run
 *   node scripts/add-airport-images.mjs --apply
 *   node scripts/add-airport-images.mjs --apply --limit=20
 *   node scripts/add-airport-images.mjs --apply --skip="Comiso,Aswan"
 */
import { readFileSync } from 'fs'
import { createClient } from '@sanity/client'
import { findPhoto, uploadToSanity } from './add-route-images-intl.mjs'

for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([^#=]+)=(.*)$/)
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim()
}

const APPLY = process.argv.includes('--apply')
const LIMIT = Number((process.argv.find(a => a.startsWith('--limit=')) || '').split('=')[1] || '0') || Infinity
// --loose: no exige que el nombre del archivo describa una vista del lugar.
// Sube la cobertura y baja la precisión, así que se revisa a mano en dry-run
// antes de aplicarlo (varias ciudades grandes no tienen ningún archivo cuyo
// nombre case con el patrón "escénico", pero sí buenas fotos).
const LOOSE = process.argv.includes('--loose')
const SKIP = ((process.argv.find(a => a.startsWith('--skip=')) || '').split('=')[1] || '')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN_WRITE || process.env.SANITY_API_TOKEN,
  useCdn: false,
})

/**
 * The place to photograph. Prefer the linked city; otherwise strip the generic
 * airport vocabulary from the airport's name and keep the proper noun.
 * "Bangkok Suvarnabhumi Airport" → "Bangkok Suvarnabhumi", "Dalaman Airport" →
 * "Dalaman". Person-named airports keep the whole name, which is what Wikipedia
 * indexes them under anyway.
 */
function placesFor(a) {
  const clean = String(a.title || '')
    .replace(/\b(international|intl\.?|regional|municipal|airport|airfield|aeropuerto|aeroporto|aéroport|flughafen)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/[-–—,]\s*$/, '')
    .trim()
  // Airports are usually "<city> <person the airport is named after>", and
  // Wikipedia files nothing under the combination: "Bari Karol Wojtyła" finds
  // nothing, "Biarritz Pays Basque" finds a rugby club. So try the full name
  // first and fall back to progressively shorter prefixes, which converge on
  // the city — the place we actually want to show.
  const words = clean.split(/[\s-]+/).filter(Boolean)
  // Shortest-first (after the linked city): the prefixes converge on the city
  // name, which is what Wikipedia indexes. Trying the full name first found a
  // rugby club for Biarritz and an Airbus for Bangkok.
  const candidates = [a.city, words.slice(0, 2).join(' '), words[0], clean]
  return [...new Set(candidates.filter(Boolean))]
}

const airports = await client.fetch(
  `*[_type == "airport" && !defined(featuredImage.asset)]{
     _id, title, "slug": slug.current, iataCode, "city": city->title, "country": country->title
   } | order(title asc)`
)
console.log(`Aeropuertos sin imagen: ${airports.length}`)

const kept = SKIP.length ? airports.filter(a => !SKIP.includes(String(a.title || '').toLowerCase())) : airports
if (SKIP.length) console.log(`Excluidos por --skip: ${airports.length - kept.length}`)
const batch = kept.slice(0, LIMIT)

let done = 0, skipped = 0, failed = 0
for (const [i, a] of batch.entries()) {
  const candidates = placesFor(a)
  const label = `[${i + 1}/${batch.length}] ${a.iataCode} ${a.title}`
  if (!candidates.length) { console.log(`  ⚠ ${label}: sin término de búsqueda`); skipped++; continue }
  try {
    let info = null, place = ''
    for (const cand of candidates) {
      info = await findPhoto(cand, a.iataCode, !LOOSE)
      if (info) { place = cand; break }
    }
    if (!info) { console.log(`  ⚠ ${label}: sin foto (probado: ${candidates.join(' / ')})`); skipped++; continue }
    if (!APPLY) { console.log(`  · ${label} → "${place}": "${info.filename.slice(0, 40)}" · ${info.license}`); done++; continue }
    const asset = await uploadToSanity(info.url, `${a.slug}-airport-featured.jpg`)
    await client.patch(a._id).set({
      featuredImage: {
        _type: 'image', asset: { _type: 'reference', _ref: asset._id },
        alt: `${place} — private airport transfers`,
        creditAuthor: info.author, creditLicense: info.license, creditUrl: info.page,
      },
    }).commit()
    done++
    console.log(`  ✓ ${label} → "${place}": ${info.license}`)
  } catch (e) { failed++; console.log(`  ✗ ${label}: ${e.message}`) }
}
console.log(`\n=== ${APPLY ? 'Hecho' : 'Simulación'} === con imagen: ${done} · sin foto: ${skipped} · fallidas: ${failed}`)
