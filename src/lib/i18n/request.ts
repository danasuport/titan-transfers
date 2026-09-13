import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import type { Locale } from './config'
import { withReviewFigures } from '@/lib/reviews'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: withReviewFigures((await import(`@/messages/${locale}.json`)).default, locale as Locale),
  }
})
