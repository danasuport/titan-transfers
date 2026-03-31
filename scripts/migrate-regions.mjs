/**
 * Phase 3: Migrate Regions to Sanity
 * Creates ~35 regions with country references
 */

import { client } from './lib/sanity-client.mjs'
import { richText } from './lib/portable-text.mjs'
import { seoTitle, seoDesc } from './lib/content-templates.mjs'

const REGIONS = [
  // Spain
  { slug: 'catalonia', name: 'Catalonia', esName: 'Cataluña', country: 'spain' },
  { slug: 'community-of-madrid', name: 'Community of Madrid', esName: 'Comunidad de Madrid', country: 'spain' },
  { slug: 'andalusia', name: 'Andalusia', esName: 'Andalucía', country: 'spain' },
  { slug: 'valencian-community', name: 'Valencian Community', esName: 'Comunidad Valenciana', country: 'spain' },
  { slug: 'balearic-islands', name: 'Balearic Islands', esName: 'Islas Baleares', country: 'spain' },
  { slug: 'canary-islands', name: 'Canary Islands', esName: 'Islas Canarias', country: 'spain' },
  { slug: 'galicia', name: 'Galicia', esName: 'Galicia', country: 'spain' },
  // UK
  { slug: 'england', name: 'England', esName: 'Inglaterra', country: 'united-kingdom' },
  { slug: 'scotland', name: 'Scotland', esName: 'Escocia', country: 'united-kingdom' },
  // France
  { slug: 'ile-de-france', name: 'Île-de-France', esName: 'Isla de Francia', country: 'france' },
  { slug: 'hauts-de-france', name: 'Hauts-de-France', esName: 'Alta Francia', country: 'france' },
  // Italy
  { slug: 'lazio', name: 'Lazio', esName: 'Lacio', country: 'italy' },
  { slug: 'lombardy', name: 'Lombardy', esName: 'Lombardía', country: 'italy' },
  { slug: 'tuscany', name: 'Tuscany', esName: 'Toscana', country: 'italy' },
  { slug: 'sicily', name: 'Sicily', esName: 'Sicilia', country: 'italy' },
  // Germany
  { slug: 'bavaria', name: 'Bavaria', esName: 'Baviera', country: 'germany' },
  { slug: 'hesse', name: 'Hesse', esName: 'Hesse', country: 'germany' },
  { slug: 'north-rhine-westphalia', name: 'North Rhine-Westphalia', esName: 'Renania del Norte-Westfalia', country: 'germany' },
  { slug: 'berlin-brandenburg', name: 'Berlin-Brandenburg', esName: 'Berlín-Brandeburgo', country: 'germany' },
  // Turkey
  { slug: 'marmara', name: 'Marmara Region', esName: 'Región de Mármara', country: 'turkey' },
  { slug: 'mediterranean-turkey', name: 'Mediterranean Region', esName: 'Región Mediterránea', country: 'turkey' },
  // Portugal
  { slug: 'algarve', name: 'Algarve', esName: 'Algarve', country: 'portugal' },
  { slug: 'lisbon-region', name: 'Lisbon Region', esName: 'Región de Lisboa', country: 'portugal' },
  { slug: 'norte-portugal', name: 'Norte Region', esName: 'Región Norte', country: 'portugal' },
  // Netherlands
  { slug: 'north-holland', name: 'North Holland', esName: 'Holanda Septentrional', country: 'netherlands' },
  // Greece
  { slug: 'attica', name: 'Attica', esName: 'Ática', country: 'greece' },
  { slug: 'south-aegean', name: 'South Aegean', esName: 'Egeo Meridional', country: 'greece' },
  // Belgium
  { slug: 'brussels-capital', name: 'Brussels-Capital Region', esName: 'Región de Bruselas-Capital', country: 'belgium' },
  { slug: 'wallonia', name: 'Wallonia', esName: 'Valonia', country: 'belgium' },
  // Ireland
  { slug: 'leinster', name: 'Leinster', esName: 'Leinster', country: 'ireland' },
  // UAE
  { slug: 'dubai-emirate', name: 'Emirate of Dubai', esName: 'Emirato de Dubái', country: 'united-arab-emirates' },
  { slug: 'abu-dhabi-emirate', name: 'Emirate of Abu Dhabi', esName: 'Emirato de Abu Dabi', country: 'united-arab-emirates' },
  // US major states
  { slug: 'california', name: 'California', esName: 'California', country: 'united-states' },
  { slug: 'new-york-state', name: 'New York', esName: 'Nueva York', country: 'united-states' },
  { slug: 'florida', name: 'Florida', esName: 'Florida', country: 'united-states' },
  { slug: 'texas', name: 'Texas', esName: 'Texas', country: 'united-states' },
  { slug: 'illinois', name: 'Illinois', esName: 'Illinois', country: 'united-states' },
  { slug: 'georgia-us', name: 'Georgia', esName: 'Georgia', country: 'united-states' },
  { slug: 'massachusetts', name: 'Massachusetts', esName: 'Massachusetts', country: 'united-states' },
  { slug: 'nevada', name: 'Nevada', esName: 'Nevada', country: 'united-states' },
  { slug: 'pennsylvania', name: 'Pennsylvania', esName: 'Pensilvania', country: 'united-states' },
  { slug: 'washington-state', name: 'Washington', esName: 'Washington', country: 'united-states' },
  // Others
  { slug: 'greater-budapest', name: 'Greater Budapest', esName: 'Gran Budapest', country: 'hungary' },
  { slug: 'central-bohemia', name: 'Central Bohemia', esName: 'Bohemia Central', country: 'czech-republic' },
  { slug: 'quintana-roo', name: 'Quintana Roo', esName: 'Quintana Roo', country: 'mexico' },
  { slug: 'cundinamarca', name: 'Cundinamarca', esName: 'Cundinamarca', country: 'colombia' },
  { slug: 'quebec', name: 'Quebec', esName: 'Quebec', country: 'canada' },
  { slug: 'british-columbia', name: 'British Columbia', esName: 'Columbia Británica', country: 'canada' },
  { slug: 'ontario', name: 'Ontario', esName: 'Ontario', country: 'canada' },
]

function genDesc(name, country, locale) {
  if (locale === 'es') {
    return richText([
      { text: `Transfers Privados en ${name}`, style: 'h2' },
      `Titan Transfers ofrece servicios de transfer privado en toda la región de ${name}. Conectamos aeropuertos, ciudades y destinos turísticos con un servicio profesional puerta a puerta a precios fijos. Conductores licenciados, vehículos modernos y cancelación gratuita hasta 24 horas antes del servicio.`,
    ])
  }
  return richText([
    { text: `Private Transfers in ${name}`, style: 'h2' },
    `Titan Transfers provides professional private transfer services across the ${name} region. We connect airports, cities, and tourist destinations with reliable door-to-door service at fixed prices. Licensed drivers, modern vehicles, and free cancellation up to 24 hours before your transfer.`,
  ])
}

async function migrate() {
  console.log('🗺️  Migrating regions...\n')

  const existing = await client.fetch('*[_type=="region"]{"slug": slug.current}')
  const existingSlugs = new Set(existing.map(r => r.slug))

  let created = 0, skipped = 0

  for (const r of REGIONS) {
    if (existingSlugs.has(r.slug)) {
      console.log(`  ⏭️  ${r.name} — exists`)
      skipped++
      continue
    }

    process.stdout.write(`  🗺️  ${r.name}...`)

    const doc = {
      _id: `region-${r.slug}`,
      _type: 'region',
      title: r.name,
      slug: { _type: 'slug', current: r.slug },
      country: { _type: 'reference', _ref: `country-${r.country}` },
      description: genDesc(r.name, r.country, 'en'),
      seoTitle: `Private Transfers in ${r.name} | Titan Transfers`,
      seoDescription: `Book private airport transfers across ${r.name}. Fixed prices, professional drivers, and free cancellation. Titan Transfers.`,
      translations: {
        es: {
          title: r.esName,
          slug: { _type: 'slug', current: r.slug },
          description: genDesc(r.esName, r.country, 'es'),
          seoTitle: `Transfers Privados en ${r.esName} | Titan Transfers`,
          seoDescription: `Reserva transfers privados en ${r.esName}. Precios fijos, conductores profesionales y cancelación gratuita. Titan Transfers.`,
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
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ Created: ${created} | ⏭️ Skipped: ${skipped}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

migrate().catch(console.error)
