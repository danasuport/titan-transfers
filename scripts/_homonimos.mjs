// ¿Cuántos destinos de la hoja se llaman igual que una ciudad que ya existe
// en otro país? Cada uno es un Cartagena en potencia.
import { readFileSync } from 'fs'
import { createClient } from '@sanity/client'
import { fetchSheetRoutes, norm } from './lib/routes-sheet.mjs'
for (const line of readFileSync('.env.local','utf8').split('\n')) { const m=line.match(/^([^#=]+)=(.*)$/); if(m&&!process.env[m[1].trim()]) process.env[m[1].trim()]=m[2].trim() }
const c = createClient({projectId:process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,dataset:process.env.NEXT_PUBLIC_SANITY_DATASET,token:process.env.SANITY_API_TOKEN,apiVersion:'2024-01-01',useCdn:false})
const COUNTRY_MAP = JSON.parse(readFileSync('/dev/stdin','utf8'))
const cities = await c.fetch(`*[_type=="city"]{title,"slug":slug.current,"pais":country->slug.current}`)
const web = new Set((await c.fetch(`*[_type=="airport" && defined(iataCode)].iataCode`)).map(s=>s.toUpperCase()))
const byName = new Map()
for (const x of cities) if (!byName.has(norm(x.title))) byName.set(norm(x.title), x)
const sheet = await fetchSheetRoutes()
const vistos = new Set(), choques = []
for (const r of sheet) {
  if (web.has(r.iata)) continue                      // aeropuerto ya publicado
  const ciudad = byName.get(norm(r.resort))
  if (!ciudad || !ciudad.pais) continue
  const paisRuta = COUNTRY_MAP[r.country]
  if (!paisRuta || paisRuta === ciudad.pais) continue
  const k = `${r.resort}|${paisRuta}`
  if (vistos.has(k)) continue
  vistos.add(k)
  choques.push({ resort: r.resort, iata: r.iata, tiene: ciudad.pais, esperado: paisRuta })
}
console.log(`DESTINOS QUE CHOCARÍAN: ${choques.length}\n`)
for (const x of choques.slice(0, 30)) console.log(`  ${x.iata.padEnd(4)} → ${x.resort.padEnd(24)} ciudad existente en «${x.tiene}» · aeropuerto en «${x.esperado}»`)
if (choques.length > 30) console.log(`  … y ${choques.length - 30} más`)
