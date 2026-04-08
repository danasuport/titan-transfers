/**
 * Add featured image, gallery (3 images), and section images to ALL routes
 * Each image gets unique SEO alt text targeting the route's search intent
 *
 * Usage:
 *   SANITY_API_TOKEN_WRITE=sk... node scripts/add-route-images.mjs
 *   SANITY_API_TOKEN_WRITE=sk... ORIGIN_SLUG=barcelona node scripts/add-route-images.mjs
 */
import { createClient } from 'next-sanity'
import { readFileSync } from 'fs'
import https from 'https'
import http from 'http'

const envFile = readFileSync('.env.local', 'utf8')
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN_WRITE || process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const ORIGIN_FILTER = process.env.ORIGIN_SLUG || null

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    mod.get(url, { headers: { 'User-Agent': 'TitanTransfersBot/1.0 (contact@titantransfers.com)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

async function searchWikimedia(query, limit = 5) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=${limit}&format=json`
  const buf = await fetchBuffer(apiUrl)
  return JSON.parse(buf.toString()).query?.search || []
}

async function getImageUrl(fileTitle) {
  const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1200&format=json`
  const buf = await fetchBuffer(infoUrl)
  const data = JSON.parse(buf.toString())
  const page = Object.values(data.query?.pages || {})[0]
  const ii = page?.imageinfo?.[0]
  if (ii && ii.thumburl && ii.width > 300 && (ii.mime?.startsWith('image/jpeg') || ii.mime?.startsWith('image/png'))) {
    return ii.thumburl
  }
  return null
}

async function findImages(queries) {
  const urls = []
  const usedTitles = new Set()
  for (const q of queries) {
    if (urls.length >= 4) break
    try {
      const results = await searchWikimedia(q, 8)
      for (const r of results) {
        if (urls.length >= 4) break
        if (usedTitles.has(r.title)) continue
        usedTitles.add(r.title)
        const url = await getImageUrl(r.title)
        if (url) urls.push(url)
      }
    } catch (e) { /* skip */ }
    await new Promise(r => setTimeout(r, 1500))
  }
  return urls
}

async function uploadImage(buf, filename) {
  return client.assets.upload('image', buf, { filename, contentType: 'image/jpeg' })
}

// Generate varied SEO alt texts for a route
function generateAlts(originTitle, destTitle, destCountry) {
  const route = `${originTitle} to ${destTitle}`
  const routeEs = `${originTitle} a ${destTitle}`
  return {
    featured: {
      en: `Private transfer from ${route} — ${destTitle} skyline and landmarks`,
      es: `Traslado privado de ${routeEs} — panorámica y monumentos de ${destTitle}`,
    },
    gallery: [
      {
        en: `Airport taxi ${route} — professional driver service in ${destTitle}`,
        es: `Taxi aeropuerto ${routeEs} — servicio de conductor profesional en ${destTitle}`,
      },
      {
        en: `Book transfer ${route} — scenic view of ${destTitle}, ${destCountry}`,
        es: `Reservar traslado ${routeEs} — vista panorámica de ${destTitle}, ${destCountry}`,
      },
      {
        en: `${destTitle} private taxi from ${originTitle} — explore ${destTitle} with door-to-door service`,
        es: `Taxi privado en ${destTitle} desde ${originTitle} — explora ${destTitle} con servicio puerta a puerta`,
      },
    ],
    sections: [
      {
        en: `Things to see in ${destTitle} after your transfer from ${originTitle}`,
        es: `Qué ver en ${destTitle} tras tu traslado desde ${originTitle}`,
      },
      {
        en: `${destTitle} travel guide — best attractions near your drop-off point`,
        es: `Guía de viaje de ${destTitle} — mejores atracciones cerca de tu destino`,
      },
      {
        en: `Getting around ${destTitle} — private transfer tips from ${originTitle}`,
        es: `Cómo moverse por ${destTitle} — consejos de traslado privado desde ${originTitle}`,
      },
    ],
  }
}

async function run() {
  let filter = '*[_type == "route"'
  if (ORIGIN_FILTER) filter += ` && origin->slug.current == "${ORIGIN_FILTER}"`
  filter += ']'

  const routes = await client.fetch(`${filter}{
    _id, title, "slug": slug.current,
    "originTitle": origin->title, "originSlug": origin->slug.current,
    "destTitle": destination->title, "destCountry": destination->country->title,
    "hasFeatured": defined(featuredImage.asset),
    "galleryCount": count(gallery[defined(asset)]),
    "sectionCount": count(contentSections[defined(image.asset)]),
    "sectionTitles": contentSections[].title
  } | order(title asc)`)

  // Filter to only routes needing work
  const needWork = routes.filter(r => !r.hasFeatured || r.galleryCount < 3 || r.sectionCount < count(r.sectionTitles))
  console.log(`Total routes: ${routes.length}, needing images: ${needWork.length}\n`)

  let done = 0, errors = 0

  for (const route of needWork) {
    const dest = route.destTitle || 'destination'
    const origin = route.originTitle || 'airport'
    const country = route.destCountry || ''
    const alts = generateAlts(origin, dest, country)

    console.log(`[${done + 1}/${needWork.length}] ${route.title}`)
    console.log(`  Featured: ${route.hasFeatured ? '✓' : '✗'} | Gallery: ${route.galleryCount}/3 | Sections: ${route.sectionCount}/${(route.sectionTitles||[]).length}`)

    // Build search queries — destination-focused for relevant images
    const queries = [
      `${dest} ${country} landmark`,
      `${dest} ${country} city skyline`,
      `${dest} ${country} tourism`,
      `${dest} ${country} architecture`,
      `${dest} ${country} street`,
      `${dest} beach coast` // fallback for coastal destinations
    ]

    try {
      const imageUrls = await findImages(queries)
      if (imageUrls.length === 0) {
        console.log(`  ⚠ No images found, skipping\n`)
        errors++
        continue
      }
      console.log(`  Found ${imageUrls.length} images`)

      const patch = {}
      let imgIdx = 0

      // 1. Featured image
      if (!route.hasFeatured && imageUrls[imgIdx]) {
        await new Promise(r => setTimeout(r, 2000))
        const buf = await fetchBuffer(imageUrls[imgIdx])
        const asset = await uploadImage(buf, `${route.slug}-featured.jpg`)
        patch.featuredImage = {
          _type: 'image',
          alt: alts.featured.en,
          asset: { _type: 'reference', _ref: asset._id },
        }
        patch['translations.es.featuredImageAlt'] = alts.featured.es
        console.log(`  ✓ Featured (${(buf.length / 1024).toFixed(0)}KB)`)
        imgIdx++
      }

      // 2. Gallery images (up to 3)
      if (route.galleryCount < 3) {
        const galleryItems = []
        const needed = Math.min(3 - route.galleryCount, imageUrls.length - imgIdx)
        for (let g = 0; g < needed && imgIdx < imageUrls.length; g++) {
          try {
            await new Promise(r => setTimeout(r, 2000))
            const buf = await fetchBuffer(imageUrls[imgIdx])
            const asset = await uploadImage(buf, `${route.slug}-gallery-${g}.jpg`)
            const altObj = alts.gallery[g] || alts.gallery[0]
            galleryItems.push({
              _type: 'image',
              _key: `gallery-${Date.now()}-${g}`,
              alt: altObj.en,
              asset: { _type: 'reference', _ref: asset._id },
            })
            console.log(`  ✓ Gallery ${g + 1} (${(buf.length / 1024).toFixed(0)}KB)`)
            imgIdx++
          } catch (e) {
            console.log(`  ✗ Gallery ${g + 1}: ${e.message}`)
          }
        }
        if (galleryItems.length > 0) {
          patch.gallery = galleryItems
        }
      }

      // 3. Section images — patch alt text for existing, add images for missing
      const sectionTitles = route.sectionTitles || []
      if (sectionTitles.length > 0 && route.sectionCount < sectionTitles.length) {
        // We need to fetch the full route to know which sections have images
        const full = await client.fetch(`*[_id == $id][0]{contentSections[]{_key, title, "hasImg": defined(image.asset)}}`, { id: route._id })
        const sections = full?.contentSections || []
        for (let s = 0; s < sections.length && imgIdx < imageUrls.length; s++) {
          if (sections[s].hasImg) continue
          try {
            await new Promise(r => setTimeout(r, 2000))
            const buf = await fetchBuffer(imageUrls[imgIdx])
            const asset = await uploadImage(buf, `${route.slug}-section-${s}.jpg`)
            const altObj = alts.sections[s] || alts.sections[0]
            const key = sections[s]._key
            patch[`contentSections[_key=="${key}"].image`] = {
              _type: 'image',
              alt: altObj.en,
              asset: { _type: 'reference', _ref: asset._id },
            }
            patch[`contentSections[_key=="${key}"].imageAlt`] = altObj.en
            console.log(`  ✓ Section "${sections[s].title}" (${(buf.length / 1024).toFixed(0)}KB)`)
            imgIdx++
          } catch (e) {
            console.log(`  ✗ Section ${s}: ${e.message}`)
          }
        }
      }

      // Apply patch
      if (Object.keys(patch).length > 0) {
        await client.patch(route._id).set(patch).commit()
        console.log(`  ✓ Saved to Sanity\n`)
        done++
      } else {
        console.log(`  Nothing to patch\n`)
      }
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}\n`)
      errors++
    }

    await new Promise(r => setTimeout(r, 2000))
  }

  console.log(`\nDone! ${done} routes updated, ${errors} errors.`)
}

function count(arr) { return (arr || []).length }

run().catch(console.error)
