/**
 * Translate Sanity content to German via OpenAI Chat Completions.
 *
 * Mirrors translate-to-italian.mjs: reads every document of the supported types,
 * builds a per-document JSON payload with the fields to translate (title, slug,
 * description, seoTitle, seoDescription, plus contentSections for routes), sends
 * it to the model, and writes the result into translations.de on the same doc.
 *
 * German uses the Latin alphabet, so slugs are derived from the translated German
 * title. Umlauts are transliterated for SEO-friendly URLs (ä→ae, ö→oe, ü→ue, ß→ss)
 * BEFORE stripping any remaining accents.
 *
 * Usage:
 *   node scripts/translate-to-german.mjs \
 *     [--type=city,airport,...] [--limit=10] [--force] [--dry-run] [--model=gpt-4o-mini]
 *
 * Reads OPENAI_API_KEY from .env.local. Writes to Sanity project 6iu2za90
 * (see scripts/lib/sanity-client.mjs).
 *
 * Skips documents that already have translations.de.title (idempotent), unless
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
const FORCE = !!args.force
const DRY_RUN = !!args['dry-run']
const MODEL = args.model || 'gpt-4o-mini'
// Optional sharding for parallel runs: --shard=INDEX/TOTAL (0-based index).
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
    // German transliteration for SEO slugs (must run before accent stripping)
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // strip any remaining accents
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

const SYSTEM_PROMPT = `You are a professional translator specializing in German for the travel and transportation industry, targeting travellers in Germany, Austria and Switzerland.

RULES:
- Translate to natural, fluent, marketing-friendly standard German (Hochdeutsch, de-DE) — not literal/robotic translation.
- Use the formal address (Sie) consistently.
- Use standard German umlauts (ä, ö, ü, ß) in the visible text. Do NOT transliterate them in titles or body — only URL slugs are transliterated, and that happens separately.
- Keep prices, distances, durations and ratings with Western numerals (0-9).
- Keep brand names ("Titan Transfers"), airport codes and airport names in their original form. For places, use the standard German exonym when one exists (e.g. Milan → Mailand, Rome → Rom, Spain → Spanien, Munich → München, Nice → Nizza), otherwise keep the local name.
- Keep email addresses and URLs in their original form.
- Use the professional, trustworthy register typical of German travel websites.
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

  return `Translate this ${docKind} from English to German.

Input JSON (English source):
${JSON.stringify(payload, null, 2)}

Return the translated JSON with the SAME shape. Every text field must be in German. Do not include a "slug" field.`
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
  const existing = doc.translations?.de
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

  // Build the translations.de object for Sanity. Don't overwrite an existing slug.
  const de = {}
  if (translated.title) de.title = translated.title
  // German slug derived from the translated title (umlauts transliterated).
  const slugSource = translated.title || doc.title
  if (slugSource && !existing?.slug?.current) {
    const current = slugify(slugSource)
    if (current) de.slug = { _type: 'slug', current }
  }
  if (translated.seoTitle) de.seoTitle = translated.seoTitle
  if (translated.seoDescription) de.seoDescription = translated.seoDescription
  if (translated.excerpt) de.excerpt = translated.excerpt
  if (translated.description) de.description = flattenedToPortableText(translated.description)
  if (translated.content) de.content = flattenedToPortableText(translated.content)
  if (translated.contentSections) {
    de.contentSections = translated.contentSections.map(s => ({
      _key: randomUUID().slice(0, 12),
      title: s.title || '',
      body: flattenedToPortableText(s.body),
      imagePosition: 'left',
    }))
  }

  return de
}

// ─── Process one document ────────────────────────────────────────────────────

async function processDoc(doc) {
  const label = `[${doc._type}] ${doc.title || doc._id}`
  console.log(`\n${label}`)

  try {
    const de = await translateDoc(doc)
    if (!de) return

    if (DRY_RUN) {
      console.log(`  [DRY RUN] would patch translations.de:`, Object.keys(de))
      return
    }

    await client
      .patch(doc._id)
      .setIfMissing({ translations: {} })
      .set({ 'translations.de': de })
      .commit()

    console.log(`  ✓ Patched translations.de (${Object.keys(de).join(', ')})`)
  } catch (e) {
    console.error(`  ✗ Failed: ${e.message}`)
  }
}

// ─── Fetch & dispatch ────────────────────────────────────────────────────────

async function run() {
  console.log(`Translating types: ${TYPES.join(', ')}`)
  console.log(`Model: ${MODEL}`)
  if (LIMIT !== Infinity) console.log(`Limit per type: ${LIMIT}`)
  if (FORCE) console.log('Force: overwriting existing translations.de')
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
