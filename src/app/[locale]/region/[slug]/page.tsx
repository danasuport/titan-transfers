import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { regionBySlugQuery, allRegionsQuery } from '@/lib/sanity/queries'
import { generatePageMetadata, generateRegionMetadata } from '@/lib/seo/generateMetadata'
import { generateTaxiServiceSchema } from '@/lib/seo/schemaOrg'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { BookingWidgetWrapper } from '@/components/booking/BookingWidgetWrapper'
import { RegionOverview } from '@/components/sections/RegionOverview'
import { FAQ } from '@/components/sections/FAQ'
import { LatestNews } from '@/components/sections/LatestNews'
import { PortableText } from '@portabletext/react'
import type { Locale } from '@/lib/i18n/config'

export async function generateStaticParams() {
  const regions = await sanityClient.fetch(allRegionsQuery)
  return regions.map((r: { slug: { current: string } }) => ({ slug: r.slug.current }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const region = await sanityClient.fetch(regionBySlugQuery, { slug })
  if (!region) return {}
  const { title, description } = generateRegionMetadata(region, locale as Locale)
  return generatePageMetadata({ title, description, path: `/region/${slug}/`, locale: locale as Locale, alternates: [{ locale: 'en' as Locale, path: `/region/${slug}/` }, { locale: 'es' as Locale, path: `/es/region/${region.translations?.es?.slug?.current || slug}/` }] })
}

export default async function RegionPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const region = await sanityClient.fetch(regionBySlugQuery, { slug })
  if (!region) notFound()

  const t = await getTranslations({ locale, namespace: 'region' })
  const regionTitle = (locale !== 'en' && region.translations?.[locale]?.title) || region.title
  const description = (locale !== 'en' && region.translations?.[locale]?.description) || region.description

  const breadcrumbs = [
    { label: region.country?.title || '', href: `/country/${region.country?.slug?.current}/` },
    { label: regionTitle },
  ]

  const faqItems = [
    { question: `How do I get to ${regionTitle} from the nearest airport?`, answer: `We offer private transfers from all airports serving ${regionTitle}. Use our booking widget to find available routes.` },
    { question: `Is there a private taxi service in ${regionTitle}?`, answer: `Yes, we offer private taxi services across ${regionTitle} with fixed prices and professional drivers.` },
    { question: `Which airport is closest to ${regionTitle}?`, answer: `Check the airports section above for the nearest airports serving ${regionTitle}.` },
  ]

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={breadcrumbs} />
      <SchemaOrg data={generateTaxiServiceSchema({ name: `${regionTitle} Transfers`, description: `Private transfers in ${regionTitle}`, url: `/region/${slug}/`, areaServed: regionTitle, rating: 4.8 })} />

      <h1 className="mb-8 text-3xl font-bold text-heading sm:text-4xl">
        {t('transfers', { region: regionTitle })}
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          {description && (
            <section className="prose max-w-none prose-headings:text-heading prose-p:text-body prose-li:text-body prose-strong:text-heading">
              <PortableText value={description} />
            </section>
          )}

          <section>
            <h2 className="mb-4 text-2xl font-bold text-heading">{t('airports', { region: regionTitle })}</h2>
            <RegionOverview airports={region.airports} />
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-heading">{t('destinations', { region: regionTitle })}</h2>
            <RegionOverview cities={region.cities} />
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-heading">{t('privateTaxi', { region: regionTitle })}</h2>
            <p className="text-body">Our private taxi services in {regionTitle} connect airports, hotels, and key destinations with fixed-price comfort.</p>
          </section>

          <LatestNews type="region" id={region._id} title={t('latestNews', { region: regionTitle })} />

          <FAQ items={faqItems} title={t('faq')} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingWidgetWrapper context={{ type: 'region', regionName: regionTitle }} />
        </aside>
      </div>
    </div>
  )
}
