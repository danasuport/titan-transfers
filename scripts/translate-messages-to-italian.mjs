/**
 * Translate the UI message catalog en.json → it.json via OpenAI.
 *
 * Preserves the full key structure, ICU placeholders ({name}, {count, plural, ...}),
 * and any HTML/markup tags. Only the human-readable text is translated.
 *
 * Usage:
 *   node scripts/translate-messages-to-italian.mjs [--force] [--model=gpt-4o-mini] [--batch=40]
 *
 * Reads OPENAI_API_KEY from .env.local. Writes src/messages/it.json.
 * Without --force, keys already present in an existing it.json are kept as-is
 * (so re-runs only fill in what's missing).
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'

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
const MODEL = args.model || 'gpt-4o-mini'
const FORCE = !!args.force
const BATCH = args.batch ? Number(args.batch) : 40

const SRC = 'src/messages/en.json'
const OUT = 'src/messages/it.json'

// ─── Flatten / unflatten nested JSON to dotted keys ──────────────────────────

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out)
    else out[key] = v
  }
  return out
}

function setDeep(obj, dottedKey, value) {
  const parts = dottedKey.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) cur[parts[i]] = {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
}

// ─── OpenAI batch translate ──────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a professional translator localizing the UI of a private-transfer booking website into Italian (it-IT).

You receive a JSON object mapping opaque keys to English UI strings. Return a JSON object with the SAME keys, where every value is the Italian translation.

CRITICAL RULES:
- Preserve EVERY placeholder exactly: {name}, {count}, {city}, ICU like {count, plural, one {# city} other {# cities}}, and HTML/markup tags like <b>, </b>, <link>. Translate only the surrounding human text, never the tokens inside { } or < >.
- Keep the brand name "Titan Transfers" unchanged.
- Use natural, concise, marketing-friendly Italian appropriate for buttons, labels, headings and short paragraphs.
- Do NOT add or remove keys. Do NOT translate the keys themselves.
- Return ONLY minified JSON, no markdown, no commentary.`

async function translateBatch(batchObj) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Translate these UI strings to Italian:\n${JSON.stringify(batchObj)}` },
      ],
      temperature: 0.3,
      max_tokens: 8000,
    }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 300)}`)
  }
  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content || ''
  return JSON.parse(raw)
}

// ─── Run ─────────────────────────────────────────────────────────────────────

async function run() {
  const en = JSON.parse(readFileSync(SRC, 'utf-8'))
  const flatEn = flatten(en)
  const existing = !FORCE && existsSync(OUT) ? flatten(JSON.parse(readFileSync(OUT, 'utf-8'))) : {}

  const keys = Object.keys(flatEn).filter(k => typeof flatEn[k] === 'string')
  const todo = keys.filter(k => FORCE || !(k in existing) || existing[k] === flatEn[k])
  console.log(`Total keys: ${keys.length} · to translate: ${todo.length} · model: ${MODEL}`)

  const result = {}
  // seed with existing translations we keep
  for (const k of keys) if (k in existing) setDeep(result, k, existing[k])
  // carry over any non-string values (arrays etc.) verbatim
  for (const [k, v] of Object.entries(flatEn)) if (typeof v !== 'string') setDeep(result, k, v)

  for (let i = 0; i < todo.length; i += BATCH) {
    const slice = todo.slice(i, i + BATCH)
    const batchObj = Object.fromEntries(slice.map(k => [k, flatEn[k]]))
    process.stdout.write(`  Batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(todo.length / BATCH)} (${slice.length})... `)
    try {
      const translated = await translateBatch(batchObj)
      let missing = 0
      for (const k of slice) {
        const val = translated[k]
        if (typeof val === 'string') setDeep(result, k, val)
        else { setDeep(result, k, flatEn[k]); missing++ }
      }
      console.log(missing ? `done (${missing} fell back to EN)` : 'done')
    } catch (e) {
      console.log('FAILED:', e.message)
      for (const k of slice) setDeep(result, k, flatEn[k]) // fall back to English on failure
    }
    await new Promise(r => setTimeout(r, 250))
  }

  writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n')
  console.log(`\nWrote ${OUT}`)
}

run().catch(e => { console.error(e); process.exit(1) })
