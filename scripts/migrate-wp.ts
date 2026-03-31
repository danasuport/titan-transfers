/**
 * WordPress to Sanity Migration Script
 *
 * Usage: npx tsx scripts/migrate-wp.ts
 *
 * Prerequisites:
 * 1. Export WordPress data via WP REST API or WP All Export
 * 2. Set environment variables:
 *    - SANITY_PROJECT_ID
 *    - SANITY_DATASET
 *    - SANITY_API_TOKEN (with write access)
 *    - WP_API_URL (e.g. https://titantransfers.com/wp-json/wp/v2)
 */

import { createClient } from '@sanity/client'

const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN || '',
  useCdn: false,
})

const WP_API = process.env.WP_API_URL || 'https://titantransfers.com/wp-json/wp/v2'

interface WPPage {
  id: number
  slug: string
  title: { rendered: string }
  content: { rendered: string }
  status: string
}

async function fetchWPPages(type: string): Promise<WPPage[]> {
  const pages: WPPage[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    try {
      const res = await fetch(`${WP_API}/${type}?per_page=100&page=${page}&status=publish`)
      if (!res.ok) break
      const data = await res.json()
      if (data.length === 0) break
      pages.push(...data)
      page++
      const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1')
      hasMore = page <= totalPages
    } catch {
      hasMore = false
    }
  }

  return pages
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function htmlToPortableText(html: string) {
  const text = htmlToPlainText(html)
  if (!text) return []
  return [
    {
      _type: 'block',
      _key: Math.random().toString(36).slice(2),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: Math.random().toString(36).slice(2), text, marks: [] }],
    },
  ]
}

async function migrateAirports() {
  console.log('Fetching airports from WordPress...')
  // This assumes airports are stored as a custom post type or pages
  // Adjust the endpoint based on your WP setup
  const wpAirports = await fetchWPPages('pages')
  const airportPages = wpAirports.filter((p) => p.slug.includes('airport'))

  console.log(`Found ${airportPages.length} airport pages`)

  for (const wp of airportPages) {
    const doc = {
      _type: 'airport',
      _id: `airport-${wp.id}`,
      title: htmlToPlainText(wp.title.rendered),
      slug: { _type: 'slug', current: slugify(wp.slug) },
      description: htmlToPortableText(wp.content.rendered),
      seoTitle: htmlToPlainText(wp.title.rendered),
    }

    try {
      await sanity.createOrReplace(doc)
      console.log(`  Migrated: ${doc.title}`)
    } catch (err) {
      console.error(`  Failed: ${doc.title}`, err)
    }
  }
}

async function migrateBlogPosts() {
  console.log('Fetching blog posts from WordPress...')
  const wpPosts = await fetchWPPages('posts')

  console.log(`Found ${wpPosts.length} blog posts`)

  for (const wp of wpPosts) {
    const doc = {
      _type: 'blogPost',
      _id: `blog-${wp.id}`,
      title: htmlToPlainText(wp.title.rendered),
      slug: { _type: 'slug', current: slugify(wp.slug) },
      content: htmlToPortableText(wp.content.rendered),
      excerpt: htmlToPlainText(wp.content.rendered).slice(0, 200),
      publishDate: new Date().toISOString().split('T')[0],
      category: 'guide',
    }

    try {
      await sanity.createOrReplace(doc)
      console.log(`  Migrated: ${doc.title}`)
    } catch (err) {
      console.error(`  Failed: ${doc.title}`, err)
    }
  }
}

async function main() {
  console.log('Starting WordPress to Sanity migration...')
  console.log(`Sanity project: ${sanity.config().projectId}`)
  console.log(`WP API: ${WP_API}`)
  console.log('')

  await migrateAirports()
  console.log('')
  await migrateBlogPosts()

  console.log('')
  console.log('Migration complete!')
  console.log('NOTE: Review imported content in Sanity Studio and add missing fields (references, translations, images).')
}

main().catch(console.error)
