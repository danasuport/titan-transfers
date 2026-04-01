import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { allBlogPostsQuery } from '@/lib/sanity/queries'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { BlogCard } from '@/components/blog/BlogCard'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { russoOne } from '@/lib/fonts'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'
  return {
    title: es ? 'Blog de viajes y traslados | Titan Transfers' : 'Travel Guides, Airport Tips & Transfer News | Titan Transfers',
    description: es
      ? 'Guías de viaje, consejos para el aeropuerto, noticias de traslados y destinos de todo el mundo.'
      : 'Travel guides, airport tips, transfer news and destination guides from around the world.',
  }
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const posts = await sanityClient.fetch(allBlogPostsQuery)
  const t = await getTranslations({ locale, namespace: 'blog' })
  const es = locale === 'es'

  const [featured, ...rest] = posts

  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: es ? 'Blog de viajes | Titan Transfers' : 'Travel Blog | Titan Transfers',
    description: es ? 'Guías de viaje y consejos de traslado' : 'Travel guides and transfer tips',
    blogPost: posts.slice(0, 10).map((p: any) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `https://titantransfers.com/blog/${p.slug.current}/`,
      datePublished: p.publishDate,
    })),
  }

  return (
    <>
      <SchemaOrg data={blogListSchema} />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ background: '#F8FAF0', padding: '5rem 6vw 4rem' }}>
        <Breadcrumbs items={[{ label: 'Blog' }]} variant="light" />
        <div style={{ marginTop: '2rem', maxWidth: '640px' }}>
          <h1 className={russoOne.className} style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#242426', lineHeight: 1.05, marginBottom: '1.25rem' }}>
            {es ? 'Blog de viajes' : 'Travel blog'}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.75 }}>
            {es
              ? 'Guías de destinos, consejos para el aeropuerto y novedades del sector de los traslados privados.'
              : 'Destination guides, airport tips and news from the world of private transfers.'}
          </p>
        </div>
      </section>

      {/* ─── FEATURED POST ────────────────────────────────────────────────── */}
      {featured && (
        <section style={{ background: '#ffffff', padding: '4rem 6vw 0' }}>
          <div style={{ width: '48px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8BAA1D', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            {es ? 'Artículo destacado' : 'Featured article'}
          </p>
          <BlogCard post={featured} featured />
        </section>
      )}

      {/* ─── GRID ─────────────────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section style={{ background: '#ffffff', padding: '4rem 6vw 5rem' }}>
          <div style={{ width: '48px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
          <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#242426', marginBottom: '2rem' }}>
            {es ? 'Últimos artículos' : 'Latest articles'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {rest.map((post: any) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
