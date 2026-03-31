'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { locales, localeNames, type Locale } from '@/lib/i18n/config'

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()

  function handleChange(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value as Locale)}
        className="cursor-pointer appearance-none rounded-lg border border-dark-border bg-dark-card py-1.5 pl-3 pr-8 text-sm font-medium text-heading transition-colors hover:border-brand-500/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        aria-label="Select language"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {l.toUpperCase()}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </div>
  )
}
