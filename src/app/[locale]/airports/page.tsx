import Image from 'next/image'
import { sanityClient } from '@/lib/sanity/client'
import { allAirportsQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { getAirportUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Link } from '@/lib/i18n/navigation'
import { AirportsClient } from '@/components/listings/AirportsClient'
import type { Locale } from '@/lib/i18n/config'
import { russoOne } from '@/lib/fonts'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Aeropuertos | Titan Transfers' : 'Airports | Titan Transfers',
    description: locale === 'es'
      ? 'Traslados privados desde 124 aeropuertos en todo el mundo. Precios fijos, conductor profesional, servicio 24/7.'
      : 'Private transfers from 124 airports worldwide. Fixed prices, professional driver, 24/7 service.',
  }
}

export default async function AirportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const airports = await sanityClient.fetch(allAirportsQuery)
  const es = locale === 'es'

  const grouped: Record<string, any[]> = {}
  for (const a of airports) {
    const country = a.country?.title || 'Other'
    if (!grouped[country]) grouped[country] = []
    grouped[country].push({
      _id: a._id,
      title: getTranslatedTitle(a, locale as Locale),
      iataCode: a.iataCode,
      href: getAirportUrl(a, locale as Locale),
      imgUrl: urlFor(a.featuredImage)?.width(600).height(400).quality(85).url() || null,
      country: a.country?.title || '',
      countrySlug: a.country?.slug?.current || null,
    })
  }

  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ background: '#F8FAF0', padding: '5rem 6vw 4rem' }}>
        <Breadcrumbs items={[{ label: es ? 'Aeropuertos' : 'Airports' }]} variant="light" />

        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ width: '48px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
          <h1 className={russoOne.className} style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: '#242426', lineHeight: 1.05, marginBottom: '1rem' }}>
            {es ? 'Aeropuertos' : 'Airports'}
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.75, maxWidth: '620px' }}>
            {es
              ? 'Traslados privados desde los principales aeropuertos del mundo. Conductor profesional, precio fijo y seguimiento de vuelo incluido.'
              : 'Private transfers from major airports worldwide. Professional driver, fixed price and flight monitoring included.'}
          </p>

          {/* Stats */}
          <div className="listing-stats-row" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            {[
              { n: '124', label: es ? 'aeropuertos' : 'airports' },
              { n: '30', label: es ? 'países' : 'countries' },
              { n: '24/7', label: es ? 'soporte' : 'support' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: '#ffffff', border: '1.5px solid #e5e7eb', padding: '1.5rem 1.75rem', transform: 'skewX(-6deg)', textAlign: 'center' }}>
                <div style={{ transform: 'skewX(6deg)' }}>
                  <div className={russoOne.className} style={{ fontSize: '2.25rem', color: '#6B8313', lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LISTING (client for search filter) ──────────────────────── */}
      <AirportsClient groups={sortedGroups} locale={locale as Locale} />
    </>
  )
}
