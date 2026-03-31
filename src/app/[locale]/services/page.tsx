import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { TrustNumbers } from '@/components/sections/TrustNumbers'
import { Link } from '@/lib/i18n/navigation'
import { sanityClient } from '@/lib/sanity/client'
import { allServicesQuery } from '@/lib/sanity/queries'

const serviceConfig: Record<string, { img: string; icon: string; stats: { routes: string; airports: string } }> = {
  airport: {
    img: '/services/airport-transfers.jpg',
    icon: 'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5',
    stats: { routes: '350+', airports: '120+' },
  },
  port: {
    img: '/services/port-transfers.jpg',
    icon: 'M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z',
    stats: { routes: '50+', airports: '30+' },
  },
  trainStation: {
    img: '/services/train-transfers.jpg',
    icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121l-1.431-1.431A2.999 2.999 0 0017.466 9.5H15.75m-6 0V6.375m0 0a2.625 2.625 0 115.25 0M9.75 6.375v3.125',
    stats: { routes: '80+', airports: '40+' },
  },
  cityToCity: {
    img: '/services/city-to-city.jpg',
    icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121L16.5 10.5M6 6.5h10.5',
    stats: { routes: '200+', airports: '100+' },
  },
}

const descriptions: Record<string, Record<string, string>> = {
  airport: {
    en: 'Door-to-door private transfers from 120+ airports worldwide. Meet & greet service with flight monitoring.',
    es: 'Traslados privados puerta a puerta desde más de 120 aeropuertos en todo el mundo. Servicio meet & greet con monitoreo de vuelo incluido.',
  },
  port: {
    en: 'Comfortable transfers to and from major cruise ports. Your driver meets you right at the terminal.',
    es: 'Traslados cómodos hacia y desde los principales puertos de crucero. Tu conductor te espera en la terminal.',
  },
  trainStation: {
    en: 'Reliable pre-booked transfers from major train stations. Fixed price, no complications, always on time.',
    es: 'Traslados fiables y pre-reservados desde las principales estaciones de tren. Precio fijo, sin complicaciones, siempre a tiempo.',
  },
  cityToCity: {
    en: 'Private intercity transfers between major cities. Comfortable vehicles for longer journeys.',
    es: 'Traslados privados interurbanos entre las principales ciudades. Vehículos cómodos para viajes largos.',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es'
      ? 'Servicios de Traslados Privados | Titan Transfers'
      : 'Private Transfer Services | Titan Transfers',
    description: locale === 'es'
      ? 'Servicios de traslados privados: aeropuerto, puerto, estación de tren y ciudad a ciudad. Precios fijos, conductores profesionales y soporte 24/7.'
      : 'Private transfer services worldwide: airport, cruise port, train station and city-to-city. Fixed prices, professional drivers and 24/7 support.',
  }
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  const services = await sanityClient.fetch(allServicesQuery)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-dark pb-20 pt-32">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-500/5 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-500/3 blur-3xl" />

        <div className="relative w-full">
          <Breadcrumbs items={[{ label: t('services') }]} />

          <div className="mt-8 max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-400 ring-1 ring-brand-500/20">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
              {locale === 'es' ? '4 tipos de servicio' : '4 service types'}
            </div>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-heading sm:text-5xl lg:text-6xl">
              {locale === 'es' ? 'Nuestros Servicios' : 'Our Services'}
            </h1>
            <p className="max-w-xl text-lg text-body">
              {locale === 'es'
                ? 'Traslados privados para cada necesidad. Precios fijos, conductores profesionales y soporte 24/7 en todos nuestros servicios.'
                : 'Private transfers for every need. Fixed prices, professional drivers and 24/7 support across all our services.'}
            </p>
          </div>
        </div>
      </section>

      <TrustNumbers compact />

      {/* Service Cards */}
      <section className="bg-dark py-20">
        <div className="site-container">
          <div className="space-y-8">
            {services.map((s: any, i: number) => {
              const slug = locale === 'es'
                ? (s.translations?.es?.slug?.current || s.slug.current)
                : s.slug.current
              const title = locale === 'es'
                ? (s.translations?.es?.title || s.title)
                : s.title
              const config = serviceConfig[s.serviceType] || serviceConfig.airport
              const desc = descriptions[s.serviceType]

              return (
                <Link
                  key={s._id}
                  href={{ pathname: '/services/[slug]/' as any, params: { slug } }}
                  className="group relative grid overflow-hidden rounded-2xl ring-1 ring-glass-ring transition-all duration-500 hover:ring-brand-500/40 hover:shadow-2xl hover:shadow-brand-500/10 md:grid-cols-2"
                >
                  {/* Image side */}
                  <div className={`relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[320px] ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                    <Image
                      src={config.img}
                      alt={title}
                      fill
                      loading="lazy"
                      quality={75}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>

                  {/* Content side */}
                  <div className="flex flex-col justify-center bg-dark-card p-8 md:p-12">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
                      </svg>
                    </div>

                    <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-heading transition-colors duration-300 group-hover:text-brand-400 sm:text-3xl">
                      {title}
                    </h2>

                    <p className="mb-6 text-body leading-relaxed">
                      {desc?.[locale as string] || desc?.en}
                    </p>

                    {/* Mini stats */}
                    <div className="mb-6 flex gap-6">
                      <div>
                        <div className="text-xl font-extrabold text-heading">{config.stats.routes}</div>
                        <div className="text-xs text-muted">{locale === 'es' ? 'Rutas' : 'Routes'}</div>
                      </div>
                      <div>
                        <div className="text-xl font-extrabold text-heading">{config.stats.airports}</div>
                        <div className="text-xs text-muted">{locale === 'es' ? 'Destinos' : 'Destinations'}</div>
                      </div>
                      <div>
                        <div className="text-xl font-extrabold text-heading">24/7</div>
                        <div className="text-xs text-muted">{locale === 'es' ? 'Soporte' : 'Support'}</div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-400 transition-colors group-hover:text-brand-300">
                      {locale === 'es' ? 'Ver más' : 'Learn more'}
                      <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
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
