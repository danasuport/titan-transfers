/**
 * Patch blog posts with featured images from Unsplash
 * Usage: SANITY_TOKEN=xxx node scripts/patch-blog-images.mjs
 */

import { createClient } from '@sanity/client'

const token = process.env.SANITY_TOKEN
const client = createClient({
  projectId: '6iu2za90',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const patches = [
  {
    id: 'lp8nx8I08cpLXAmeSNdHVv',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', // F1 racing
  },
  {
    id: 'DVoWrnAL9sX9pYVB0w77SR',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80', // Dubai skyline
  },
  {
    id: 'DVoWrnAL9sX9pYVB0w77cP',
    imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&q=80', // Prague
  },
]

async function uploadImageFromUrl(url) {
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()
  const asset = await client.assets.upload('image', Buffer.from(buffer), {
    filename: url.split('/').pop().split('?')[0] + '.jpg',
    contentType: 'image/jpeg',
  })
  return asset._id
}

async function run() {
  for (const { id, imageUrl } of patches) {
    console.log(`📷 Uploading image for ${id}...`)
    const assetId = await uploadImageFromUrl(imageUrl)
    await client.patch(id).set({
      featuredImage: { _type: 'image', asset: { _type: 'reference', _ref: assetId } }
    }).commit()
    console.log(`✅ Patched ${id}`)
  }
  console.log('Done!')
}

run().catch(console.error)
