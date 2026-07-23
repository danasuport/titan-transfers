/**
 * Featured + section images for routes, from Pexels, with an honesty rule.
 *
 * Why not scripts/add-route-images.mjs: that one searches Wikimedia Commons,
 * which has no usable coverage for these destinations (Frigiliana returns zero
 * results; Sedella returns PDFs of American library scans) and is mostly CC BY-SA,
 * which needs visible attribution on a commercial site. Pexels allows commercial
 * use with no attribution.
 *
 * The trap this script exists to avoid: when Pexels doesn't know a village it
 * does NOT return nothing — it returns thousands of generic "white Andalusian
 * village" photos. Accepting those silently would illustrate dozens of pages
 * with somewhere that isn't the place. So a destination photo is only used when
 * the destination's name actually appears in the photo's own description.
 * Everything else falls back to a photo of the comarca, and says so in the alt
 * text: honest, and still useful to the reader.
 *
 * Usage:
 *   node scripts/add-route-images-pexels.mjs --airport=AGP --limit=3   # dry run
 *   node scripts/add-route-images-pexels.mjs --airport=AGP --apply
 */
import { readFileSync } from 'fs'
import { createClient } from '@sanity/client'

for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([^#=]+)=(.*)$/)
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim()
}

const arg = (n, d = null) => {
  const h = process.argv.find(a => a.startsWith(`--${n}=`))
  return h ? h.slice(n.length + 3) : d
}
const APPLY = process.argv.includes('--apply')
const AIRPORT = (arg('airport') || 'AGP').toUpperCase()
const LIMIT = Number(arg('limit', '0')) || Infinity
const COMARCAS_FILE = arg('comarcas', '/private/tmp/claude-501/-Users-WEBKMABCN-Documents-titan/38a7d564-287c-4a6e-aacf-710446851937/scratchpad/comarcas.json')

const PEXELS_KEY = process.env.PEXELS_KEY || '8qiSZL5VPyIGFvvlRhwFaMRBCPzdPBg5Q6wg4NMv1JoWxwJqdOI63ZAb'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN_WRITE || process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function pexels(query, perPage = 8) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape&size=large`,
      { headers: { Authorization: PEXELS_KEY } }
    )
    if (res.status === 429) { await sleep(20_000); continue }
    if (!res.ok) throw new Error(`Pexels ${res.status}`)
    const json = await res.json()
    return json.photos || []
  }
  throw new Error('Pexels rate-limited after retries')
}

// Spanish connectives and generic scenery words — they carry no identity, so
// they must not count towards a match.
const STOP = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'san', 'santa',
  'spain', 'andalusia', 'andalucia', 'costa', 'mountains', 'mountain', 'beach',
  'coast', 'village', 'town', 'landscape', 'view', 'golf', 'resort'])

const tokens = s => norm(s).split(/[\s,\-()]+/).filter(w => w.length > 3 && !STOP.has(w))

/**
 * Photos whose description names the place — what separates "a photo of
 * Frigiliana" from "a photo of some white village".
 *
 * EVERY identifying word must appear, not just the longest one: matching on
 * "alcala" alone accepted a photo of Alcalá del Júcar (Albacete, 500km away)
 * for Alcalá la Real (Jaén). Requiring "alcala" AND "real" rejects it.
 */
function photosActuallyOf(place, photos) {
  const want = tokens(place)
  if (!want.length) return []
  return photos.filter(p => {
    const alt = norm(p.alt)
    return want.every(w => alt.includes(w))
  })
}

/** The place the query is built around — by design, the first word of it. */
const toponymOf = query => tokens(query)[0] || ''

const comarcaCache = new Map()
/**
 * Photos of the region's reference town, verified against that town's name
 * ONLY. Matching on any query word was far too loose: "Guadix cave houses"
 * accepted a photo of Göreme in Turkey (via "cave houses") and "Alhama de
 * Granada gorge" accepted Ronda's Puente Nuevo (via "gorge"). The toponym is
 * the only word that identifies the place, so it's the only one that counts.
 */
async function comarcaPhotos(query) {
  if (!comarcaCache.has(query)) {
    const top = toponymOf(query)
    const pool = top ? await pexels(query, 15) : []
    comarcaCache.set(query, pool.filter(p => norm(p.alt).includes(top)))
    await sleep(400)
  }
  return comarcaCache.get(query)
}

async function uploadToSanity(url, filename) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`descarga ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  return client.assets.upload('image', buf, { filename, contentType: 'image/jpeg' })
}

async function run() {
  const comarcas = Object.fromEntries(
    JSON.parse(readFileSync(COMARCAS_FILE, 'utf8')).map(c => [norm(c.dest), c])
  )

  const routes = await client.fetch(
    `*[_type=="route" && origin->iataCode==$iata && !defined(featuredImage.asset)]{
       _id, title, "slug": slug.current,
       "dest": destination->title,
       "origin": origin->title,
       "nSections": count(contentSections)
     } | order(dest asc)`,
    { iata: AIRPORT }
  )

  console.log(`Rutas de ${AIRPORT} sin imagen: ${routes.length}`)
  const batch = routes.slice(0, LIMIT)
  if (batch.length < routes.length) console.log(`  (procesando ${batch.length})`)
  if (!batch.length) return

  let own = 0, region = 0, none = 0, failed = 0
  for (const [i, r] of batch.entries()) {
    const label = `[${i + 1}/${batch.length}] ${r.dest}`
    try {
      let photos = photosActuallyOf(r.dest, await pexels(`${r.dest} Spain`))
      let source = 'propia'
      let altEn, altEs
      await sleep(350)

      if (photos.length) {
        altEn = `${r.dest} — private transfer from ${r.origin}`
        altEs = `${r.dest} — traslado privado desde ${r.origin}`
      } else {
        // No verified photo of the place itself: use the comarca and say so.
        const c = comarcas[norm(r.dest)]
        if (!c) { console.log(`  ⚠ ${label}: sin comarca mapeada, salto`); none++; continue }
        photos = await comarcaPhotos(c.pexelsQuery)
        // Name the town actually in the photo, then place the destination in
        // its region. Both halves are true and checkable — the reader is never
        // told they're looking at a village the picture doesn't show.
        const town = (c.pexelsQuery.split(/\s+/)[0] || '').trim()
        source = `comarca (${c.comarcaEs}, foto de ${town})`
        altEn = `${town}, in ${c.comarcaEn} — the area around ${r.dest}, reached by private transfer from ${r.origin}`
        altEs = `${town}, en ${c.comarcaEs} — la zona de ${r.dest}, con traslado privado desde ${r.origin}`
      }

      if (!photos.length) { console.log(`  ⚠ ${label}: sin fotos, salto`); none++; continue }

      // Rotate within the comarca pool so 49 Costa del Sol pages don't all show
      // the same picture.
      const pick = n => photos[(i + n) % photos.length]
      const needed = 1 + Math.min(r.nSections, 3)
      const chosen = Array.from({ length: needed }, (_, n) => pick(n))

      if (!APPLY) {
        console.log(`  · ${label}: ${source} — "${(chosen[0].alt || '').slice(0, 60)}"`)
        source === 'propia' ? own++ : region++
        continue
      }

      const patch = {}
      const featuredAsset = await uploadToSanity(chosen[0].src.large2x || chosen[0].src.large, `${r.slug}-featured.jpg`)
      patch.featuredImage = { _type: 'image', alt: altEn, asset: { _type: 'reference', _ref: featuredAsset._id } }

      for (let s = 0; s < Math.min(r.nSections, 3); s++) {
        const p = chosen[s + 1]
        const asset = await uploadToSanity(p.src.large || p.src.medium, `${r.slug}-s${s}.jpg`)
        patch[`contentSections[${s}].image`] = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
        patch[`contentSections[${s}].imageAlt`] = altEn
      }
      patch['translations.es.featuredImageAlt'] = altEs

      await client.patch(r._id).set(patch).commit()
      source === 'propia' ? own++ : region++
      console.log(`  ✓ ${label}: ${source}`)
    } catch (e) {
      failed++
      console.log(`  ✗ ${label}: ${e.message}`)
    }
  }

  console.log(`\n=== ${APPLY ? 'Hecho' : 'Simulación'} ===`)
  console.log(`  foto propia del destino : ${own}`)
  console.log(`  foto de su comarca      : ${region}`)
  console.log(`  sin foto                : ${none}`)
  console.log(`  fallidas                : ${failed}`)
  if (!APPLY) console.log(`\n(dry run — nada subido. Repite con --apply.)`)
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1) })
