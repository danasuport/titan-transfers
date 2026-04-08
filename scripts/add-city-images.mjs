import { createClient } from 'next-sanity'
import { readFileSync } from 'fs'
import https from 'https'
import http from 'http'

// Load .env.local manually
const envFile = readFileSync('.env.local', 'utf8')
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const SANITY_TOKEN = process.env.SANITY_API_TOKEN_WRITE || process.env.SANITY_API_TOKEN

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    mod.get(url, { headers: { 'User-Agent': 'TitanTransfersBot/1.0 (contact@titantransfers.com)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

async function findWikimediaImage(searchTerm) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&srnamespace=6&srlimit=5&format=json`
  const buf = await fetchBuffer(apiUrl)
  const data = JSON.parse(buf.toString())
  const results = data.query?.search || []

  for (const r of results) {
    const title = r.title
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1200&format=json`
    const infoBuf = await fetchBuffer(infoUrl)
    const infoData = JSON.parse(infoBuf.toString())
    const pages = infoData.query?.pages || {}
    const page = Object.values(pages)[0]
    const ii = page?.imageinfo?.[0]
    if (ii && ii.thumburl && ii.width > 400 && (ii.mime?.startsWith('image/jpeg') || ii.mime?.startsWith('image/png'))) {
      return ii.thumburl
    }
  }
  return null
}

// SEO alt text templates per city
function generateAlt(cityTitle, countryTitle) {
  return {
    en: `Private transfers in ${cityTitle}, ${countryTitle} — book your taxi`,
    es: `Traslados privados en ${cityTitle}, ${countryTitle} — reserva tu taxi`,
  }
}

// Search terms — use city + country for best results
function getSearchTerm(city) {
  // For well-known cities, use landmark-based search
  const specific = {
    'manhattan': 'Manhattan skyline New York',
    'miami-beach': 'Miami Beach ocean drive',
    'houston': 'Houston Texas skyline',
    'anaheim': 'Anaheim Disneyland California',
    'mexico-city': 'Mexico City Palacio Bellas Artes',
    'faro': 'Faro Algarve Portugal city',
    'lloret-de-mar': 'Lloret de Mar Costa Brava beach',
    'playa-del-carmen': 'Playa del Carmen Quinta Avenida',
    'belek': 'Belek Antalya Turkey golf resort',
    'kemer': 'Kemer Antalya Turkey beach',
    'besiktas': 'Besiktas Istanbul Bosphorus',
    'kadikoy': 'Kadikoy Istanbul market',
    'fatih': 'Fatih Istanbul mosque',
    'durham': 'Durham North Carolina',
    'fort-worth': 'Fort Worth Texas Stockyards',
    'kansas-city': 'Kansas City Missouri skyline',
    'fujairah': 'Fujairah UAE coast',
    'marsa-alam': 'Marsa Alam Egypt Red Sea',
    'niagara-falls-canada': 'Niagara Falls Canada',
    'niagara-falls-usa': 'Niagara Falls New York',
    'manresa': 'Manresa Catalonia Spain',
    'malgrat-de-mar': 'Malgrat de Mar Barcelona beach',
    'costa-mujeres': 'Costa Mujeres Cancun beach',
    'akumal': 'Akumal Mexico beach turtles',
    'playa-mujeres': 'Playa Mujeres Cancun Mexico',
    'puerto-morelos': 'Puerto Morelos Mexico',
    'xcaret': 'Xcaret park Mexico Riviera Maya',
    'playacar': 'Playacar Playa del Carmen beach',
    'puerto-aventuras': 'Puerto Aventuras Mexico marina',
    'jebel-ali': 'Jebel Ali Dubai waterfront',
  }
  if (specific[city.slug]) return specific[city.slug]
  return `${city.title} ${city.country || ''} city`
}

async function run() {
  const cities = await client.fetch('*[_type == "city" && !defined(featuredImage.asset)]{_id, title, "slug": slug.current, "country": country->title} | order(title asc)')
  console.log(`Found ${cities.length} cities without images\n`)

  let success = 0, failed = 0

  for (const city of cities) {
    const searchTerm = getSearchTerm(city)
    const alt = generateAlt(city.title, city.country || '')

    try {
      console.log(`→ ${city.title} (${city.country}): searching "${searchTerm}"...`)
      const imageUrl = await findWikimediaImage(searchTerm)
      if (!imageUrl) {
        console.log(`  ⚠ No image found, skipping\n`)
        failed++
        await new Promise(r => setTimeout(r, 2000))
        continue
      }
      console.log(`  Found: ${imageUrl.substring(0, 80)}...`)

      await new Promise(r => setTimeout(r, 2500))

      const buf = await fetchBuffer(imageUrl)
      console.log(`  Uploading to Sanity (${(buf.length / 1024).toFixed(0)} KB)...`)
      const asset = await client.assets.upload('image', buf, {
        filename: `${city.slug}-featured.jpg`,
        contentType: 'image/jpeg',
      })

      await client
        .patch(city._id)
        .set({
          featuredImage: {
            _type: 'image',
            alt: alt.en,
            asset: { _type: 'reference', _ref: asset._id },
          },
          'translations.es.featuredImageAlt': alt.es,
        })
        .commit()

      console.log(`  ✓ Done: ${alt.en}\n`)
      success++
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}\n`)
      failed++
    }
    await new Promise(r => setTimeout(r, 3000))
  }

  console.log(`\nComplete! ${success} images added, ${failed} failed.`)
}

run().catch(console.error)
