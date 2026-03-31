import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { allRegionsQuery } from '@/lib/sanity/queries'
import { getRegionUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Regiones | Titan Transfers' : 'Regions | Titan Transfers',
    description: 'All regions covered by Titan Transfers.',
  }
}

export default async function RegionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const regions = await sanityClient.fetch(allRegionsQuery)
  const t = await getTranslations({ locale, namespace: 'nav' })

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: t('regions') }]} />
      <h1 className="mb-8 text-3xl font-bold text-heading sm:text-4xl">{t('regions')}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {regions.map((region: any) => (
          <Link
            key={region._id}
            href={getRegionUrl(region, locale as Locale) as any}
            className="group rounded-xl bg-dark-card p-6 ring-1 ring-glass-ring transition-all hover:ring-brand-500/30"
          >
            <h2 className="text-lg font-semibold text-heading transition-colors group-hover:text-brand-500">
              {getTranslatedTitle(region, locale as Locale)}
            </h2>
            {region.country && <p className="mt-1 text-sm text-muted">{getTranslatedTitle(region.country, locale as Locale)}</p>}
          </Link>
        ))}
      </div>
    </div>
  )
}
