import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { allAirportsQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { getAirportUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { TrustNumbers } from '@/components/sections/TrustNumbers'
import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Aeropuertos | Titan Transfers' : 'Airports | Titan Transfers',
    description: locale === 'es'
      ? 'Todos los aeropuertos cubiertos por Titan Transfers. Traslados privados de aeropuerto con precios fijos.'
      : 'All airports covered by Titan Transfers. Private airport transfers with fixed prices.',
  }
}

export default async function AirportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const airports = await sanityClient.fetch(allAirportsQuery)
  const t = await getTranslations({ locale, namespace: 'nav' })

  const grouped = airports.reduce((acc: Record<string, typeof airports>, airport: { country?: { title: string; slug?: { current: string } } }) => {
    const country = airport.country?.title || 'Other'
    if (!acc[country]) acc[country] = []
    acc[country].push(airport)
    return acc
  }, {} as Record<string, typeof airports>)

  const totalAirports = airports.length
  const totalCountries = Object.keys(grouped).length

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-dark pb-20 pt-32">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-500/5 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-500/3 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: t('airports') }]} />

          <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:items-end">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-400 ring-1 ring-brand-500/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                {totalAirports} {t('airports')} · {totalCountries} {locale === 'es' ? 'países' : 'countries'}
              </div>
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-heading sm:text-5xl lg:text-6xl">
                {t('airports')}
              </h1>
              <p className="max-w-xl text-lg text-body">
                {locale === 'es'
                  ? 'Traslados privados desde los principales aeropuertos del mundo. Precios fijos, conductor profesional y servicio puerta a puerta.'
                  : 'Private transfers from major airports worldwide. Fixed prices, professional drivers, and door-to-door service.'}
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: `${totalAirports}+`, label: locale === 'es' ? 'Aeropuertos' : 'Airports', icon: 'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5' },
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([country, countryAirports]) => (
              <div key={country}>
                {/* Country header */}
                <div className="mb-8 flex items-center gap-4">
                  {(() => {
                    const countrySlug = (countryAirports as any[])[0]?.country?.slug?.current
                    const inner = (
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-extrabold tracking-tight text-heading">{country}</h2>
                          <span className="text-xs text-muted">{(countryAirports as any[]).length} {locale === 'es' ? 'aeropuertos' : 'airports'}</span>
                        </div>
                      </div>
                    )
                    return countrySlug ? (
                      <Link href={`/country/${countrySlug}/` as any} className="transition-opacity hover:opacity-80">{inner}</Link>
                    ) : inner
                  })()}
                  <div className="h-px flex-1 bg-gradient-to-r from-dark-border to-transparent" />
                </div>

                {/* Airport grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(countryAirports as any[]).map((airport: any) => {
                    const imgUrl = urlFor(airport.featuredImage)?.width(800).height(500).quality(85).url()
                    return (
                      <Link
                        key={airport._id}
                        href={getAirportUrl(airport, locale as Locale) as any}
                        className="group relative overflow-hidden rounded-2xl ring-1 ring-glass-ring transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/10 hover:ring-brand-500/40"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-dark-card">
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={getTranslatedTitle(airport, locale as Locale)}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-dark-card to-dark" />
                          )}
                          {/* Overlays — on image, always dark */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                          {/* IATA badge — on image */}
                          {airport.iataCode && (
                            <div className="absolute right-3 top-3 rounded-lg bg-black/40 px-3 py-1.5 text-xs font-extrabold tracking-widest text-brand-400 ring-1 ring-brand-500/30 backdrop-blur-md">
                              {airport.iataCode}
                            </div>
                          )}

                          {/* Content — on image, text stays white */}
                          <div className="absolute inset-x-0 bottom-0 p-5">
                            <h3 className="text-lg font-bold text-white transition-colors duration-300 group-hover:text-brand-400">
                              {getTranslatedTitle(airport, locale as Locale)}
                            </h3>
                          </div>

                          {/* Arrow — on image */}
                          <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white opacity-0 backdrop-blur-md ring-1 ring-white/10 transition-all duration-300 group-hover:opacity-100 group-hover:bg-brand-500 group-hover:ring-brand-500/50">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
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

      {/* Cross-links */}
      <section className="bg-dark-light py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/cities/" className="group rounded-2xl bg-glass-bg p-6 text-center ring-1 ring-glass-ring transition-all hover:ring-brand-500/40">
              <div className="mb-2 text-2xl font-extrabold text-brand-400">145+</div>
              <div className="font-semibold text-heading group-hover:text-brand-400">{locale === 'es' ? 'Ciudades' : 'Cities'}</div>
              <div className="mt-1 text-xs text-muted">{locale === 'es' ? 'Explorar ciudades' : 'Browse cities'}</div>
            </Link>
            <Link href="/countries/" className="group rounded-2xl bg-glass-bg p-6 text-center ring-1 ring-glass-ring transition-all hover:ring-brand-500/40">
              <div className="mb-2 text-2xl font-extrabold text-brand-400">30+</div>
              <div className="font-semibold text-heading group-hover:text-brand-400">{locale === 'es' ? 'Países' : 'Countries'}</div>
              <div className="mt-1 text-xs text-muted">{locale === 'es' ? 'Explorar países' : 'Browse countries'}</div>
            </Link>
            <Link href="/services/" className="group rounded-2xl bg-glass-bg p-6 text-center ring-1 ring-glass-ring transition-all hover:ring-brand-500/40">
              <div className="mb-2 text-2xl font-extrabold text-brand-400">4</div>
              <div className="font-semibold text-heading group-hover:text-brand-400">{locale === 'es' ? 'Servicios' : 'Services'}</div>
              <div className="mt-1 text-xs text-muted">{locale === 'es' ? 'Nuestros servicios' : 'Our services'}</div>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
