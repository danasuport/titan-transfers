import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { blogPostBySlugQuery, allBlogPostsQuery } from '@/lib/sanity/queries'
import { generatePageMetadata, generateBlogMetadata } from '@/lib/seo/generateMetadata'
import { generateBlogPostingSchema } from '@/lib/seo/schemaOrg'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { PortableText } from '@portabletext/react'
import { BookingCTABlock } from '@/components/blog/BookingCTABlock'
import { InternalLinks } from '@/components/sections/InternalLinks'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils/formatters'
import Image from 'next/image'
import type { Locale } from '@/lib/i18n/config'
import { getAirportUrl, getCityUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'

export async function generateStaticParams() {
  const posts = await sanityClient.fetch(allBlogPostsQuery)
  return posts.map((p: { slug: { current: string } }) => ({ slug: p.slug.current }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const post = await sanityClient.fetch(blogPostBySlugQuery, { slug })
  if (!post) return {}
  const { title, description } = generateBlogMetadata(post, locale as Locale)
  return generatePageMetadata({ title, description, path: `/blog/${slug}/`, locale: locale as Locale, type: 'article', publishedTime: post.publishDate, alternates: [{ locale: 'en' as Locale, path: `/blog/${slug}/` }, { locale: 'es' as Locale, path: `/es/blog/${post.translations?.es?.slug?.current || slug}/` }] })
}

const portableTextComponents = {
  types: {
    bookingCTA: ({ value }: { value: any }) => (
      <BookingCTABlock
        type={value.type}
        ctaText={value.ctaText}
        linkedAirport={value.linkedAirport}
        linkedCity={value.linkedCity}
        linkedRoute={value.linkedRoute}
      />
    ),
    image: ({ value }: { value: any }) => (
      <figure className="my-8">
        {value.asset?.url && (
          <Image src={value.asset.url} alt={value.alt || ''} width={800} height={450} className="rounded-lg" />
        )}
      </figure>
    ),
  },
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const post = await sanityClient.fetch(blogPostBySlugQuery, { slug })
  if (!post) notFound()

  const postTitle = (locale !== 'en' && post.translations?.[locale]?.title) || post.title
  const content = (locale !== 'en' && post.translations?.[locale]?.content) || post.content

  const relatedLinks = [
    ...(post.relatedAirports || []).map((a: any) => ({
      href: getAirportUrl(a, locale as Locale),
      label: getTranslatedTitle(a, locale as Locale),
      subtitle: a.iataCode,
    })),
    ...(post.relatedCities || []).map((c: any) => ({
      href: getCityUrl(c, locale as Locale),
      label: getTranslatedTitle(c, locale as Locale),
      subtitle: c.country?.title,
    })),
  ]

  return (
    <div className="site-container px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Blog', href: '/blog/' }, { label: postTitle }]} />
      <SchemaOrg data={generateBlogPostingSchema({ title: postTitle, description: post.excerpt || postTitle, url: `/blog/${slug}/`, image: post.featuredImage?.asset?.url, publishDate: post.publishDate })} />

      <article>
        <header className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            {post.category && <Badge variant="amber">{post.category}</Badge>}
            {post.publishDate && <time className="text-sm text-muted">{formatDate(post.publishDate, locale)}</time>}
          </div>
          <h1 className="text-3xl font-bold text-heading sm:text-4xl">{postTitle}</h1>
        </header>

        {post.featuredImage?.asset?.url && (
          <Image
            src={post.featuredImage.asset.url}
            alt={postTitle}
            width={900}
            height={500}
            className="mb-8 rounded-xl"
            priority
          />
        )}

        <div className="prose max-w-none prose-headings:text-heading prose-p:text-body prose-li:text-body prose-strong:text-heading">
          {content && <PortableText value={content} components={portableTextComponents} />}
        </div>
      </article>

      {relatedLinks.length > 0 && (
        <div className="mt-12">
          <InternalLinks links={relatedLinks} title="Related Transfers" />
        </div>
      )}
    </div>
  )
}
