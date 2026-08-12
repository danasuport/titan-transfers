// Impacto global del cambio de metas: cuántas páginas salen del truncado.
import { createClient } from '@sanity/client'
// Ruta en variable: tsc no admite importar ".ts" explícito, y tsx lo necesita.
const SEO_MODULE = '../src/lib/seo/generateMetadata.ts'
const { shortenTitle, clampDescription } = await import(SEO_MODULE)

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const SITE_NAME = 'Titan Transfers'
const brand = (t: string) => (t.includes(SITE_NAME) ? t : `${t} | ${SITE_NAME}`)

// Plantillas EN anteriores, para medir los docs que no tienen seoTitle propio.
const OLD_FALLBACK: Record<string, (d: any) => string> = {
  airport: (d) => `${d.title} Airport Transfers — Private Taxi Fixed Price | ${SITE_NAME}`,
  route: (d) => `Private Transfer from ${d.origin?.title || ''} to ${d.destination?.title || ''} | Fixed Price Taxi | ${SITE_NAME}`,
  city: (d) => `Private Transfers in ${d.title} | Airport, Port & City Transfers | ${SITE_NAME}`,
  country: (d) => `Private Transfers in ${d.title} | Airport & City Taxi | ${SITE_NAME}`,
  region: (d) => `Private Transfers in ${d.title} | Airport & Resort Taxi | ${SITE_NAME}`,
  blogPost: (d) => `${d.title} | ${SITE_NAME} Blog`,
}
const OLD_DESC_FALLBACK = 130 // las descripciones de fallback rondaban 120-140: nunca truncaban

let totalTitlesFixed = 0
let totalDescsFixed = 0
let totalPages = 0

console.log('tipo        docs   títulos>60 antes → después   descs>155 antes → después')
console.log('─'.repeat(78))

for (const type of ['route', 'airport', 'city', 'country', 'region', 'blogPost']) {
  const docs = await client.fetch(
    `*[_type == "${type}" && hidden != true]{title, seoTitle, seoDescription${
      type === 'route' ? ', "origin": origin->{title}, "destination": destination->{title}' : ''
    }}`
  )
  let tBefore = 0, tAfter = 0, dBefore = 0, dAfter = 0
  for (const d of docs) {
    const before = brand(d.seoTitle || OLD_FALLBACK[type](d))
    const after = shortenTitle(before)
    if (before.length > 60) tBefore++
    if (after.length > 60) tAfter++

    const descBefore = d.seoDescription || 'x'.repeat(OLD_DESC_FALLBACK)
    if (descBefore.length > 155) dBefore++
    if (clampDescription(descBefore).length > 155) dAfter++
  }
  totalTitlesFixed += tBefore - tAfter
  totalDescsFixed += dBefore - dAfter
  totalPages += docs.length
  console.log(
    `${type.padEnd(10)} ${String(docs.length).padStart(5)}   ` +
    `${String(tBefore).padStart(9)} → ${String(tAfter).padEnd(9)}    ` +
    `${String(dBefore).padStart(8)} → ${String(dAfter)}`
  )
}

console.log('─'.repeat(78))
console.log(`\n${totalPages} páginas por idioma (×6 idiomas = ${totalPages * 6} URLs).`)
console.log(`Títulos que dejan de truncarse:      ${totalTitlesFixed} (${totalTitlesFixed * 6} URLs)`)
console.log(`Descripciones que dejan de cortarse: ${totalDescsFixed} (${totalDescsFixed * 6} URLs)`)
