import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { formatDistance, formatDuration } from '@/lib/utils/formatters'
import { getTranslatedTitle, getTranslatedSlug } from '@/lib/utils/slugHelpers'
import type { Locale } from '@/lib/i18n/config'

interface Route {
  _id: string
  title: string
  slug: { current: string }
  distance?: number
  estimatedDuration?: number
  destination?: { _id: string; title: string; slug: { current: string }; translations?: Record<string, { title?: string; slug?: { current: string } }> }
  translations?: Record<string, { title?: string; slug?: { current: string } }>
}

export function RoutesList({
  routes,
  airportSlug,
  cityName,
  title,
}: {
  routes: Route[]
  airportSlug: string
  cityName?: string
  title?: string
}) {
  const locale = useLocale() as Locale

  if (!routes || routes.length === 0) return null

  return (
    <section>
      {title && <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">{title}</h2>}
      <div className="grid gap-4 sm:grid-cols-2">
        {routes.map((route) => {
          const routeSlug = getTranslatedSlug(route, locale)
          const destTitle = route.destination ? getTranslatedTitle(route.destination, locale) : getTranslatedTitle(route, locale)

          return (
            <Link
              key={route._id}
              href={`/airport/${airportSlug}/${routeSlug}/` as any}
              className="group relative overflow-hidden rounded-2xl bg-dark-card p-5 ring-1 ring-glass-ring transition-all duration-300 hover:-translate-y-0.5 hover:ring-brand-500/30"
            >
              {/* Accent bar */}
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-brand-500 to-brand-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  {/* Origin → Destination */}
                  <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                    {cityName && (
                      <>
                        <span className="text-sm font-bold text-heading">{cityName}</span>
                        <svg className="h-4 w-4 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                    <span className="text-sm font-bold text-brand-500 group-hover:text-brand-400">
                      {destTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {route.distance && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-glass-bg px-2 py-0.5 text-xs font-medium text-muted">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        {formatDistance(route.distance)}
                      </span>
                    )}
                    {route.estimatedDuration && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-glass-bg px-2 py-0.5 text-xs font-medium text-muted">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {formatDuration(route.estimatedDuration)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-glass-bg text-muted transition-all duration-300 group-hover:bg-brand-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-brand-500/25">
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
