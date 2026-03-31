import { useLocale } from 'next-intl'
import { sanityClient } from '@/lib/sanity/client'
import { relatedBlogPostsQuery } from '@/lib/sanity/queries'
import { BlogGrid } from '@/components/blog/BlogGrid'
import type { Locale } from '@/lib/i18n/config'

interface LatestNewsProps {
  type: 'airport' | 'city' | 'country' | 'region' | 'service'
  id: string
  serviceType?: string
  title: string
  limit?: number
}

export async function LatestNews({ type, id, serviceType, title, limit = 4 }: LatestNewsProps) {
  const posts = await sanityClient.fetch(relatedBlogPostsQuery, {
    type,
    id,
    serviceType: serviceType || '',
    limit,
  })

  if (!posts || posts.length === 0) return null

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-white">{title}</h2>
      <BlogGrid posts={posts} />
    </section>
  )
}
