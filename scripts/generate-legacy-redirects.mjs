/**
 * Cross-references the 358 old WordPress /rutas/ URLs with the actual Sanity routes
 * and produces scripts/legacy-redirects.json with permanent redirects to the new URLs.
 */
import { createClient } from 'next-sanity'
import { readFileSync, writeFileSync } from 'fs'

const envFile = readFileSync('.env.local', 'utf8')
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// Stop words to remove when extracting the destination from a slug
const STOP = new Set([
  'transfer', 'transfers', 'traslados', 'traslado', 'transbordos',
  'from', 'to', 'a', 'al', 'de', 'del', 'la', 'el', 'los', 'las',
  'en', 'y', 'hasta', 'desde', 'hacia',
  'airport', 'aeropuerto', 'international', 'internacional',
  'the', 'of', 'and', 'in',
])

// Lowercase + strip diacritics
function stripAccents(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// Extract the IATA code (3-letter code) and destination tokens from an old slug
function parseOldSlug(slug) {
  const tokens = stripAccents(slug).split('-').filter(Boolean)

  // Find IATA: first 3-letter UPPERCASE original token (we lowercased, so check with original)
  // Better: use known IATA list
  const KNOWN_IATAS = new Set([
    'bcn','dxb','auh','dwc','rkt','shj','cun','czm','mex','tqo','atl','aus','bos','buf',
    'bwi','chs','clt','dca','den','dfw','dtw','ewr','fll','hnl','hou','iad','iah','jfk',
    'las','lax','lga','mci','mco','mdw','mia','msp','msy','ord','phl','phx','pit','rdu',
    'ric','san','sat','sea','sfo','sju','slc','tpa','ayt','ist','saw',
  ])

  let iata = null
  let iataIdx = -1
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].length === 3 && KNOWN_IATAS.has(tokens[i])) {
      iata = tokens[i]
      iataIdx = i
      break
    }
  }

  // Find "to"/"a" separator → everything after is destination
  let sepIdx = -1
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === 'to' || tokens[i] === 'a' || tokens[i] === 'al' || tokens[i] === 'hasta') {
      // Only consider 'a' if it's after the IATA, since 'a' alone is too short
      if (tokens[i] === 'a' || tokens[i] === 'al' || tokens[i] === 'hasta') {
        if (i > iataIdx && iataIdx >= 0) { sepIdx = i; break }
      } else {
        sepIdx = i
        break
      }
    }
  }

  const destTokens = sepIdx >= 0 ? tokens.slice(sepIdx + 1) : []
  const destSlug = destTokens.filter(t => !STOP.has(t)).join('-')

  return { iata, destSlug, destTokens }
}

// Normalize a destination slug for fuzzy matching against city titles/slugs
function normalizeDest(s) {
  return stripAccents(s).split('-').filter(t => !STOP.has(t)).join('-')
}

async function main() {
  const lines = readFileSync('scripts/old-rutas-urls.txt', 'utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('http'))

  console.log(`Processing ${lines.length} old URLs`)

  const routes = await client.fetch(`*[_type == "route"]{
    _id,
    "enSlug": slug.current,
    "esSlug": translations.es.slug.current,
    "originEnSlug": origin->slug.current,
    "originEsSlug": origin->translations.es.slug.current,
    "originIata": origin->iataCode,
    "destEnSlug": destination->slug.current,
    "destEsSlug": destination->translations.es.slug.current,
    "destTitle": destination->title
  }`)

  console.log(`Loaded ${routes.length} routes from Sanity`)

  // Build indexes
  const enBySlug = {}
  const esBySlug = {}
  const byIataDest = {} // "iata|dest-slug" → route
  for (const r of routes) {
    if (r.enSlug) enBySlug[r.enSlug] = r
    if (r.esSlug) esBySlug[r.esSlug] = r
    if (r.originIata && r.destEnSlug) {
      byIataDest[`${r.originIata.toLowerCase()}|${normalizeDest(r.destEnSlug)}`] = r
    }
    if (r.originIata && r.destTitle) {
      byIataDest[`${r.originIata.toLowerCase()}|${normalizeDest(stripAccents(r.destTitle).replace(/[^a-z0-9]+/g, '-'))}`] = r
    }
  }

  // Specific destination synonyms (old Spanish slug → new English destination slug)
  const DEST_SYNONYMS = {
    'abu-dabi': 'abu-dhabi',
    'fuyaira': 'fujairah',
    'ciudad-de-mexico': 'mexico-city',
    'nueva-orleans': 'new-orleans',
    'filadelfia': 'philadelphia',
    'jebel-ali-motiongate': 'jebel-ali-motiongate',
    'jebel-ali-y-motiongate': 'jebel-ali-motiongate',
    'jebel-ali-and-motiongate': 'jebel-ali-motiongate',
    'centro-de-la-ciudad': 'antalya',
    'city-center': 'antalya',
    'belek-serik': 'belek',
    'vilanova-y-la-geltru': 'vilanova-i-la-geltru',
    'zona-1-casa-mexicana': 'zona-1-casa-mexicana',
    'zona-2-secrets-aura-cozumel': 'zona-2-secrets-aura-cozumel',
    'x-puha': 'x-puha',
  }

  // Manual overrides for old slugs that don't fit the patterns above (typos, edge cases)
  const MANUAL_OVERRIDES = {
    '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-ciudad-de-mexico-mex-a-ciudad-de-mexico/':
      '/es/traslados-aeropuerto-privados-taxi/mexico-city/transfer-mexico-city-international-airport-mex-to-mexico-city/',
    '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-san-antonio-sat-a-san-antonio/':
      '/es/traslados-aeropuerto-privados-taxi/san-antonio/transfer-san-antonio-international-airport-sat-to-san-antonio/',
    '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-san-francisco-sfo-a-san-francisco/':
      '/es/traslados-aeropuerto-privados-taxi/san-francisco/transfer-san-francisco-international-airport-sfo-to-san-francisco/',
    '/es/rutas/traslados-desde-el-aeropuerto-de-antalya-ayt-al-centro-de-la-ciudad/':
      '/es/traslados-aeropuerto-privados-taxi/antalya/transfer-antalya-airport-ayt-to-antalya/',
  }

  const redirects = []
  const unmapped = []

  for (const url of lines) {
    const u = new URL(url)
    let pathname = u.pathname

    if (pathname === '/rutas/' || pathname === '/es/rutas/') continue

    // Manual override
    if (MANUAL_OVERRIDES[pathname]) {
      redirects.push({ source: pathname, destination: MANUAL_OVERRIDES[pathname], permanent: true })
      continue
    }

    const isEs = pathname.startsWith('/es/')
    const m = pathname.match(/^\/(?:es\/)?rutas\/([^/]+)\/?$/)
    if (!m) continue
    const oldSlug = m[1]

    // 1. Exact match in either locale
    let route = enBySlug[oldSlug] || esBySlug[oldSlug]

    // 2. Parse the old slug for IATA + destination
    if (!route) {
      const parsed = parseOldSlug(oldSlug)
      if (parsed.iata && parsed.destSlug) {
        const destNorm = normalizeDest(parsed.destSlug)
        const destFinal = DEST_SYNONYMS[destNorm] || destNorm
        route = byIataDest[`${parsed.iata}|${destFinal}`]
        if (!route) {
          // Try variations
          for (const [oldDest, newDest] of Object.entries(DEST_SYNONYMS)) {
            if (destNorm.includes(oldDest)) {
              route = byIataDest[`${parsed.iata}|${newDest}`]
              if (route) break
            }
          }
        }
      }
    }

    // 3. Special handling for /rutas/transfers-from-barcelona-airport-to-X (BCN routes)
    if (!route && oldSlug.startsWith('transfers-from-barcelona-airport-to-')) {
      const dest = oldSlug.replace('transfers-from-barcelona-airport-to-', '')
      route = byIataDest[`bcn|${dest}`] || byIataDest[`bcn|${normalizeDest(dest)}`]
    }
    if (!route && oldSlug.startsWith('traslados-desde-el-aeropuerto-de-barcelona-a-')) {
      const dest = oldSlug.replace('traslados-desde-el-aeropuerto-de-barcelona-a-', '')
      const destFinal = DEST_SYNONYMS[dest] || dest
      route = byIataDest[`bcn|${destFinal}`] || byIataDest[`bcn|${normalizeDest(destFinal)}`]
    }
    if (!route && oldSlug.startsWith('transbordos-desde-el-aeropuerto-de-barcelona-a-')) {
      const dest = oldSlug.replace('transbordos-desde-el-aeropuerto-de-barcelona-a-', '')
      route = byIataDest[`bcn|${dest}`]
    }

    if (!route) {
      unmapped.push(pathname)
      continue
    }

    const enOrigin = route.originEnSlug
    const enRoute = route.enSlug
    const esOrigin = route.originEsSlug || route.originEnSlug
    const esRoute = route.esSlug || route.enSlug

    redirects.push({
      source: pathname,
      destination: isEs
        ? `/es/traslados-aeropuerto-privados-taxi/${esOrigin}/${esRoute}/`
        : `/airport-transfers-private-taxi/${enOrigin}/${enRoute}/`,
      permanent: true,
    })
  }

  // Dedupe
  const seen = new Set()
  const dedup = []
  for (const r of redirects) {
    if (seen.has(r.source)) continue
    seen.add(r.source)
    dedup.push(r)
  }

  writeFileSync('scripts/legacy-redirects.json', JSON.stringify(dedup, null, 2))

  console.log(`\n✓ Mapped ${dedup.length} redirects`)
  console.log(`✗ Unmapped: ${unmapped.length}`)
  if (unmapped.length) {
    console.log('\nUnmapped URLs:')
    unmapped.forEach(u => console.log('  ' + u))
  }
}

main().catch(e => { console.error(e); process.exit(1) })
