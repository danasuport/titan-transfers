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
import { BookingForm } from '@/components/ui/BookingForm'
import { BlogBookingForm } from '@/components/blog/BlogBookingForm'
import { FleetCompact } from '@/components/blog/FleetCompact'
import { RouteInlineBlock } from '@/components/blog/RouteCard'
import { formatDate } from '@/lib/utils/formatters'
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/config'
import { getAirportUrl, getCityUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import { russoOne } from '@/lib/fonts'

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

function InlineBookingBlock({ locale }: { locale: string }) {
  const es = locale === 'es'
  return (
    <div style={{ margin: '2.5rem 0' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8BAA1D', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
        {es ? 'Reserva tu transfer' : 'Book your transfer'}
      </p>
      <BlogBookingForm />
    </div>
  )
}

const portableTextComponents = {
  block: {
    h2: ({ children }: any) => <h2 style={{ fontWeight: 400 }}>{children}</h2>,
    h3: ({ children }: any) => <h3 style={{ fontWeight: 400 }}>{children}</h3>,
    h4: ({ children }: any) => <h4 style={{ fontWeight: 400 }}>{children}</h4>,
  },
  list: {
    bullet: ({ children }: any) => <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0' }}>{children}</ul>,
    number: ({ children }: any) => <ol style={{ listStyle: 'none', padding: 0, margin: '1rem 0', counterReset: 'blog-counter' }}>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', marginBottom: '0.5rem' }}>
        <span style={{ display: 'inline-block', width: '18px', height: '10px', background: '#8BAA1D', transform: 'skewX(-8deg)', flexShrink: 0, marginTop: '2px' }} />
        <span>{children}</span>
      </li>
    ),
    number: ({ children, index }: any) => (
      <li style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.65rem' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '26px', height: '22px', background: '#242426', color: '#8BAA1D', fontSize: '0.72rem', fontWeight: 700, transform: 'skewX(-8deg)', flexShrink: 0 }}>
          <span style={{ transform: 'skewX(8deg)', display: 'inline-block' }}>{(index ?? 0) + 1}</span>
        </span>
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    strong: ({ children }: any) => <span style={{ fontWeight: 400 }}>{children}</span>,
  },
  types: {
    bookingCTA: () => null,
    image: ({ value }: { value: any }) => (
      <figure style={{ margin: '2rem 0' }}>
        {value.asset?.url && (
          <Image src={value.asset.url} alt={value.alt || ''} width={800} height={450} style={{ width: '100%', height: 'auto' }} />
        )}
        {value.caption && <figcaption style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', textAlign: 'center' }}>{value.caption}</figcaption>}
      </figure>
    ),
  },
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const post = await sanityClient.fetch(blogPostBySlugQuery, { slug })
  if (!post) notFound()

  const t = await getTranslations({ locale, namespace: 'blog' })
  const es = locale === 'es'

  const postTitle = (locale !== 'en' && post.translations?.[locale]?.title) || post.title
  const content = (locale !== 'en' && post.translations?.[locale]?.content) || post.content

  const relatedLinks = [
    ...(post.relatedAirports || []).map((a: any) => ({
      href: getAirportUrl(a, locale as Locale),
      label: getTranslatedTitle(a, locale as Locale),
      iata: a.iataCode,
    })),
    ...(post.relatedCities || []).map((c: any) => ({
      href: getCityUrl(c, locale as Locale),
      label: getTranslatedTitle(c, locale as Locale),
      iata: null,
    })),
  ]

  return (
    <>
      <SchemaOrg data={generateBlogPostingSchema({ title: postTitle, description: post.excerpt || postTitle, url: `/blog/${slug}/`, image: post.featuredImage?.asset?.url, publishDate: post.publishDate })} />

      {/* ─── HERO — split grid like airport pages ─────────────────────────── */}
      <section style={{ background: '#F8FAF0', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '480px' }}>

        {/* Left: content */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '6vw', paddingRight: '4vw', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <Breadcrumbs items={[{ label: 'Blog', href: '/blog/' }, { label: postTitle }]} variant="light" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {post.category && (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8BAA1D', background: '#e8f0c4', padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.08em', transform: 'skewX(-6deg)', display: 'inline-block' }}>
                {post.category}
              </span>
            )}
            {post.publishDate && (
              <time style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{formatDate(post.publishDate, locale)}</time>
            )}
          </div>

          <h1 className={russoOne.className} style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: '#242426', lineHeight: 1.1, marginBottom: '1.25rem' }}>
            {postTitle}
          </h1>

          {post.excerpt && (
            <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.75, maxWidth: '480px' }}>
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Right: featured image with diagonal clip */}
        <div style={{ position: 'relative', clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)' }}>
          {post.featuredImage?.asset?.url ? (
            <Image
              src={post.featuredImage.asset.url}
              alt={postTitle}
              fill
              priority
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              sizes="50vw"
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: '#242426' }} />
          )}
        </div>

      </section>

      {/* ─── CONTENT ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', padding: '4rem 6vw 5rem' }}>
        <div style={{ maxWidth: '820px' }}>

          {/* Article + inline blocks */}
          <div>
            {(() => {
              const blocks = content || []
              const third = Math.floor(blocks.length / 3)
              const mid   = Math.floor(blocks.length / 2)
              const part1 = blocks.slice(0, third)
              const part2 = blocks.slice(third, mid)
              const part3 = blocks.slice(mid)
              const hasRoutes = post.relatedRoutes?.length > 0
              return (
                <article className="prose prose-lg prose-headings:font-normal prose-h1:font-normal prose-h2:font-normal prose-h3:font-normal prose-headings:text-[#242426] prose-p:text-[#475569] prose-p:leading-relaxed prose-a:text-[#8BAA1D] prose-a:no-underline prose-strong:font-semibold prose-strong:text-[#242426] prose-li:text-[#475569]">
                  {part1.length > 0 && <PortableText value={part1} components={portableTextComponents} />}
                  {hasRoutes && (
                    <div className="not-prose">
                      <RouteInlineBlock routes={post.relatedRoutes} locale={locale as Locale} />
                    </div>
                  )}
                  {part2.length > 0 && <PortableText value={part2} components={portableTextComponents} />}
                  <div className="not-prose">
                    <InlineBookingBlock locale={locale} />
                  </div>
                  {part3.length > 0 && <PortableText value={part3} components={portableTextComponents} />}
                </article>
              )
            })()}

            {/* Fleet compact — always shown */}
            <FleetCompact />
          </div>

        </div>
      </section>
    </>
  )
}
