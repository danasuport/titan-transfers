/**
 * Add Italian ('it') variants to inline pick(locale, { en, es, ar }) calls.
 *
 * SAFETY-FIRST: only touches pick() calls whose values are ALL simple string
 * literals ('...', "...", or `...`). Any pick whose values include arrays,
 * objects, JSX or nested calls is left untouched (it falls back to English,
 * which is safe). Existing en/es/ar entries are never modified — we only insert
 * a new `it` entry, translated from the Spanish (es) source.
 *
 * Usage:
 *   node scripts/translate-pick-inline.mjs            # dry-run: report only
 *   node scripts/translate-pick-inline.mjs --apply    # write changes
 *   [--model=gpt-4o-mini]
 *
 * Reads OPENAI_API_KEY from .env.local.
 */

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

function readEnv(key) {
  if (process.env[key]) return process.env[key]
  try {
    const env = readFileSync('.env.local', 'utf-8')
    const m = env.match(new RegExp(`^${key}=(.+)$`, 'm'))
    return m ? m[1].trim() : ''
  } catch { return '' }
}

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true] }))
const APPLY = !!args.apply
const MODEL = args.model || 'gpt-4o-mini'
const apiKey = readEnv('OPENAI_API_KEY')
if (APPLY && !apiKey) { console.error('Missing OPENAI_API_KEY'); process.exit(1) }

// ─── Find files ──────────────────────────────────────────────────────────────

const files = execSync('grep -rl "pick(locale" src/app src/components --include="*.tsx"', { encoding: 'utf-8' })
  .trim().split('\n').filter(Boolean)

// ─── Tiny scanner: find matching close of a {...} starting at idx, string-aware
function matchBrace(src, openIdx) {
  let depth = 0, i = openIdx, str = null
  for (; i < src.length; i++) {
    const c = src[i], p = src[i - 1]
    if (str) {
      if (c === str && p !== '\\') str = null
      continue
    }
    if (c === "'" || c === '"' || c === '`') { str = c; continue }
    if (c === '{') depth++
    else if (c === '}') { depth--; if (depth === 0) return i }
  }
  return -1
}

// Read a single string literal starting at idx (src[idx] is a quote). Returns
// { raw, inner, quote, end } or null. Backtick allowed (kept verbatim).
function readString(src, idx) {
  const quote = src[idx]
  if (quote !== "'" && quote !== '"' && quote !== '`') return null
  let i = idx + 1
  for (; i < src.length; i++) {
    const c = src[i], p = src[i - 1]
    if (c === quote && p !== '\\') {
      return { raw: src.slice(idx, i + 1), inner: src.slice(idx + 1, i), quote, end: i }
    }
  }
  return null
}

// Parse top-level entries of an object literal source `{...}`. Returns array of
// { key, valRaw, valIsString, valInner, valQuote } or null if not parseable
// as a flat key:value object.
function parseObject(objSrc) {
  // objSrc includes the braces
  const inner = objSrc.slice(1, -1)
  const entries = []
  let i = 0
  const n = inner.length
  const ws = () => { while (i < n && /\s/.test(inner[i])) i++ }
  while (true) {
    ws()
    if (i >= n) break
    if (inner[i] === ',') { i++; continue }
    // key
    const km = /^([A-Za-z_$][\w$]*)\s*:/.exec(inner.slice(i))
    if (!km) return null // not a simple key (could be spread, computed, etc.)
    const key = km[1]
    i += km[0].length
    ws()
    // value
    const c = inner[i]
    if (c === "'" || c === '"' || c === '`') {
      const s = readString(inner, i)
      if (!s) return null
      entries.push({ key, valRaw: s.raw, valIsString: true, valInner: s.inner, valQuote: s.quote })
      i = s.end + 1
    } else {
      // non-string value: capture raw up to the matching top-level comma/end,
      // but mark as non-string so the whole pick is disqualified.
      let depth = 0, str = null, start = i
      for (; i < n; i++) {
        const ch = inner[i], pr = inner[i - 1]
        if (str) { if (ch === str && pr !== '\\') str = null; continue }
        if (ch === "'" || ch === '"' || ch === '`') { str = ch; continue }
        if ('{[('.includes(ch)) depth++
        else if ('}])'.includes(ch)) depth--
        else if (ch === ',' && depth === 0) break
      }
      entries.push({ key, valRaw: inner.slice(start, i).trim(), valIsString: false })
    }
  }
  return entries
}

// ─── Collect eligible picks ──────────────────────────────────────────────────

const jobs = [] // { file, objStart, objEnd, entries, multiline, indent }
const stats = { files: 0, eligible: 0, skipped: 0 }

for (const file of files) {
  const src = readFileSync(file, 'utf-8')
  let idx = 0
  let fileHas = false
  const re = /pick\(\s*locale\s*,\s*\{/g
  let m
  while ((m = re.exec(src))) {
    const openIdx = src.indexOf('{', m.index)
    const closeIdx = matchBrace(src, openIdx)
    if (closeIdx === -1) continue
    const objSrc = src.slice(openIdx, closeIdx + 1)
    const entries = parseObject(objSrc)
    re.lastIndex = closeIdx + 1
    if (!entries) { stats.skipped++; continue }
    const keys = entries.map(e => e.key)
    const allStrings = entries.every(e => e.valIsString)
    const onlyLocaleKeys = keys.every(k => ['en', 'es', 'ar', 'it'].includes(k))
    if (!allStrings || !onlyLocaleKeys || keys.includes('it')) { stats.skipped++; continue }
    const sourceEntry = entries.find(e => e.key === 'es') || entries.find(e => e.key === 'en')
    if (!sourceEntry) { stats.skipped++; continue }
    const multiline = objSrc.includes('\n')
    // indentation of entries (from char before first key on its line)
    let indent = '  '
    if (multiline) {
      const lineStart = src.lastIndexOf('\n', src.indexOf(entries[0].key, openIdx)) + 1
      indent = src.slice(lineStart, src.indexOf(entries[0].key, openIdx))
    }
    jobs.push({ file, openIdx, closeIdx, objSrc, entries, sourceEntry, multiline, indent })
    stats.eligible++
    fileHas = true
  }
  if (fileHas) stats.files++
}

console.log(`Files with pick(): ${files.length}`)
console.log(`Eligible (all-string) picks: ${stats.eligible}`)
console.log(`Skipped (arrays/JSX/complex): ${stats.skipped}`)

if (!APPLY) {
  console.log('\n[DRY RUN] Sample of what would be translated (first 8):')
  for (const j of jobs.slice(0, 8)) {
    console.log(`  ${j.file.split('/').pop()} ← es: ${j.sourceEntry.valInner.slice(0, 70)}`)
  }
  console.log('\nRun with --apply to translate and write.')
  process.exit(0)
}

// ─── Translate (batched) ─────────────────────────────────────────────────────

const SYSTEM = `You translate short UI strings from Spanish to Italian for a private-transfer booking website.
Return a JSON object mapping each id to its Italian translation.
RULES:
- Preserve EXACTLY any \${...} template expressions and any <...> tags. Translate only the human text around them.
- Keep "Titan Transfers" unchanged.
- Natural, concise, marketing-friendly Italian. Do not add quotes around values.
- Return ONLY minified JSON.`

async function translateBatch(map) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, response_format: { type: 'json_object' }, temperature: 0.3, max_tokens: 8000,
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: 'Translate to Italian:\n' + JSON.stringify(map) }] }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return JSON.parse((await res.json()).choices[0].message.content)
}

const BATCH = 30
for (let i = 0; i < jobs.length; i += BATCH) {
  const slice = jobs.slice(i, i + BATCH)
  const map = Object.fromEntries(slice.map((j, k) => [String(i + k), j.sourceEntry.valInner]))
  process.stdout.write(`  Batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(jobs.length / BATCH)}... `)
  const out = await translateBatch(map)
  slice.forEach((j, k) => { j.itText = out[String(i + k)] })
  console.log('done')
  await new Promise(r => setTimeout(r, 250))
}

// ─── Apply edits per file (back-to-front to preserve offsets) ─────────────────

const byFile = {}
for (const j of jobs) (byFile[j.file] ||= []).push(j)

for (const [file, fjobs] of Object.entries(byFile)) {
  let src = readFileSync(file, 'utf-8')
  fjobs.sort((a, b) => b.openIdx - a.openIdx)
  for (const j of fjobs) {
    if (typeof j.itText !== 'string' || !j.itText) continue
    const q = j.sourceEntry.valQuote
    // escape the quote char inside the value if needed (only for ' or ")
    let v = j.itText
    if (q !== '`') v = v.split('\\').join('\\\\').split(q).join('\\' + q)
    const itLiteral = `${q}${v}${q}`
    // rebuild object: insert it after the last entry, preserving layout
    const last = j.entries[j.entries.length - 1]
    if (j.multiline) {
      // insert a new line after the close-finding: place `it: <lit>,` before closing brace
      const insertion = `${j.indent}it: ${itLiteral},\n`
      // find position: the closing brace index; back up to its line start
      const braceLineStart = src.lastIndexOf('\n', j.closeIdx) + 1
      src = src.slice(0, braceLineStart) + insertion + src.slice(braceLineStart)
    } else {
      // single line: insert ", it: <lit>" before closing brace
      const before = src.slice(0, j.closeIdx).replace(/\s*$/, '')
      src = before + `, it: ${itLiteral} ` + src.slice(j.closeIdx)
    }
  }
  writeFileSync(file, src)
  console.log(`  ✓ ${file} (+${fjobs.filter(j => j.itText).length})`)
}

console.log('\nDone. Now run a build to verify.')
