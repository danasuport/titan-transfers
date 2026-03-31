import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { allCountriesQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { getCountryUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Países | Titan Transfers' : 'Countries | Titan Transfers',
    description: locale === 'es'
      ? 'Todos los países cubiertos por Titan Transfers. Traslados privados en todo el mundo.'
      : 'All countries covered by Titan Transfers. Private transfers worldwide.',
  }
}

export default async function CountriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const countries = await sanityClient.fetch(allCountriesQuery)
  const t = await getTranslations({ locale, namespace: 'nav' })

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-dark pb-16 pt-32">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-brand-500/5 blur-3xl" />
        <div className="relative w-full">
          <Breadcrumbs items={[{ label: t('countries') }]} />
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t('countries')}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-400">
            {locale === 'es'
              ? 'Traslados privados en más de 30 países. Cobertura global con precios fijos y servicio profesional.'
              : 'Private transfers in 30+ countries. Global coverage with fixed prices and professional service.'}
          </p>
        </div>
      </section>

      {/* Listing */}
      <section className="bg-dark py-16">
        <div className="site-container">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((country: any) => {
              const imgUrl = urlFor(country.featuredImage)?.width(800).height(500).quality(85).url()
              return (
                <Link
                  key={country._id}
                  href={getCountryUrl(country, locale as Locale) as any}
                  className="group relative overflow-hidden rounded-2xl ring-1 ring-white/[0.08] transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/10 hover:ring-brand-500/40"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-dark-card">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={getTranslatedTitle(country, locale as Locale)}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-dark-card to-dark" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                    {/* Brand glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    {/* Content overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <h2 className="mb-2 text-xl font-extrabold text-white transition-colors duration-300 group-hover:text-brand-400">
                        {getTranslatedTitle(country, locale as Locale)}
                      </h2>
                      <div className="flex gap-4 text-sm text-white/60">
                        {country.airportCount > 0 && (
                          <span className="flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                            {country.airportCount} {locale === 'es' ? 'aeropuertos' : 'airports'}
                          </span>
                        )}
                        {country.cityCount > 0 && (
                          <span className="flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
                            {country.cityCount} {locale === 'es' ? 'ciudades' : 'cities'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white opacity-0 backdrop-blur-md ring-1 ring-white/10 transition-all duration-300 group-hover:opacity-100 group-hover:bg-brand-500 group-hover:ring-brand-500/50 group-hover:shadow-lg group-hover:shadow-brand-500/25">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
