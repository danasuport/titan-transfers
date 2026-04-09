/**
 * Create all missing routes from the Excel pricing sheet
 * 1. Creates missing countries, airports, cities
 * 2. Creates routes connecting airport → city
 * 3. Generates SEO content with Claude API (EN + ES)
 *
 * Usage: SANITY_API_TOKEN_WRITE=sk... ANTHROPIC_API_KEY=sk-ant... node scripts/create-missing-routes.mjs
 */
import { createClient } from 'next-sanity'
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, appendFileSync } from 'fs'

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

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const LOG = 'scripts/create-missing-routes.log'
function log(msg) { console.log(msg); appendFileSync(LOG, msg + '\n') }

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── Country mapping from Excel names to Sanity ──────────────────────
const COUNTRY_MAP = {
  'Spain': 'spain', 'USA': 'united-states', 'UK': 'united-kingdom', 'UAE': 'united-arab-emirates',
  'TURKEY': 'turkey', 'Turkey': 'turkey', 'France': 'france', 'Germany': 'germany', 'Italy': 'italy',
  'Greece': 'greece', 'Portugal': 'portugal', 'Netherlands': 'netherlands', 'Belgium': 'belgium',
  'Mexico': 'mexico', 'Canada': 'canada', 'Colombia': 'colombia', 'Egypt': 'egypt',
  'Thailand': 'thailand', 'China': 'china', 'Ireland': 'ireland', 'Hungary': 'hungary',
  'Czech Republic': 'czech-republic', 'Albania': 'albania', 'Kosovo': 'kosovo',
  'North Macedonia': 'north-macedonia', 'Morocco': 'morocco', 'Panama': 'panama',
  'Bosnia and Herzegovina': 'bosnia-and-herzegovina', 'Jamaica': 'jamaica', 'JAM': 'jamaica',
  'Puerto Rico': 'puerto-rico', 'RD': 'dominican-republic',
  // New countries to create
  'Argentina': 'argentina', 'Austria': 'austria', 'Brazil': 'brazil',
  'Cape Verde': 'cape-verde', 'Chile': 'chile', 'Indonesia': 'indonesia',
  'Japan': 'japan', 'Moldova': 'moldova', 'Qatar': 'qatar',
  'Romania': 'romania', 'Saudi Arabia': 'saudi-arabia', 'Switzerland': 'switzerland',
}

// ─── Airport names for IATA codes ────────────────────────────────────
const AIRPORT_NAMES = {
  'AEP': 'Buenos Aires Aeroparque Jorge Newbery', 'EZE': 'Buenos Aires Ezeiza International Airport',
  'VIE': 'Vienna International Airport',
  'CGH': 'São Paulo Congonhas Airport', 'FLN': 'Florianópolis International Airport',
  'GIG': 'Rio de Janeiro Galeão International Airport', 'GRU': 'São Paulo Guarulhos International Airport',
  'SDU': 'Rio de Janeiro Santos Dumont Airport',
  'YYC': 'Calgary International Airport', 'YYZ': 'Toronto Pearson International Airport',
  'BVC': 'Boa Vista Aristides Pereira Airport', 'RAI': 'Praia Nelson Mandela International Airport',
  'SID': 'Sal Amílcar Cabral International Airport', 'VXE': 'São Vicente Cesária Évora Airport',
  'SCL': 'Santiago Arturo Merino Benítez International Airport',
  'ITM': 'Osaka Itami Airport', 'KIK': 'Osaka Kansai International Airport', // KIX actually
  'NRT': 'Tokyo Narita International Airport', 'HND': 'Tokyo Haneda Airport',
  'ADZ': 'San Andrés Gustavo Rojas Pinilla Airport',
  'BAQ': 'Barranquilla Ernesto Cortissoz International Airport',
  'BGA': 'Bucaramanga Palonegro International Airport',
  'CLO': 'Cali Alfonso Bonilla Aragón International Airport',
  'CUC': 'Cúcuta Camilo Daza International Airport',
  'EOH': 'Medellín Olaya Herrera Airport', 'MDE': 'Medellín José María Córdova International Airport',
  'PEI': 'Pereira Matecaña International Airport', 'SMR': 'Santa Marta Simón Bolívar International Airport',
  'ASW': 'Aswan International Airport', 'SSH': 'Sharm el-Sheikh International Airport',
  'DPS': 'Bali Ngurah Rai International Airport',
  'DOH': 'Doha Hamad International Airport',
  'OTP': 'Bucharest Henri Coandă International Airport',
  'JED': 'Jeddah King Abdulaziz International Airport',
  'GVA': 'Geneva Airport', 'ZRH': 'Zurich Airport',
  'DMK': 'Bangkok Don Mueang International Airport', 'BKK': 'Bangkok Suvarnabhumi Airport',
  'RMO': 'Chișinău International Airport',
  'IBZ': 'Ibiza Airport', 'SVQ': 'Seville Airport',
  'TFN': 'Tenerife North Airport', 'TFS': 'Tenerife South Airport',
  'AGP': 'Málaga-Costa del Sol Airport', 'ALC': 'Alicante-Elche Airport',
  'ACE': 'Lanzarote Airport',
  'SKP': 'Skopje Alexander the Great Airport',
  // Already existing but might need reference
  'CIVITAVECHIA PORT': null, // Skip this one
}

// Country names for new countries
const NEW_COUNTRIES = {
  'argentina': 'Argentina', 'austria': 'Austria', 'brazil': 'Brazil',
  'cape-verde': 'Cape Verde', 'chile': 'Chile', 'indonesia': 'Indonesia',
  'japan': 'Japan', 'moldova': 'Moldova', 'qatar': 'Qatar',
  'romania': 'Romania', 'saudi-arabia': 'Saudi Arabia', 'switzerland': 'Switzerland',
}

// ─── Normalize destination names for matching ────────────────────────
function normalizeDestName(name) {
  return name.trim()
    .replace(/\s+/g, ' ')
    .replace(/\t/g, '')
}

// ─── Generate SEO content with Claude ────────────────────────────────
async function generateContent(airportTitle, destTitle, countryTitle) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Generate SEO content for a private transfer route from "${airportTitle}" to "${destTitle}" in ${countryTitle}. Return ONLY valid JSON (no markdown, no code fences):
{
  "seoTitle": "max 60 chars, include 'private transfer' and destination",
  "seoDescription": "max 155 chars, include key benefits",
  "seoTitleEs": "Spanish version of seoTitle",
  "seoDescriptionEs": "Spanish version of seoDescription",
  "contentSections": [
    {"title": "Section about the destination", "bodyEn": "2-3 sentences about what makes this destination special", "bodyEs": "Spanish translation", "titleEs": "Spanish title"},
    {"title": "Section about the journey/transfer", "bodyEn": "2-3 sentences about the transfer experience", "bodyEs": "Spanish translation", "titleEs": "Spanish title"},
    {"title": "Section about local tips", "bodyEn": "2-3 sentences with traveler tips", "bodyEs": "Spanish translation", "titleEs": "Spanish title"}
  ]
}`
      }]
    })
    const text = response.content[0].text.trim()
    return JSON.parse(text)
  } catch (e) {
    log(`  ⚠ Claude error: ${e.message}`)
    return null
  }
}

// ─── Main ────────────────────────────────────────────────────────────
async function run() {
  // Read Excel data
  const csvLines = readFileSync('scripts/excel_routes.csv', 'utf8').split('\n').filter(l => l.trim())
  const excelData = []
  const seen = new Set()
  for (const line of csvLines) {
    const parts = line.split(',').map(s => (s || '').trim())
    let country = parts[0], iata = parts[1], resort = normalizeDestName(parts[2] || '')
    if (!country || !iata || !resort || country.includes('Country')) continue
    if (iata === 'CIVITAVECHIA PORT') continue // skip non-airport
    iata = iata.toUpperCase()
    const key = iata + '|' + resort.toLowerCase()
    if (!seen.has(key)) { seen.add(key); excelData.push({ country, iata, resort }) }
  }

  // Load existing data from Sanity
  const [existingCountries, existingAirports, existingCities, existingRoutes] = await Promise.all([
    client.fetch('*[_type == "country"]{_id, title, "slug": slug.current}'),
    client.fetch('*[_type == "airport"]{_id, title, iataCode, "slug": slug.current, "countryId": country->_id}'),
    client.fetch('*[_type == "city"]{_id, title, "slug": slug.current, "countryId": country->_id}'),
    client.fetch('*[_type == "route"]{_id, "originIata": origin->iataCode, "destTitle": destination->title, "destSlug": destination->slug.current}'),
  ])

  const countryBySlug = {}
  for (const c of existingCountries) countryBySlug[c.slug] = c

  const airportByIata = {}
  for (const a of existingAirports) airportByIata[a.iataCode] = a

  const cityBySlug = {}
  for (const c of existingCities) cityBySlug[c.slug] = c

  const routeSet = new Set()
  for (const r of existingRoutes) routeSet.add(r.originIata + '|' + r.destTitle?.toLowerCase()?.trim())

  // Also build a fuzzy match set for cities
  const cityByNameLower = {}
  for (const c of existingCities) cityByNameLower[c.title.toLowerCase().trim()] = c

  // ─── Step 1: Create missing countries ──────────────────────────────
  log('=== STEP 1: Creating missing countries ===')
  for (const [slug, title] of Object.entries(NEW_COUNTRIES)) {
    if (countryBySlug[slug]) { log(`  ✓ ${title} exists`); continue }
    try {
      const doc = {
        _id: `country-${slug}`,
        _type: 'country',
        title,
        slug: { _type: 'slug', current: slug },
      }
      await client.createOrReplace(doc)
      countryBySlug[slug] = { _id: doc._id, title, slug }
      log(`  + Created country: ${title}`)
    } catch (e) {
      log(`  ✗ Failed country ${title}: ${e.message}`)
    }
  }

  // ─── Step 2: Create missing airports ───────────────────────────────
  log('\n=== STEP 2: Creating missing airports ===')
  const neededIatas = new Set(excelData.map(e => e.iata))
  for (const iata of neededIatas) {
    if (airportByIata[iata]) continue
    const name = AIRPORT_NAMES[iata]
    if (name === null) continue // explicitly skip
    if (!name) { log(`  ⚠ Unknown IATA: ${iata}, skipping`); continue }

    // Find country for this airport from excel data
    const excelEntry = excelData.find(e => e.iata === iata)
    const countrySlug = COUNTRY_MAP[excelEntry?.country]
    const countryDoc = countryBySlug[countrySlug]
    if (!countryDoc) { log(`  ⚠ No country for ${iata} (${excelEntry?.country})`); continue }

    const slug = slugify(name.replace(/airport|international/gi, '').trim()).substring(0, 60)
    try {
      const doc = {
        _id: `airport-${iata.toLowerCase()}`,
        _type: 'airport',
        title: name,
        iataCode: iata,
        slug: { _type: 'slug', current: slug },
        country: { _type: 'reference', _ref: countryDoc._id },
      }
      await client.createOrReplace(doc)
      airportByIata[iata] = { _id: doc._id, title: name, iataCode: iata, slug, countryId: countryDoc._id }
      log(`  + Created airport: ${name} (${iata})`)
    } catch (e) {
      log(`  ✗ Failed airport ${name}: ${e.message}`)
    }
  }

  // ─── Step 3: Identify missing routes & create cities ───────────────
  log('\n=== STEP 3: Creating missing cities ===')
  const missingRoutes = []
  for (const entry of excelData) {
    const key = entry.iata + '|' + entry.resort.toLowerCase()
    if (routeSet.has(key)) continue

    const countrySlug = COUNTRY_MAP[entry.country]
    if (!countrySlug) continue
    const countryDoc = countryBySlug[countrySlug]
    if (!countryDoc) continue

    // Find or create city
    const citySlug = slugify(entry.resort)
    let city = cityBySlug[citySlug] || cityByNameLower[entry.resort.toLowerCase()]

    if (!city) {
      try {
        const doc = {
          _id: `city-${citySlug}`,
          _type: 'city',
          title: entry.resort,
          slug: { _type: 'slug', current: citySlug },
          country: { _type: 'reference', _ref: countryDoc._id },
        }
        await client.createOrReplace(doc)
        city = { _id: doc._id, title: entry.resort, slug: citySlug, countryId: countryDoc._id }
        cityBySlug[citySlug] = city
        cityByNameLower[entry.resort.toLowerCase()] = city
        log(`  + Created city: ${entry.resort} (${countryDoc.title})`)
      } catch (e) {
        log(`  ✗ Failed city ${entry.resort}: ${e.message}`)
        continue
      }
    }

    missingRoutes.push({ ...entry, cityDoc: city, countryDoc, countrySlug })
  }

  log(`\n=== STEP 4: Creating ${missingRoutes.length} routes with SEO content ===`)

  let created = 0, errors = 0
  for (let i = 0; i < missingRoutes.length; i++) {
    const r = missingRoutes[i]
    const airport = airportByIata[r.iata]
    if (!airport) { log(`  ⚠ [${i+1}] No airport for ${r.iata}`); errors++; continue }

    const routeSlug = `transfer-${slugify(airport.title.replace(/airport|international/gi, ''))}-to-${slugify(r.resort)}`.substring(0, 90)
    const title = `Transfer from ${airport.title} to ${r.resort}`

    log(`\n[${i+1}/${missingRoutes.length}] ${airport.iataCode} → ${r.resort}`)

    try {
      // Generate content with Claude
      const content = await generateContent(airport.title, r.resort, r.countryDoc.title)
      await new Promise(res => setTimeout(res, 500))

      const sections = (content?.contentSections || []).map((s, idx) => ({
        _type: 'object',
        _key: `section-${Date.now()}-${idx}`,
        title: s.title,
        body: [{ _type: 'block', _key: `b-${Date.now()}-${idx}`, children: [{ _type: 'span', _key: `s-${Date.now()}-${idx}`, text: s.bodyEn }], markDefs: [], style: 'normal' }],
        imagePosition: idx % 2 === 0 ? 'left' : 'right',
      }))

      const translationSections = (content?.contentSections || []).map((s, idx) => ({
        _type: 'object',
        _key: `section-${Date.now()}-${idx}`,
        title: s.titleEs || s.title,
        body: [{ _type: 'block', _key: `b-es-${Date.now()}-${idx}`, children: [{ _type: 'span', _key: `s-es-${Date.now()}-${idx}`, text: s.bodyEs || s.bodyEn }], markDefs: [], style: 'normal' }],
        imagePosition: idx % 2 === 0 ? 'left' : 'right',
      }))

      const esSlug = `traslado-${slugify(airport.title.replace(/airport|international/gi, ''))}-a-${slugify(r.resort)}`.substring(0, 90)

      const doc = {
        _type: 'route',
        title,
        slug: { _type: 'slug', current: routeSlug },
        origin: { _type: 'reference', _ref: airport._id },
        destination: { _type: 'reference', _ref: r.cityDoc._id },
        country: { _type: 'reference', _ref: r.countryDoc._id },
        originType: 'airport',
        seoTitle: content?.seoTitle || `Private Transfer ${airport.title} to ${r.resort} | Titan Transfers`,
        seoDescription: content?.seoDescription || `Book your private transfer from ${airport.title} to ${r.resort}. Fixed prices, professional drivers, 24/7 support.`,
        contentSections: sections,
        translations: {
          es: {
            title: `Traslado desde ${airport.title} a ${r.resort}`,
            slug: { _type: 'slug', current: esSlug },
            seoTitle: content?.seoTitleEs || `Traslado privado ${airport.title} a ${r.resort} | Titan Transfers`,
            seoDescription: content?.seoDescriptionEs || `Reserva tu traslado privado desde ${airport.title} a ${r.resort}. Precios fijos, conductores profesionales.`,
            contentSections: translationSections,
          }
        }
      }

      await client.create(doc)
      routeSet.add(r.iata + '|' + r.resort.toLowerCase())
      created++
      log(`  ✓ Created: ${title}`)
    } catch (e) {
      log(`  ✗ Error: ${e.message}`)
      errors++
    }

    // Rate limit for Claude API
    await new Promise(res => setTimeout(res, 1200))
  }

  log(`\n=== DONE ===`)
  log(`Created: ${created} routes`)
  log(`Errors: ${errors}`)
  log(`Total routes now: ${existingRoutes.length + created}`)
}

run().catch(e => { log(`FATAL: ${e.message}`); process.exit(1) })
