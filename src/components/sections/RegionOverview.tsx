import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { getAirportUrl, getCityUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import type { Locale } from '@/lib/i18n/config'

interface RegionOverviewProps {
  airports?: Array<{ _id: string; title: string; slug: { current: string }; iataCode?: string; translations?: Record<string, { title?: string; slug?: { current: string } }> }>
  cities?: Array<{ _id: string; title: string; slug: { current: string }; translations?: Record<string, { title?: string; slug?: { current: string } }> }>
}

export function RegionOverview({ airports, cities }: RegionOverviewProps) {
  const locale = useLocale() as Locale

  return (
    <div className="space-y-8">
      {airports && airports.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {airports.map((a) => {
            return (
              <Link key={a._id} href={getAirportUrl(a, locale) as any} className="group flex items-center gap-3 rounded-lg bg-white/[0.03] p-3 ring-1 ring-white/[0.06] hover:ring-brand-500/30">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-brand-500/15 text-xs font-bold text-brand-400">{a.iataCode || <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>}</span>
                <span className="text-sm font-medium text-white group-hover:text-brand-400">{getTranslatedTitle(a, locale)}</span>
              </Link>
            )
          })}
        </div>
      )}
      {cities && cities.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {cities.map((c) => {
            return (
              <Link key={c._id} href={getCityUrl(c, locale) as any} className="rounded-lg bg-white/[0.03] p-3 text-sm font-medium text-white ring-1 ring-white/[0.06] hover:ring-brand-500/30 hover:text-brand-400">
                {getTranslatedTitle(c, locale)}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
