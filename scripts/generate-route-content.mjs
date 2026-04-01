/**
 * Generate editorial content for routes using Claude API
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-route-content.mjs
 *
 * Options (env vars):
 *   ORIGIN_SLUG=barcelona-el-prat-airport   — only process routes from this airport
 *   ROUTE_SLUG=barcelona-el-prat-to-sitges  — only process this specific route
 *   FORCE=true                               — regenerate even if content already exists
 *   LANG=en                                  — 'en', 'es', or 'both' (default: both)
 *   DRY_RUN=true                             — print prompts without calling API or writing to Sanity
 */

import Anthropic from '@anthropic-ai/sdk'
import { client } from './lib/sanity-client.mjs'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ORIGIN_SLUG  = process.env.ORIGIN_SLUG  || null
const ROUTE_SLUG   = process.env.ROUTE_SLUG   || null
const FORCE        = process.env.FORCE === 'true'
const LANG         = process.env.LANG || 'both'
const DRY_RUN      = process.env.DRY_RUN === 'true'

// ─── Portable Text helpers ────────────────────────────────────────────────────

function key() { return Math.random().toString(36).slice(2, 9) }

function ptBlock(text, style = 'normal') {
  return {
    _type: 'block', _key: key(), style,
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
    markDefs: [],
  }
}

function ptH2(text) { return ptBlock(text, 'h2') }

function ptBullet(items) {
  return items.map(text => ({
    _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1,
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
    markDefs: [],
  }))
}

// ─── Parse Claude JSON response safely ───────────────────────────────────────

function parseJSON(text) {
  const match = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/)
  if (!match) throw new Error('No JSON found in response')
  return JSON.parse(match[1].trim())
}

// ─── Convert Claude structured output to Portable Text ───────────────────────

function structureToPortableText(sections) {
  const blocks = []
  for (const section of sections) {
    if (section.h2) blocks.push(ptH2(section.h2))
    if (section.paragraphs) {
      for (const p of section.paragraphs) {
        blocks.push(ptBlock(p))
      }
    }
    if (section.bullets) {
      blocks.push(...ptBullet(section.bullets))
    }
  }
  return blocks
}

// ─── Fetch Wikimedia image for a query ───────────────────────────────────────

async function searchWikimedia(query) {
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=8&format=json&origin=*`
  const searchData = await fetch(searchUrl).then(r => r.json())
  return searchData?.query?.search || []
}

async function getWikimediaImage(query) {
  try {
    // Build a list of queries to try: original → first 3 words → first 2 words
    const words = query.trim().split(/\s+/)
    const fallbacks = [
      query,
      words.slice(0, 3).join(' '),
      words.slice(0, 2).join(' '),
    ].filter((q, i, arr) => arr.indexOf(q) === i) // deduplicate

    let results = []
    for (const q of fallbacks) {
      results = await searchWikimedia(q)
      if (results.length) break
    }
    if (!results.length) return null

    // Try each result until we find a downloadable JPEG/PNG
    for (const result of results) {
      try {
        const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(result.title)}&prop=imageinfo&iiprop=url|mediatype&format=json&origin=*`
        const infoData = await fetch(infoUrl).then(r => r.json())
        const page = Object.values(infoData?.query?.pages)[0]
        const info = page?.imageinfo?.[0]
        if (!info) continue
        if (info.mediatype && !['BITMAP', 'DRAWING'].includes(info.mediatype)) continue
        const url = info.url || info.thumburl
        if (!url) continue
        if (!/\.(jpg|jpeg|png)/i.test(url)) continue
        return url
      } catch { continue }
    }
    return null
  } catch {
    return null
  }
}

// ─── Upload image to Sanity ───────────────────────────────────────────────────

async function uploadImage(imageUrl, filename) {
  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TitanTransfers/1.0; +https://titan-transfers.com)',
        'Accept': 'image/jpeg,image/png,image/webp,image/*',
        'Referer': 'https://commons.wikimedia.org/',
      },
      redirect: 'follow',
    })
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    if (buffer.byteLength < 10000) return null // skip tiny/broken images
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename,
      contentType: contentType.split(';')[0].trim(),
    })
    return asset._id
  } catch {
    return null
  }
}

// ─── Build Claude prompt ──────────────────────────────────────────────────────

function buildPrompt(route, lang) {
  const { origin, destination, distance, estimatedDuration, country, region } = route
  const originName = origin?.title || 'the airport'
  const destName = destination?.title || 'the destination'
  const distanceStr = distance ? `${distance} km` : 'unknown distance'
  const durationStr = estimatedDuration ? `${Math.floor(estimatedDuration / 60)}h ${estimatedDuration % 60}min`.replace('0h ', '') : 'unknown duration'
  const countryName = country?.title || ''
  const regionName = region?.title || ''
  const isES = lang === 'es'

  return `You are a professional travel copywriter for Titan Transfers, a premium private transfer company.

Write editorial content for the route: **${originName} → ${destName}** (${distanceStr}, approximately ${durationStr}).
${countryName ? `Country: ${countryName}` : ''}${regionName ? `, Region: ${regionName}` : ''}

Language: ${isES ? 'Spanish (Spain, formal tone)' : 'English (British, professional)'}

Output a JSON object with this exact structure:
{
  "featuredImage": {
    "imageQuery": "best Wikimedia Commons search query for a wide establishing shot of ${destName} (landmark, skyline, beach, old town...)",
    "imageAlt": "SEO alt text: 'Private transfer from ${originName} to ${destName} — [specific place shown in photo]'"
  },
  "description": [
    { "h2": "section title" },
    { "paragraphs": ["paragraph 1 text", "paragraph 2 text"] },
    { "h2": "another section" },
    { "paragraphs": ["..."] },
    { "bullets": ["item 1", "item 2", "item 3"] }
  ],
  "contentSections": [
    {
      "title": "Section title (short, punchy)",
      "paragraphs": ["paragraph 1", "paragraph 2"],
      "imageQuery": "specific Wikimedia Commons search for this section's topic",
      "imageAlt": "SEO alt text mentioning ${originName}, ${destName} and what is shown in the photo",
      "imagePosition": "left"
    },
    {
      "title": "...",
      "paragraphs": ["..."],
      "imageQuery": "...",
      "imageAlt": "...",
      "imagePosition": "right"
    },
    {
      "title": "...",
      "paragraphs": ["..."],
      "imageQuery": "...",
      "imageAlt": "...",
      "imagePosition": "left"
    }
  ]
}

Requirements for "featuredImage":
- imageQuery: specific enough to find a real, high-quality Wikimedia photo of ${destName} (e.g. "${destName} seafront", "${destName} old town panorama", "${destName} beach aerial")
- imageAlt: keyword-rich, descriptive, mentions the transfer route and what is shown (e.g. "Private transfer from ${originName} to ${destName} — ${destName} seafront promenade")

Requirements for "description" (the main article body):
- 700-900 words total
- 4-6 H2 sections covering: the journey itself, about the destination, what to see/do, practical travel tips, why private transfer is the best option
- Rich in keywords naturally: "${originName} to ${destName} transfer", "private transfer", destination name, country, region
- Editorial tone — engaging, informative, not salesy
- Do NOT include pricing or booking CTAs (those are on the page already)
- Each paragraph 60-100 words

Requirements for "contentSections" (exactly 3):
- Each section is a distinct topic: local gastronomy, architecture/culture, beaches/nature, history, events/festivals, or hidden gems
- 2 paragraphs per section, 80-120 words each
- imagePosition alternates: left, right, left
- imageQuery: specific enough to find a real Wikimedia photo (e.g. "${destName} beach", "${destName} cathedral", "${destName} market")
- imageAlt: always keyword-rich, mentioning the destination and what is shown — never generic

Respond ONLY with the JSON object, no other text.`
}

// ─── Generate content for one route in one language ──────────────────────────

async function generateForRoute(route, lang) {
  const prompt = buildPrompt(route, lang)

  if (DRY_RUN) {
    console.log(`\n[DRY RUN] Prompt for ${route.title} (${lang}):\n${prompt.slice(0, 300)}...\n`)
    return null
  }

  console.log(`  → Calling Claude for ${lang}...`)
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].text
  const data = parseJSON(raw)
  return data
}

// ─── Process one route ────────────────────────────────────────────────────────

async function processRoute(route) {
  const hasEN = route.description?.length > 0
  const hasES = route.translations?.es?.description?.length > 0
  const hasENSections = route.contentSections?.length > 0
  const hasESSections = route.translations?.es?.contentSections?.length > 0

  const doEN = (LANG === 'en' || LANG === 'both') && (FORCE || !hasEN || !hasENSections)
  const doES = (LANG === 'es' || LANG === 'both') && (FORCE || !hasES || !hasESSections)

  if (!doEN && !doES) {
    console.log(`  ✓ Already has content, skipping (use FORCE=true to regenerate)`)
    return
  }

  const patch = {}

  if (doEN) {
    const data = await generateForRoute(route, 'en')
    if (data) {
      patch.description = structureToPortableText(data.description)
      patch.contentSections = await buildContentSections(data.contentSections, route.title, 'en')
      // Featured image — only set if not already present
      if (!route.featuredImage && data.featuredImage?.imageQuery) {
        const featRef = await uploadFeaturedImage(data.featuredImage, route.title, 'en')
        if (featRef) patch.featuredImage = featRef
      }
    }
  }

  if (doES) {
    const data = await generateForRoute(route, 'es')
    if (data) {
      patch['translations.es.description'] = structureToPortableText(data.description)
      patch['translations.es.contentSections'] = await buildContentSections(data.contentSections, route.title, 'es')
    }
  }

  if (DRY_RUN || Object.keys(patch).length === 0) return

  await client.patch(route._id).set(patch).commit()
  console.log(`  ✓ Saved to Sanity`)
}

// ─── Upload featured image ────────────────────────────────────────────────────

async function uploadFeaturedImage(featuredImage, routeTitle, lang) {
  if (!featuredImage?.imageQuery) return null
  console.log(`    → Searching featured image: "${featuredImage.imageQuery}"`)
  const imgUrl = await getWikimediaImage(featuredImage.imageQuery)
  if (!imgUrl) return null
  console.log(`    → Uploading featured: ${imgUrl.slice(0, 60)}...`)
  const assetId = await uploadImage(imgUrl, `route-featured-${lang}.jpg`)
  if (!assetId) return null
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: assetId },
    alt: featuredImage.imageAlt || routeTitle,
  }
}

// ─── Build contentSections with uploaded images ───────────────────────────────

async function buildContentSections(sections, routeTitle, lang) {
  const result = []
  for (const [i, section] of sections.entries()) {
    const body = (section.paragraphs || []).map(p => ptBlock(p))
    let imageRef = null

    if (section.imageQuery) {
      console.log(`    → Searching image: "${section.imageQuery}"`)
      const imgUrl = await getWikimediaImage(section.imageQuery)
      if (imgUrl) {
        const filename = `route-section-${i + 1}-${lang}.jpg`
        console.log(`    → Uploading: ${imgUrl.slice(0, 60)}...`)
        imageRef = await uploadImage(imgUrl, filename)
      }
    }

    result.push({
      _key: key(),
      title: section.title || '',
      body,
      imagePosition: section.imagePosition || (i % 2 === 0 ? 'left' : 'right'),
      imageAlt: section.imageAlt || section.title || routeTitle,
      ...(imageRef ? { image: { _type: 'image', asset: { _type: 'reference', _ref: imageRef } } } : {}),
    })
  }
  return result
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  let filter = `_type == "route"`
  if (ORIGIN_SLUG) filter += ` && origin->slug.current == "${ORIGIN_SLUG}"`
  if (ROUTE_SLUG)  filter += ` && slug.current == "${ROUTE_SLUG}"`

  const routes = await client.fetch(`*[${filter}] | order(title asc) {
    _id, title, slug,
    origin->{ _id, title, slug, iataCode },
    destination->{ _id, title, slug },
    country->{ _id, title, slug },
    region->{ _id, title, slug },
    distance, estimatedDuration,
    description,
    contentSections[]{ _key },
    translations{ es{ description, contentSections[]{ _key } } }
  }`)

  console.log(`Found ${routes.length} routes to process`)
  if (DRY_RUN) console.log(`DRY RUN mode — no API calls or Sanity writes\n`)

  for (const route of routes) {
    console.log(`\n[${routes.indexOf(route) + 1}/${routes.length}] ${route.title}`)
    try {
      await processRoute(route)
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`)
    }
    // Pause between routes to avoid rate limits
    if (!DRY_RUN) await new Promise(r => setTimeout(r, 1500))
  }

  console.log('\nDone.')
}

main().catch(console.error)
