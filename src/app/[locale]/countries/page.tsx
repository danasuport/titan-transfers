import Image from 'next/image'
import { sanityClient } from '@/lib/sanity/client'
import { allCountriesQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { getCountryUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CountriesClient } from '@/components/listings/CountriesClient'
import type { Locale } from '@/lib/i18n/config'
import { russoOne } from '@/lib/fonts'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Países | Titan Transfers' : 'Countries | Titan Transfers',
    description: locale === 'es'
      ? 'Traslados privados en 30 países. Cobertura global con precios fijos y servicio profesional.'
      : 'Private transfers in 30 countries. Global coverage with fixed prices and professional service.',
  }
}

export default async function CountriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const countries = await sanityClient.fetch(allCountriesQuery)
  const es = locale === 'es'

  const items = countries.map((c: any) => ({
    _id: c._id,
    title: getTranslatedTitle(c, locale as Locale),
    href: getCountryUrl(c, locale as Locale),
    imgUrl: urlFor(c.featuredImage)?.width(800).height(500).quality(85).url() || null,
    airportCount: c.airportCount || 0,
    cityCount: c.cityCount || 0,
  }))

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ background: '#F8FAF0', padding: '5rem 6vw 4rem' }}>
        <Breadcrumbs items={[{ label: es ? 'Países' : 'Countries' }]} variant="light" />

        <div className="resp-listing-hero" style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'flex-end', gap: '3rem', marginTop: '1.5rem' }}>
          <div>
            <div style={{ width: '48px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
            <h1 className={russoOne.className} style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: '#242426', lineHeight: 1.05, marginBottom: '1rem' }}>
              {es ? 'Países' : 'Countries'}
            </h1>
            <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.75, maxWidth: '520px' }}>
              {es
                ? 'Cobertura en 30 países con precios fijos, conductor profesional y servicio puerta a puerta disponible 24/7.'
                : 'Coverage in 30 countries with fixed prices, professional driver and door-to-door service available 24/7.'}
            </p>
          </div>

          {/* Stats */}
          <div className="listing-stats-row" style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
            {[
              { n: '30', label: es ? 'países' : 'countries' },
              { n: '124', label: es ? 'aeropuertos' : 'airports' },
              { n: '186', label: es ? 'ciudades' : 'cities' },
            ].map(s => (
              <div key={s.label} style={{ background: '#ffffff', border: '1.5px solid #e5e7eb', padding: '1rem 1.25rem', transform: 'skewX(-6deg)', textAlign: 'center', minWidth: '80px' }}>
                <div style={{ transform: 'skewX(6deg)' }}>
                  <div className={russoOne.className} style={{ fontSize: '1.5rem', color: '#8BAA1D', lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LISTING (client for search filter) ──────────────────────── */}
      <CountriesClient items={items} locale={locale as Locale} />
    </>
  )
}
