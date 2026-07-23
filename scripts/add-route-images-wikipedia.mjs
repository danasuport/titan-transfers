/**
 * Real photos of each destination, from that municipality's Wikipedia article,
 * with the attribution their licence requires.
 *
 * Why this source. Three were tested against the actual destination list:
 *   · Wikimedia Commons search (scripts/add-route-images.mjs) — unusable.
 *     "Frigiliana Spain landmark" returns nothing; "Sedella Spain landmark"
 *     returns scanned PDFs from American libraries.
 *   · Pexels — only ~20% coverage, and it fails dangerously: for a village it
 *     doesn't know it returns thousands of generic "white Andalusian village"
 *     photos rather than nothing, so unverified use illustrates pages with
 *     somewhere else entirely.
 *   · The municipality's own Wikipedia article — a real photo of the place for
 *     essentially every destination. That's this script.
 *
 * The catch, and why the schema grew credit fields: these images are CC BY /
 * CC BY-SA, which require the author and licence to be shown VISIBLY next to
 * the image. The page renders that credit; an alt attribute would not satisfy
 * the licence.
 *
 * Usage:
 *   node scripts/add-route-images-wikipedia.mjs --airport=AGP --limit=5   # dry run
 *   node scripts/add-route-images-wikipedia.mjs --airport=AGP --apply
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

// Heraldry, maps and UI chrome dominate municipality articles and are useless
// as page imagery — a flag is not a photo of the town.
const NOT_A_PHOTO = /bandera|flag|escudo|coat[_ ]of[_ ]arms|coa[_.]|location|localizaci|mapa|map[_.]|\.svg|logo|commons|wiki|icon|symbol/i
// Real photos that are nonetheless the wrong picture for a transfer page:
// nature close-ups, historical engravings and magazine scans (a 1903 etching
// doesn't show today's town), and reservoirs — "albufeira" is Portuguese for
// reservoir, which matched a dam in Cáceres for Albufeira in the Algarve.
const OFF_TOPIC = new RegExp([
  'bellota', 'insect', 'mariposa', 'butterfly', 'flor[_ ]', 'flower', 'bird', 'ave[_ ]',
  'seta', 'hongo', 'mushroom', 'retrato', 'portrait',
  'barragem', 'embalse', 'presa[_ ]', 'pantano',
  'grabado', 'litograf', 'blanco y negro', 'dibujo', 'plano[_ ]', 'cartel',
  '\\b1[5-9]\\d\\d\\b', // pre-1900s dates in the filename
].join('|'), 'i')

async function wiki(params) {
  const url = `https://es.wikipedia.org/w/api.php?${new URLSearchParams({ format: 'json', origin: '*', ...params })}`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`wiki ${res.status}`)
  return res.json()
}

/** Article title for a destination, preferring the Málaga/Spain disambiguation. */
async function findArticle(dest) {
  const data = await wiki({ action: 'query', list: 'search', srsearch: `${dest} municipio España`, srlimit: 5 })
  const hits = (data.query?.search || []).map(h => h.title)
  const key = norm(dest).split(/[\s,]+/)[0]
  return hits.find(t => norm(t).includes(key)) || null
}

/** Candidate photo filenames from the article, best first. */
async function articlePhotos(title, dest) {
  const data = await wiki({ action: 'query', prop: 'images', titles: title, imlimit: '40' })
  const page = Object.values(data.query?.pages || {})[0]
  const files = (page?.images || [])
    .map(i => i.title.replace(/^(Archivo|File):/, ''))
    .filter(f => /\.(jpe?g|png)$/i.test(f) && !NOT_A_PHOTO.test(f) && !OFF_TOPIC.test(f))

  // ONLY files that name the town. Falling back to "any photo in the article"
  // put a picture of Torre del Mar on the Algarrobo page — a different village
  // a few kilometres away. No photo is better than the wrong one.
  const key = norm(dest).split(/[\s,]+/)[0]
  return files.filter(f => norm(f).includes(key))
}

/** URL + licence + author, or null when the licence isn't one we can use. */
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
  // Anything more restrictive than CC BY-SA (NC, ND, "fair use") can't go on a
  // commercial page at all, so skip rather than risk it.
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
       _id, "slug": slug.current, "dest": destination->title, "origin": origin->title,
       "nSections": count(contentSections)
     } | order(dest asc)`,
    { iata: AIRPORT }
  )
  console.log(`Rutas de ${AIRPORT} sin imagen: ${routes.length}`)
  const batch = routes.slice(0, LIMIT)
  if (batch.length < routes.length) console.log(`  (procesando ${batch.length})`)
  if (!batch.length) return

  let done = 0, skipped = 0, failed = 0
  for (const [i, r] of batch.entries()) {
    const label = `[${i + 1}/${batch.length}] ${r.dest}`
    try {
      const article = await findArticle(r.dest)
      await sleep(250)
      if (!article) { console.log(`  ⚠ ${label}: sin artículo`); skipped++; continue }

      const files = await articlePhotos(article, r.dest)
      await sleep(250)
      if (!files.length) { console.log(`  ⚠ ${label}: sin fotos usables (${article})`); skipped++; continue }

      // Take up to 1 featured + 3 section images, skipping unusable licences.
      const want = 1 + Math.min(r.nSections, 3)
      const picked = []
      for (const f of files) {
        if (picked.length >= want) break
        const info = await fileInfo(f)
        await sleep(200)
        if (info) picked.push(info)
      }
      if (!picked.length) { console.log(`  ⚠ ${label}: sin licencia usable`); skipped++; continue }

      const altEn = `${r.dest} — private transfer from ${r.origin}`
      const altEs = `${r.dest} — traslado privado desde ${r.origin}`

      if (!APPLY) {
        console.log(`  · ${label}: ${picked.length} img — "${picked[0].filename.slice(0, 42)}" · ${picked[0].license} · ${picked[0].author.slice(0, 28)}`)
        done++
        continue
      }

      const credit = info => ({
        alt: altEn,
        creditAuthor: info.author,
        creditLicense: info.license,
        creditUrl: info.page,
      })

      const featured = picked[0]
      const asset = await uploadToSanity(featured.url, `${r.slug}-featured.jpg`)
      const patch = {
        featuredImage: { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, ...credit(featured) },
        'translations.es.featuredImageAlt': altEs,
      }

      for (let s = 0; s < Math.min(r.nSections, 3) && s + 1 < picked.length; s++) {
        const info = picked[s + 1]
        const a = await uploadToSanity(info.url, `${r.slug}-s${s}.jpg`)
        patch[`contentSections[${s}].image`] = { _type: 'image', asset: { _type: 'reference', _ref: a._id }, ...credit(info) }
        patch[`contentSections[${s}].imageAlt`] = altEn
      }

      await client.patch(r._id).set(patch).commit()
      done++
      console.log(`  ✓ ${label}: ${picked.length} img · ${featured.license}`)
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
