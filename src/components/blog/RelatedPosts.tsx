import { useTranslations } from 'next-intl'
import { BlogGrid } from './BlogGrid'

interface RelatedPostsProps {
  posts: Array<{
    _id: string
    title: string
    slug: { current: string }
    category?: string
    excerpt?: string
    publishDate?: string
    featuredImage?: { asset: { url: string } }
    translations?: Record<string, { title?: string; slug?: { current: string }; excerpt?: string }>
  }>
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  const t = useTranslations('blog')

  if (!posts || posts.length === 0) return null

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-heading">{t('relatedPosts')}</h2>
      <BlogGrid posts={posts} columns={3} />
    </section>
  )
}
