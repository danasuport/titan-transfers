import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { allRegionsQuery } from '@/lib/sanity/queries'
import { getRegionUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Link } from '@/lib/i18n/navigation'
import { RegionCard } from '@/components/ui/RegionCard'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { russoOne } from '@/lib/fonts'
import type { Locale } from '@/lib/i18n/config'

// ISR: rebuild this page in the background every hour. Reads (e.g. Sanity)
// stay cached so navigation feels instant; new content shows up within 1h
// or immediately via /api/revalidate.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'
  return {
    title: es
      ? 'Traslados privados por región | Europa, Asia, América | Titan Transfers'
      : 'Private Transfers by Region | Europe, Asia, Americas | Titan Transfers',
    description: es
      ? 'Traslados privados con precio fijo en todas las regiones del mundo. Conductor profesional, servicio puerta a puerta y cancelación gratuita.'
      : 'Fixed-price private transfers in every region worldwide. Professional driver, door-to-door service and free cancellation up to 24h before.',
  }
}

export default async function RegionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const regions = await sanityClient.fetch(allRegionsQuery)
  const t = await getTranslations({ locale, namespace: 'nav' })
  const es = locale === 'es'

  // Group by country
  const grouped = regions.reduce((acc: Record<string, { slug: string; regions: any[] }>, region: any) => {
    const countryTitle = region.country ? getTranslatedTitle(region.country, locale as Locale) : 'Other'
    const countrySlug = region.country?.slug?.current || ''
    if (!acc[countryTitle]) acc[countryTitle] = { slug: countrySlug, regions: [] }
    acc[countryTitle].regions.push(region)
    return acc
  }, {})

  const totalRegions = regions.length
  const totalCountries = Object.keys(grouped).length

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: es ? 'Traslados privados por región' : 'Private transfers by region',
    numberOfItems: totalRegions,
    itemListElement: regions.slice(0, 20).map((r: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: getTranslatedTitle(r, locale as Locale),
      url: `https://titantransfers.com${getRegionUrl(r, locale as Locale)}`,
    })),
  }

  return (
    <>
      <SchemaOrg data={itemListSchema} />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ background: '#F8FAF0', padding: '5rem 6vw 4rem' }}>
        <Breadcrumbs items={[{ label: t('regions') }]} variant="light" />

        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ width: '48px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
          <h1 className={russoOne.className} style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: '#242426', lineHeight: 1.05, marginBottom: '1rem' }}>
            {es ? 'Regiones' : 'Regions'}
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.75, maxWidth: '620px' }}>
            {es
              ? `Cubre ${totalRegions} regiones en ${totalCountries} países con traslados privados a precio fijo. Conductor profesional, servicio puerta a puerta y cancelación gratuita hasta 24h antes.`
              : `Covering ${totalRegions} regions across ${totalCountries} countries with fixed-price private transfers. Professional driver, door-to-door service and free cancellation up to 24h before.`}
          </p>

          {/* Stats */}
          <div className="listing-stats-row" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            {[
              { value: `${totalRegions}+`, label: es ? 'regiones' : 'regions' },
              { value: `${totalCountries}+`, label: es ? 'países' : 'countries' },
              { value: '4.8★', label: es ? 'valoración' : 'rating' },
            ].map((s) => (
              <div key={s.label} style={{ flex: 1, background: '#ffffff', border: '1.5px solid #e5e7eb', padding: '1.5rem 1.75rem', transform: 'skewX(-6deg)', textAlign: 'center' }}>
                <div style={{ transform: 'skewX(6deg)' }}>
                  <div className={russoOne.className} style={{ fontSize: '2.25rem', color: '#6B8313', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LISTING ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', padding: '5rem 6vw' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([country, { slug: countrySlug, regions: countryRegions }]) => (
            <div key={country}>
              {/* Country header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {countrySlug ? (
                    <Link href={(locale === 'es' ? `/traslados-privados-pais/${countrySlug}/` : `/private-transfers-country/${countrySlug}/`) as any} style={{ textDecoration: 'none' }}>
                      <span className={russoOne.className} style={{ fontSize: '1.1rem', color: '#6B8313', cursor: 'pointer' }}>
                        {country}
                      </span>
                    </Link>
                  ) : (
                    <span className={russoOne.className} style={{ fontSize: '1.1rem', color: '#6B8313' }}>{country}</span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {countryRegions.length} {es ? 'regiones' : 'regions'}
                  </span>
                </div>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              </div>

              {/* Regions grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' }}>
                {countryRegions.map((region: any) => (
                  <RegionCard key={region._id} href={getRegionUrl(region, locale as Locale)} title={getTranslatedTitle(region, locale as Locale)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

