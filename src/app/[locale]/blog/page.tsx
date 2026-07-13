import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { allBlogPostsQuery } from '@/lib/sanity/queries'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { BlogListing } from '@/components/blog/BlogListing'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { russoOne } from '@/lib/fonts'
import { pick } from '@/lib/i18n/pick'

// ISR: rebuild this page in the background every hour. Reads (e.g. Sanity)
// stay cached so navigation feels instant; new content shows up within 1h
// or immediately via /api/revalidate.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: pick(locale, {
      en: 'Travel guides, airport tips & transfer news | Titan Transfers',
      es: 'Blog de viajes y traslados | Titan Transfers',
      ar: 'أدلة السفر ونصائح المطار وأخبار النقل | تايتن ترانسفرز',
      it: 'Blog di viaggi e trasferimenti | Titan Transfers',
      de: 'Reiseführer, Flughafentipps & Transfernachrichten | Titan Transfers',
    }),
    description: pick(locale, {
      en: 'Travel guides, airport tips, transfer news and destination guides from around the world.',
      es: 'Guías de viaje, consejos para el aeropuerto, noticias de traslados y destinos de todo el mundo.',
      ar: 'أدلة السفر، نصائح المطار، أخبار النقل، وأدلة الوجهات من حول العالم.',
      it: 'Guide di viaggio, consigli per l\'aeroporto, notizie sui trasferimenti e destinazioni in tutto il mondo.',
      de: 'Reiseführer, Flughafentipps, Transfernachrichten und Zielanleitungen aus der ganzen Welt.',
    }),
  }
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const posts = await sanityClient.fetch(allBlogPostsQuery)
  const t = await getTranslations({ locale, namespace: 'blog' })

  const labels = {
    h1: pick(locale, { en: 'Travel blog', es: 'Blog de viajes', ar: 'مدونة السفر', it: 'Blog di viaggi', de: 'Reiseblog' }),
    intro: pick(locale, {
      en: 'Destination guides, airport tips and news from the world of private transfers.',
      es: 'Guías de destinos, consejos para el aeropuerto y novedades del sector de los traslados privados.',
      ar: 'أدلة الوجهات، نصائح المطار، وأخبار من عالم النقل الخاص.',
      it: 'Guide di destinazione, consigli per l\'aeroporto e novità nel settore dei trasferimenti privati.',
      de: 'Zielanleitungen, Flughafentipps und Nachrichten aus der Welt der privaten Transfers.',
    }),
    schemaName: pick(locale, {
      en: 'Travel blog | Titan Transfers',
      es: 'Blog de viajes | Titan Transfers',
      ar: 'مدونة السفر | تايتن ترانسفرز',
      it: 'Blog di viaggi | Titan Transfers',
      de: 'Reiseblog | Titan Transfers',
    }),
    schemaDesc: pick(locale, {
      en: 'Travel guides and transfer tips',
      es: 'Guías de viaje y consejos de traslado',
      ar: 'أدلة السفر ونصائح النقل',
      it: 'Guide di viaggio e consigli sui trasferimenti',
      de: 'Reiseführer und Transfer Tipps',
    }),
  }

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

      {/* ─── GRID + AJAX CATEGORY FILTER ──────────────────────────────────── */}
      <section style={{ background: '#ffffff', padding: '3rem 6vw 5rem' }}>
        <BlogListing posts={posts} />
      </section>
    </>
  )
}
