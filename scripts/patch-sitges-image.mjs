/**
 * Patch Barcelona-Sitges post with featured image from Wikimedia Commons
 * Usage: SANITY_TOKEN=xxx node scripts/patch-sitges-image.mjs
 */

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '6iu2za90',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

async function getWikimediaImage(query) {
  // Search Wikimedia Commons for images
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json&origin=*`
  const searchRes = await fetch(searchUrl)
  const searchData = await searchRes.json()
  const results = searchData?.query?.search
  if (!results?.length) throw new Error('No results found')

  // Get image info for first result
  const title = results[0].title
  const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=1200&format=json&origin=*`
  const infoRes = await fetch(infoUrl)
  const infoData = await infoRes.json()
  const pages = infoData?.query?.pages
  const page = Object.values(pages)[0]
  return page?.imageinfo?.[0]?.thumburl || page?.imageinfo?.[0]?.url
}

async function run() {
  const post = await client.fetch(`*[_type == "blogPost" && slug.current == "barcelona-airport-to-sitges-transfer-guide"][0]{ _id }`)
  if (!post) { console.error('Post not found'); return }

  const imageUrl = await getWikimediaImage('Sitges Spain')
  console.log('Found image:', imageUrl)

  const res = await fetch(imageUrl, { headers: { 'User-Agent': 'TitanTransfers/1.0 (info@titan-transfers.com)' } })
  const buffer = await res.arrayBuffer()

  const asset = await client.assets.upload('image', Buffer.from(buffer), {
    filename: 'barcelona-airport-to-sitges-transfer.jpg',
    contentType: 'image/jpeg',
  })

  await client.patch(post._id).set({
    featuredImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: 'Private transfer from Barcelona El Prat airport to Sitges — door-to-door service',
    },
  }).commit()

  console.log('Done:', asset._id)
}

run().catch(console.error)
