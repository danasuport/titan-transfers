import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { getCityUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import type { Locale } from '@/lib/i18n/config'

interface City {
  _id: string
  title: string
  slug: { current: string }
  country?: { title: string; slug: { current: string } }
  translations?: Record<string, { title?: string; slug?: { current: string } }>
}

export function RelatedCities({ cities, title }: { cities: City[]; title?: string }) {
  const locale = useLocale() as Locale

  if (!cities || cities.length === 0) return null

  return (
    <section>
      {title && <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => {
          return (
            <Link
              key={city._id}
              href={getCityUrl(city, locale) as any}
              className="group flex items-center justify-between rounded-lg bg-white/[0.03] p-4 ring-1 ring-white/[0.06] transition-all hover:ring-brand-500/30 hover:shadow-sm"
            >
              <div>
                <h3 className="font-medium text-white transition-colors group-hover:text-brand-400">
                  {getTranslatedTitle(city, locale)}
                </h3>
                {city.country && <p className="mt-0.5 text-xs text-gray-400">{city.country.title}</p>}
              </div>
              <svg className="h-5 w-5 text-gray-500 transition-colors group-hover:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
