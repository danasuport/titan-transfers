/**
 * Phase 2: Migrate Countries to Sanity
 * Creates 22 countries with SEO content in EN + ES and images
 */

import { client } from './lib/sanity-client.mjs'
import { generateCountryEN, generateCountryES, seoTitle, seoDesc } from './lib/content-templates.mjs'
import { getImageForCity } from './lib/image-utils.mjs'

const COUNTRIES = [
  { slug: 'spain', name: 'Spain', esName: 'España', vibe: 'sun-drenched beaches, passionate culture, and world-renowned gastronomy', vibeEs: 'playas bañadas por el sol, cultura apasionada y gastronomía de renombre mundial', mainAirport: 'Madrid-Barajas or Barcelona-El Prat' },
  { slug: 'united-states', name: 'United States', esName: 'Estados Unidos', vibe: 'iconic cities, diverse landscapes, and endless opportunity', vibeEs: 'ciudades icónicas, paisajes diversos y oportunidades infinitas', mainAirport: 'JFK, LAX, or Miami International' },
  { slug: 'united-kingdom', name: 'United Kingdom', esName: 'Reino Unido', vibe: 'historic landmarks, vibrant cultural scene, and world-class theatre', vibeEs: 'monumentos históricos, vibrante escena cultural y teatro de clase mundial', mainAirport: 'London Heathrow' },
  { slug: 'france', name: 'France', esName: 'Francia', vibe: 'timeless elegance, gourmet cuisine, and artistic heritage', vibeEs: 'elegancia atemporal, alta cocina y patrimonio artístico', mainAirport: 'Paris Charles de Gaulle' },
  { slug: 'italy', name: 'Italy', esName: 'Italia', vibe: 'ancient ruins, Renaissance art, and unforgettable Mediterranean cuisine', vibeEs: 'ruinas antiguas, arte renacentista y cocina mediterránea inolvidable', mainAirport: 'Rome Fiumicino or Milan Malpensa' },
  { slug: 'germany', name: 'Germany', esName: 'Alemania', vibe: 'precision engineering, rich history, and a thriving cultural landscape', vibeEs: 'ingeniería de precisión, rica historia y un panorama cultural próspero', mainAirport: 'Frankfurt or Munich Airport' },
  { slug: 'turkey', name: 'Turkey', esName: 'Turquía', vibe: 'where East meets West, with stunning coastlines and ancient civilisations', vibeEs: 'donde Oriente se encuentra con Occidente, con impresionantes costas y civilizaciones antiguas', mainAirport: 'Istanbul Airport' },
  { slug: 'united-arab-emirates', name: 'United Arab Emirates', esName: 'Emiratos Árabes Unidos', vibe: 'futuristic skylines, luxury shopping, and desert adventures', vibeEs: 'horizontes futuristas, compras de lujo y aventuras en el desierto', mainAirport: 'Dubai International' },
  { slug: 'portugal', name: 'Portugal', esName: 'Portugal', vibe: 'charming coastal towns, rich maritime history, and warm hospitality', vibeEs: 'encantadores pueblos costeros, rica historia marítima y cálida hospitalidad', mainAirport: 'Lisbon Airport' },
  { slug: 'netherlands', name: 'Netherlands', esName: 'Países Bajos', vibe: 'iconic canals, world-class museums, and a progressive, cycling-friendly culture', vibeEs: 'canales icónicos, museos de clase mundial y una cultura progresista', mainAirport: 'Amsterdam Schiphol' },
  { slug: 'greece', name: 'Greece', esName: 'Grecia', vibe: 'ancient mythology, idyllic islands, and sun-kissed Mediterranean shores', vibeEs: 'mitología antigua, islas idílicas y costas mediterráneas bañadas por el sol', mainAirport: 'Athens International' },
  { slug: 'belgium', name: 'Belgium', esName: 'Bélgica', vibe: 'medieval architecture, world-famous chocolate, and a vibrant beer culture', vibeEs: 'arquitectura medieval, chocolate mundialmente famoso y una vibrante cultura cervecera', mainAirport: 'Brussels Airport' },
  { slug: 'ireland', name: 'Ireland', esName: 'Irlanda', vibe: 'rolling green landscapes, literary heritage, and legendary hospitality', vibeEs: 'verdes paisajes ondulantes, patrimonio literario y hospitalidad legendaria', mainAirport: 'Dublin Airport' },
  { slug: 'china', name: 'China', esName: 'China', vibe: 'millennia of history, breathtaking landscapes, and dynamic modern cities', vibeEs: 'milenios de historia, paisajes impresionantes y dinámicas ciudades modernas', mainAirport: 'Beijing Capital or Shanghai Pudong' },
  { slug: 'egypt', name: 'Egypt', esName: 'Egipto', vibe: 'ancient pyramids, the Nile River, and thousands of years of fascinating history', vibeEs: 'pirámides antiguas, el río Nilo y miles de años de historia fascinante', mainAirport: 'Cairo International' },
  { slug: 'morocco', name: 'Morocco', esName: 'Marruecos', vibe: 'colourful souks, Sahara adventures, and a captivating blend of Arab and Berber cultures', vibeEs: 'zocos coloridos, aventuras en el Sáhara y una cautivadora mezcla de culturas árabe y bereber', mainAirport: 'Marrakech Menara' },
  { slug: 'mexico', name: 'Mexico', esName: 'México', vibe: 'ancient civilisations, stunning beaches, and vibrant fiestas', vibeEs: 'civilizaciones antiguas, playas impresionantes y fiestas vibrantes', mainAirport: 'Cancún International' },
  { slug: 'colombia', name: 'Colombia', esName: 'Colombia', vibe: 'lush coffee regions, Caribbean coastlines, and incredible biodiversity', vibeEs: 'exuberantes regiones cafeteras, costas caribeñas y una biodiversidad increíble', mainAirport: 'El Dorado International, Bogotá' },
  { slug: 'canada', name: 'Canada', esName: 'Canadá', vibe: 'vast wilderness, multicultural cities, and breathtaking natural wonders', vibeEs: 'vastos paisajes naturales, ciudades multiculturales y maravillas naturales impresionantes', mainAirport: 'Toronto Pearson or Vancouver International' },
  { slug: 'hungary', name: 'Hungary', esName: 'Hungría', vibe: 'thermal baths, grand architecture, and a rich culinary tradition', vibeEs: 'baños termales, arquitectura grandiosa y una rica tradición culinaria', mainAirport: 'Budapest Ferenc Liszt' },
  { slug: 'czech-republic', name: 'Czech Republic', esName: 'República Checa', vibe: 'fairy-tale castles, historic beer culture, and stunning Gothic and Baroque architecture', vibeEs: 'castillos de cuento, cultura cervecera histórica e impresionante arquitectura gótica y barroca', mainAirport: 'Václav Havel Airport Prague' },
  { slug: 'jamaica', name: 'Jamaica', esName: 'Jamaica', vibe: 'reggae rhythms, pristine beaches, and the warm spirit of the Caribbean', vibeEs: 'ritmos de reggae, playas vírgenes y el cálido espíritu del Caribe', mainAirport: 'Sangster International, Montego Bay' },
  { slug: 'panama', name: 'Panama', esName: 'Panamá', vibe: 'the famous canal, tropical rainforests, and a booming modern skyline', vibeEs: 'el famoso canal, selvas tropicales y un moderno horizonte en auge', mainAirport: 'Tocumen International' },
  { slug: 'dominican-republic', name: 'Dominican Republic', esName: 'República Dominicana', vibe: 'all-inclusive resorts, turquoise waters, and merengue rhythms', vibeEs: 'resorts todo incluido, aguas turquesas y ritmos de merengue', mainAirport: 'Punta Cana International' },
  { slug: 'thailand', name: 'Thailand', esName: 'Tailandia', vibe: 'ornate temples, tropical beaches, and one of the world\'s most celebrated cuisines', vibeEs: 'templos ornamentados, playas tropicales y una de las gastronomías más célebres del mundo', mainAirport: 'Phuket International' },
  { slug: 'albania', name: 'Albania', esName: 'Albania', vibe: 'the last hidden gem of Europe with pristine beaches, Ottoman history, and dramatic mountain scenery', vibeEs: 'la última joya oculta de Europa con playas vírgenes, historia otomana y espectaculares paisajes montañosos', mainAirport: 'Tirana International' },
  { slug: 'north-macedonia', name: 'North Macedonia', esName: 'Macedonia del Norte', vibe: 'ancient churches, Lake Ohrid, and a crossroads of Balkan cultures', vibeEs: 'iglesias antiguas, el Lago Ohrid y un cruce de culturas balcánicas', mainAirport: 'Skopje International' },
  { slug: 'kosovo', name: 'Kosovo', esName: 'Kosovo', vibe: 'emerging tourism, Ottoman heritage, and warm Balkan hospitality', vibeEs: 'turismo emergente, herencia otomana y cálida hospitalidad balcánica', mainAirport: 'Pristina International' },
  { slug: 'bosnia-and-herzegovina', name: 'Bosnia and Herzegovina', esName: 'Bosnia y Herzegovina', vibe: 'Ottoman bridges, dramatic canyons, and a rich multicultural tapestry', vibeEs: 'puentes otomanos, cañones espectaculares y un rico tapiz multicultural', mainAirport: 'Sarajevo International' },
  { slug: 'puerto-rico', name: 'Puerto Rico', esName: 'Puerto Rico', vibe: 'colourful colonial streets, tropical rainforests, and Caribbean beaches', vibeEs: 'coloridas calles coloniales, selvas tropicales y playas caribeñas', mainAirport: 'Luis Muñoz Marín International' },
]

async function migrate() {
  console.log('🌍 Migrating countries...\n')

  const existing = await client.fetch('*[_type=="country"]{title, "slug": slug.current}')
  const existingSlugs = new Set(existing.map(c => c.slug))

  let created = 0, skipped = 0, withImg = 0

  for (const c of COUNTRIES) {
    if (existingSlugs.has(c.slug)) {
      console.log(`  ⏭️  ${c.name} — already exists`)
      skipped++
      continue
    }

    process.stdout.write(`  🌍 ${c.name}...`)

    const image = await getImageForCity(c.name, c.slug, `${c.name} - Private Transfers`)
    if (image) withImg++

    const doc = {
      _id: `country-${c.slug}`,
      _type: 'country',
      title: c.name,
      slug: { _type: 'slug', current: c.slug },
      description: generateCountryEN(c),
      seoTitle: seoTitle('country', c.name, 'en'),
      seoDescription: seoDesc('country', c.name, 'en'),
      ...(image && { featuredImage: image }),
      translations: {
        es: {
          title: c.esName,
          slug: { _type: 'slug', current: c.slug },
          description: generateCountryES(c),
          seoTitle: seoTitle('country', c.esName, 'es'),
          seoDescription: seoDesc('country', c.esName, 'es'),
        },
      },
    }

    try {
      await client.createOrReplace(doc)
      created++
      console.log(image ? ' ✅ + 🖼️' : ' ✅')
    } catch (err) {
      console.log(` ❌ ${err.message}`)
    }

    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ Created: ${created} | ⏭️ Skipped: ${skipped} | 🖼️ With images: ${withImg}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

migrate().catch(console.error)
