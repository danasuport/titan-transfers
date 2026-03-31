import { generateHreflangs, type HreflangLink } from '@/lib/seo/generateHreflangs'
import type { Locale } from '@/lib/i18n/config'

interface HreflangsProps {
  path: string
  translatedPaths: Partial<Record<Locale, string>>
}

export function Hreflangs({ path, translatedPaths }: HreflangsProps) {
  const links = generateHreflangs(path, translatedPaths)

  return (
    <>
      {links.map((link) => (
        <link key={link.locale} rel="alternate" hrefLang={link.locale} href={link.url} />
      ))}
    </>
  )
}
