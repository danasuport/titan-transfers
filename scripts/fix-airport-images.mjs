/**
 * Quita la foto de los aeropuertos cuya imagen automática no representa el
 * lugar, dejándolos con la imagen de marca.
 *
 * La pasada automática acertó en 65 de 79, pero en catorce la mejor candidata
 * de Wikipedia no era la ciudad: una estación de metro para Buenos Aires, una
 * señal de calle para Valencia, un semáforo para Viena. Reintentar con el
 * nombre de la ciudad tampoco sirve — para "Vienna" devuelve Vienna, Virginia,
 * y para "Tokyo" un grabado de la era Edo — así que se retiran. La ficha usa
 * entonces la imagen corporativa, que es preferible a ilustrar Viena con una
 * calle de Estados Unidos.
 *
 *   node scripts/fix-airport-images.mjs            # simulación
 *   node scripts/fix-airport-images.mjs --apply
 */
import { readFileSync } from 'fs'
import { createClient } from '@sanity/client'
import { findPhoto, uploadToSanity } from './add-route-images-intl.mjs'

for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([^#=]+)=(.*)$/)
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim()
}
const APPLY = process.argv.includes('--apply')
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN_WRITE || process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// IATA → término de búsqueda (la ciudad, escrita como la indexa Wikipedia)
const FIX = {
  AEP: 'Buenos Aires', EZE: 'Buenos Aires', VLC: 'Valencia Spain', VIE: 'Vienna',
  SVQ: 'Seville', JED: 'Jeddah', NRT: 'Tokyo', HND: 'Tokyo', SID: 'Sal Cape Verde',
  MEX: 'Mexico City', SCL: 'Santiago Chile', YYZ: 'Toronto', PUY: 'Pula Croatia',
  YYC: 'Calgary',
}

let done = 0
for (const [iata, term] of Object.entries(FIX)) {
  const a = await client.fetch(`*[_type=="airport" && iataCode==$iata][0]{_id, title}`, { iata })
  if (!a) { console.log(`  ? ${iata}: no existe`); continue }
  if (!APPLY) { console.log(`  · ${iata} ${a.title}: se retiraría la foto (era: ${term})`); done++; continue }
  await client.patch(a._id).unset(['featuredImage']).commit()
  done++
  console.log(`  ✓ ${iata} ${a.title}: foto retirada`)
}
const skipped = 0
console.log(`\n${APPLY ? 'Aplicado' : 'Simulación'}: ${done} · sin foto: ${skipped}`)
