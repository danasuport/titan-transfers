/**
 * Regional fallback imagery for routes whose destination has no photo of its own
 * — golf resorts, urbanisations and hamlets that don't have a Wikipedia article
 * (or whose article carries no usable photo). The client's priority:
 *
 *   1. a real photo of the destination itself      → add-route-images-wikipedia.mjs
 *   2. a real photo of its comarca / municipality   → THIS script
 *   3. a generic owned transfer photo               → page-level fallback (no data)
 *
 * How it works. Most of these places sit inside a well-known municipality
 * (Cabo Pino → Marbella, Cancelada → Estepona, …). We map each resort to that
 * municipality, pull a real, correctly-licensed photo of it from Wikipedia, and
 * store it on the route with an HONEST alt: "<municipio> — la zona de <resort>".
 * The reader is never told the photo is the resort; it's the area around it, and
 * that is true and checkable — the same standard as the Pexels comarca pass.
 *
 * Destinations that ARE real towns but were missed by the town pass (a stricter
 * filename filter) resolve themselves: with no override we search the
 * destination's own name, so Almuñécar, Medina-Sidonia, Priego de Córdoba, … get
 * their own photo and the alt stays the normal "<town> — private transfer".
 *
 * Licence: same as the town pass — CC BY / CC BY-SA, credit rendered on the page.
 *
 * Usage:
 *   node scripts/add-route-images-comarca.mjs --airport=AGP --limit=5   # dry run
 *   node scripts/add-route-images-comarca.mjs --airport=AGP --apply
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

const UA = 'TitanTransfersBot/1.0 (https://titantransfers.com; contact@titantransfers.com)'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN_WRITE || process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Resort / urbanisation / district  →  the municipality to photograph instead.
// Only entries that are NOT towns in their own right; real towns are left out so
// they resolve to their own name. Geography double-checked by hand.
const OVERRIDE = {
  'Alhaurín Golf Resort': 'Alhaurín de la Torre',
  'Almenara Golf Club': 'Sotogrande',
  'Atalaya Park': 'Estepona',
  'Cabo Pino': 'Marbella',
  'Las Lomas de Cabopino': 'Marbella',
  'Cancelada': 'Estepona',
  'Club la Costa World': 'Mijas',
  'El Madroñal': 'Benahavís',
  'El Paraiso': 'Estepona',
  'Elviria': 'Marbella',
  'La Capellania': 'Benalmádena',
  'La Mairena': 'Ojén',
  'Las Chapas': 'Marbella',
  'Lauro Golf Resort': 'Alhaurín de la Torre',
  'Marbesa': 'Marbella',
  'Miraflores Golf Resort': 'Mijas',
  'Nueva Andalucía': 'Marbella',
  'Puebla Aida': 'Mijas',
  'Riviera del Sol': 'Mijas',
  'Sitio de Calahonda': 'Mijas',
  'Sunset Beach Malaga': 'Benalmádena',
  'Torrealquería': 'Alhaurín de la Torre',
  'Torrequebrada': 'Benalmádena',
  'Atlanterra': 'Zahara de los Atunes',
  'La Chullera': 'Manilva',
  'Torreguadiaro': 'San Roque',
  'Valdevaqueros': 'Tarifa',
  'Buenas Noches': 'Estepona',
  'Bahía Serena': 'Roquetas de Mar',
  'Desert Springs Golf Resort': 'Cuevas del Almanzora',
  'Fuentes de Cesna': 'Algarinejo',
  'Sabariego': 'Alcaudete',
  'Zalea': 'Pizarra',
  'Pedregalejo': 'Málaga',
  'Parque Tecnologico': 'Málaga',
  'Montecastillo Resort': 'Jerez de la Frontera',
  'Novo Sancti Petri': 'Chiclana de la Frontera',
  // spelling fix — the sheet has "Sayolonga", the town is Sayalonga
  'Sayolonga': 'Sayalonga',
  // Portugal (Algarve) — searched on pt.wikipedia
  'Albufeira': 'Albufeira',
  'Vilamoura': 'Loulé',
  'Monte Gordo': 'Vila Real de Santo António',
}
const PT = new Set(['Albufeira', 'Vilamoura', 'Monte Gordo'])

const NOT_A_PHOTO = /bandera|flag|escudo|coat.?of.?arms|\bcoa\b|location|localizaci|mapa|map[_.]|\.svg|logo|commons|wiki|icon|symbol/i
const OFF_TOPIC = new RegExp([
  'bellota', 'insect', 'mariposa', 'butterfly', 'flor[_ ]', 'flower', 'bird', 'ave[_ ]',
  'seta', 'hongo', 'mushroom', 'retrato', 'portrait',
  'barragem', 'embalse', 'presa[_ ]', 'pantano',
  'grabado', 'litograf', 'blanco y negro', 'dibujo', 'plano[_ ]', 'cartel',
  '\\b1[5-9]\\d\\d\\b',
  // civic transport — a public bus/tram is the wrong image for a private transfer
  '\\bbus\\b', 'autob[uú]s', 'irisbus', 'citelis', 'tranv', 'trolebus', '\\bmetro[_ ]', 'estaci[oó]n de autob',
  // aerial / satellite imagery reads as a map, not a place
  'aerogenerador', 'wind[_ ]turbine', 'sat[eé]lite', 'satellite', 'sentinel', 'landsat', 'iss0', 'from[_ ]space', 'aerial', 'a[eé]rea',
  // the departure airport, barracks and schools are not the destination's charm
  'aeropuerto', 'airport', 'cuartel', 'guardia civil', 'escuela', 'escola', '\\beb[_ ]?\\d',
].join('|'), 'i')

// Filenames that suggest an actual view of the place, tried before civic buildings.
const SCENIC = /panor|vista|views?[_.]|paisaje|pueblo|casco|playa|beach|puerto|harbou?r|castillo|plaza|calle|street|iglesia|church|skyline|town[_ ]|ciudad|old[_ ]town|mirador|costa/i

async function wiki(lang, params) {
  const url = `https://${lang}.wikipedia.org/w/api.php?${new URLSearchParams({ format: 'json', origin: '*', ...params })}`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`wiki ${res.status}`)
  return res.json()
}

async function findArticle(place, lang) {
  const term = lang === 'pt' ? `${place} freguesia Portugal` : `${place} municipio España`
  const data = await wiki(lang, { action: 'query', list: 'search', srsearch: term, srlimit: 5 })
  const hits = (data.query?.search || []).map(h => h.title)
  const key = norm(place).split(/[\s,]+/)[0]
  return hits.find(t => norm(t).includes(key)) || null
}

async function articlePhotos(title, place, lang) {
  const data = await wiki(lang, { action: 'query', prop: 'images', titles: title, imlimit: '40' })
  const page = Object.values(data.query?.pages || {})[0]
  const files = (page?.images || [])
    .map(i => i.title.replace(/^(Archivo|Ficheiro|File):/, ''))
    .filter(f => /\.(jpe?g|png)$/i.test(f) && !NOT_A_PHOTO.test(f) && !OFF_TOPIC.test(f))
  const key = norm(place).split(/[\s,]+/)[0]
  // Scenic views first, civic buildings last — both are real photos of the place,
  // but a townscape sells a destination better than a courthouse.
  return files
    .filter(f => norm(f).includes(key))
    .sort((a, b) => (SCENIC.test(b) ? 1 : 0) - (SCENIC.test(a) ? 1 : 0))
}

async function fileInfo(filename) {
  const url = `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
    action: 'query', titles: `File:${filename}`, prop: 'imageinfo',
    iiprop: 'url|extmetadata|size', iiurlwidth: '1600', format: 'json', origin: '*',
  })}`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) return null
  const page = Object.values((await res.json()).query?.pages || {})[0]
  const info = page?.imageinfo?.[0]
  if (!info) return null
  const meta = info.extmetadata || {}
  const license = meta.LicenseShortName?.value || ''
  if (/fair use|non-?commercial|\bNC\b|\bND\b/i.test(license)) return null
  const author = (meta.Artist?.value || '')
    .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Wikimedia Commons'
  return {
    url: info.thumburl || info.url,
    license: license || 'CC BY-SA',
    author,
    page: info.descriptionurl || `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename)}`,
    filename,
  }
}

async function uploadToSanity(url, filename) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`descarga ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 15_000) throw new Error('imagen demasiado pequeña')
  return client.assets.upload('image', buf, { filename, contentType: 'image/jpeg' })
}

async function run() {
  const routes = await client.fetch(
    `*[_type=="route" && origin->iataCode==$iata && !defined(featuredImage.asset)]{
       _id, "slug": slug.current, "dest": destination->title, "origin": origin->title
     } | order(dest asc)`,
    { iata: AIRPORT }
  )
  console.log(`Rutas de ${AIRPORT} sin imagen: ${routes.length}`)
  const batch = routes.slice(0, LIMIT)
  if (batch.length < routes.length) console.log(`  (procesando ${batch.length})`)
  if (!batch.length) return

  let done = 0, skipped = 0, failed = 0
  for (const [i, r] of batch.entries()) {
    const ref = OVERRIDE[r.dest] || r.dest      // where to get the photo from
    const isArea = norm(ref) !== norm(r.dest)   // photo is of the area, not the place itself
    const lang = PT.has(r.dest) ? 'pt' : 'es'
    const label = `[${i + 1}/${batch.length}] ${r.dest}${isArea ? ` → ${ref}` : ''}`
    try {
      const article = await findArticle(ref, lang)
      await sleep(250)
      if (!article) { console.log(`  ⚠ ${label}: sin artículo`); skipped++; continue }

      const files = await articlePhotos(article, ref, lang)
      await sleep(250)
      if (!files.length) { console.log(`  ⚠ ${label}: sin fotos usables (${article})`); skipped++; continue }

      let info = null
      for (const f of files) {
        info = await fileInfo(f)
        await sleep(200)
        if (info) break
      }
      if (!info) { console.log(`  ⚠ ${label}: sin licencia usable`); skipped++; continue }

      // Honest alt. When the photo is of the surrounding municipality we say so;
      // when it's the place itself (a town missed by the town pass) it reads normal.
      const altEn = isArea
        ? `${ref} — the area around ${r.dest}, reached by private transfer from ${r.origin}`
        : `${r.dest} — private transfer from ${r.origin}`
      const altEs = isArea
        ? `${ref} — la zona de ${r.dest}, con traslado privado desde ${r.origin}`
        : `${r.dest} — traslado privado desde ${r.origin}`

      if (!APPLY) {
        console.log(`  · ${label}: "${info.filename.slice(0, 40)}" · ${info.license} · ${info.author.slice(0, 26)}`)
        done++
        continue
      }

      const asset = await uploadToSanity(info.url, `${r.slug}-featured.jpg`)
      await client.patch(r._id).set({
        featuredImage: {
          _type: 'image', asset: { _type: 'reference', _ref: asset._id },
          alt: altEn, creditAuthor: info.author, creditLicense: info.license, creditUrl: info.page,
        },
        'translations.es.featuredImageAlt': altEs,
      }).commit()
      done++
      console.log(`  ✓ ${label}: ${info.license}`)
    } catch (e) {
      failed++
      console.log(`  ✗ ${label}: ${e.message}`)
    }
  }

  console.log(`\n=== ${APPLY ? 'Hecho' : 'Simulación'} ===`)
  console.log(`  con imagen : ${done}`)
  console.log(`  sin foto   : ${skipped}`)
  console.log(`  fallidas   : ${failed}`)
  if (!APPLY) console.log(`\n(dry run — nada subido. Repite con --apply.)`)
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1) })
