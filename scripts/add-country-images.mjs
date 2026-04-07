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

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN_WRITE || process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Search terms for Wikimedia API — will fetch actual image URL dynamically
const countrySearch = {
  france: { q: 'Eiffel Tower Paris', alt: 'Eiffel Tower in Paris, France', altEs: 'Torre Eiffel en París, Francia' },
  germany: { q: 'Brandenburg Gate Berlin', alt: 'Brandenburg Gate in Berlin, Germany', altEs: 'Puerta de Brandeburgo en Berlín, Alemania' },
  ireland: { q: 'Cliffs of Moher Ireland', alt: 'Cliffs of Moher, Ireland', altEs: 'Acantilados de Moher, Irlanda' },
  jamaica: { q: 'Montego Bay Jamaica beach', alt: 'Beach in Montego Bay, Jamaica', altEs: 'Playa en Montego Bay, Jamaica' },
  kosovo: { q: 'Prizren Kosovo old town', alt: 'Prizren old town, Kosovo', altEs: 'Casco antiguo de Prizren, Kosovo' },
  mexico: { q: 'Chichen Itza Mexico pyramid', alt: 'Chichen Itza pyramid, Mexico', altEs: 'Pirámide de Chichén Itzá, México' },
  morocco: { q: 'Marrakech Koutoubia Morocco', alt: 'Koutoubia Mosque in Marrakech, Morocco', altEs: 'Mezquita Kutubía en Marrakech, Marruecos' },
  netherlands: { q: 'Amsterdam canal houses', alt: 'Canal houses in Amsterdam, Netherlands', altEs: 'Casas del canal en Ámsterdam, Países Bajos' },
  'north-macedonia': { q: 'Ohrid lake Macedonia church', alt: 'Lake Ohrid, North Macedonia', altEs: 'Lago Ohrid, Macedonia del Norte' },
  panama: { q: 'Panama City skyline', alt: 'Panama City skyline', altEs: 'Panorámica de Ciudad de Panamá' },
  portugal: { q: 'Lisbon Belem Tower Portugal', alt: 'Belem Tower in Lisbon, Portugal', altEs: 'Torre de Belém en Lisboa, Portugal' },
  'puerto-rico': { q: 'Old San Juan Puerto Rico', alt: 'Old San Juan, Puerto Rico', altEs: 'Viejo San Juan, Puerto Rico' },
  thailand: { q: 'Grand Palace Bangkok Thailand', alt: 'Grand Palace in Bangkok, Thailand', altEs: 'Gran Palacio en Bangkok, Tailandia' },
  turkey: { q: 'Istanbul Blue Mosque skyline', alt: 'Istanbul skyline with Blue Mosque, Turkey', altEs: 'Panorámica de Estambul con la Mezquita Azul, Turquía' },
  'united-kingdom': { q: 'Big Ben London Westminster', alt: 'Big Ben and Palace of Westminster, London', altEs: 'Big Ben y Palacio de Westminster, Londres, Reino Unido' },
}

// Use Wikimedia API to search for image and get a working thumbnail URL
async function findWikimediaImage(searchTerm) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&srnamespace=6&srlimit=5&format=json`
  const buf = await fetchBuffer(apiUrl)
  const data = JSON.parse(buf.toString())
  const results = data.query?.search || []

  for (const r of results) {
    const title = r.title // e.g. "File:Something.jpg"
    // Get actual image info
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size&iiurlwidth=1200&format=json`
    const infoBuf = await fetchBuffer(infoUrl)
    const infoData = JSON.parse(infoBuf.toString())
    const pages = infoData.query?.pages || {}
    const page = Object.values(pages)[0]
    const ii = page?.imageinfo?.[0]
    if (ii && ii.thumburl && ii.width > 400) {
      return ii.thumburl
    }
  }
  return null
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    mod.get(url, { headers: { 'User-Agent': 'TitanTransfersBot/1.0' } }, (res) => {
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

async function run() {
  const countries = await client.fetch('*[_type == "country" && !defined(featuredImage.asset)]{_id, title, "slug": slug.current}')
  console.log(`Found ${countries.length} countries without images\n`)

  for (const country of countries) {
    const entry = countrySearch[country.slug]
    if (!entry) {
      console.log(`⚠ No image mapped for ${country.title} (${country.slug}), skipping`)
      continue
    }

    try {
      console.log(`→ ${country.title}: searching Wikimedia for "${entry.q}"...`)
      const imageUrl = await findWikimediaImage(entry.q)
      if (!imageUrl) {
        console.log(`  ⚠ No image found, skipping\n`)
        continue
      }
      console.log(`  Found: ${imageUrl.substring(0, 80)}...`)

      await new Promise(r => setTimeout(r, 3000))

      const buf = await fetchBuffer(imageUrl)
      console.log(`  Uploading to Sanity (${(buf.length / 1024).toFixed(0)} KB)...`)
      const asset = await client.assets.upload('image', buf, {
        filename: `${country.slug}-featured.jpg`,
        contentType: 'image/jpeg',
      })

      await client
        .patch(country._id)
        .set({
          featuredImage: {
            _type: 'image',
            alt: entry.alt,
            asset: { _type: 'reference', _ref: asset._id },
          },
          'translations.es.featuredImageAlt': entry.altEs,
        })
        .commit()

      console.log(`  ✓ Done: ${entry.alt}\n`)
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}\n`)
    }
    // Delay between countries
    await new Promise(r => setTimeout(r, 3000))
  }

  console.log('All done!')
}

run().catch(console.error)
