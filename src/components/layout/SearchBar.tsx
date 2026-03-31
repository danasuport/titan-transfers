'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/lib/i18n/navigation'
import { sanityClient } from '@/lib/sanity/client'
import { searchQuery } from '@/lib/sanity/queries'
import { getTranslatedTitle, getAirportUrl, getCityUrl, getCountryUrl, getRegionUrl } from '@/lib/utils/slugHelpers'
import type { Locale } from '@/lib/i18n/config'

interface SearchResult {
  _id: string
  _type: string
  title: string
  slug: { current: string }
  iataCode?: string
  country?: { title: string }
  translations?: Record<string, { title?: string; slug?: { current: string } }>
}

export function SearchBar() {
  const t = useTranslations('common')
  const nav = useTranslations('nav')
  const locale = useLocale() as Locale
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ airports: SearchResult[]; cities: SearchResult[]; countries: SearchResult[]; regions: SearchResult[] } | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults(null)
      return
    }
    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await sanityClient.fetch(searchQuery, { searchTerm: `${query}*` })
        setResults(data)
        setOpen(true)
      } catch {
        setResults(null)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  function navigateTo(item: SearchResult) {
    const urlMap: Record<string, string> = {
      airport: getAirportUrl(item, locale),
      city: getCityUrl(item, locale),
      country: getCountryUrl(item, locale),
      region: getRegionUrl(item, locale),
    }
    router.push((urlMap[item._type] || '/') as any)
    setOpen(false)
    setQuery('')
  }

  const hasResults = results && (results.airports.length > 0 || results.cities.length > 0 || results.countries.length > 0 || results.regions.length > 0)

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setOpen(true)}
          placeholder={t('searchPlaceholder')}
          className="w-48 rounded-lg border border-dark-border bg-dark-card py-1.5 pl-9 pr-3 text-sm text-heading transition-all placeholder:text-muted focus:w-64 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-dark-border bg-dark-card shadow-lg">
          {loading && <p className="p-4 text-sm text-muted">{t('loading')}</p>}
          {!loading && !hasResults && query.length >= 2 && (
            <p className="p-4 text-sm text-muted">{t('noResults')}</p>
          )}
          {!loading && hasResults && (
            <div className="max-h-80 overflow-y-auto p-2">
              {results!.airports.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-xs font-semibold uppercase text-muted">{nav('airports')}</p>
                  {results!.airports.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => navigateTo(item)}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-brand-500/10"
                    >
                      <span className="font-medium text-heading">{getTranslatedTitle(item, locale)}</span>
                      {item.iataCode && <span className="rounded bg-brand-500/10 px-1.5 py-0.5 text-xs text-brand-400">{item.iataCode}</span>}
                    </button>
                  ))}
                </div>
              )}
              {results!.cities.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-xs font-semibold uppercase text-muted">{nav('cities')}</p>
                  {results!.cities.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => navigateTo(item)}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-brand-500/10"
                    >
                      <span className="font-medium text-heading">{getTranslatedTitle(item, locale)}</span>
                      {item.country && <span className="text-xs text-muted">{item.country.title}</span>}
                    </button>
                  ))}
                </div>
              )}
              {results!.countries.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-xs font-semibold uppercase text-muted">{nav('countries')}</p>
                  {results!.countries.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => navigateTo(item)}
                      className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-heading hover:bg-brand-500/10"
                    >
                      {getTranslatedTitle(item, locale)}
                    </button>
                  ))}
                </div>
              )}
              {results!.regions.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-xs font-semibold uppercase text-muted">{nav('regions')}</p>
                  {results!.regions.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => navigateTo(item)}
                      className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-heading hover:bg-brand-500/10"
                    >
                      {getTranslatedTitle(item, locale)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
