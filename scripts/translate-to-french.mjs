/**
 * Translate Sanity content to French via OpenAI Chat Completions.
 *
 * Mirrors translate-to-german.mjs: reads every document of the supported types,
 * builds a per-document JSON payload with the fields to translate (title, slug,
 * description, seoTitle, seoDescription, plus contentSections for routes), sends
 * it to the model, and writes the result into translations.fr on the same doc.
 *
 * French uses the Latin alphabet, so slugs are derived from the translated French
 * title with accents stripped (é→e, è→e, à→a, ç→c, œ→oe, æ→ae) for clean URLs.
 *
 * Usage:
 *   node scripts/translate-to-french.mjs \
 *     [--type=city,airport,...] [--limit=10] [--force] [--dry-run] [--model=gpt-4o-mini]
 *
 * Reads OPENAI_API_KEY from .env.local. Writes to Sanity (see scripts/lib/sanity-client.mjs).
 *
 * Skips documents that already have translations.fr.title (idempotent), unless
 * --force is passed. Will not overwrite an existing slug — slugs are stable for SEO.
 */

import { client } from './lib/sanity-client.mjs'
import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'

// ─── Config ──────────────────────────────────────────────────────────────────

function readEnv(key) {
  if (process.env[key]) return process.env[key]
  try {
    const env = readFileSync('.env.local', 'utf-8')
    const m = env.match(new RegExp(`^${key}=(.+)$`, 'm'))
    return m ? m[1].trim() : ''
  } catch { return '' }
}

const apiKey = readEnv('OPENAI_API_KEY')
if (!apiKey) {
  console.error('Missing OPENAI_API_KEY. Add it to .env.local or pass via env.')
  process.exit(1)
}

const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  })
)

const TYPES = (args.type || 'country,region,city,airport,port,trainStation,servicePage,route,blogPost,page').split(',')
const LIMIT = args.limit ? Number(args.limit) : Infinity
const IDS = args.ids ? String(args.ids).split(',').map(s => s.trim()).filter(Boolean) : null
const FORCE = !!args.force || !!IDS
const DRY_RUN = !!args['dry-run']
const MODEL = args.model || 'gpt-4o-mini'
let SHARD_I = 0, SHARD_N = 1
if (args.shard) {
  const [i, n] = String(args.shard).split('/').map(Number)
  if (Number.isInteger(i) && Number.isInteger(n) && n > 0 && i >= 0 && i < n) { SHARD_I = i; SHARD_N = n }
}

// ─── Type config ─────────────────────────────────────────────────────────────

const TYPE_FIELDS = {
  country:     ['title', 'description', 'seoTitle', 'seoDescription'],
  region:      ['title', 'description', 'seoTitle', 'seoDescription'],
  city:        ['title', 'description', 'seoTitle', 'seoDescription'],
  airport:     ['title', 'description', 'seoTitle', 'seoDescription'],
  port:        ['title', 'description', 'seoTitle', 'seoDescription'],
  trainStation:['title', 'description', 'seoTitle', 'seoDescription'],
  servicePage: ['title', 'description', 'seoTitle', 'seoDescription'],
  route:       ['title', 'description', 'seoTitle', 'seoDescription', 'contentSections'],
  blogPost:    ['title', 'content', 'excerpt', 'seoTitle', 'seoDescription'],
  page:        ['title', 'content', 'seoTitle', 'seoDescription'],
}

// ─── Slug helper ─────────────────────────────────────────────────────────────

function slugify(text) {
  return String(text)
    .toLowerCase()
    // French ligatures for clean SEO slugs (before accent stripping)
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // strip accents (é→e, è→e, à→a, ç→c, …)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Portable Text helpers ───────────────────────────────────────────────────

function flattenPortableText(blocks) {
  if (!Array.isArray(blocks)) return []
  return blocks.flatMap(b => {
    if (b._type !== 'block' || !b.children) return []
    const text = b.children.filter(c => c._type === 'span').map(c => c.text).join('')
    if (!text.trim()) return []
    const style = b.style || 'normal'
    const kind = (style === 'h1' || style === 'h2') ? 'h2'
               : (style === 'h3' || style === 'h4') ? 'h3'
               : (b.listItem) ? 'li'
               : 'p'
    return [{ kind, text }]
  })
}

function flattenedToPortableText(items) {
  if (!Array.isArray(items)) return []
  return items.map(item => {
    const style = item.kind === 'h2' ? 'h2'
                : item.kind === 'h3' ? 'h3'
                : 'normal'
    const listItem = item.kind === 'li' ? 'bullet' : undefined
    const block = {
      _type: 'block',
      _key: randomUUID().slice(0, 12),
      style,
      markDefs: [],
      children: [{ _type: 'span', _key: randomUUID().slice(0, 8), text: item.text, marks: [] }],
    }
    if (listItem) block.listItem = listItem
    return block
  })
}

// ─── Prompt builder ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a professional translator specializing in French for the travel and transportation industry, targeting travellers in France, Belgium, Switzerland and Canada.

RULES:
- Translate to natural, fluent, marketing-friendly standard French (français standard, fr-FR) — not literal/robotic translation.
- Use the formal address (vous) consistently.
- Use correct French accents and typography (é, è, ê, à, ç, ï, ô, û…) in the visible text. Do NOT strip them — only URL slugs are stripped, and that happens separately.
- Keep prices, distances, durations and ratings with Western numerals (0-9).
- Keep brand names ("Titan Transfers"), airport codes and airport names in their original form. For places, use the standard French exonym when one exists (e.g. London → Londres, Seville → Séville, Munich → Munich, Rome → Rome, Milan → Milan, Spain → Espagne, Greece → Grèce, Egypt → Égypte, Morocco → Maroc), otherwise keep the local name.
- Keep email addresses and URLs in their original form.
- Use the professional, trustworthy register typical of French travel websites.
- Preserve formatting hints (h2, h3, paragraph, list item).

OUTPUT FORMAT:
Return ONLY valid minified JSON. No markdown, no explanations, no leading text. The shape must match the input exactly. Do NOT include a "slug" field in your output — slugs are generated separately.`

function buildPrompt(doc) {
  const payload = {}
  const fields = TYPE_FIELDS[doc._type] || []

  for (const f of fields) {
    if (doc[f] === undefined || doc[f] === null) continue
    if (f === 'description' || f === 'content') {
      payload[f] = flattenPortableText(doc[f])
    } else if (f === 'contentSections') {
      payload[f] = (doc[f] || []).map(s => ({
        title: s.title || '',
        body: flattenPortableText(s.body),
      }))
    } else {
      payload[f] = doc[f]
    }
  }

  const docKind = ({
    country: 'country page',
    region: 'region page',
    city: 'city page',
    airport: 'airport page',
    port: 'cruise port page',
    trainStation: 'train station page',
    servicePage: 'service page',
    route: 'transfer route page',
    blogPost: 'blog post',
    page: 'static page',
  })[doc._type] || doc._type

  const secNote = Array.isArray(payload.contentSections) && payload.contentSections.length
    ? `\nThe "contentSections" array has EXACTLY ${payload.contentSections.length} items. Return the SAME number of items, in the SAME order — never merge, split, drop or add sections.`
    : ''

  return `Translate this ${docKind} from English to French.

Input JSON (English source):
${JSON.stringify(payload, null, 2)}

Return the translated JSON with the SAME shape. Every text field must be in French. Do not include a "slug" field.${secNote}`
}

function parseJSON(raw) {
  let s = raw.trim()
  if (s.startsWith('```')) s = s.replace(/^```(?:json)?\s*/, '').replace(/```\s*$/, '')
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object in response')
  return JSON.parse(s.slice(start, end + 1))
}

// ─── Translate one document ──────────────────────────────────────────────────

async function translateDoc(doc) {
  const existing = doc.translations?.fr
  if (existing?.title && !FORCE) {
    console.log(`  ✓ Already translated — skipping (use --force to overwrite)`)
    return null
  }

  const prompt = buildPrompt(doc)

  if (DRY_RUN) {
    console.log(`\n[DRY RUN] Prompt (first 500 chars):\n${prompt.slice(0, 500)}...\n`)
    return null
  }

  console.log(`  → Calling OpenAI (${MODEL})...`)
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: 8000,
      temperature: 0.4,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    console.error(`  ✗ OpenAI API error ${res.status}: ${errBody.slice(0, 300)}`)
    return null
  }

  const payload = await res.json()
  const raw = payload.choices?.[0]?.message?.content
  if (!raw) {
    console.error(`  ✗ No content in OpenAI response: ${JSON.stringify(payload).slice(0, 300)}`)
    return null
  }
  let translated
  try {
    translated = parseJSON(raw)
  } catch (e) {
    console.error(`  ✗ JSON parse failed: ${e.message}`)
    console.error(`  Raw response (first 500): ${raw.slice(0, 500)}`)
    return null
  }

  // Build the translations.fr object for Sanity. Don't overwrite an existing slug.
  const fr = {}
  if (translated.title) fr.title = translated.title
  const slugSource = translated.title || doc.title
  if (slugSource && !existing?.slug?.current) {
    const current = slugify(slugSource)
    if (current) fr.slug = { _type: 'slug', current }
  }
  if (translated.seoTitle) fr.seoTitle = translated.seoTitle
  if (translated.seoDescription) fr.seoDescription = translated.seoDescription
  if (translated.excerpt) fr.excerpt = translated.excerpt
  if (translated.description) fr.description = flattenedToPortableText(translated.description)
  if (translated.content) fr.content = flattenedToPortableText(translated.content)
  if (doc.contentSections && doc.contentSections.length) {
    const srcSecs = doc.contentSections
    const trSecs = Array.isArray(translated.contentSections) ? translated.contentSections : []
    fr.contentSections = srcSecs.map((src, i) => {
      const tr = trSecs[i] || {}
      const bodyItems = (Array.isArray(tr.body) && tr.body.length) ? tr.body : flattenPortableText(src.body)
      const section = {
        _key: randomUUID().slice(0, 12),
        title: tr.title || src.title || '',
        body: flattenedToPortableText(bodyItems),
        imagePosition: src.imagePosition || 'left',
      }
      if (src.imageAlt) section.imageAlt = src.imageAlt
      if (src.image) section.image = src.image
      return section
    })
  }

  return fr
}

// ─── Process one document ────────────────────────────────────────────────────

async function processDoc(doc) {
  const label = `[${doc._type}] ${doc.title || doc._id}`
  console.log(`\n${label}`)

  try {
    const fr = await translateDoc(doc)
    if (!fr) return

    if (DRY_RUN) {
      console.log(`  [DRY RUN] would patch translations.fr:`, Object.keys(fr))
      return
    }

    await client
      .patch(doc._id)
      .setIfMissing({ translations: {} })
      .set({ 'translations.fr': fr })
      .commit()

    console.log(`  ✓ Patched translations.fr (${Object.keys(fr).join(', ')})`)
  } catch (e) {
    console.error(`  ✗ Failed: ${e.message}`)
  }
}

// ─── Fetch & dispatch ────────────────────────────────────────────────────────

async function run() {
  console.log(`Translating types: ${TYPES.join(', ')}`)
  console.log(`Model: ${MODEL}`)
  if (LIMIT !== Infinity) console.log(`Limit per type: ${LIMIT}`)
  if (FORCE) console.log('Force: overwriting existing translations.fr')
  if (DRY_RUN) console.log('DRY RUN: no Sanity writes, no OpenAI calls')

  for (const type of TYPES) {
    if (!TYPE_FIELDS[type]) {
      console.warn(`Skipping unknown type: ${type}`)
      continue
    }

    const fields = TYPE_FIELDS[type].join(', ')
    const query = `*[_type == "${type}"] | order(title asc) [0...${LIMIT === Infinity ? 99999 : LIMIT}] {
      _id, _type, title, slug, ${fields},
      translations
    }`
    console.log(`\n━━━ ${type.toUpperCase()} ━━━`)
    let docs = await client.fetch(query)
    if (IDS) {
      docs = docs.filter(d => IDS.includes(d._id))
      console.log(`Filtered to ${docs.length} document(s) by --ids`)
    }
    if (SHARD_N > 1) {
      docs = docs.filter((_, idx) => idx % SHARD_N === SHARD_I)
      console.log(`Shard ${SHARD_I + 1}/${SHARD_N}: ${docs.length} of this type`)
    }
    console.log(`Found ${docs.length} ${type} document(s)`)

    for (const doc of docs) {
      await processDoc(doc)
      if (!DRY_RUN) await new Promise(r => setTimeout(r, 300))
    }
  }

  console.log('\nDone.')
}

run().catch(e => { console.error(e); process.exit(1) })
