'use client'

import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'

function IconCheck() {
  return (
    <svg className="h-4 w-4 flex-shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

export function WhyChooseUs() {
  const t = useTranslations('home')
  const tTrust = useTranslations('trust')

  const features = [
    tTrust('fixedPrice'),
    tTrust('freeCancel'),
    tTrust('meetGreet'),
  ]

  const stats = [
    { value: '120+', label: tTrust('airports') },
    { value: '30+', label: tTrust('countries') },
    { value: '24/7', label: tTrust('support') },
  ]

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* ── Left: Text ── */}
          <div>
            <h2 className="mb-4 text-3xl leading-tight text-gray-900 sm:text-4xl" style={{ fontFamily: 'var(--font-russo)' }}>
              {t('whyChooseTitle')}
            </h2>

            <p className="mb-8 max-w-md text-base leading-relaxed text-gray-500">
              {t('whyChooseSubtitle')}
            </p>

            {/* Feature list */}
            <ul className="mb-8 flex flex-wrap gap-x-8 gap-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <IconCheck />
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/services/"
              className="inline-block rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              {t('viewAllServices')}
            </Link>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap gap-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-extrabold text-brand-500">{s.value}</div>
                  <div className="mt-0.5 text-sm text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Image ── */}
          <div className="relative h-72 overflow-hidden rounded-2xl sm:h-80 lg:h-[420px] lg:rounded-3xl">
            <Image
              src="/vehicles/executive.jpg"
              alt="Passenger in luxury transfer"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
