/**
 * Generate 301 redirects from old WordPress /rutas/[slug]/ to new Next.js route URLs.
 *
 * Fetches all routes from Sanity, then maps old sitemap slugs to new URLs
 * and outputs ready-to-paste next.config.ts redirect entries.
 *
 * Usage: node scripts/generate-rutas-redirects.mjs
 */

import { createClient } from '@sanity/client'

const sanity = createClient({
  projectId: '6iu2za90',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const routes = await sanity.fetch(`*[_type == "route"] {
  "enSlug": slug.current,
  "esSlug": translations.es.slug.current,
  "airportSlug": origin->slug.current,
  "esAirportSlug": coalesce(origin->translations.es.slug.current, origin->slug.current)
}`)

console.log(`Fetched ${routes.length} routes from Sanity\n`)

// Old WordPress EN slugs from /rutas/ sitemap
const oldEnSlugs = [
  'traslados-desde-el-aeropuerto-de-barcelona-a-sitges',
  'transfers-from-barcelona-airport-to-badalona',
  'traslados-desde-el-aeropuerto-de-barcelona-a-barcelona',
  'transfers-from-barcelona-airport-to-castelldefels',
  'transfers-from-barcelona-airport-to-lhospitalet-de-llobregat',
  'transfers-from-barcelona-airport-to-montcada-i-reixac',
  'transfers-from-barcelona-airport-to-ripollet',
  'transfers-from-barcelona-airport-to-sant-cugat-del-valles',
  'traslados-desde-el-aeropuerto-de-barcelona-a-barcelona',
  'transfers-from-barcelona-airport-to-vallmoll',
  'transfers-from-barcelona-airport-to-lloret-de-mar',
  'transfers-from-barcelona-airport-to-tossa-de-mar',
  'transfers-from-barcelona-airport-to-platja-daro',
  'transfers-from-barcelona-airport-to-altafulla',
  'transfers-from-barcelona-airport-to-tarragona',
  'transfers-from-barcelona-airport-to-la-pineda',
  'transfers-from-barcelona-airport-to-castellar-del-valles',
  'transfers-from-barcelona-airport-to-salou',
  'transfers-from-barcelona-airport-to-cambrils',
  'transfers-from-barcelona-airport-to-escaladei',
  'transfers-from-barcelona-airport-to-girona',
  'transfers-from-barcelona-airport-to-banyoles',
  'transfers-from-barcelona-airport-to-cadaques',
  'transfers-from-barcelona-airport-to-andorra',
  'transfers-from-barcelona-airport-to-castellon',
  'transfers-from-barcelona-airport-to-santa-coloma-de-gramenet',
  'transfers-from-barcelona-airport-to-tordera',
  'transfers-from-barcelona-airport-to-malgrat-de-mar',
  'transfers-from-barcelona-airport-to-santa-susanna',
  'transfers-from-barcelona-airport-to-pineda-de-mar',
  'transfers-from-barcelona-airport-to-calella',
  'transfers-from-barcelona-airport-to-manresa',
  'transfers-from-barcelona-airport-to-calafell',
  'transfers-from-barcelona-airport-to-cubelles',
  'transfers-from-barcelona-airport-to-vilanova-i-la-geltru',
  'transfers-from-barcelona-airport-to-mataro',
  'transfers-from-barcelona-airport-to-granollers',
  'transfers-from-barcelona-airport-to-cabrils',
  'transfers-from-barcelona-airport-to-palau-solita-i-plegamans',
  'transfer-dubai-international-airport-dxb-to-dubai',
  'transfer-dubai-international-airport-dxb-to-abu-dhabi',
  'transfer-zayed-international-airport-auh-to-abu-dhabi',
  'transfer-zayed-international-airport-auh-to-abu-dhabi-2',
  'transfer-zayed-international-airport-auh-to-ajman',
  'transfer-zayed-international-airport-auh-to-dubai',
  'transfer-zayed-international-airport-auh-to-fujairah',
  'transfer-zayed-international-airport-auh-to-jebel-ali-and-motiongate',
  'transfer-zayed-international-airport-auh-to-palm-jumeirah',
  'transfer-al-maktoum-international-airport-dwc-to-abu-dhabi',
  'transfer-al-maktoum-international-airport-dwc-to-ajman',
  'transfer-al-maktoum-international-airport-dwc-to-dubai',
  'transfer-al-maktoum-international-airport-dwc-to-fujairah',
  'transfer-al-maktoum-international-airport-dwc-to-jebel-ali-and-motiongate',
  'transfer-al-maktoum-international-airport-dwc-to-palm-jumeirah',
  'transfer-dubai-international-airport-dxb-to-ajman',
  'transfer-dubai-international-airport-dxb-to-fujairah',
  'transfer-dubai-international-airport-dxb-to-jebel-ali-and-motiongate',
  'transfer-dubai-international-airport-dxb-to-palm-jumeirah',
  'transfer-ras-al-khaimah-international-airport-rkt-to-abu-dhabi',
  'transfer-ras-al-khaimah-international-airport-rkt-to-dubai',
  'transfer-ras-al-khaimah-international-airport-rkt-to-jebel-ali-and-motiongate',
  'transfer-ras-al-khaimah-international-airport-rkt-to-palm-jumeirah',
  'transfer-sharjah-international-airport-shj-to-abu-dhabi',
  'transfer-sharjah-international-airport-shj-to-ajman',
  'transfer-sharjah-international-airport-shj-to-dubai',
  'transfer-sharjah-international-airport-shj-to-fujairah',
  'transfer-sharjah-international-airport-shj-to-jebel-ali-and-motiongate',
  'transfer-sharjah-international-airport-shj-to-palm-jumeirah',
  'transfer-sharjah-international-airport-shj-to-sharjah',
  'transfer-cancun-international-airport-cun-to-akumal',
  'transfer-cancun-international-airport-cun-to-cancun',
  'transfer-cancun-international-airport-cun-to-chiquila',
  'transfer-cancun-international-airport-cun-to-costa-mujeres',
  'transfer-cancun-international-airport-cun-to-playa-del-carmen',
]

// Old WordPress ES slugs from /es/rutas/ sitemap
const oldEsSlugs = [
  'traslados-desde-el-aeropuerto-de-barcelona-a-sitges',
  'traslados-desde-el-aeropuerto-de-barcelona-a-barcelona',
  'traslados-desde-el-aeropuerto-de-barcelona-a-castelldefels',
  'traslados-desde-el-aeropuerto-de-barcelona-a-montcada-i-reixac',
  'traslados-desde-el-aeropuerto-de-barcelona-a-ripollet',
  'traslados-desde-el-aeropuerto-de-barcelona-a-sant-cugat-del-valles',
  'traslados-desde-el-aeropuerto-de-barcelona-a-santa-coloma-de-gramenet',
  'traslados-desde-el-aeropuerto-de-barcelona-a-vallmoll',
  'traslados-desde-el-aeropuerto-de-barcelona-a-lloret-de-mar',
  'traslados-desde-el-aeropuerto-de-barcelona-a-tossa-de-mar',
  'traslados-desde-el-aeropuerto-de-barcelona-a-platja-daro',
  'traslados-desde-el-aeropuerto-de-barcelona-a-altafulla',
  'traslados-desde-el-aeropuerto-de-barcelona-a-la-pineda',
  'traslados-desde-el-aeropuerto-de-barcelona-a-castellar-del-valles',
  'transbordos-desde-el-aeropuerto-de-barcelona-a-salou',
  'transbordos-desde-el-aeropuerto-de-barcelona-a-cambrils',
  'traslados-desde-el-aeropuerto-de-barcelona-a-escaladei',
  'traslados-desde-el-aeropuerto-de-barcelona-a-girona',
  'traslados-desde-el-aeropuerto-de-barcelona-a-banyoles',
  'traslados-desde-el-aeropuerto-de-barcelona-a-cadaques',
  'traslados-desde-el-aeropuerto-de-barcelona-a-andorra',
  'traslados-desde-el-aeropuerto-de-barcelona-a-castellon',
  'traslados-desde-el-aeropuerto-de-barcelona-a-tordera',
  'traslados-desde-el-aeropuerto-de-barcelona-a-malgrat-de-mar',
  'traslados-desde-el-aeropuerto-de-barcelona-a-santa-susanna',
  'traslados-desde-el-aeropuerto-de-barcelona-a-pineda-de-mar',
  'traslados-desde-el-aeropuerto-de-barcelona-a-calella',
  'traslados-desde-el-aeropuerto-de-barcelona-a-manresa',
  'traslados-desde-el-aeropuerto-de-barcelona-a-calafell',
  'traslados-desde-el-aeropuerto-de-barcelona-a-cubelles',
  'traslados-desde-el-aeropuerto-de-barcelona-a-vilanova-y-la-geltru',
  'traslados-desde-el-aeropuerto-de-barcelona-a-tarragona',
  'traslados-desde-el-aeropuerto-de-barcelona-a-badalona',
  'traslados-desde-el-aeropuerto-de-barcelona-a-lhospitalet-de-llobregat',
  'traslados-desde-el-aeropuerto-de-barcelona-a-granollers',
  'traslados-desde-el-aeropuerto-de-barcelona-a-mataro',
  'traslados-desde-el-aeropuerto-de-barcelona-a-cabrils',
  'traslados-desde-el-aeropuerto-de-barcelona-a-palau-solita-i-plegamans',
  'traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-dubai',
  'traslados-desde-el-aeropuerto-internacional-zayed-auh-a-abu-dabi',
  'traslados-desde-el-aeropuerto-internacional-zayed-auh-a-abu-dabi-2',
  'traslados-desde-el-aeropuerto-internacional-zayed-auh-a-ajman',
  'traslados-desde-el-aeropuerto-internacional-zayed-auh-a-dubai',
  'traslados-desde-el-aeropuerto-internacional-zayed-auh-a-fujairah',
  'traslados-desde-el-aeropuerto-internacional-zayed-auh-a-jebel-ali-y-motiongate',
  'traslados-desde-el-aeropuerto-internacional-zayed-auh-a-palm-jumeirah',
  'traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-abu-dabi',
  'traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-ajman',
  'traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-dubai',
  'traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-fujairah',
  'traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-jebel-ali-y-motiongate',
  'traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-palm-jumeirah',
  'traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-ajman',
  'traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-fuyaira',
  'traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-jebel-ali-motiongate',
  'traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-palm-jumeirah',
  'traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-abu-dabi',
  'traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-dubai',
  'traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-jebel-ali-y-motiongate',
  'traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-palm-jumeirah',
  'traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-abu-dabi',
  'traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-ajman',
  'traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-dubai',
  'traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-fujairah',
  'traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-jebel-ali-y-motiongate',
  'traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-palm-jumeirah',
  'traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-sharjah',
  'traslados-desde-el-aeropuerto-internacional-de-cancun-cun-a-akumal',
  'traslados-desde-el-aeropuerto-internacional-de-cancun-cun-a-cancun',
  'traslados-desde-el-aeropuerto-internacional-de-cancun-cun-a-chiquila',
  'traslados-desde-el-aeropuerto-internacional-de-cancun-cun-a-costa-mujeres',
  'traslados-desde-el-aeropuerto-internacional-de-cancun-cun-a-playa-del-carmen',
]

// Build lookup: enSlug → { airportSlug, enSlug, esSlug, esAirportSlug }
const byEnSlug = {}
const byEsSlug = {}
for (const r of routes) {
  if (r.enSlug) byEnSlug[r.enSlug] = r
  if (r.esSlug) byEsSlug[r.esSlug] = r
}

const redirects = []
const unmapped = []

// EN redirects: /rutas/[old-slug]/ → /airport-transfers-private-taxi/[airport]/[new-slug]/
for (const old of oldEnSlugs) {
  const match = byEnSlug[old]
  if (match) {
    redirects.push(`      { source: '/rutas/${old}/', destination: '/airport-transfers-private-taxi/${match.airportSlug}/${match.enSlug}/', permanent: true },`)
  } else {
    unmapped.push(`EN: /rutas/${old}/`)
  }
}

// ES redirects: /es/rutas/[old-slug]/ → /es/traslados-aeropuerto-privados-taxi/[airport]/[new-slug]/
for (const old of oldEsSlugs) {
  const match = byEsSlug[old] || byEnSlug[old]
  if (match) {
    const destSlug = match.esSlug || match.enSlug
    const airportSlug = match.esAirportSlug || match.airportSlug
    redirects.push(`      { source: '/es/rutas/${old}/', destination: '/es/traslados-aeropuerto-privados-taxi/${airportSlug}/${destSlug}/', permanent: true },`)
  } else {
    unmapped.push(`ES: /es/rutas/${old}/`)
  }
}

console.log('// ── /rutas/ → new route URL redirects ──')
console.log(redirects.join('\n'))

if (unmapped.length) {
  console.log(`\n// Unmapped (${unmapped.length}):`)
  unmapped.forEach(u => console.log('//  ' + u))
}

console.log(`\n// Total: ${redirects.length} redirects, ${unmapped.length} unmapped`)
