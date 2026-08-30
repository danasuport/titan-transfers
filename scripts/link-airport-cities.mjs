/**
 * Links each airport to its city document.
 *
 * 117 of 241 airports had no `city` reference, including every one created by
 * publish-routes.mjs, which never set it. It matters beyond tidiness: the
 * megamenu ranks a city higher when we fly into it, so Salzburg and Pisa were
 * being treated as ordinary drop-off points and pushed out of the menu by
 * alphabetical noise.
 *
 * Matches on the slug, which both documents derive from the same place name
 * ("salzburg" ↔ "salzburg"). Anything that doesn't match exactly is left alone
 * and reported — guessing from the airport's title would happily link
 * "Paris Beauvais-Tillé Airport" to the wrong town.
 *
 *   node scripts/link-airport-cities.mjs          # dry run
 *   node scripts/link-airport-cities.mjs --apply
 */
import { readFileSync } from 'fs'
import { createClient } from '@sanity/client'
for (const line of readFileSync('.env.local','utf8').split('\n')) { const m=line.match(/^([^#=]+)=(.*)$/); if(m&&!process.env[m[1].trim()]) process.env[m[1].trim()]=m[2].trim() }
const APPLY = process.argv.includes('--apply')
const c = createClient({projectId:process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,dataset:process.env.NEXT_PUBLIC_SANITY_DATASET,token:process.env.SANITY_API_TOKEN_WRITE||process.env.SANITY_API_TOKEN,apiVersion:'2024-01-01',useCdn:false})

const airports = await c.fetch(`*[_type=="airport" && !defined(city)]{_id, title, "iata":iataCode, "slug":slug.current, "pais":country->slug.current}`)
const cities = await c.fetch(`*[_type=="city"]{_id, title, "slug":slug.current, "pais":country->slug.current}`)
// La hoja del cliente arrastra sufijos ("Bilbao ciudad", "Basel City Centre")
// que el slug hereda. Quitarlos deja el nombre del sitio, que es lo que hay
// que comparar; sigue siendo una coincidencia exacta, no un parecido.
const limpia = s => String(s||'').replace(/-(ciudad|city-cent(er|re)|centro-ciudad|downtown)$/,'')
const bySlug = new Map()
for (const x of cities) {
  for (const k of [`${x.pais}|${x.slug}`, `${x.pais}|${limpia(x.slug)}`]) if (!bySlug.has(k)) bySlug.set(k, x)
}
const sinPais = new Map()
for (const x of cities) if (!sinPais.has(x.slug)) sinPais.set(x.slug, x)

let ok = 0, no = []
for (const a of airports) {
  // Mismo país primero; si el aeropuerto no tiene país, cae al slug a secas.
  const city = bySlug.get(`${a.pais}|${a.slug}`) || (a.pais ? null : sinPais.get(a.slug))
  if (!city) { no.push(a); continue }
  ok++
  console.log(`  ${a.iata}  ${a.title}  →  ${city.title}`)
  if (APPLY) await c.patch(a._id).set({ city: { _type: 'reference', _ref: city._id } }).commit()
}
console.log(`\nenlazados ${ok} de ${airports.length}${APPLY ? '' : '  (dry run, pasa --apply)'}`)
console.log(`sin pareja: ${no.length} → ${no.slice(0,20).map(a=>a.iata).join(' ')}`)
