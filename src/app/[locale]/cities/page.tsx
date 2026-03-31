import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { allCitiesQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { getCityUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { TrustNumbers } from '@/components/sections/TrustNumbers'
import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Ciudades | Titan Transfers' : 'Cities | Titan Transfers',
    description: locale === 'es'
      ? 'Todas las ciudades cubiertas por Titan Transfers. Traslados privados con precios fijos.'
      : 'All cities covered by Titan Transfers. Private transfers with fixed prices.',
  }
}

export default async function CitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const cities = await sanityClient.fetch(allCitiesQuery)
  const t = await getTranslations({ locale, namespace: 'nav' })

  const grouped = cities.reduce((acc: Record<string, typeof cities>, city: { country?: { title: string } }) => {
    const country = city.country?.title || 'Other'
    if (!acc[country]) acc[country] = []
    acc[country].push(city)
    return acc
  }, {} as Record<string, typeof cities>)

  const totalCities = cities.length
  const totalCountries = Object.keys(grouped).length

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-dark pb-20 pt-32">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-500/5 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-500/3 blur-3xl" />

        <div className="relative w-full">
          <Breadcrumbs items={[{ label: t('cities') }]} />

          <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:items-end">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-400 ring-1 ring-brand-500/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
                {totalCities} {t('cities')} · {totalCountries} {locale === 'es' ? 'países' : 'countries'}
              </div>
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-heading sm:text-5xl lg:text-6xl">
                {t('cities')}
              </h1>
              <p className="max-w-xl text-lg text-body">
                {locale === 'es'
                  ? 'Traslados privados en las principales ciudades del mundo. Servicio puerta a puerta con conductor profesional.'
                  : 'Private transfers in major cities worldwide. Door-to-door service with professional drivers.'}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: `${totalCities}+`, label: locale === 'es' ? 'Ciudades' : 'Cities', icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z' },
                { value: '24/7', label: locale === 'es' ? 'Soporte' : 'Support', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
                { value: '4.8★', label: locale === 'es' ? 'Valoración' : 'Rating', icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-glass-bg p-5 text-center ring-1 ring-glass-ring backdrop-blur-sm">
                  <svg className="mx-auto mb-2 h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} /></svg>
                  <div className="text-2xl font-extrabold text-heading">{stat.value}</div>
                  <div className="mt-0.5 text-xs text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TrustNumbers compact />

      {/* Listing */}
      <section className="bg-dark py-20">
        <div className="site-container">
          <div className="space-y-20">
            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([country, countryCities]) => (
              <div key={country}>
                {/* Country header */}
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight text-heading">{country}</h2>
                      <span className="text-xs text-muted">{(countryCities as any[]).length} {locale === 'es' ? 'ciudades' : 'cities'}</span>
                    </div>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-dark-border to-transparent" />
                </div>

                {/* City grid */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  {(countryCities as any[]).map((city: any, i: number) => {
                    const imgUrl = urlFor(city.featuredImage)?.width(600).height(600).quality(85).url()
                    const isFirst = i === 0 && (countryCities as any[]).length > 2

                    return (
                      <Link
                        key={city._id}
                        href={getCityUrl(city, locale as Locale) as any}
                        className={`group relative overflow-hidden rounded-2xl ring-1 ring-glass-ring transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/10 hover:ring-brand-500/40 ${isFirst ? 'col-span-2 row-span-2' : ''}`}
                      >
                        <div className={`relative overflow-hidden bg-dark-card ${isFirst ? 'aspect-square' : 'aspect-square'}`}>
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={getTranslatedTitle(city, locale as Locale)}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                              sizes={isFirst ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-dark-card to-dark" />
                          )}
                          {/* Overlays — on image, always dark */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                          {/* Content — on image, text stays white */}
                          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                            <h3 className={`font-bold text-white transition-colors duration-300 group-hover:text-brand-400 ${isFirst ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
                              {getTranslatedTitle(city, locale as Locale)}
                            </h3>
                          </div>

                          {/* Arrow — on image */}
                          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white opacity-0 backdrop-blur-md ring-1 ring-white/10 transition-all duration-300 group-hover:opacity-100 group-hover:bg-brand-500 group-hover:ring-brand-500/50">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
