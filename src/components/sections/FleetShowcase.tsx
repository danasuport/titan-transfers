'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

function IconUsers({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
}
function IconCheck({ className = 'h-4 w-4' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
}

const vehicles = [
  { key: 'economy', pax: '1-3', img: '/vehicles/sedan.jpg' },
  { key: 'standard', pax: '1-4', img: '/vehicles/mpv.jpg' },
  { key: 'firstClass', pax: '1-3', img: '/vehicles/executive.jpg' },
  { key: 'minibus', pax: '5-16', img: '/vehicles/minibus.jpg' },
] as const

export function FleetShowcase() {
  const t = useTranslations('fleet')
  const tTrust = useTranslations('trust')

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
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121l-1.431-1.431A2.999 2.999 0 0017.466 9.5H15.75m-6 0V6.375m0 0a2.625 2.625 0 115.25 0M9.75 6.375v3.125" />
            </svg>
            {t('subtitle')}
          </div>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-heading sm:text-4xl lg:text-5xl">
            {t('title')}
          </h2>
          <p className="text-lg text-body">{t('subtitle')}</p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {vehicles.map((v, i) => (
            <motion.div
              key={v.key}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group overflow-hidden rounded-2xl bg-glass-bg ring-1 ring-glass-ring transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-500/10 hover:ring-brand-500/30"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={v.img}
                  alt={t(v.key)}
                  fill
                  loading="lazy"
                  quality={75}
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-card/90 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Pax badge — on image, keep white */}
                <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-dark/80 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm ring-1 ring-white/[0.06]">
                  <IconUsers className="h-3.5 w-3.5 text-brand-500" />
                  {v.pax}
                </div>
              </div>
              {/* Card body — not on image, use theme-aware colors */}
              <div className="p-5">
                <h3 className="mb-2 text-lg font-bold text-heading transition-colors duration-300 group-hover:text-brand-400">{t(v.key)}</h3>
                <p className="mb-4 text-sm leading-relaxed text-body">{t(`${v.key}Desc`)}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {[tTrust('fixedPrice'), tTrust('freeCancel')].map((feat) => (
                    <span key={feat} className="inline-flex items-center gap-1.5 text-xs text-muted">
                      <IconCheck className="h-3.5 w-3.5 text-brand-500" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
