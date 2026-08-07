/**
 * Real photos for INTERNATIONAL destinations that the Spanish-Wikipedia script
 * (add-route-images-wikipedia.mjs) can't find — Italian, Croatian, Turkish,
 * Greek, Portuguese, French, Montenegrin, Maltese resorts, etc.
 *
 * Strategy: English Wikipedia has an article with real photos for essentially
 * every famous resort in the batch, so we query EN first, then the destination
 * country's local-language Wikipedia as a fallback, then Spanish. Only accepts
 * photos whose filename names the destination, and only CC BY / CC BY-SA / PD /
 * CC0 licences (credit rendered on the page). Same quality filters as the comarca
 * pass (no buses, coats of arms, satellite, barracks, engravings…).
 *
 * Processes every hidden route that still has no featuredImage.
 *
 * Usage:
 *   node scripts/add-route-images-intl.mjs            # dry run
 *   node scripts/add-route-images-intl.mjs --apply
 */
import { readFileSync } from 'fs'
import { createClient } from '@sanity/client'

for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([^#=]+)=(.*)$/)
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim()
}
const APPLY = process.argv.includes('--apply')
const LIMIT = Number((process.argv.find(a => a.startsWith('--limit=')) || '').split('=')[1] || '0') || Infinity

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

// Airport IATA → local-language Wikipedia to try after English.
const IATA_LANG = {
  NAP:'it',OLB:'it',AHO:'it',CAG:'it',CTA:'it',PMO:'it',BRI:'it',SUF:'it',VCE:'it',
  DBV:'hr',SPU:'hr',ZAD:'hr',PUY:'hr',
  FAO:'pt',LIS:'pt',OPO:'pt',
  AYT:'tr',BJV:'tr',DLM:'tr',
  NCE:'fr',
  PFO:'el',LCA:'el',KGS:'el',ATH:'el',
  MLA:'en',TIV:'sr',
  IBZ:'es',BCN:'es',VLC:'es',SVQ:'es',
}

const NOT_A_PHOTO = /bandera|flag|escudo|coat.?of.?arms|\bcoa\b|location|localizaci|mapa|map[_.]|\.svg|logo|commons|wiki|icon|symbol|blason/i
const OFF_TOPIC = new RegExp([
  'bellota','insect','mariposa','butterfly','flor[_ ]','flower','bird','ave[_ ]','seta','hongo','mushroom','retrato','portrait',
  'barragem','embalse','presa[_ ]','pantano','grabado','litograf','blanco y negro','dibujo','plano[_ ]','cartel','engraving',
  '\\b1[5-9]\\d\\d\\b','\\bbus\\b','autob[uú]s','irisbus','citelis','tranv','\\bmetro[_ ]','estaci[oó]n de autob',
  'aerogenerador','wind[_ ]turbine','sat[eé]lite','satellite','sentinel','landsat','from[_ ]space','aerial',
  'aeropuerto','airport','aeroport','flughafen','cuartel','guardia civil','caserma','kaserne','escuela','escola','\\beb[_ ]?\\d','stemma','wappen',
].join('|'), 'i')
const SCENIC = /panor|vista|views?[_.]|paesaggio|paisaje|pueblo|casco|playa|beach|spiaggia|plaza|piazza|calle|street|old[_ ]town|centro|harbou?r|porto|puerto|castello|castillo|church|chiesa|iglesia|skyline|mirador|coast|costa|bay|marina|seafront|waterfront|veduta|paysage/i

async function wiki(lang, params) {
  const url = `https://${lang}.wikipedia.org/w/api.php?${new URLSearchParams({ format: 'json', origin: '*', ...params })}`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`wiki ${res.status}`)
  return res.json()
}

async function findArticle(dest, lang) {
  const data = await wiki(lang, { action: 'query', list: 'search', srsearch: dest, srlimit: 6 })
  const hits = (data.query?.search || []).map(h => h.title)
  const key = norm(dest).split(/[\s,(]+/)[0]
  return hits.find(t => norm(t).includes(key)) || null
}

async function articlePhotos(title, dest, lang) {
  const data = await wiki(lang, { action: 'query', prop: 'images', titles: title, imlimit: '60' })
  const page = Object.values(data.query?.pages || {})[0]
  const files = (page?.images || [])
    .map(i => i.title.replace(/^(Archivo|Ficheiro|File|Datei|Immagine|Slika|Dosya|Αρχείο):/i, ''))
    .filter(f => /\.(jpe?g|png)$/i.test(f) && !NOT_A_PHOTO.test(f) && !OFF_TOPIC.test(f))
  const key = norm(dest).split(/[\s,(]+/)[0]
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
  if (!/CC|public domain|pd|attribution/i.test(license)) return null
  const author = (meta.Artist?.value || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Wikimedia Commons'
  return { url: info.thumburl || info.url, license: license || 'CC BY-SA', author,
    page: info.descriptionurl || `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename)}`, filename }
}

async function uploadToSanity(url, filename) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`descarga ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 15_000) throw new Error('imagen demasiado pequeña')
  return client.assets.upload('image', buf, { filename, contentType: 'image/jpeg' })
}

async function findPhoto(dest, iata) {
  const langs = ['en', IATA_LANG[iata] || 'en', 'es'].filter((v, i, a) => a.indexOf(v) === i)
  for (const lang of langs) {
    try {
      const article = await findArticle(dest, lang)
      await sleep(150)
      if (!article) continue
      const files = await articlePhotos(article, dest, lang)
      await sleep(150)
      for (const f of files.slice(0, 6)) {
        const info = await fileInfo(f)
        await sleep(120)
        if (info) return info
      }
    } catch { /* try next lang */ }
  }
  return null
}

async function run() {
  const routes = await client.fetch(
    `*[_type=="route" && hidden==true && !defined(featuredImage.asset)]{
       _id, "slug": slug.current, "dest": destination->title, "origin": origin->title, "iata": origin->iataCode
     } | order(iata asc, dest asc)`
  )
  console.log(`Rutas ocultas sin imagen: ${routes.length}`)
  const batch = routes.slice(0, LIMIT)
  let done = 0, skipped = 0, failed = 0
  for (const [i, r] of batch.entries()) {
    const label = `[${i + 1}/${batch.length}] ${r.iata} → ${r.dest}`
    try {
      const info = await findPhoto(r.dest, r.iata)
      if (!info) { console.log(`  ⚠ ${label}: sin foto`); skipped++; continue }
      const altEn = `${r.dest} — private transfer from ${r.origin}`
      const altEs = `${r.dest} — traslado privado desde ${r.origin}`
      if (!APPLY) { console.log(`  · ${label}: "${info.filename.slice(0, 40)}" · ${info.license}`); done++; continue }
      const asset = await uploadToSanity(info.url, `${r.slug}-featured.jpg`)
      await client.patch(r._id).set({
        featuredImage: { _type: 'image', asset: { _type: 'reference', _ref: asset._id },
          alt: altEn, creditAuthor: info.author, creditLicense: info.license, creditUrl: info.page },
        'translations.es.featuredImageAlt': altEs,
      }).commit()
      done++
      console.log(`  ✓ ${label}: ${info.license}`)
    } catch (e) { failed++; console.log(`  ✗ ${label}: ${e.message}`) }
  }
  console.log(`\n=== ${APPLY ? 'Hecho' : 'Simulación'} === con imagen: ${done} · sin foto: ${skipped} · fallidas: ${failed}`)
}
run().catch(e => { console.error('FATAL:', e.message); process.exit(1) })
