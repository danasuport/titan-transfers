/**
 * Reveal hidden routes — or hide visible ones — in controlled batches.
 *
 * publish-routes.mjs creates routes hidden: they exist and can be previewed but
 * stay out of the sitemap and out of Google. This is the second half: it flips
 * `hidden` off a batch at a time, so URLs reach Google at a rate you choose
 * rather than all at once. --hide does the reverse — the panic button if a batch
 * turns out wrong after it went live.
 *
 * By default it refuses to reveal a route that isn't finished (no image, no
 * content, or missing a translation) — exposing thin pages to Google is the
 * whole thing we're trying to avoid. --force overrides that.
 *
 * Order by demand from /admin/searches ("Las tenemos, pero faltan en la web"),
 * then reveal that airport or those exact routes here — this script can't see the
 * analytics DB (no public port), so it can't rank by demand itself.
 *
 * Usage:
 *   node scripts/reveal-routes.mjs --airport=VLC --limit=10           # dry run
 *   node scripts/reveal-routes.mjs --airport=VLC --limit=10 --apply
 *   node scripts/reveal-routes.mjs --route="BCN:Sitges" --apply
 *   node scripts/reveal-routes.mjs --airport=BCN --limit=50 --apply --force   # incl. incomplete
 *   node scripts/reveal-routes.mjs --route="BCN:Sitges" --hide --apply        # put it back
 *
 * Needs SANITY_API_TOKEN_WRITE (or SANITY_API_TOKEN with write access).
 */
import { readFileSync } from 'fs'
import { createClient } from '@sanity/client'
import { norm } from './lib/routes-sheet.mjs'
import { locales } from './lib/locales.mjs'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim()
}

const arg = (name, dflt = null) => {
  const hit = process.argv.find(a => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : dflt
}
const APPLY = process.argv.includes('--apply')
const HIDE = process.argv.includes('--hide')
const FORCE = process.argv.includes('--force')
const ONLY_AIRPORT = arg('airport')?.toUpperCase()
const ONLY_COUNTRY = arg('country')
const ONLY_ROUTES = process.argv.filter(a => a.startsWith('--route=')).map(a => norm(a.slice(8)))
const LIMIT = Number(arg('limit', '0')) || Infinity

if (!ONLY_AIRPORT && !ONLY_COUNTRY && !ONLY_ROUTES.length) {
  console.error('Indica qué revelar: --airport=XXX, --country=Nombre o --route="IATA:Ciudad". Sin filtro no hago nada (evita revelar las 1.000 de golpe).')
  process.exit(1)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN_WRITE || process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const trLang = locales.filter(l => l !== 'en')

/** What's still missing from a route, so we don't reveal a half-finished page. */
function gaps(r) {
  const g = []
  if (!r.hasImage) g.push('sin imagen')
  if (!r.nSections) g.push('sin contenido')
  const missing = trLang.filter(l => !r.langs?.[l])
  if (missing.length) g.push(`falta ${missing.join('/').toUpperCase()}`)
  return g
}

async function run() {
  // Target set: hidden routes to reveal, or visible routes to hide.
  const targetHidden = HIDE ? false : true
  const routes = await client.fetch(
    `*[_type == "route" && hidden == $targetHidden && defined(origin->iataCode) && defined(destination->title)]{
       _id, title, "slug": slug.current,
       "iata": origin->iataCode,
       "dest": destination->title,
       "country": country->title,
       "hasImage": defined(featuredImage.asset),
       "nSections": count(contentSections),
       "langs": { ${trLang.map(l => `"${l}": defined(translations.${l}.title)`).join(', ')} }
     } | order(iata asc, dest asc)`,
    { targetHidden }
  )

  const matched = routes.filter(r => {
    if (ONLY_AIRPORT && r.iata !== ONLY_AIRPORT) return false
    if (ONLY_COUNTRY && (r.country || '').toLowerCase() !== ONLY_COUNTRY.toLowerCase()) return false
    if (ONLY_ROUTES.length && !ONLY_ROUTES.includes(norm(`${r.iata}:${r.dest}`))) return false
    return true
  })

  const verb = HIDE ? 'ocultar' : 'revelar'
  const cond = HIDE ? 'ocultarían' : 'revelarían' // "Se ___" en dry run
  console.log(`Rutas ${HIDE ? 'visibles' : 'ocultas'} que casan con el filtro: ${matched.length}`)
  if (matched.length === 0) return

  // When revealing, hold back the unfinished ones unless --force.
  let batch = matched
  if (!HIDE && !FORCE) {
    const ready = [], notReady = []
    for (const r of matched) (gaps(r).length ? notReady : ready).push(r)
    if (notReady.length) {
      console.log(`\n⚠ ${notReady.length} incompletas — NO se revelan (usa --force para incluirlas):`)
      for (const r of notReady.slice(0, 15)) console.log(`   ${r.iata} → ${r.dest}: ${gaps(r).join(', ')}`)
      if (notReady.length > 15) console.log(`   … y ${notReady.length - 15} más`)
    }
    batch = ready
  }

  batch = batch.slice(0, LIMIT)
  if (batch.length === 0) {
    console.log(`\nNada que ${verb} tras aplicar los filtros.`)
    return
  }
  if (batch.length < matched.length) {
    console.log(`  (se ${cond} ${batch.length}; el resto queda para la próxima tanda)`)
  }

  console.log(`\n=== ${APPLY ? (HIDE ? 'Ocultando' : 'Revelando') : `Se ${cond}`} ${batch.length} rutas ===`)
  for (const r of batch) console.log(`  ${r.iata} → ${r.dest}`)

  if (!APPLY) {
    console.log(`\n(dry run — no se ha tocado nada. Repite con --apply.)`)
    return
  }

  let done = 0
  for (const r of batch) {
    // unset drops the field entirely; the queries treat missing as visible.
    if (HIDE) await client.patch(r._id).set({ hidden: true }).commit()
    else await client.patch(r._id).unset(['hidden']).commit()
    done++
  }
  console.log(`\n${done} rutas ${HIDE ? 'ocultadas' : 'reveladas'}.`)
  console.log(`El sitemap y los listados tardan hasta 1 h en reflejarlo (revalidate). Fuérzalo desde el webhook de Sanity si tienes prisa.`)
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1) })
