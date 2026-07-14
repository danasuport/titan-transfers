import Image from 'next/image'
import { staticPageAlternates } from '@/lib/seo/generateMetadata'
import { sanityClient } from '@/lib/sanity/client'
import { allCitiesQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { getCityUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CitiesClient } from '@/components/listings/CitiesClient'
import type { Locale } from '@/lib/i18n/config'
import { pick } from '@/lib/i18n/pick'
import { russoOne } from '@/lib/fonts'

// ISR: rebuild this page in the background every hour. Reads (e.g. Sanity)
// stay cached so navigation feels instant; new content shows up within 1h
// or immediately via /api/revalidate.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    alternates: staticPageAlternates('/cities/', locale),
    title: pick(locale, {
      en: 'Cities | Titan Transfers',
      es: 'Ciudades | Titan Transfers',
      ar: 'المدن | تايتن ترانسفرز',
      it: 'Città | Titan Transfers',
      de: 'Städte | Titan Transfers',
    }),
    description: pick(locale, {
      en: 'Private transfers to 186 cities worldwide. Fixed prices, professional driver, 24/7 service.',
      es: 'Traslados privados a 186 ciudades en todo el mundo. Precios fijos, conductor profesional, servicio 24/7.',
      ar: 'نقل خاص إلى ١٨٦ مدينة حول العالم. أسعار ثابتة، سائق محترف، خدمة على مدار الساعة.',
      it: 'Trasferimenti privati in 186 città in tutto il mondo. Prezzi fissi, autista professionale, servizio 24/7.',
      de: 'Private Transfers zu 186 Städten weltweit. Festpreise, professioneller Fahrer, 24/7 Service.',
    }),
  }
}

export default async function CitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const cities = await sanityClient.fetch(allCitiesQuery)

  const labels = {
    breadcrumb: pick(locale, { en: 'Cities', es: 'Ciudades', ar: 'المدن', it: 'Città', de: 'Städte' }),
    h1: pick(locale, { en: 'Cities', es: 'Ciudades', ar: 'المدن', it: 'Città', de: 'Städte' }),
    intro: pick(locale, {
      en: 'Private transfers to major cities worldwide. Door-to-door service with professional driver and fixed price.',
      es: 'Traslados privados a las principales ciudades del mundo. Servicio puerta a puerta con conductor profesional y precio fijo.',
      ar: 'نقل خاص إلى المدن الكبرى حول العالم. خدمة من الباب إلى الباب مع سائق محترف وسعر ثابت.',
      it: 'Trasferimenti privati nelle principali città del mondo. Servizio porta a porta con autista professionale e prezzo fisso.',
      de: 'Private Transfers zu großen Städten weltweit. Tür-zu-Tür-Service mit professionellem Fahrer und Festpreis.',
    }),
    statCities: pick(locale, { en: 'cities', es: 'ciudades', ar: 'مدينة', it: 'città', de: 'Städte' }),
    statCountries: pick(locale, { en: 'countries', es: 'países', ar: 'دولة', it: 'paesi', de: 'Länder' }),
    statRating: pick(locale, { en: 'rating', es: 'valoración', ar: 'تقييم', it: 'valutazione', de: 'Bewertung' }),
  }

  const grouped: Record<string, any[]> = {}
  for (const c of cities) {
    const country = c.country?.title || 'Other'
    if (!grouped[country]) grouped[country] = []
    grouped[country].push({
      _id: c._id,
      title: getTranslatedTitle(c, locale as Locale),
      href: getCityUrl(c, locale as Locale),
      imgUrl: urlFor(c.featuredImage)?.width(600).height(600).quality(75).auto('format').url() || null,
      country: c.country?.title || '',
      countrySlug: c.country?.slug?.current || null,
    })
  }

  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ background: '#F8FAF0', padding: '5rem 6vw 4rem' }}>
        <Breadcrumbs items={[{ label: labels.breadcrumb }]} variant="light" />

        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ width: '48px', height: '3px', background: '#8BAA1D', marginBottom: '1.25rem' }} />
          <h1 className={russoOne.className} style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: '#242426', lineHeight: 1.05, marginBottom: '1rem' }}>
            {labels.h1}
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.75, maxWidth: '620px' }}>
            {labels.intro}
          </p>

          {/* Stats */}
          <div className="listing-stats-row" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            {[
              { n: '186', label: labels.statCities },
              { n: '30', label: labels.statCountries },
              { n: '4.8★', label: labels.statRating },
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
      <CitiesClient groups={sortedGroups} locale={locale as Locale} />
    </>
  )
}
