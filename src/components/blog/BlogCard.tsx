import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import Image from 'next/image'
import { formatDate } from '@/lib/utils/formatters'
import { getBlogUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import { Badge } from '@/components/ui/Badge'
import type { Locale } from '@/lib/i18n/config'

interface BlogCardProps {
  post: {
    _id: string
    title: string
    slug: { current: string }
    category?: string
    excerpt?: string
    publishDate?: string
    featuredImage?: { asset: { url: string } }
    translations?: Record<string, { title?: string; slug?: { current: string }; excerpt?: string }>
  }
}

export function BlogCard({ post }: BlogCardProps) {
  const locale = useLocale() as Locale
  const title = getTranslatedTitle(post, locale)
  const excerpt = (locale !== 'en' && post.translations?.[locale]?.excerpt) || post.excerpt

  return (
    <Link href={getBlogUrl(post, locale) as any} className="group">
      <article className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
        {post.featuredImage?.asset?.url && (
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={post.featuredImage.asset.url}
              alt={title}
              fill
              loading="lazy"
              quality={75}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            {post.category && <Badge variant="amber">{post.category}</Badge>}
            {post.publishDate && (
              <span className="text-xs text-gray-400">{formatDate(post.publishDate, locale)}</span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-brand-600">
            {title}
          </h3>
          {excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-500">{excerpt}</p>
          )}
        </div>
      </article>
    </Link>
  )
}
