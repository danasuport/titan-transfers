/**
 * Phase 6a: Create destination cities for routes
 * Small towns/districts that are route destinations but not major cities
 */

import { client } from './lib/sanity-client.mjs'
import { generateCityEN, generateCityES, seoTitle, seoDesc } from './lib/content-templates.mjs'

const ROUTE_CITIES = [
  // ── Barcelona region towns (Catalonia, Spain) ──────────────────────────
  { slug: 'badalona', name: 'Badalona', esName: 'Badalona', country: 'spain', region: 'catalonia', vibe: 'a Mediterranean coastal city just north of Barcelona, known for its beaches and Roman heritage' },
  { slug: 'castelldefels', name: 'Castelldefels', esName: 'Castelldefels', country: 'spain', region: 'catalonia', vibe: 'a charming coastal town with a stunning medieval castle overlooking 5 km of golden beaches' },
  { slug: 'lhospitalet-de-llobregat', name: "L'Hospitalet de Llobregat", esName: "L'Hospitalet de Llobregat", country: 'spain', region: 'catalonia', vibe: 'the second-largest city in Catalonia, a vibrant urban hub on Barcelona\'s doorstep' },
  { slug: 'montcada-i-reixac', name: 'Montcada i Reixac', esName: 'Montcada i Reixac', country: 'spain', region: 'catalonia', vibe: 'a peaceful residential town in the Vallès, known for its thermal springs and proximity to Barcelona' },
  { slug: 'ripollet', name: 'Ripollet', esName: 'Ripollet', country: 'spain', region: 'catalonia', vibe: 'a small, welcoming town in the Vallès Occidental with a strong local community feel' },
  { slug: 'sant-cugat-del-valles', name: 'Sant Cugat del Vallès', esName: 'Sant Cugat del Vallès', country: 'spain', region: 'catalonia', vibe: 'an upscale residential town with a beautiful Romanesque monastery and excellent quality of life' },
  { slug: 'santa-coloma-de-gramenet', name: 'Santa Coloma de Gramenet', esName: 'Santa Coloma de Gramenet', country: 'spain', region: 'catalonia', vibe: 'a diverse, multicultural city at the foot of the Serra de Marina mountains' },
  { slug: 'vallmoll', name: 'Vallmoll', esName: 'Vallmoll', country: 'spain', region: 'catalonia', vibe: 'a traditional wine-producing village in the Alt Camp region, surrounded by vineyards and olive groves' },
  { slug: 'lloret-de-mar', name: 'Lloret de Mar', esName: 'Lloret de Mar', country: 'spain', region: 'catalonia', vibe: 'one of the Costa Brava\'s most famous resort towns, with beautiful beaches, botanical gardens, and vibrant nightlife' },
  { slug: 'tossa-de-mar', name: 'Tossa de Mar', esName: 'Tossa de Mar', country: 'spain', region: 'catalonia', vibe: 'a picturesque medieval walled town on the Costa Brava with crystal-clear coves and a stunning Old Quarter' },
  { slug: 'platja-daro', name: "Platja d'Aro", esName: "Platja d'Aro", country: 'spain', region: 'catalonia', vibe: 'a popular Costa Brava resort known for its long sandy beach, shopping, and family-friendly atmosphere' },
  { slug: 'altafulla', name: 'Altafulla', esName: 'Altafulla', country: 'spain', region: 'catalonia', vibe: 'a charming seaside village with a medieval old town, Roman villa ruins, and a tranquil golden beach' },
  { slug: 'la-pineda', name: 'La Pineda', esName: 'La Pineda', country: 'spain', region: 'catalonia', vibe: 'a popular family beach resort on the Costa Daurada, near PortAventura theme park' },
  { slug: 'castellar-del-valles', name: 'Castellar del Vallès', esName: 'Castellar del Vallès', country: 'spain', region: 'catalonia', vibe: 'a quiet residential town in the Vallès Occidental, surrounded by forests and hiking trails' },
  { slug: 'cambrils', name: 'Cambrils', esName: 'Cambrils', country: 'spain', region: 'catalonia', vibe: 'the gastronomic capital of the Costa Daurada, famous for its seafood, fishing port, and golden beaches' },
  { slug: 'escaladei', name: 'Escaladei', esName: 'Escaladei', country: 'spain', region: 'catalonia', vibe: 'a tiny village at the foot of the Montsant mountains, home to the historic Carthusian monastery and prized DOQ Priorat wines' },
  { slug: 'banyoles', name: 'Banyoles', esName: 'Banyoles', country: 'spain', region: 'catalonia', vibe: 'a serene lakeside town built around the largest natural lake in Catalonia, host of the 1992 Olympic rowing events' },
  { slug: 'cadaques', name: 'Cadaqués', esName: 'Cadaqués', country: 'spain', region: 'catalonia', vibe: 'the jewel of the Cap de Creus peninsula, a whitewashed fishing village beloved by Salvador Dalí and artists worldwide' },
  { slug: 'andorra', name: 'Andorra', esName: 'Andorra', country: 'spain', region: 'catalonia', vibe: 'a tiny Pyrenean principality famous for duty-free shopping, ski resorts, and spectacular mountain scenery' },
  { slug: 'castellon', name: 'Castellón', esName: 'Castellón', country: 'spain', region: 'valencian-community', vibe: 'the capital of the Costa del Azahar, with beautiful orange blossom-scented landscapes and Mediterranean beaches' },
  { slug: 'tordera', name: 'Tordera', esName: 'Tordera', country: 'spain', region: 'catalonia', vibe: 'a charming inland town near the Maresme coast, gateway to the Montnegre i el Corredor natural park' },
  { slug: 'malgrat-de-mar', name: 'Malgrat de Mar', esName: 'Malgrat de Mar', country: 'spain', region: 'catalonia', vibe: 'a lively Maresme coast town with wide sandy beaches and a charming old quarter' },
  { slug: 'santa-susanna', name: 'Santa Susanna', esName: 'Santa Susanna', country: 'spain', region: 'catalonia', vibe: 'a family-friendly beach resort on the Maresme coast, combining medieval heritage with modern seaside amenities' },
  { slug: 'pineda-de-mar', name: 'Pineda de Mar', esName: 'Pineda de Mar', country: 'spain', region: 'catalonia', vibe: 'a relaxed Maresme coastal town with a beautiful long beach and a historic Romanesque watchtower' },
  { slug: 'calella', name: 'Calella', esName: 'Calella', country: 'spain', region: 'catalonia', vibe: 'the tourism capital of the Maresme coast, with a vibrant beach promenade, lighthouse, and year-round events' },
  { slug: 'manresa', name: 'Manresa', esName: 'Manresa', country: 'spain', region: 'catalonia', vibe: 'a historic city in central Catalonia, famous for the Basilica of Santa Maria de la Seu and Ignatian heritage' },
  { slug: 'calafell', name: 'Calafell', esName: 'Calafell', country: 'spain', region: 'catalonia', vibe: 'a popular Penedès coast town with an Iberian citadel, Romanesque castle, and family-friendly beaches' },
  { slug: 'cubelles', name: 'Cubelles', esName: 'Cubelles', country: 'spain', region: 'catalonia', vibe: 'a peaceful seaside village at the mouth of the Foix river, ideal for a relaxing Mediterranean escape' },
  { slug: 'vilanova-i-la-geltru', name: 'Vilanova i la Geltrú', esName: 'Vilanova i la Geltrú', country: 'spain', region: 'catalonia', vibe: 'a vibrant coastal city known for its famous Carnival, railway museum, and picturesque beaches' },
  { slug: 'mataro', name: 'Mataró', esName: 'Mataró', country: 'spain', region: 'catalonia', vibe: 'the capital of the Maresme coast, with Roman ruins, modernist architecture, and a bustling marina' },
  { slug: 'granollers', name: 'Granollers', esName: 'Granollers', country: 'spain', region: 'catalonia', vibe: 'a thriving market town in the Vallès Oriental, famous for its Thursday market tradition dating back centuries' },
  { slug: 'cabrils', name: 'Cabrils', esName: 'Cabrils', country: 'spain', region: 'catalonia', vibe: 'a tranquil hilltop village in the Maresme with panoramic views of the Mediterranean coast' },
  { slug: 'palau-solita-i-plegamans', name: 'Palau-solità i Plegamans', esName: 'Palau-solità i Plegamans', country: 'spain', region: 'catalonia', vibe: 'a growing residential town in the Vallès, combining rural charm with modern amenities' },

  // ── UAE destination districts ──────────────────────────────────────────
  { slug: 'ajman', name: 'Ajman', esName: 'Ajmán', country: 'united-arab-emirates', region: 'dubai-emirate', vibe: 'the smallest of the seven emirates, offering pristine beaches, a vibrant corniche, and authentic Arabian culture' },
  { slug: 'fujairah', name: 'Fujairah', esName: 'Fuyaira', country: 'united-arab-emirates', region: 'dubai-emirate', vibe: 'the only emirate on the Gulf of Oman, with dramatic Hajar mountain scenery and unspoiled beaches' },
  { slug: 'jebel-ali', name: 'Jebel Ali & Motiongate', esName: 'Jebel Ali y Motiongate', country: 'united-arab-emirates', region: 'dubai-emirate', vibe: 'Dubai\'s premier entertainment zone, home to theme parks, resorts, and the iconic Jebel Ali port area' },
  { slug: 'palm-jumeirah', name: 'Palm Jumeirah', esName: 'Palm Jumeirah', country: 'united-arab-emirates', region: 'dubai-emirate', vibe: 'Dubai\'s iconic man-made island, shaped like a palm tree, featuring luxury resorts, fine dining, and stunning views' },
]

async function migrate() {
  console.log('🏘️  Creating route destination cities...\n')

  const existing = await client.fetch('*[_type=="city"]{"slug": slug.current}')
  const existingSlugs = new Set(existing.map(c => c.slug))

  let created = 0, skipped = 0

  for (const c of ROUTE_CITIES) {
    if (existingSlugs.has(c.slug)) {
      console.log(`  ⏭️  ${c.name} — exists`)
      skipped++
      continue
    }

    process.stdout.write(`  🏘️  ${c.name}...`)

    const doc = {
      _id: `city-${c.slug}`,
      _type: 'city',
      title: c.name,
      slug: { _type: 'slug', current: c.slug },
      country: { _type: 'reference', _ref: `country-${c.country}` },
      ...(c.region && { region: { _type: 'reference', _ref: `region-${c.region}` } }),
      description: generateCityEN({ name: c.name, country: c.country.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), vibe: c.vibe, nearestAirport: 'Barcelona-El Prat Airport' }),
      seoTitle: seoTitle('city', c.name, 'en'),
      seoDescription: seoDesc('city', c.name, 'en'),
      translations: {
        es: {
          title: c.esName,
          slug: { _type: 'slug', current: c.slug },
          description: generateCityES({ name: c.name, esName: c.esName, country: c.country.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), vibeEs: c.vibe, nearestAirport: 'Aeropuerto de Barcelona-El Prat' }),
          seoTitle: seoTitle('city', c.esName, 'es'),
          seoDescription: seoDesc('city', c.esName, 'es'),
        },
      },
    }

    try {
      await client.createOrReplace(doc)
      created++
      console.log(' ✅')
    } catch (err) {
      console.log(` ❌ ${err.message}`)
    }

    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ Created: ${created} | ⏭️ Skipped: ${skipped}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

migrate().catch(console.error)
