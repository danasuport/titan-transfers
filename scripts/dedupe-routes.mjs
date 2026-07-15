/**
 * Merge and remove duplicate routes — two route docs pointing at the same
 * airport AND the same destination city.
 *
 * How they got there: create-missing-routes.mjs deduped by comparing the CSV's
 * resort text against the city's title in Sanity, while it looked the city up by
 * *slug*. Slugify strips accents, the title comparison doesn't — so "Mataro" in
 * the sheet found city-mataro, failed to match the existing "BCN|Mataró" route,
 * and created a second route onto the same city. 43 of them.
 *
 * Which one survives: the one the WordPress legacy redirects already point at,
 * because that's where inbound traffic lands. Only if neither (or both) is
 * targeted does completeness decide. The loser's URLs get a 301 to the winner,
 * written to scripts/duplicate-route-redirects.json for next.config to serve.
 *
 * Before deleting, anything the winner lacks and the loser has is copied over —
 * in 4 groups the redirect-targeted winner has no contentSections at all.
 *
 * Usage:
 *   node scripts/dedupe-routes.mjs              # dry run, writes nothing
 *   node scripts/dedupe-routes.mjs --apply      # merge, delete, write redirects
 */
import { readFileSync, writeFileSync } from 'fs'
import { client } from './lib/sanity-client.mjs'
import { locales, pathTranslations } from './lib/locales.mjs'

const APPLY = process.argv.includes('--apply')
const REDIRECTS_FILE = 'scripts/duplicate-route-redirects.json'
const LEGACY_FILE = 'scripts/legacy-redirects.json'
const BACKUP_FILE = 'scripts/dedupe-routes-deleted.json'

const legacy = JSON.parse(readFileSync(LEGACY_FILE, 'utf8'))
const legacyTargets = new Set(
  legacy.map(r => r.destination.replace(/\/+$/, '').split('/').pop()).filter(Boolean)
)

/** image + sections + translated languages: a coarse "how finished is this doc". */
function score(r) {
  return (r.hasImage ? 1 : 0) + (r.nSections || 0) + locales.filter(l => l !== 'en' && r.langs?.[l]).length
}

/** The public URL of a route in one locale, or null if it has no slug there. */
function routeUrl(route, locale) {
  const slug = locale === 'en' ? route.slug : route.slugs?.[locale]
  const airport = locale === 'en' ? route.airportSlug : route.airportSlugs?.[locale]
  if (!slug || !airport) return null
  const seg = pathTranslations.airport[locale]
  const prefix = locale === 'en' ? '' : `/${locale}`
  return `${prefix}/${seg}/${airport}/${slug}/`
}

const trField = f => locales.filter(l => l !== 'en').map(l => `"${l}": translations.${l}.${f}`).join(', ')

/** Deep copy of `doc` with every reference to `fromId` pointing at `toId`. */
function repoint(doc, fromId, toId) {
  if (Array.isArray(doc)) return doc.map(v => repoint(v, fromId, toId))
  if (!doc || typeof doc !== 'object') return doc
  const out = {}
  for (const [k, v] of Object.entries(doc)) {
    out[k] = k === '_ref' && v === fromId ? toId : repoint(v, fromId, toId)
  }
  return out
}

function referencesId(doc, id) {
  if (Array.isArray(doc)) return doc.some(v => referencesId(v, id))
  if (!doc || typeof doc !== 'object') return false
  if (doc._ref === id) return true
  return Object.values(doc).some(v => referencesId(v, id))
}

async function run() {
  const routes = await client.fetch(
    `*[_type == "route" && defined(origin->_id) && defined(destination->_id)]{
       _id, _createdAt, title,
       "slug": slug.current,
       "slugs": { ${trField('slug.current')} },
       "langs": { ${trField('title')} },
       "originId": origin->_id,
       "destId": destination->_id,
       "iata": origin->iataCode,
       "dest": destination->title,
       "airportSlug": origin->slug.current,
       "airportSlugs": { ${locales.filter(l => l !== 'en').map(l => `"${l}": origin->translations.${l}.slug.current`).join(', ')} },
       "hasImage": defined(featuredImage.asset),
       "nSections": count(contentSections),
       "sections": contentSections,
       "trSections": { ${trField('contentSections')} },
       "featuredImage": featuredImage,
       "refs": count(*[references(^._id)])
     }`
  )

  // Group on document ids, not on text. The text comparison is what created
  // these in the first place.
  const groups = {}
  for (const r of routes) (groups[`${r.originId}|${r.destId}`] ||= []).push(r)
  const dups = Object.values(groups).filter(g => g.length > 1)

  console.log(`Rutas: ${routes.length} · grupos duplicados: ${dups.length} · docs a borrar: ${dups.reduce((a, g) => a + g.length - 1, 0)}\n`)
  if (dups.length === 0) return

  const redirects = []
  const relinked = []
  const plan = []

  for (const group of dups) {
    const targeted = group.filter(r => legacyTargets.has(r.slug))
    // Inbound WP traffic outranks completeness: a redirect that starts 404ing is
    // worse than a page that's missing a section, and the section can be copied.
    const keep =
      targeted.length === 1
        ? targeted[0]
        : [...(targeted.length ? targeted : group)].sort((a, b) => score(b) - score(a) || a._createdAt.localeCompare(b._createdAt))[0]
    const drop = group.filter(r => r._id !== keep._id)

    const patch = {}
    for (const d of drop) {
      if (!keep.nSections && d.nSections) patch.contentSections = d.sections
      if (!keep.hasImage && d.featuredImage) patch.featuredImage = d.featuredImage
      for (const l of locales.filter(x => x !== 'en')) {
        if (!keep.trSections?.[l]?.length && d.trSections?.[l]?.length) {
          patch[`translations.${l}.contentSections`] = d.trSections[l]
        }
      }
    }

    for (const d of drop) {
      for (const l of locales) {
        const from = routeUrl(d, l)
        const to = routeUrl(keep, l)
        if (!from || !to || from === to) continue
        // Only redirect where the winner has a URL in that locale too. Sending
        // /it/… to an English page would be worse than the 404.
        redirects.push({ source: from, destination: to, permanent: true })

        // When both siblings were legacy targets, the losing one still has WP
        // redirects aimed at it. Left alone they'd chain (WP → dead → winner);
        // repoint them so it stays a single hop.
        for (const entry of legacy) {
          if (entry.destination === from) {
            relinked.push({ source: entry.source, was: from, now: to })
            entry.destination = to
          }
        }
      }
    }

    plan.push({ keep, drop, patch })
  }

  const merges = plan.filter(p => Object.keys(p.patch).length)
  console.log(`Redirects a generar: ${redirects.length}`)
  if (relinked.length) {
    console.log(`Redirects heredados de WP que apuntaban al borrado y se reapuntan (evita cadena de 2 saltos): ${relinked.length}`)
    for (const r of relinked) console.log(`   ${r.source}\n     → ${r.now}`)
  }
  console.log(`Grupos que necesitan copiar contenido al superviviente: ${merges.length}`)
  for (const m of merges) {
    console.log(`  ${m.keep.iata} → ${m.keep.dest}: copio [${Object.keys(m.patch).join(', ')}]`)
  }

  // A referenced duplicate can't just be deleted — Sanity refuses, and the
  // referrer (the airport's routes[] list, a blog post's relatedRoutes) would
  // lose its link. Point those at the survivor first; it's the same route.
  const referenced = plan.flatMap(p => p.drop.map(d => ({ d, keep: p.keep }))).filter(x => x.d.refs > 0)
  if (referenced.length) {
    console.log(`\n${referenced.length} duplicado(s) con referencias entrantes — se reapuntarán al superviviente:`)
    for (const { d, keep } of referenced) {
      const referrers = await client.fetch(`*[references($id)]{_id, _type, title}`, { id: d._id })
      for (const r of referrers) {
        const already = referencesId(await client.fetch(`*[_id==$id][0]`, { id: r._id }), keep._id)
        console.log(`   ${r._type} ${r._id} : ${d.slug} → ${keep.slug}${already ? '  ⚠ ya referencia al superviviente (quedaría duplicado)' : ''}`)
      }
    }
  }

  console.log(`\n=== Muestra del plan ===`)
  for (const { keep, drop } of plan.slice(0, 5)) {
    console.log(`\n▸ ${keep.iata} → ${keep.dest}`)
    console.log(`   CONSERVO ${keep.slug}  (${legacyTargets.has(keep.slug) ? 'destino de un redirect WP' : `sin redirect WP, más completo: ${score(keep)}`})`)
    for (const d of drop) console.log(`   BORRO    ${d.slug}`)
  }

  if (!APPLY) {
    console.log(`\n(dry run — no se ha tocado nada. Repite con --apply para ejecutarlo.)`)
    return
  }

  // Deleting from Sanity is irreversible and this is the production dataset, so
  // dump the full docs first. Restoring is `client.createOrReplace(doc)` per entry.
  const doomed = await client.fetch(`*[_id in $ids]`, { ids: plan.flatMap(p => p.drop.map(d => d._id)) })
  writeFileSync(BACKUP_FILE, JSON.stringify(doomed, null, 2) + '\n')
  console.log(`\nRespaldo de los ${doomed.length} documentos a borrar → ${BACKUP_FILE}`)

  console.log(`\n=== Aplicando ===`)
  let merged = 0, deleted = 0, repointed = 0
  for (const { keep, drop, patch } of plan) {
    if (Object.keys(patch).length) {
      await client.patch(keep._id).set(patch).commit()
      merged++
      console.log(`  ⇢ ${keep.slug}: contenido copiado`)
    }
    for (const d of drop) {
      if (d.refs > 0) {
        const referrers = await client.fetch(`*[references($id)]`, { id: d._id })
        for (const r of referrers) {
          await client.createOrReplace(repoint(r, d._id, keep._id))
          repointed++
          console.log(`  ⇢ ${r._type} ${r._id}: referencia reapuntada`)
        }
      }
      await client.delete(d._id)
      deleted++
      console.log(`  ✗ borrado ${d.slug}`)
    }
  }

  writeFileSync(REDIRECTS_FILE, JSON.stringify(redirects, null, 2) + '\n')
  if (relinked.length) writeFileSync(LEGACY_FILE, JSON.stringify(legacy, null, 2) + '\n')
  console.log(`\n${merged} merge(s) · ${repointed} referencia(s) reapuntada(s) · ${deleted} borrado(s) · ${redirects.length} redirects → ${REDIRECTS_FILE}`)
  console.log('Recuerda desplegar: los redirects sólo existen tras rebuild de next.config.')
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1) })
