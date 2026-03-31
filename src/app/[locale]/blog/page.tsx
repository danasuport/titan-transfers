import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { allBlogPostsQuery } from '@/lib/sanity/queries'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { BlogGrid } from '@/components/blog/BlogGrid'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Blog | Titan Transfers' : 'Travel News, Events & Transfer Guides | Titan Transfers',
    description: 'Travel news, events, transfer guides and tips from Titan Transfers.',
  }
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const posts = await sanityClient.fetch(allBlogPostsQuery)
  const t = await getTranslations({ locale, namespace: 'blog' })

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Blog' }]} />
      <h1 className="mb-8 text-3xl font-bold text-heading sm:text-4xl">{t('title')}</h1>

      <section>
        <h2 className="mb-6 text-2xl font-bold text-heading">{t('latestArticles')}</h2>
        <BlogGrid posts={posts} columns={3} />
      </section>
    </div>
  )
}
