import { client } from './sanity-client.mjs'

// Try downloading hero image from WP
export async function tryDownloadFromWP(slug) {
  const patterns = [
    `https://titantransfers.com/wp-content/uploads/2025/06/${slug}-airport-transfers.jpg`,
    `https://titantransfers.com/wp-content/uploads/2025/11/${slug}.jpg`,
    `https://titantransfers.com/wp-content/uploads/2025/06/${slug}.jpg`,
    `https://titantransfers.com/wp-content/uploads/2025/06/${slug}-private-transfers.jpg`,
  ]
  for (const url of patterns) {
    try {
      const res = await fetch(url)
      if (res.ok && res.headers.get('content-type')?.includes('image')) {
        const buffer = Buffer.from(await res.arrayBuffer())
        if (buffer.length > 5000) return buffer
      }
    } catch {}
  }
  return null
}

// Search Pexels for a city/landmark image
export async function searchPexels(query, perPage = 5) {
  const PEXELS_KEY = process.env.PEXELS_KEY || '8qiSZL5VPyIGFvvlRhwFaMRBCPzdPBg5Q6wg4NMv1JoWxwJqdOI63ZAb'
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.photos || []).map(p => ({
      url: p.src.large2x || p.src.large,
      alt: p.alt || query,
      photographer: p.photographer,
    }))
  } catch { return [] }
}

// Download image from URL
export async function downloadImage(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    return buffer.length > 5000 ? buffer : null
  } catch { return null }
}

// Upload buffer to Sanity and return image object
export async function uploadToSanity(buffer, filename, altText) {
  try {
    const asset = await client.assets.upload('image', buffer, {
      filename,
      contentType: 'image/jpeg',
    })
    return {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: altText,
      title: altText,
    }
  } catch (err) {
    console.error(`  ⚠️  Upload failed for ${filename}:`, err.message)
    return null
  }
}

// Full pipeline: try WP → Pexels → return image object or null
export async function getImageForCity(cityName, slug, altPrefix = '') {
  // 1. Try WP
  let buffer = await tryDownloadFromWP(slug)
  if (buffer) {
    return uploadToSanity(buffer, `${slug}.jpg`, `${altPrefix || cityName} - Transfers`)
  }

  // 2. Try Pexels
  const photos = await searchPexels(`${cityName} city skyline`)
  if (photos.length > 0) {
    buffer = await downloadImage(photos[0].url)
    if (buffer) {
      return uploadToSanity(buffer, `${slug}.jpg`, `${altPrefix || cityName} - Transfers`)
    }
  }

  return null
}

// Get multiple images for gallery
export async function getGalleryForCity(cityName, count = 4) {
  const queries = [
    `${cityName} landmark`,
    `${cityName} city street`,
    `${cityName} architecture`,
    `${cityName} panoramic view`,
    `${cityName} tourism`,
  ]
  const images = []
  for (const q of queries.slice(0, count)) {
    const photos = await searchPexels(q, 2)
    if (photos.length > 0) {
      const buffer = await downloadImage(photos[0].url)
      if (buffer) {
        const img = await uploadToSanity(buffer, `${cityName.toLowerCase().replace(/\s+/g, '-')}-${images.length}.jpg`, `${cityName} - ${q.split(' ').pop()}`)
        if (img) images.push(img)
      }
    }
    // Rate limit
    await new Promise(r => setTimeout(r, 200))
  }
  return images
}
