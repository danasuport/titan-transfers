import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { allBlogPostsQuery } from '@/lib/sanity/queries'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { BlogCard } from '@/components/blog/BlogCard'
import { BlogPagination } from '@/components/blog/BlogPagination'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { russoOne } from '@/lib/fonts'
import { pick } from '@/lib/i18n/pick'
import { getLocalizedPath } from '@/lib/utils/slugHelpers'
import type { Locale } from '@/lib/i18n/config'

// ISR: rebuild this page in the background every hour. Reads (e.g. Sanity)
// stay cached so navigation feels instant; new content shows up within 1h
// or immediately via /api/revalidate.
export const revalidate = 3600

const PER_PAGE = 8

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: pick(locale, {
      en: 'Travel guides, airport tips & transfer news | Titan Transfers',
      es: 'Blog de viajes y traslados | Titan Transfers',
      ar: 'أدلة السفر ونصائح المطار وأخبار النقل | تايتن ترانسفرز',
      it: 'Blog di viaggi e trasferimenti | Titan Transfers',
    }),
    description: pick(locale, {
      en: 'Travel guides, airport tips, transfer news and destination guides from around the world.',
      es: 'Guías de viaje, consejos para el aeropuerto, noticias de traslados y destinos de todo el mundo.',
      ar: 'أدلة السفر، نصائح المطار، أخبار النقل، وأدلة الوجهات من حول العالم.',
      it: 'Guide di viaggio, consigli per l\'aeroporto, notizie sui trasferimenti e destinazioni in tutto il mondo.',
    }),
  }
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { locale } = await params
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10))

  const posts = await sanityClient.fetch(allBlogPostsQuery)
  const t = await getTranslations({ locale, namespace: 'blog' })

  const labels = {
    h1: pick(locale, { en: 'Travel blog', es: 'Blog de viajes', ar: 'مدونة السفر', it: 'Blog di viaggi' }),
    intro: pick(locale, {
      en: 'Destination guides, airport tips and news from the world of private transfers.',
      es: 'Guías de destinos, consejos para el aeropuerto y novedades del sector de los traslados privados.',
      ar: 'أدلة الوجهات، نصائح المطار، وأخبار من عالم النقل الخاص.',
      it: 'Guide di destinazione, consigli per l\'aeroporto e novità nel settore dei trasferimenti privati.',
    }),
    schemaName: pick(locale, {
      en: 'Travel blog | Titan Transfers',
      es: 'Blog de viajes | Titan Transfers',
      ar: 'مدونة السفر | تايتن ترانسفرز',
      it: 'Blog di viaggi | Titan Transfers',
    }),
    schemaDesc: pick(locale, {
      en: 'Travel guides and transfer tips',
      es: 'Guías de viaje y consejos de traslado',
      ar: 'أدلة السفر ونصائح النقل',
      it: 'Guide di viaggio e consigli sui trasferimenti',
    }),
  }

  const totalPages = Math.ceil(posts.length / PER_PAGE)
  const pagePosts = posts.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: labels.schemaName,
    description: labels.schemaDesc,
    blogPost: posts.slice(0, 10).map((p: any) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `https://titantransfers.com/blog/${p.slug.current}/`,
      datePublished: p.publishDate,
    })),
  }

  const blogSegment = getLocalizedPath('blog', locale as Locale)
  const localePrefix = locale === 'en' ? '' : `/${locale}`
  const basePath = `${localePrefix}/${blogSegment}/`

  return (
    <>
      <SchemaOrg data={blogListSchema} />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ background: '#F8FAF0', padding: '5rem 6vw 4rem' }}>
        <Breadcrumbs items={[{ label: 'Blog' }]} variant="light" />
        <div style={{ marginTop: '2rem', maxWidth: '640px' }}>
          <h1 className={russoOne.className} style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#242426', lineHeight: 1.05, marginBottom: '1.25rem' }}>
            {labels.h1}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.75 }}>
            {labels.intro}
          </p>
        </div>
      </section>

      {/* ─── GRID ─────────────────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', padding: '4rem 6vw 5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {pagePosts.map((post: any) => (
            <BlogCard key={post._id} post={post} featured />
          ))}
        </div>

        <BlogPagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
      </section>
    </>
  )
}
