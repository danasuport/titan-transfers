import { locales, defaultLocale, type Locale } from '@/lib/i18n/config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://titantransfers.com'

export interface HreflangLink {
  locale: string
  url: string
}

export function generateHreflangs(
  path: string,
  translatedPaths: Partial<Record<Locale, string>>
): HreflangLink[] {
  const links: HreflangLink[] = []

  for (const locale of locales) {
    const localePath = translatedPaths[locale] || path
    const prefix = locale === defaultLocale ? '' : `/${locale}`
    links.push({
      locale,
      url: `${SITE_URL}${prefix}${localePath}`,
    })
  }

  // x-default points to EN version
  const enPath = translatedPaths[defaultLocale] || path
  links.push({
    locale: 'x-default',
    url: `${SITE_URL}${enPath}`,
  })

  return links
}
