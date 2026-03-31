'use client'

import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'

const categories = [
  {
    href: '/airports/',
    labelKey: 'airports',
    count: '120+',
    icon: 'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5',
    color: 'from-brand-500/20 to-brand-500/5',
  },
  {
    href: '/cities/',
    labelKey: 'cities',
    count: '145+',
    icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
    color: 'from-blue-500/20 to-blue-500/5',
  },
  {
    href: '/countries/',
    labelKey: 'countries',
    count: '30+',
    icon: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418',
    color: 'from-purple-500/20 to-purple-500/5',
  },
  {
    href: '/services/',
    labelKey: 'services',
    count: '4',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z',
    color: 'from-brand-500/20 to-brand-500/5',
  },
]

export function BrowseCategories() {
  const t = useTranslations('nav')
  const locale = useLocale()

  return (
    <section className="bg-dark py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
            {locale === 'es' ? 'Explora por Categoría' : 'Browse by Category'}
          </h2>
          <p className="mx-auto max-w-2xl text-body">
            {locale === 'es'
              ? 'Encuentra tu traslado perfecto explorando aeropuertos, ciudades, países y servicios.'
              : 'Find your perfect transfer by browsing airports, cities, countries and services.'}
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.href}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                href={cat.href}
                className="group flex flex-col items-center rounded-2xl bg-glass-bg p-8 text-center ring-1 ring-glass-ring transition-all duration-300 hover:-translate-y-1 hover:ring-brand-500/40 hover:shadow-xl hover:shadow-brand-500/5"
              >
                <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.color} ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                  <svg className="h-7 w-7 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                  </svg>
                </div>
                <div className="mb-1 text-2xl font-extrabold text-brand-400">{cat.count}</div>
                <div className="text-base font-semibold text-heading transition-colors duration-300 group-hover:text-brand-400">
                  {t(cat.labelKey)}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
