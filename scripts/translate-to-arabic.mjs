/**
 * Translate Sanity content to Arabic (MSA) via OpenAI Chat Completions.
 *
 * Reads every document of the supported types, builds a per-document JSON
 * payload with the fields to translate (title, slug, description, seoTitle,
 * seoDescription, plus contentSections for routes), sends it to GPT-4o, and
 * writes the result into translations.ar on the same doc.
 *
 * Slugs are transliterated (Latin chars), per the decision in
 * memory/project_arabic_i18n.md. Body text uses Modern Standard Arabic with
 * Western numerals for prices.
 *
 * Usage:
 *   node scripts/translate-to-arabic.mjs \
 *     [--type=city,airport,...] [--limit=10] [--force] [--dry-run] [--model=gpt-4o-mini]
 *
 * Reads OPENAI_API_KEY from .env.local.
 *
 * Skips documents that already have translations.ar.title (idempotent), unless
 * --force is passed. Will not overwrite an existing slug — slugs are stable
 * for SEO.
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
const MODEL = args.model || 'gpt-4o'

// ─── Type config ─────────────────────────────────────────────────────────────

// What fields each type exposes to be translated. Routes also have
// contentSections (array of { title, body }).
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

// ─── Portable Text helpers ───────────────────────────────────────────────────

// Flatten PortableText to an array of { kind: 'h2'|'h3'|'p'|'li', text }
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

const SYSTEM_PROMPT = `You are a professional translator specializing in Modern Standard Arabic (Fusha) for the travel and transportation industry, targeting users in the Gulf region (UAE, Saudi Arabia, Qatar, Kuwait).

RULES:
- Translate to Modern Standard Arabic (MSA / الفصحى).
- Use Western numerals (0-9), NOT Eastern Arabic numerals (٠-٩), for prices, distances, durations, ratings.
- Use Eastern Arabic numerals only for ordinals or stylistic numbers (e.g. "أكثر من ١٠٠ مدينة").
- Keep brand names ("Titan Transfers"), airport names, city names in their original form when the brand is widely known. For places, use the standard Arabic name if there is one (e.g. London → لندن, Paris → باريس, Spain → إسبانيا, Madrid → مدريد).
- Use natural, marketing-friendly tone — not literal/robotic translation.
- Keep email addresses and URLs in their original form.
- Preserve formatting hints (h2, h3, paragraph, list item).

SLUGS:
- Slugs must be transliterated (Latin chars only, lowercase, hyphens).
- Use the Buckwalter-style or common English transliteration (e.g. "private-transfers" → "nakl-khass", "Madrid" → "madrid", not Arabic chars).
- Slugs should be short, SEO-friendly, and unambiguous.

OUTPUT FORMAT:
Return ONLY valid minified JSON. No markdown, no explanations, no leading text. The shape must match the input exactly.`

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

  // Always translate the slug (transliterated). If the doc has a slug, ask for it.
  if (doc.slug?.current) payload.slug = doc.slug.current

  // Hint to the model what kind of doc this is, for better domain context.
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

  return `Translate this ${docKind} from English to Modern Standard Arabic.

Input JSON (English source):
${JSON.stringify(payload, null, 2)}

Return the translated JSON with the SAME shape. The "slug" field must be a transliterated SEO-friendly slug (Latin chars, lowercase, hyphens, no Arabic chars). Every other text field must be in Arabic.`
}

function parseJSON(raw) {
  // Strip markdown fences if present.
  let s = raw.trim()
  if (s.startsWith('```')) s = s.replace(/^```(?:json)?\s*/, '').replace(/```\s*$/, '')
  // Cut to the outermost JSON object.
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object in response')
  return JSON.parse(s.slice(start, end + 1))
}

// ─── Translate one document ──────────────────────────────────────────────────

async function translateDoc(doc) {
  const existing = doc.translations?.ar
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

  // Build the translations.ar object for Sanity. Don't overwrite an existing slug.
  const ar = {}
  if (translated.title) ar.title = translated.title
  if (translated.slug && !existing?.slug?.current) {
    ar.slug = { _type: 'slug', current: String(translated.slug).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') }
  }
  if (translated.seoTitle) ar.seoTitle = translated.seoTitle
  if (translated.seoDescription) ar.seoDescription = translated.seoDescription
  if (translated.excerpt) ar.excerpt = translated.excerpt
  if (translated.description) ar.description = flattenedToPortableText(translated.description)
  if (translated.content) ar.content = flattenedToPortableText(translated.content)
  if (translated.contentSections) {
    ar.contentSections = translated.contentSections.map(s => ({
      _key: randomUUID().slice(0, 12),
      title: s.title || '',
      body: flattenedToPortableText(s.body),
      imagePosition: 'left',
    }))
  }

  return ar
}

// ─── Process one document ────────────────────────────────────────────────────

async function processDoc(doc) {
  const label = `[${doc._type}] ${doc.title || doc._id}`
  console.log(`\n${label}`)

  try {
    const ar = await translateDoc(doc)
    if (!ar) return

    if (DRY_RUN) {
      console.log(`  [DRY RUN] would patch translations.ar:`, Object.keys(ar))
      return
    }

    await client
      .patch(doc._id)
      .setIfMissing({ translations: {} })
      .set({ 'translations.ar': ar })
      .commit()

    console.log(`  ✓ Patched translations.ar (${Object.keys(ar).join(', ')})`)
  } catch (e) {
    console.error(`  ✗ Failed: ${e.message}`)
  }
}

// ─── Fetch & dispatch ────────────────────────────────────────────────────────

async function run() {
  console.log(`Translating types: ${TYPES.join(', ')}`)
  if (LIMIT !== Infinity) console.log(`Limit per type: ${LIMIT}`)
  if (FORCE) console.log('Force: overwriting existing translations.ar')
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
    const docs = await client.fetch(query)
    console.log(`Found ${docs.length} ${type} document(s)`)

    for (const doc of docs) {
      await processDoc(doc)
      // Gentle pacing to stay well under any rate cap.
      if (!DRY_RUN) await new Promise(r => setTimeout(r, 500))
    }
  }

  console.log('\nDone.')
}

run().catch(e => { console.error(e); process.exit(1) })
