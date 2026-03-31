import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { getAirportUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import type { Locale } from '@/lib/i18n/config'

interface Airport {
  _id: string
  title: string
  slug: { current: string }
  iataCode?: string
  translations?: Record<string, { title?: string; slug?: { current: string } }>
}

export function NearbyAirports({ airports, title }: { airports: Airport[]; title?: string }) {
  const locale = useLocale() as Locale

  if (!airports || airports.length === 0) return null

  return (
    <section>
      {title && <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title}</h2>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {airports.map((airport) => {
          return (
            <Link
              key={airport._id}
              href={getAirportUrl(airport, locale) as any}
              className="group relative overflow-hidden rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.06] transition-all duration-300 hover:-translate-y-0.5 hover:ring-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-brand-500 to-brand-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-md shadow-brand-500/20">
                  {airport.iataCode || <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>}
                </div>
                <div className="min-w-0">
                  <span className="block truncate font-semibold text-white transition-colors group-hover:text-brand-400">
                    {getTranslatedTitle(airport, locale)}
                  </span>
                  {airport.iataCode && (
                    <span className="text-xs text-gray-400">{airport.iataCode}</span>
                  )}
                </div>
                <div className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-gray-500 transition-all duration-300 group-hover:bg-brand-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-brand-500/25">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
