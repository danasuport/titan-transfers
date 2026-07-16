/**
 * Publish routes the client already sells but the site doesn't have yet.
 *
 * Reads the client's pricing sheet straight from Drive — the same CSV the
 * /admin/searches panel reads — so its queue and this script always agree, and
 * routes the client adds show up here without anyone re-exporting anything.
 * Creates the missing country / airport / city, then the route with EN + ES SEO
 * content from Claude.
 *
 * Replaces create-missing-routes.mjs, which read a hand-maintained CSV with
 * split(','), and deduped routes by comparing the sheet's resort text against
 * the city's *title* while looking the city up by *slug*. Slugify strips accents
 * and the title comparison doesn't, so "Mataro" in the sheet found city-mataro,
 * missed the existing "BCN|Mataró" route and created a second one onto the same
 * city — 43 duplicates. Here routes are keyed on the airport and city document
 * ids, so no amount of text drift can duplicate one.
 *
 * Known limitation, inherited: the sheet's Country column describes the AIRPORT,
 * so a new destination city is filed under the airport's country. That's right
 * almost always and wrong across borders — "BCN → Andorra la Vella" would create
 * Andorra la Vella under Spain. Publish those by hand, or fix the country in the
 * Studio afterwards.
 *
 * Usage:
 *   node scripts/publish-routes.mjs --airport=BCN --limit=10       # dry run
 *   node scripts/publish-routes.mjs --airport=BCN --limit=10 --apply
 *   node scripts/publish-routes.mjs --route="BCN:Andorra la Vella" --apply
 *   node scripts/publish-routes.mjs --country=Spain --limit=25 --apply
 *
 * Pick what to publish from the panel's "Las tenemos, pero faltan en la web"
 * table — it's ordered by real demand, which this script can't see (the
 * analytics Postgres has no public port).
 *
 * Needs SANITY_API_TOKEN_WRITE and ANTHROPIC_API_KEY.
 */
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { createClient } from '@sanity/client'
import { fetchSheetRoutes, norm } from './lib/routes-sheet.mjs'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim()
}

const arg = (name, dflt = null) => {
  const hit = process.argv.find(a => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : dflt
}
const APPLY = process.argv.includes('--apply')
const ONLY_AIRPORT = arg('airport')?.toUpperCase()
const ONLY_COUNTRY = arg('country')
const ONLY_ROUTES = process.argv.filter(a => a.startsWith('--route=')).map(a => norm(a.slice(8)))
const LIMIT = Number(arg('limit', '0')) || Infinity
// Routes are created hidden by default: they exist and can be previewed, but stay
// out of the sitemap and out of Google until reveal-routes.mjs unhides them. This
// separates the expensive step (generating content) from the SEO-sensitive one
// (exposing URLs), so a big --apply run can't dump 1.000 pages on Google at once.
// --visible skips that, for the handful you want live immediately.
const VISIBLE = process.argv.includes('--visible')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN_WRITE || process.env.SANITY_API_TOKEN,
  useCdn: false,
})
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function slugify(s) {
  return String(s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// The sheet's country column → Sanity country slug.
const COUNTRY_MAP = {
  'Spain': 'spain', 'USA': 'united-states', 'UK': 'united-kingdom', 'UAE': 'united-arab-emirates',
  'TURKEY': 'turkey', 'Turkey': 'turkey', 'France': 'france', 'Germany': 'germany', 'Italy': 'italy',
  'Greece': 'greece', 'Portugal': 'portugal', 'Netherlands': 'netherlands', 'Belgium': 'belgium',
  'Mexico': 'mexico', 'Canada': 'canada', 'Colombia': 'colombia', 'Egypt': 'egypt',
  'Thailand': 'thailand', 'China': 'china', 'Ireland': 'ireland', 'Hungary': 'hungary',
  'Czech Republic': 'czech-republic', 'Albania': 'albania', 'Kosovo': 'kosovo',
  'North Macedonia': 'north-macedonia', 'Morocco': 'morocco', 'Panama': 'panama',
  'Bosnia and Herzegovina': 'bosnia-and-herzegovina', 'Jamaica': 'jamaica', 'JAM': 'jamaica',
  'Puerto Rico': 'puerto-rico', 'RD': 'dominican-republic', 'Argentina': 'argentina',
  'Austria': 'austria', 'Brazil': 'brazil', 'Cape Verde': 'cape-verde', 'Chile': 'chile',
  'Indonesia': 'indonesia', 'Japan': 'japan', 'Moldova': 'moldova', 'Qatar': 'qatar',
  'Romania': 'romania', 'Saudi Arabia': 'saudi-arabia', 'Switzerland': 'switzerland',
  'Serbia': 'serbia',
}

const COUNTRY_TITLES = {
  'argentina': 'Argentina', 'austria': 'Austria', 'brazil': 'Brazil', 'cape-verde': 'Cape Verde',
  'chile': 'Chile', 'indonesia': 'Indonesia', 'japan': 'Japan', 'moldova': 'Moldova',
  'qatar': 'Qatar', 'romania': 'Romania', 'saudi-arabia': 'Saudi Arabia',
  'switzerland': 'Switzerland', 'serbia': 'Serbia',
}

// Entries in the sheet's Airport column that aren't airports. The catalogue
// models port origins as a separate type, so these need a different pipeline.
const NOT_AIRPORTS = new Set(['CIVITAVECCHIA PORT', 'CIVITAVECHIA PORT'])

// IATA → airport name, for airports the sheet mentions but Sanity doesn't have.
// Every gap here silently blocks all of that airport's routes, which is how
// Valencia — the client's second-biggest airport, 319 routes — was never
// published at all. 'KIX' was also misspelled 'KIK', skipping every Kansai row.
const AIRPORT_NAMES = {
  'VLC': 'Valencia Airport', 'BZC': 'Búzios Umberto Modiano Airport',
  'AEP': 'Buenos Aires Aeroparque Jorge Newbery', 'EZE': 'Buenos Aires Ezeiza International Airport',
  'VIE': 'Vienna International Airport',
  'CGH': 'São Paulo Congonhas Airport', 'FLN': 'Florianópolis International Airport',
  'GIG': 'Rio de Janeiro Galeão International Airport', 'GRU': 'São Paulo Guarulhos International Airport',
  'SDU': 'Rio de Janeiro Santos Dumont Airport',
  'YYC': 'Calgary International Airport', 'YYZ': 'Toronto Pearson International Airport',
  'BVC': 'Boa Vista Aristides Pereira Airport', 'RAI': 'Praia Nelson Mandela International Airport',
  'SID': 'Sal Amílcar Cabral International Airport', 'VXE': 'São Vicente Cesária Évora Airport',
  'SCL': 'Santiago Arturo Merino Benítez International Airport',
  'ITM': 'Osaka Itami Airport', 'KIX': 'Osaka Kansai International Airport',
  'NRT': 'Tokyo Narita International Airport', 'HND': 'Tokyo Haneda Airport',
  'ADZ': 'San Andrés Gustavo Rojas Pinilla Airport',
  'BAQ': 'Barranquilla Ernesto Cortissoz International Airport',
  'BGA': 'Bucaramanga Palonegro International Airport',
  'CLO': 'Cali Alfonso Bonilla Aragón International Airport',
  'CUC': 'Cúcuta Camilo Daza International Airport',
  'EOH': 'Medellín Olaya Herrera Airport', 'MDE': 'Medellín José María Córdova International Airport',
  'PEI': 'Pereira Matecaña International Airport', 'SMR': 'Santa Marta Simón Bolívar International Airport',
  'ASW': 'Aswan International Airport', 'SSH': 'Sharm el-Sheikh International Airport',
  'DPS': 'Bali Ngurah Rai International Airport', 'DOH': 'Doha Hamad International Airport',
  'OTP': 'Bucharest Henri Coandă International Airport',
  'JED': 'Jeddah King Abdulaziz International Airport',
  'GVA': 'Geneva Airport', 'ZRH': 'Zurich Airport',
  'DMK': 'Bangkok Don Mueang International Airport', 'BKK': 'Bangkok Suvarnabhumi Airport',
  'RMO': 'Chișinău International Airport', 'IBZ': 'Ibiza Airport', 'SVQ': 'Seville Airport',
  'TFN': 'Tenerife North Airport', 'TFS': 'Tenerife South Airport',
  'AGP': 'Málaga-Costa del Sol Airport', 'ALC': 'Alicante-Elche Airport',
  'ACE': 'Lanzarote Airport', 'SKP': 'Skopje Alexander the Great Airport',
  'BEG': 'Belgrade Nikola Tesla Airport',
}

async function generateContent(airportTitle, destTitle, countryTitle) {
  const res = await anthropic.messages.create({
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
}`,
    }],
  })
  const content = JSON.parse(res.content[0].text.trim())
  // The old script caught this and published the route anyway with
  // contentSections: [], which renders a page with a hero, a booking widget and
  // nothing else — thin content, indexable, and silent. Nothing gets created
  // unless there's something to put on the page.
  if (!content?.contentSections?.length) throw new Error('Claude devolvió 0 secciones')
  return content
}

const block = (text, keyPrefix, i) => [{
  _type: 'block', _key: `${keyPrefix}-b${i}`, style: 'normal', markDefs: [],
  children: [{ _type: 'span', _key: `${keyPrefix}-s${i}`, text }],
}]

const sectionsFor = (content, lang) =>
  content.contentSections.map((s, i) => ({
    _type: 'object',
    _key: `section-${lang}-${i}`,
    title: lang === 'es' ? (s.titleEs || s.title) : s.title,
    body: block(lang === 'es' ? (s.bodyEs || s.bodyEn) : s.bodyEn, lang, i),
    imagePosition: i % 2 === 0 ? 'left' : 'right',
  }))

async function run() {
  const sheet = await fetchSheetRoutes()

  const [countries, airports, cities, routes] = await Promise.all([
    client.fetch(`*[_type == "country"]{_id, title, "slug": slug.current}`),
    client.fetch(`*[_type == "airport" && defined(iataCode)]{_id, title, iataCode, "slug": slug.current}`),
    client.fetch(`*[_type == "city"]{_id, title, "slug": slug.current, "tr": translations}`),
    client.fetch(`*[_type == "route" && defined(origin->_id) && defined(destination->_id)]{
      "originId": origin->_id, "destId": destination->_id }`),
  ])

  const countryBySlug = Object.fromEntries(countries.map(c => [c.slug, c]))
  const airportByIata = Object.fromEntries(airports.map(a => [a.iataCode.toUpperCase(), a]))

  // Cities under every name we know them by — same reason the dashboard does it:
  // the sheet writes "Rome", Sanity may hold "Roma", and either should find the
  // one city rather than create a second.
  const cityByName = {}
  for (const c of cities) {
    for (const name of [c.title, ...Object.values(c.tr || {}).map(t => t?.title)]) {
      const k = norm(name)
      if (k && !cityByName[k]) cityByName[k] = c
    }
    cityByName[`slug:${c.slug}`] = c
  }

  // The dedupe that matters: document ids, never text.
  const existingRoutes = new Set(routes.map(r => `${r.originId}|${r.destId}`))

  const pending = []
  const skipped = { noCountry: 0, noAirport: [], alreadyLive: 0, notAirport: 0 }
  let matchedFilters = 0

  for (const row of sheet) {
    if (ONLY_AIRPORT && row.iata !== ONLY_AIRPORT) continue
    if (ONLY_COUNTRY && row.country.toLowerCase() !== ONLY_COUNTRY.toLowerCase()) continue
    if (ONLY_ROUTES.length && !ONLY_ROUTES.includes(norm(`${row.iata}:${row.resort}`))) continue
    matchedFilters++

    if (NOT_AIRPORTS.has(row.iata)) { skipped.notAirport++; continue }

    const countrySlug = COUNTRY_MAP[row.country]
    if (!countrySlug) { skipped.noCountry++; continue }

    const airport = airportByIata[row.iata]
    if (!airport && !AIRPORT_NAMES[row.iata]) { skipped.noAirport.push(row.iata); continue }

    const city = cityByName[norm(row.resort)] || cityByName[`slug:${slugify(row.resort)}`]
    if (airport && city && existingRoutes.has(`${airport._id}|${city._id}`)) { skipped.alreadyLive++; continue }

    pending.push({ ...row, countrySlug, airport, city })
  }

  const filters = [ONLY_AIRPORT && `aeropuerto=${ONLY_AIRPORT}`, ONLY_COUNTRY && `país=${ONLY_COUNTRY}`,
    ONLY_ROUTES.length && `${ONLY_ROUTES.length} ruta(s) sueltas`].filter(Boolean).join(', ')
  console.log(`Hoja: ${sheet.length} rutas en total`)
  if (filters) console.log(`Filtro (${filters}): ${matchedFilters} rutas`)
  console.log(`  ya publicadas: ${skipped.alreadyLive} · pendientes de publicar: ${pending.length}`)
  if (skipped.notAirport) console.log(`  · ${skipped.notAirport} saltadas: el origen no es un aeropuerto (puerto)`)
  if (skipped.noCountry) console.log(`  ⚠ ${skipped.noCountry} saltadas: país no mapeado en COUNTRY_MAP`)
  if (skipped.noAirport.length) {
    // Loud, and by airport: a missing name here blocks every route of that
    // airport, and reads as "nothing pending" if you don't look.
    const byIata = {}
    for (const i of skipped.noAirport) byIata[i] = (byIata[i] || 0) + 1
    console.log(`  ⚠ ${skipped.noAirport.length} saltadas por IATA sin nombre en AIRPORT_NAMES — añádelo y vuelve a lanzar:`)
    for (const [i, n] of Object.entries(byIata).sort((a, b) => b[1] - a[1])) console.log(`      ${i}: ${n} ruta(s)`)
  }

  const batch = pending.slice(0, LIMIT)
  if (batch.length < pending.length) {
    console.log(`  (--limit=${LIMIT}: se publican ${batch.length} de ${pending.length}; el resto queda para la próxima tanda)`)
  }
  if (batch.length === 0) return

  const mode = VISIBLE ? 'VISIBLES (entran en el sitemap y en Google ya)' : 'OCULTAS (fuera del sitemap y de Google hasta revelarlas)'
  console.log(`\n=== ${APPLY ? 'Creando' : 'Se crearían'} ${batch.length} rutas · ${mode} ===`)
  for (const r of batch) {
    console.log(`  ${r.iata} → ${r.resort}${r.city ? '' : '  (+ ciudad nueva)'}${r.airport ? '' : '  (+ aeropuerto nuevo)'}`)
  }
  if (!APPLY) {
    console.log(`\n(dry run — no se ha tocado nada. Repite con --apply para publicarlas.)`)
    return
  }

  let created = 0, failed = 0
  for (const [i, r] of batch.entries()) {
    const label = `[${i + 1}/${batch.length}] ${r.iata} → ${r.resort}`
    try {
      let country = countryBySlug[r.countrySlug]
      if (!country) {
        const title = COUNTRY_TITLES[r.countrySlug]
        if (!title) throw new Error(`país "${r.country}" sin título en COUNTRY_TITLES`)
        country = { _id: `country-${r.countrySlug}`, title, slug: r.countrySlug }
        await client.createOrReplace({
          _id: country._id, _type: 'country', title,
          slug: { _type: 'slug', current: r.countrySlug },
        })
        countryBySlug[r.countrySlug] = country
        console.log(`  + país ${title}`)
      }

      let airport = r.airport
      if (!airport) {
        const name = AIRPORT_NAMES[r.iata]
        const slug = slugify(name.replace(/airport|international/gi, '')).slice(0, 60)
        airport = { _id: `airport-${r.iata.toLowerCase()}`, title: name, iataCode: r.iata, slug }
        await client.createOrReplace({
          _id: airport._id, _type: 'airport', title: name, iataCode: r.iata,
          slug: { _type: 'slug', current: slug },
          country: { _type: 'reference', _ref: country._id },
        })
        airportByIata[r.iata] = airport
        console.log(`  + aeropuerto ${name} (${r.iata})`)
      }

      // Content first: if Claude fails, nothing is written at all, so the route
      // can simply be retried instead of sitting published and empty.
      const content = await generateContent(airport.title, r.resort, country.title)

      let city = r.city
      if (!city) {
        const slug = slugify(r.resort)
        city = { _id: `city-${slug}`, title: r.resort, slug }
        await client.createOrReplace({
          _id: city._id, _type: 'city', title: r.resort,
          slug: { _type: 'slug', current: slug },
          country: { _type: 'reference', _ref: country._id },
        })
        cityByName[norm(r.resort)] = city
        console.log(`  + ciudad ${r.resort}`)
      }

      if (existingRoutes.has(`${airport._id}|${city._id}`)) {
        console.log(`  · ${label}: ya existe, salto`)
        continue
      }

      const base = slugify(airport.title.replace(/airport|international/gi, ''))
      // Deterministic id, so re-running can never create a second copy even if
      // the in-memory guard above somehow misses.
      const _id = `route-${r.iata.toLowerCase()}-${city.slug}`.slice(0, 120)

      await client.createIfNotExists({
        _id,
        _type: 'route',
        hidden: !VISIBLE,
        title: `Transfer from ${airport.title} to ${r.resort}`,
        slug: { _type: 'slug', current: `transfer-${base}-to-${slugify(r.resort)}`.slice(0, 90) },
        origin: { _type: 'reference', _ref: airport._id },
        destination: { _type: 'reference', _ref: city._id },
        country: { _type: 'reference', _ref: country._id },
        originType: 'airport',
        seoTitle: content.seoTitle,
        seoDescription: content.seoDescription,
        contentSections: sectionsFor(content, 'en'),
        translations: {
          es: {
            title: `Traslado desde ${airport.title} a ${r.resort}`,
            slug: { _type: 'slug', current: `traslado-${base}-a-${slugify(r.resort)}`.slice(0, 90) },
            seoTitle: content.seoTitleEs,
            seoDescription: content.seoDescriptionEs,
            contentSections: sectionsFor(content, 'es'),
          },
        },
      })
      existingRoutes.add(`${airport._id}|${city._id}`)
      created++
      console.log(`  ✓ ${label}`)
    } catch (e) {
      failed++
      console.log(`  ✗ ${label}: ${e.message}`)
    }
    await new Promise(res => setTimeout(res, 1200)) // Claude rate limit
  }

  console.log(`\n=== Hecho: ${created} creadas${VISIBLE ? ' (visibles)' : ' (ocultas)'}, ${failed} fallidas ===`)
  if (failed) console.log(`Las fallidas no han creado nada: vuelve a lanzar el mismo comando y lo reintenta.`)
  if (created) {
    const filter = ONLY_AIRPORT ? ` ORIGIN_SLUG=<slug-del-aeropuerto>` : ''
    console.log(`\nSiguientes pasos para dejarlas completas:`)
    console.log(`  node scripts/add-route-images.mjs${filter}     # imágenes`)
    console.log(`  node scripts/translate-to-italian.mjs --type=route`)
    console.log(`  node scripts/translate-to-german.mjs --type=route`)
    console.log(`  node scripts/translate-to-arabic.mjs --type=route`)
    if (!VISIBLE) {
      console.log(`\nEstán OCULTAS: no aparecen en el sitemap ni en Google todavía.`)
      console.log(`Cuando estén completas, revélalas por tandas (por demanda desde /admin/searches):`)
      console.log(`  node scripts/reveal-routes.mjs${ONLY_AIRPORT ? ` --airport=${ONLY_AIRPORT}` : ''} --limit=10 --apply`)
    }
    console.log(`\nEl panel /admin/searches te dirá en su columna "Estado en la web" qué falta.`)
  }
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1) })
