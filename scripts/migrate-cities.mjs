/**
 * Phase 4: Migrate Cities to Sanity
 * Extracts unique cities from the airports data and creates city documents
 */

import { client } from './lib/sanity-client.mjs'
import { generateCityEN, generateCityES, seoTitle, seoDesc } from './lib/content-templates.mjs'

// Extract unique cities from the airports database
// citySlug → { name, country, countrySlug, esName, region, regionSlug }
const CITIES = {
  'abu-dhabi': { name: 'Abu Dhabi', country: 'United Arab Emirates', countrySlug: 'united-arab-emirates', esName: 'Abu Dabi', region: 'Emirate of Abu Dhabi', regionSlug: 'abu-dhabi-emirate', vibe: 'futuristic architecture, luxury hotels, and desert island resorts', vibeEs: 'arquitectura futurista, hoteles de lujo y resorts en islas desérticas' },
  'alicante': { name: 'Alicante', country: 'Spain', countrySlug: 'spain', esName: 'Alicante', region: 'Valencian Community', regionSlug: 'valencian-community', vibe: 'golden beaches, a stunning castle, and vibrant nightlife', vibeEs: 'playas doradas, un impresionante castillo y vibrante vida nocturna' },
  'amsterdam': { name: 'Amsterdam', country: 'Netherlands', countrySlug: 'netherlands', esName: 'Ámsterdam', region: 'North Holland', regionSlug: 'north-holland', vibe: 'picturesque canals, world-class museums, and a liberal cultural spirit', vibeEs: 'pintorescos canales, museos de clase mundial y un espíritu cultural liberal' },
  'antalya': { name: 'Antalya', country: 'Turkey', countrySlug: 'turkey', esName: 'Antalya', region: 'Mediterranean Region', regionSlug: 'mediterranean-turkey', vibe: 'turquoise coastline, ancient ruins, and all-inclusive resorts', vibeEs: 'costa turquesa, ruinas antiguas y resorts todo incluido' },
  'athens': { name: 'Athens', country: 'Greece', countrySlug: 'greece', esName: 'Atenas', region: 'Attica', regionSlug: 'attica', vibe: 'the cradle of Western civilisation with ancient ruins and lively tavernas', vibeEs: 'la cuna de la civilización occidental con ruinas antiguas y animadas tabernas' },
  'atlanta': { name: 'Atlanta', country: 'United States', countrySlug: 'united-states', esName: 'Atlanta', region: 'Georgia', regionSlug: 'georgia-us' },
  'austin': { name: 'Austin', country: 'United States', countrySlug: 'united-states', esName: 'Austin', region: 'Texas', regionSlug: 'texas' },
  'baltimore': { name: 'Baltimore', country: 'United States', countrySlug: 'united-states', esName: 'Baltimore', region: 'Massachusetts', regionSlug: 'massachusetts' },
  'beijing': { name: 'Beijing', country: 'China', countrySlug: 'china', esName: 'Pekín', vibe: 'ancient imperial palaces, the Great Wall, and cutting-edge modernity', vibeEs: 'antiguos palacios imperiales, la Gran Muralla y modernidad de vanguardia' },
  'berlin': { name: 'Berlin', country: 'Germany', countrySlug: 'germany', esName: 'Berlín', region: 'Berlin-Brandenburg', regionSlug: 'berlin-brandenburg', vibe: 'a vibrant arts scene, rich 20th-century history, and legendary nightlife', vibeEs: 'una vibrante escena artística, rica historia del siglo XX y legendaria vida nocturna' },
  'bogota': { name: 'Bogotá', country: 'Colombia', countrySlug: 'colombia', esName: 'Bogotá', region: 'Cundinamarca', regionSlug: 'cundinamarca' },
  'boston': { name: 'Boston', country: 'United States', countrySlug: 'united-states', esName: 'Boston', region: 'Massachusetts', regionSlug: 'massachusetts' },
  'brussels': { name: 'Brussels', country: 'Belgium', countrySlug: 'belgium', esName: 'Bruselas', region: 'Brussels-Capital Region', regionSlug: 'brussels-capital' },
  'budapest': { name: 'Budapest', country: 'Hungary', countrySlug: 'hungary', esName: 'Budapest', region: 'Greater Budapest', regionSlug: 'greater-budapest', vibe: 'thermal baths, Danube panoramas, and ruin bars', vibeEs: 'baños termales, panorámicas del Danubio y bares en ruinas' },
  'buffalo': { name: 'Buffalo', country: 'United States', countrySlug: 'united-states', esName: 'Buffalo', region: 'New York', regionSlug: 'new-york-state' },
  'cairo': { name: 'Cairo', country: 'Egypt', countrySlug: 'egypt', esName: 'El Cairo', vibe: 'the Pyramids of Giza, the Sphinx, and millennia of history along the Nile', vibeEs: 'las Pirámides de Guiza, la Esfinge y milenios de historia a lo largo del Nilo' },
  'cancun': { name: 'Cancún', country: 'Mexico', countrySlug: 'mexico', esName: 'Cancún', region: 'Quintana Roo', regionSlug: 'quintana-roo' },
  'cartagena': { name: 'Cartagena', country: 'Colombia', countrySlug: 'colombia', esName: 'Cartagena' },
  'catania': { name: 'Catania', country: 'Italy', countrySlug: 'italy', esName: 'Catania', region: 'Sicily', regionSlug: 'sicily' },
  'changsha': { name: 'Changsha', country: 'China', countrySlug: 'china', esName: 'Changsha' },
  'charleroi': { name: 'Charleroi', country: 'Belgium', countrySlug: 'belgium', esName: 'Charleroi', region: 'Wallonia', regionSlug: 'wallonia' },
  'charleston': { name: 'Charleston', country: 'United States', countrySlug: 'united-states', esName: 'Charleston' },
  'charlotte': { name: 'Charlotte', country: 'United States', countrySlug: 'united-states', esName: 'Charlotte' },
  'chicago': { name: 'Chicago', country: 'United States', countrySlug: 'united-states', esName: 'Chicago', region: 'Illinois', regionSlug: 'illinois', vibe: 'stunning lakefront skyline, deep-dish pizza, and world-class architecture', vibeEs: 'impresionante horizonte frente al lago, pizza deep-dish y arquitectura de clase mundial' },
  'cologne': { name: 'Cologne', country: 'Germany', countrySlug: 'germany', esName: 'Colonia', region: 'North Rhine-Westphalia', regionSlug: 'north-rhine-westphalia' },
  'cozumel': { name: 'Cozumel', country: 'Mexico', countrySlug: 'mexico', esName: 'Cozumel', region: 'Quintana Roo', regionSlug: 'quintana-roo' },
  'dallas': { name: 'Dallas', country: 'United States', countrySlug: 'united-states', esName: 'Dallas', region: 'Texas', regionSlug: 'texas' },
  'denver': { name: 'Denver', country: 'United States', countrySlug: 'united-states', esName: 'Denver' },
  'detroit': { name: 'Detroit', country: 'United States', countrySlug: 'united-states', esName: 'Detroit' },
  'dubai': { name: 'Dubai', country: 'United Arab Emirates', countrySlug: 'united-arab-emirates', esName: 'Dubái', region: 'Emirate of Dubai', regionSlug: 'dubai-emirate', vibe: 'record-breaking skyscrapers, luxury shopping, and desert safaris', vibeEs: 'rascacielos récord, compras de lujo y safaris por el desierto' },
  'dublin': { name: 'Dublin', country: 'Ireland', countrySlug: 'ireland', esName: 'Dublín', region: 'Leinster', regionSlug: 'leinster', vibe: 'literary pubs, Georgian architecture, and legendary Irish hospitality', vibeEs: 'pubs literarios, arquitectura georgiana y legendaria hospitalidad irlandesa' },
  'dusseldorf': { name: 'Düsseldorf', country: 'Germany', countrySlug: 'germany', esName: 'Düsseldorf', region: 'North Rhine-Westphalia', regionSlug: 'north-rhine-westphalia' },
  'edinburgh': { name: 'Edinburgh', country: 'United Kingdom', countrySlug: 'united-kingdom', esName: 'Edimburgo', region: 'Scotland', regionSlug: 'scotland', vibe: 'a dramatic castle, cobbled streets, and the world-famous Festival Fringe', vibeEs: 'un castillo espectacular, calles empedradas y el mundialmente famoso Festival Fringe' },
  'faro': { name: 'Faro', country: 'Portugal', countrySlug: 'portugal', esName: 'Faro', region: 'Algarve', regionSlug: 'algarve' },
  'florence': { name: 'Florence', country: 'Italy', countrySlug: 'italy', esName: 'Florencia', region: 'Tuscany', regionSlug: 'tuscany', vibe: 'the birthplace of the Renaissance, with stunning art and Tuscan cuisine', vibeEs: 'la cuna del Renacimiento, con arte impresionante y cocina toscana' },
  'fort-lauderdale': { name: 'Fort Lauderdale', country: 'United States', countrySlug: 'united-states', esName: 'Fort Lauderdale', region: 'Florida', regionSlug: 'florida' },
  'frankfurt': { name: 'Frankfurt', country: 'Germany', countrySlug: 'germany', esName: 'Fráncfort', region: 'Hesse', regionSlug: 'hesse' },
  'girona': { name: 'Girona', country: 'Spain', countrySlug: 'spain', esName: 'Girona', region: 'Catalonia', regionSlug: 'catalonia' },
  'guangzhou': { name: 'Guangzhou', country: 'China', countrySlug: 'china', esName: 'Cantón' },
  'hong-kong': { name: 'Hong Kong', country: 'China', countrySlug: 'china', esName: 'Hong Kong' },
  'honolulu': { name: 'Honolulu', country: 'United States', countrySlug: 'united-states', esName: 'Honolulu' },
  'houston': { name: 'Houston', country: 'United States', countrySlug: 'united-states', esName: 'Houston', region: 'Texas', regionSlug: 'texas' },
  'hurghada': { name: 'Hurghada', country: 'Egypt', countrySlug: 'egypt', esName: 'Hurghada' },
  'istanbul': { name: 'Istanbul', country: 'Turkey', countrySlug: 'turkey', esName: 'Estambul', region: 'Marmara Region', regionSlug: 'marmara', vibe: 'where continents collide — Byzantine mosaics, Ottoman palaces, and bazaars', vibeEs: 'donde los continentes se encuentran — mosaicos bizantinos, palacios otomanos y bazares' },
  'kansas-city': { name: 'Kansas City', country: 'United States', countrySlug: 'united-states', esName: 'Kansas City' },
  'kos': { name: 'Kos', country: 'Greece', countrySlug: 'greece', esName: 'Kos', region: 'South Aegean', regionSlug: 'south-aegean' },
  'lanzarote': { name: 'Lanzarote', country: 'Spain', countrySlug: 'spain', esName: 'Lanzarote', region: 'Canary Islands', regionSlug: 'canary-islands' },
  'las-vegas': { name: 'Las Vegas', country: 'United States', countrySlug: 'united-states', esName: 'Las Vegas', region: 'Nevada', regionSlug: 'nevada' },
  'lisbon': { name: 'Lisbon', country: 'Portugal', countrySlug: 'portugal', esName: 'Lisboa', region: 'Lisbon Region', regionSlug: 'lisbon-region', vibe: 'pastel-coloured hillside neighbourhoods, fado music, and seafood cuisine', vibeEs: 'barrios en colinas de colores pastel, música fado y cocina marinera' },
  'london': { name: 'London', country: 'United Kingdom', countrySlug: 'united-kingdom', esName: 'Londres', region: 'England', regionSlug: 'england', vibe: 'royal palaces, West End theatre, and a global culinary melting pot', vibeEs: 'palacios reales, teatro del West End y un crisol gastronómico global' },
  'los-angeles': { name: 'Los Angeles', country: 'United States', countrySlug: 'united-states', esName: 'Los Ángeles', region: 'California', regionSlug: 'california' },
  'madrid': { name: 'Madrid', country: 'Spain', countrySlug: 'spain', esName: 'Madrid', region: 'Community of Madrid', regionSlug: 'community-of-madrid', vibe: 'royal palaces, world-class art museums, and a legendary nightlife', vibeEs: 'palacios reales, museos de arte de talla mundial y una legendaria vida nocturna' },
  'malaga': { name: 'Málaga', country: 'Spain', countrySlug: 'spain', esName: 'Málaga', region: 'Andalusia', regionSlug: 'andalusia', vibe: 'Picasso\'s birthplace with stunning beaches and Moorish heritage', vibeEs: 'cuna de Picasso con playas impresionantes y herencia morisca' },
  'manchester': { name: 'Manchester', country: 'United Kingdom', countrySlug: 'united-kingdom', esName: 'Mánchester', region: 'England', regionSlug: 'england' },
  'marrakech': { name: 'Marrakech', country: 'Morocco', countrySlug: 'morocco', esName: 'Marrakech' },
  'marsa-alam': { name: 'Marsa Alam', country: 'Egypt', countrySlug: 'egypt', esName: 'Marsa Alam' },
  'miami': { name: 'Miami', country: 'United States', countrySlug: 'united-states', esName: 'Miami', region: 'Florida', regionSlug: 'florida', vibe: 'Art Deco architecture, Latin-infused culture, and year-round sunshine', vibeEs: 'arquitectura Art Decó, cultura con influencia latina y sol todo el año' },
  'milan': { name: 'Milan', country: 'Italy', countrySlug: 'italy', esName: 'Milán', region: 'Lombardy', regionSlug: 'lombardy', vibe: 'fashion capital, Renaissance masterpieces, and Italian fine dining', vibeEs: 'capital de la moda, obras maestras renacentistas y alta cocina italiana' },
  'minneapolis': { name: 'Minneapolis', country: 'United States', countrySlug: 'united-states', esName: 'Mineápolis' },
  'montego-bay': { name: 'Montego Bay', country: 'Jamaica', countrySlug: 'jamaica', esName: 'Montego Bay' },
  'montreal': { name: 'Montreal', country: 'Canada', countrySlug: 'canada', esName: 'Montreal', region: 'Quebec', regionSlug: 'quebec' },
  'munich': { name: 'Munich', country: 'Germany', countrySlug: 'germany', esName: 'Múnich', region: 'Bavaria', regionSlug: 'bavaria' },
  'nanjing': { name: 'Nanjing', country: 'China', countrySlug: 'china', esName: 'Nankín' },
  'new-orleans': { name: 'New Orleans', country: 'United States', countrySlug: 'united-states', esName: 'Nueva Orleans' },
  'new-york': { name: 'New York', country: 'United States', countrySlug: 'united-states', esName: 'Nueva York', region: 'New York', regionSlug: 'new-york-state', vibe: 'the city that never sleeps — Broadway, Central Park, and global cuisine', vibeEs: 'la ciudad que nunca duerme — Broadway, Central Park y cocina global' },
  'newark': { name: 'Newark', country: 'United States', countrySlug: 'united-states', esName: 'Newark', region: 'New York', regionSlug: 'new-york-state' },
  'orlando': { name: 'Orlando', country: 'United States', countrySlug: 'united-states', esName: 'Orlando', region: 'Florida', regionSlug: 'florida' },
  'ottawa': { name: 'Ottawa', country: 'Canada', countrySlug: 'canada', esName: 'Ottawa', region: 'Ontario', regionSlug: 'ontario' },
  'palermo': { name: 'Palermo', country: 'Italy', countrySlug: 'italy', esName: 'Palermo', region: 'Sicily', regionSlug: 'sicily' },
  'palma-de-mallorca': { name: 'Palma de Mallorca', country: 'Spain', countrySlug: 'spain', esName: 'Palma de Mallorca', region: 'Balearic Islands', regionSlug: 'balearic-islands' },
  'panama-city': { name: 'Panama City', country: 'Panama', countrySlug: 'panama', esName: 'Ciudad de Panamá' },
  'paris': { name: 'Paris', country: 'France', countrySlug: 'france', esName: 'París', region: 'Île-de-France', regionSlug: 'ile-de-france', vibe: 'the City of Light — the Eiffel Tower, Louvre, and world-class patisseries', vibeEs: 'la Ciudad de la Luz — la Torre Eiffel, el Louvre y pastelerías de clase mundial' },
  'philadelphia': { name: 'Philadelphia', country: 'United States', countrySlug: 'united-states', esName: 'Filadelfia', region: 'Pennsylvania', regionSlug: 'pennsylvania' },
  'phoenix': { name: 'Phoenix', country: 'United States', countrySlug: 'united-states', esName: 'Phoenix' },
  'phuket': { name: 'Phuket', country: 'Thailand', countrySlug: 'thailand', esName: 'Phuket' },
  'pittsburgh': { name: 'Pittsburgh', country: 'United States', countrySlug: 'united-states', esName: 'Pittsburgh', region: 'Pennsylvania', regionSlug: 'pennsylvania' },
  'porto': { name: 'Porto', country: 'Portugal', countrySlug: 'portugal', esName: 'Oporto', region: 'Norte Region', regionSlug: 'norte-portugal' },
  'prague': { name: 'Prague', country: 'Czech Republic', countrySlug: 'czech-republic', esName: 'Praga', region: 'Central Bohemia', regionSlug: 'central-bohemia', vibe: 'fairy-tale bridges, Gothic spires, and one of Europe\'s best beer cultures', vibeEs: 'puentes de cuento, agujas góticas y una de las mejores culturas cerveceras de Europa' },
  'pristina': { name: 'Pristina', country: 'Kosovo', countrySlug: 'kosovo', esName: 'Pristina' },
  'punta-cana': { name: 'Punta Cana', country: 'Dominican Republic', countrySlug: 'dominican-republic', esName: 'Punta Cana' },
  'raleigh': { name: 'Raleigh', country: 'United States', countrySlug: 'united-states', esName: 'Raleigh' },
  'ras-al-khaimah': { name: 'Ras Al Khaimah', country: 'United Arab Emirates', countrySlug: 'united-arab-emirates', esName: 'Ras Al Khaimah' },
  'reus': { name: 'Reus', country: 'Spain', countrySlug: 'spain', esName: 'Reus', region: 'Catalonia', regionSlug: 'catalonia' },
  'richmond': { name: 'Richmond', country: 'United States', countrySlug: 'united-states', esName: 'Richmond' },
  'rome': { name: 'Rome', country: 'Italy', countrySlug: 'italy', esName: 'Roma', region: 'Lazio', regionSlug: 'lazio', vibe: 'the Eternal City — the Colosseum, Vatican, and la dolce vita', vibeEs: 'la Ciudad Eterna — el Coliseo, el Vaticano y la dolce vita' },
  'salt-lake-city': { name: 'Salt Lake City', country: 'United States', countrySlug: 'united-states', esName: 'Salt Lake City' },
  'san-antonio': { name: 'San Antonio', country: 'United States', countrySlug: 'united-states', esName: 'San Antonio', region: 'Texas', regionSlug: 'texas' },
  'san-diego': { name: 'San Diego', country: 'United States', countrySlug: 'united-states', esName: 'San Diego', region: 'California', regionSlug: 'california' },
  'san-francisco': { name: 'San Francisco', country: 'United States', countrySlug: 'united-states', esName: 'San Francisco', region: 'California', regionSlug: 'california' },
  'san-juan': { name: 'San Juan', country: 'Puerto Rico', countrySlug: 'puerto-rico', esName: 'San Juan' },
  'santiago-de-compostela': { name: 'Santiago de Compostela', country: 'Spain', countrySlug: 'spain', esName: 'Santiago de Compostela', region: 'Galicia', regionSlug: 'galicia' },
  'santo-domingo': { name: 'Santo Domingo', country: 'Dominican Republic', countrySlug: 'dominican-republic', esName: 'Santo Domingo' },
  'sarajevo': { name: 'Sarajevo', country: 'Bosnia and Herzegovina', countrySlug: 'bosnia-and-herzegovina', esName: 'Sarajevo' },
  'seattle': { name: 'Seattle', country: 'United States', countrySlug: 'united-states', esName: 'Seattle', region: 'Washington', regionSlug: 'washington-state' },
  'shanghai': { name: 'Shanghai', country: 'China', countrySlug: 'china', esName: 'Shanghái' },
  'sharjah': { name: 'Sharjah', country: 'United Arab Emirates', countrySlug: 'united-arab-emirates', esName: 'Sharjah' },
  'shenzhen': { name: 'Shenzhen', country: 'China', countrySlug: 'china', esName: 'Shenzhen' },
  'skopje': { name: 'Skopje', country: 'North Macedonia', countrySlug: 'north-macedonia', esName: 'Skopje' },
  'tampa': { name: 'Tampa', country: 'United States', countrySlug: 'united-states', esName: 'Tampa', region: 'Florida', regionSlug: 'florida' },
  'tangier': { name: 'Tangier', country: 'Morocco', countrySlug: 'morocco', esName: 'Tánger' },
  'tirana': { name: 'Tirana', country: 'Albania', countrySlug: 'albania', esName: 'Tirana' },
  'tulum': { name: 'Tulum', country: 'Mexico', countrySlug: 'mexico', esName: 'Tulum', region: 'Quintana Roo', regionSlug: 'quintana-roo' },
  'vancouver': { name: 'Vancouver', country: 'Canada', countrySlug: 'canada', esName: 'Vancouver', region: 'British Columbia', regionSlug: 'british-columbia' },
  'washington-dc': { name: 'Washington D.C.', country: 'United States', countrySlug: 'united-states', esName: 'Washington D.C.' },
}

async function migrate() {
  console.log('🏙️  Migrating cities...\n')

  const existing = await client.fetch('*[_type=="city"]{"slug": slug.current}')
  const existingSlugs = new Set(existing.map(c => c.slug))

  let created = 0, skipped = 0

  const entries = Object.entries(CITIES)
  for (let i = 0; i < entries.length; i += 5) {
    const batch = entries.slice(i, i + 5)
    await Promise.all(batch.map(async ([slug, c]) => {
      if (existingSlugs.has(slug)) {
        console.log(`  ⏭️  ${c.name} — exists`)
        skipped++
        return
      }

      process.stdout.write(`  🏙️  ${c.name}...`)

      const doc = {
        _id: `city-${slug}`,
        _type: 'city',
        title: c.name,
        slug: { _type: 'slug', current: slug },
        country: { _type: 'reference', _ref: `country-${c.countrySlug}` },
        ...(c.regionSlug && { region: { _type: 'reference', _ref: `region-${c.regionSlug}` } }),
        description: generateCityEN({ name: c.name, country: c.country, vibe: c.vibe, nearestAirport: 'the nearest airport' }),
        seoTitle: seoTitle('city', c.name, 'en'),
        seoDescription: seoDesc('city', c.name, 'en'),
        translations: {
          es: {
            title: c.esName || c.name,
            slug: { _type: 'slug', current: slug },
            description: generateCityES({ name: c.name, esName: c.esName, country: c.country, vibeEs: c.vibeEs, nearestAirport: 'el aeropuerto más cercano' }),
            seoTitle: seoTitle('city', c.esName || c.name, 'es'),
            seoDescription: seoDesc('city', c.esName || c.name, 'es'),
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
    }))
    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ Created: ${created} | ⏭️ Skipped: ${skipped}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

migrate().catch(console.error)
