'use client'

import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import { getServiceUrl } from '@/lib/utils/slugHelpers'
import type { Locale } from '@/lib/i18n/config'

function IconPlane({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
}
function IconShip({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
}
function IconTrain({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121l-1.431-1.431A2.999 2.999 0 0017.466 9.5H15.75m-6 0V6.375m0 0a2.625 2.625 0 115.25 0M9.75 6.375v3.125" /></svg>
}
function IconCar({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121L16.5 10.5M6 6.5h10.5" /></svg>
}

const servicesData = [
  { slugEn: 'airport-transfers', slugEs: 'traslados-aeropuerto', key: 'airportTransfers', descKey: 'airportTransfersDesc', Icon: IconPlane, img: '/services/airport-transfers.jpg', stat: '120+', statLabel: 'airports' },
  { slugEn: 'port-transfers', slugEs: 'traslados-puerto', key: 'portTransfers', descKey: 'portTransfersDesc', Icon: IconShip, img: '/services/port-transfers.jpg', stat: '30+', statLabel: 'ports' },
  { slugEn: 'train-station-transfers', slugEs: 'traslados-estacion-tren', key: 'trainStationTransfers', descKey: 'trainTransfersDesc', Icon: IconTrain, img: '/services/train-transfers.jpg', stat: '80+', statLabel: 'stations' },
  { slugEn: 'city-to-city', slugEs: 'ciudad-a-ciudad', key: 'cityToCity', descKey: 'cityToCityDesc', Icon: IconCar, img: '/services/city-to-city.jpg', stat: '200+', statLabel: 'routes' },
]

export function ServiceTypes() {
  const t = useTranslations('nav')
  const tHome = useTranslations('home')
  const locale = useLocale() as Locale
  const services = servicesData.map(s => ({ ...s, href: getServiceUrl(locale === 'es' ? s.slugEs : s.slugEn, locale) }))

  return (
    <section className="relative overflow-hidden bg-dark-light py-28">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-400 ring-1 ring-brand-500/20">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            {locale === 'es' ? 'Servicios premium' : 'Premium services'}
          </div>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-heading sm:text-4xl lg:text-5xl">
            {tHome('whyChooseUs')}
          </h2>
          <p className="text-lg leading-relaxed text-body">
            {tHome('servicesSubtitle')}
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          {services.map((s, i) => (
            <motion.div
              key={s.href}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={s.href}
                className="group relative grid overflow-hidden rounded-2xl ring-1 ring-glass-ring transition-all duration-500 hover:ring-brand-500/40 hover:shadow-2xl hover:shadow-brand-500/10 md:grid-cols-2"
              >
                {/* Image side */}
                <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[260px]">
                  <Image
                    src={s.img}
                    alt={t(s.key)}
                    fill
                    loading="lazy"
                    quality={75}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/40" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Stat badge on image */}
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-1.5 text-white backdrop-blur-sm ring-1 ring-white/10">
                    <span className="text-lg font-extrabold text-brand-400">{s.stat}</span>
                    <span className="text-xs uppercase tracking-wider opacity-80">{s.statLabel}</span>
                  </div>
                </div>

                {/* Content side */}
                <div className="flex flex-col justify-center bg-dark-card p-6 md:p-8">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20 transition-all duration-300 group-hover:bg-brand-500/20 group-hover:shadow-lg group-hover:shadow-brand-500/10">
                    <s.Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mb-2 text-xl font-extrabold tracking-tight text-heading transition-colors duration-300 group-hover:text-brand-400 sm:text-2xl">
                    {t(s.key)}
                  </h3>

                  <p className="mb-4 text-sm leading-relaxed text-body">
                    {tHome(s.descKey)}
                  </p>

                  {/* CTA arrow */}
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-400 transition-colors group-hover:text-brand-300">
                    {locale === 'es' ? 'Ver más' : 'Learn more'}
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all services link */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/services/"
            className="inline-flex items-center gap-3 rounded-xl bg-brand-500/10 px-8 py-4 text-base font-semibold text-brand-400 ring-1 ring-brand-500/20 transition-all duration-300 hover:bg-brand-500/20 hover:ring-brand-500/40 hover:shadow-lg hover:shadow-brand-500/10"
          >
            {locale === 'es' ? 'Ver todos los servicios' : 'View all services'}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
