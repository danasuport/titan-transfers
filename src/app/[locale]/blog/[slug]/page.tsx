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

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ background: '#F8FAF0', padding: '4rem 6vw 3rem' }}>
        <Breadcrumbs items={[{ label: 'Blog', href: '/blog/' }, { label: postTitle }]} variant="light" />

        <div style={{ maxWidth: '800px', marginTop: '1.5rem' }}>
          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {post.category && (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8BAA1D', background: '#e8f0c4', padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {post.category}
              </span>
            )}
            {post.publishDate && (
              <time style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{formatDate(post.publishDate, locale)}</time>
            )}
            {post.readTime && (
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>· {post.readTime} min read</span>
            )}
          </div>

          <h1 className={russoOne.className} style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', color: '#242426', lineHeight: 1.15, marginBottom: '1.25rem' }}>
            {postTitle}
          </h1>

          {post.excerpt && (
            <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.75 }}>
              {post.excerpt}
            </p>
          )}
        </div>
      </section>

      {/* ─── FEATURED IMAGE ───────────────────────────────────────────────── */}
      {post.featuredImage?.asset?.url && (
        <div style={{ paddingLeft: '6vw', paddingRight: '6vw', background: '#ffffff', paddingTop: '3rem' }}>
          <div style={{ position: 'relative', aspectRatio: '16/7', overflow: 'hidden', maxWidth: '900px', clipPath: 'polygon(0% 0%, 100% 0%, 97% 100%, 3% 100%)' }}>
            <Image
              src={post.featuredImage.asset.url}
              alt={postTitle}
              fill
              priority
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 1200px) 100vw, 900px"
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: '#8BAA1D' }} />
          </div>
        </div>
      )}

      {/* ─── CONTENT ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', padding: '4rem 6vw 5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '5rem', alignItems: 'start', maxWidth: '1200px' }}>

          {/* Article */}
          <article className="prose prose-lg prose-headings:font-normal prose-headings:text-[#242426] prose-p:text-[#475569] prose-p:leading-relaxed prose-a:text-[#8BAA1D] prose-a:no-underline prose-strong:text-[#242426] prose-li:text-[#475569]">
            {content && <PortableText value={content} components={portableTextComponents} />}
          </article>

          {/* Sidebar */}
          <aside style={{ position: 'sticky', top: '100px' }}>
            {/* Booking form */}
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8BAA1D', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                {es ? 'Reserva tu transfer' : 'Book your transfer'}
              </p>
              <BookingForm />
            </div>

            {/* Related links */}
            {relatedLinks.length > 0 && (
              <div style={{ border: '1.5px solid #e5e7eb', padding: '1.5rem' }}>
                <div style={{ width: '32px', height: '3px', background: '#8BAA1D', marginBottom: '1rem' }} />
                <h3 className={russoOne.className} style={{ fontSize: '0.95rem', color: '#242426', marginBottom: '1rem' }}>
                  {es ? 'Traslados relacionados' : 'Related transfers'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {relatedLinks.map((link) => (
                    <Link key={link.href} href={link.href as any} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', border: '1.5px solid #e5e7eb', transform: 'skewX(-6deg)', transition: 'border-color 0.15s' }}>
                        {link.iata && (
                          <span style={{ transform: 'skewX(6deg)', fontSize: '0.65rem', fontWeight: 700, color: '#8BAA1D', background: '#f0f4e3', padding: '1px 4px', flexShrink: 0 }}>
                            {link.iata}
                          </span>
                        )}
                        <span style={{ transform: 'skewX(6deg)', fontSize: '0.82rem', fontWeight: 600, color: '#242426' }}>{link.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  )
}
