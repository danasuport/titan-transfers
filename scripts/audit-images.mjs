/**
 * Phase 8: Image Audit
 * Reports which documents are missing featured images
 * Can optionally download from Pexels if a valid API key is provided
 *
 * Usage:
 *   node scripts/audit-images.mjs              # Just audit
 *   PEXELS_KEY=xxx node scripts/audit-images.mjs --download   # Download + upload
 */

import { client } from './lib/sanity-client.mjs'

const DOWNLOAD = process.argv.includes('--download')
const PEXELS_KEY = process.env.PEXELS_KEY || ''

async function searchPexels(query) {
  if (!PEXELS_KEY) return null
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.photos?.length > 0) {
      return data.photos[0].src.large2x || data.photos[0].src.large
    }
  } catch {}
  return null
}

async function downloadAndUpload(url, slug, altText) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.length < 5000) return null
    const asset = await client.assets.upload('image', buffer, {
      filename: `${slug}.jpg`,
      contentType: 'image/jpeg',
    })
    return {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: altText,
    }
  } catch { return null }
}

async function audit() {
  console.log('🖼️  Image Audit Report\n')
  if (DOWNLOAD && PEXELS_KEY) console.log('📥 Download mode enabled with Pexels API\n')

  const types = [
    { type: 'airport', label: 'Airports', searchField: 'title' },
    { type: 'city', label: 'Cities', searchField: 'title' },
    { type: 'country', label: 'Countries', searchField: 'title' },
    { type: 'region', label: 'Regions', searchField: 'title' },
  ]

  let totalMissing = 0, totalFixed = 0

  for (const t of types) {
    const docs = await client.fetch(`*[_type=="${t.type}"]{_id, title, "slug": slug.current, "hasImg": defined(featuredImage)}`)
    const missing = docs.filter(d => !d.hasImg)
    const withImg = docs.filter(d => d.hasImg)

    console.log(`━━━ ${t.label}: ${withImg.length}/${docs.length} have images ━━━`)

    if (missing.length === 0) {
      console.log('  ✅ All documents have images!\n')
      continue
    }

    totalMissing += missing.length

    if (DOWNLOAD && PEXELS_KEY) {
      for (const doc of missing) {
        const query = t.type === 'airport'
          ? `${doc.title.replace(/ Airport| International/g, '')} airport`
          : `${doc.title} city skyline`

        process.stdout.write(`  📥 ${doc.title}...`)
        const url = await searchPexels(query)
        if (url) {
          const img = await downloadAndUpload(url, doc.slug, `${doc.title} - Titan Transfers`)
          if (img) {
            await client.patch(doc._id).set({ featuredImage: img }).commit()
            totalFixed++
            console.log(' ✅')
          } else {
            console.log(' ⚠️ download failed')
          }
        } else {
          console.log(' ⚠️ no results')
        }
        await new Promise(r => setTimeout(r, 250)) // rate limit
      }
    } else {
      // Just list missing
      for (const doc of missing.slice(0, 10)) {
        console.log(`  ❌ ${doc.title} (${doc.slug})`)
      }
      if (missing.length > 10) console.log(`  ... and ${missing.length - 10} more`)
    }
    console.log()
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📊 Total missing images: ${totalMissing}`)
  if (totalFixed > 0) console.log(`📥 Fixed: ${totalFixed}`)
  if (!PEXELS_KEY) {
    console.log(`\n💡 To auto-download images, run:`)
    console.log(`   PEXELS_KEY=your_key node scripts/audit-images.mjs --download`)
    console.log(`\n   Get a free Pexels API key at: https://www.pexels.com/api/new/`)
  }
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

audit().catch(console.error)
