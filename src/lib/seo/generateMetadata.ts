import type { Metadata } from 'next'
import { defaultLocale, locales, type Locale } from '@/lib/i18n/config'
import { routing } from '@/lib/i18n/routing'
import { pick } from '@/lib/i18n/pick'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://titantransfers.com'
const SITE_NAME = 'Titan Transfers'

// Google renders roughly 580px of title (~60 characters) and ~155 characters of
// description before cutting. Anything past that is invisible to the searcher,
// and a title that keeps getting truncated is one Google is more likely to
// rewrite on its own. These budgets are enforced on every page, including the
// seoTitle/seoDescription that come from Sanity — many of those were generated
// against a longer template (airport titles ran to 111 characters).
const TITLE_BUDGET = 60
const DESC_BUDGET = 155

/**
 * Fits a title into TITLE_BUDGET by dropping trailing `|` segments, least
 * important first — so "Atlanta Airport Transfers | Private Taxi & Chauffeur
 * Service | Titan Transfers" (111) becomes "Atlanta Airport Transfers" (25)
 * rather than being cut mid-word by the SERP.
 *
 * The head segment always carries the page's main keyword, so it is never
 * touched: a single long segment is left over-budget rather than truncated,
 * which would cost us the keyword itself.
 */
export function shortenTitle(title: string, keepBrand = false): string {
  const parts = title.split('|').map((p) => p.trim()).filter(Boolean)
  // `keepBrand` pins the trailing segment: on the home page the brand IS the
  // keyword we rank #1 for, so it must survive even at the cost of the budget.
  const floor = keepBrand ? 2 : 1
  while (parts.length > floor && parts.join(' | ').length > TITLE_BUDGET) {
    parts.splice(parts.length - (keepBrand ? 2 : 1), 1)
  }
  return parts.join(' | ')
}

/**
 * Fits a description into DESC_BUDGET, preferring to end on a complete
 * sentence. Falls back to a word boundary + ellipsis when there is no sentence
 * break to land on.
 */
export function clampDescription(desc: string): string {
  const text = desc.trim()
  if (text.length <= DESC_BUDGET) return text
  const window = text.slice(0, DESC_BUDGET)
  const lastStop = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '))
  if (lastStop > DESC_BUDGET * 0.6) return window.slice(0, lastStop + 1)
  const lastSpace = window.lastIndexOf(' ')
  return `${window.slice(0, lastSpace > 0 ? lastSpace : DESC_BUDGET).replace(/[,;:·—-]$/, '')}…`
}

/**
 * Builds the `alternates` metadata (self-canonical + hreflang languages) for a
 * static/listing page from its routing key (e.g. '/airports/'). Static pages
 * previously shipped with no canonical or hreflang, so Google treated the
 * localized variants as duplicates and left them unindexed.
 */
export function staticPageAlternates(routeKey: string, locale: string) {
  const map = (routing.pathnames as Record<string, unknown>)[routeKey]
  const localized = (l: Locale): string =>
    (typeof map === 'object' && map ? (map as Record<string, string>)[l] : undefined) || routeKey
  const pathFor = (l: Locale): string => (l === defaultLocale ? localized(l) : `/${l}${localized(l)}`)

  const languages: Record<string, string> = {}
  for (const l of locales) languages[l] = `${SITE_URL}${pathFor(l)}`
  languages['x-default'] = `${SITE_URL}${pathFor(defaultLocale)}`

  return {
    canonical: `${SITE_URL}${pathFor(locale as Locale)}`,
    languages,
  }
}

interface MetadataParams {
  title: string
  description: string
  path: string
  locale: Locale
  alternates?: { locale: Locale; path: string }[]
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  /** Keep the page out of the index (e.g. a route flagged `hidden` in Sanity). */
  noindex?: boolean
  /**
   * Never drop "| Titan Transfers" from the title, even over the 60-character
   * budget. For the home page and other pages that rank on the brand itself.
   */
  keepBrand?: boolean
}

export function generatePageMetadata({
  title,
  description,
  path,
  locale,
  alternates = [],
  image,
  type = 'website',
  publishedTime,
  noindex = false,
  keepBrand = false,
}: MetadataParams): Metadata {
  const url = `${SITE_URL}${path}`
  // The brand is a segment like any other: appended when it fits the budget,
  // dropped by shortenTitle when it doesn't. Social cards have no such limit,
  // so they always keep it.
  const brandedTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const fullTitle = shortenTitle(brandedTitle, keepBrand)
  const shortDescription = clampDescription(description)
  // Default social share image so links never preview blank; callers (e.g. blog
  // posts) can pass their own via `image`.
  const ogImage = image || `${SITE_URL}/hero-bg.jpg`

  const languages: Record<string, string> = {}
  for (const alt of alternates) {
    languages[alt.locale] = `${SITE_URL}${alt.path}`
  }
  languages['x-default'] = `${SITE_URL}${alternates.find((a) => a.locale === defaultLocale)?.path || path}`

  return {
    title: fullTitle,
    description: shortDescription,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: brandedTitle,
      description: shortDescription,
      url,
      siteName: SITE_NAME,
      locale: locale === 'es' ? 'es_ES' : locale === 'it' ? 'it_IT' : locale === 'ar' ? 'ar_AR' : locale === 'de' ? 'de_DE' : locale === 'fr' ? 'fr_FR' : 'en_GB',
      type,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      ...(publishedTime && { publishedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: brandedTitle,
      description: shortDescription,
      images: [ogImage],
    },
    robots: {
      index: !noindex,
      follow: !noindex,
    },
  }
}

export function generateAirportMetadata(
  airport: { title: string; seoTitle?: string; seoDescription?: string; translations?: Record<string, { title?: string; seoTitle?: string; seoDescription?: string }> },
  locale: Locale,
  cityTitle?: string,
) {
  const t = locale !== defaultLocale ? airport.translations?.[locale] : undefined
  const airportTitle = t?.title || airport.title
  const city = cityTitle || airportTitle

  // Most pages pass the city name, but when they can't we fall back to the
  // airport's own name — which usually already contains the word "airport" in
  // this locale. Saying it twice ("Flughafentransfer Flughafen San Andrés")
  // reads like a broken template, so those get a phrasing that doesn't repeat.
  const airportWord = pick(locale, {
    en: 'airport', es: 'aeropuerto', it: 'aeroporto', de: 'flughafen', fr: 'aéroport', ar: 'مطار',
  })
  const named = city.toLowerCase().includes(airportWord)

  const fallbackTitle = named
    ? pick(locale, {
        en: `${city} Transfers | Private Taxi, Fixed Price`,
        es: `Traslados ${city} | Taxi privado precio fijo`,
        it: `Trasferimenti ${city} | Taxi privato prezzo fisso`,
        de: `Transfers ${city} | Privattaxi zum Festpreis`,
        fr: `Transferts ${city} | Taxi privé prix fixe`,
        ar: `توصيل ${city} | تاكسي خاص بسعر ثابت`,
      })
    : pick(locale, {
        en: `${city} Airport Transfers | Private Taxi, Fixed Price`,
        es: `Traslados aeropuerto ${city} | Taxi privado precio fijo`,
        it: `Trasferimenti aeroporto ${city} | Taxi privato prezzo fisso`,
        de: `Flughafentransfer ${city} | Privattaxi zum Festpreis`,
        fr: `Transfert aéroport ${city} | Taxi privé prix fixe`,
        ar: `توصيل مطار ${city} | تاكسي خاص بسعر ثابت`,
      })
  const fallbackDesc = pick(locale, {
    en: `Private transfers from ${airportTitle}. Fixed price, meet & greet, free cancellation. Book online in 2 minutes.`,
    es: `Traslados privados desde ${airportTitle}. Precio fijo, recogida con cartel, cancelación gratis. Reserva online en 2 minutos.`,
    it: `Trasferimenti privati da ${airportTitle}. Prezzo fisso, accoglienza con cartello, cancellazione gratuita. Prenota online in 2 minuti.`,
    de: `Private Transfers ab ${airportTitle}. Festpreis, Empfang mit Namensschild, kostenlose Stornierung. Buchen Sie in 2 Minuten.`,
    fr: `Transferts privés depuis ${airportTitle}. Prix fixe, accueil avec pancarte, annulation gratuite. Réservez en 2 minutes.`,
    ar: `توصيل خاص من ${airportTitle}. سعر ثابت، استقبال بلافتة، إلغاء مجاني. احجز عبر الإنترنت في دقيقتين.`,
  })

  const title = t?.seoTitle || airport.seoTitle || fallbackTitle
  const description = t?.seoDescription || airport.seoDescription || fallbackDesc
  return { title, description }
}

export function generateRouteMetadata(
  route: { title: string; seoTitle?: string; seoDescription?: string; origin?: { title: string }; destination?: { title: string }; translations?: Record<string, { seoTitle?: string; seoDescription?: string }> },
  locale: Locale,
  /**
   * The route's real "from" price, already formatted for this locale (e.g.
   * "Desde 32,97 €"). Leading the snippet with a concrete price is the single
   * biggest CTR lever on a transfer SERP, and it's the one thing competitors
   * can't copy from a template. Omitted when the sheet has no price.
   */
  fromPrice?: string | null,
) {
  const t = locale !== defaultLocale ? route.translations?.[locale] : undefined
  const origin = route.origin?.title || ''
  const destination = route.destination?.title || ''

  const fallbackTitle = pick(locale, {
    en: `Private Transfer ${origin} to ${destination} | Fixed Price`,
    es: `Traslado privado ${origin} a ${destination} | Precio fijo`,
    it: `Transfer privato ${origin} - ${destination} | Prezzo fisso`,
    de: `Privattransfer ${origin} – ${destination} | Festpreis`,
    fr: `Transfert privé ${origin} - ${destination} | Prix fixe`,
    ar: `نقل خاص من ${origin} إلى ${destination} | سعر ثابت`,
  })
  const fallbackDesc = pick(locale, {
    en: `Book your private transfer from ${origin} to ${destination}. Fixed price, meet & greet, free cancellation.`,
    es: `Reserva tu traslado privado de ${origin} a ${destination}. Precio fijo, recogida con cartel, cancelación gratis.`,
    it: `Prenota il tuo trasferimento privato da ${origin} a ${destination}. Prezzo fisso, accoglienza con cartello, cancellazione gratuita.`,
    de: `Buchen Sie Ihren privaten Transfer von ${origin} nach ${destination}. Festpreis, Empfang mit Namensschild, kostenlose Stornierung.`,
    fr: `Réservez votre transfert privé de ${origin} à ${destination}. Prix fixe, accueil avec pancarte, annulation gratuite.`,
    ar: `احجز نقلك الخاص من ${origin} إلى ${destination}. سعر ثابت، استقبال بلافتة، إلغاء مجاني.`,
  })

  const title = t?.seoTitle || route.seoTitle || fallbackTitle
  const body = t?.seoDescription || route.seoDescription || fallbackDesc
  // The price goes in front so it survives the SERP's 155-character cut even
  // when the body (which may come from Sanity) is long.
  const description = fromPrice ? `${fromPrice}. ${body}` : body
  return { title, description }
}

export function generateCityMetadata(city: { title: string; seoTitle?: string; seoDescription?: string; translations?: Record<string, { title?: string; seoTitle?: string; seoDescription?: string }> }, locale: Locale) {
  const t = locale !== defaultLocale ? city.translations?.[locale] : undefined
  const cityTitle = t?.title || city.title

  const fallbackTitle = pick(locale, {
    en: `Private Transfers in ${cityTitle} | Airport Taxi, Fixed Price`,
    es: `Traslados privados en ${cityTitle} | Taxi aeropuerto`,
    it: `Trasferimenti privati a ${cityTitle} | Taxi aeroporto`,
    de: `Private Transfers in ${cityTitle} | Flughafentaxi`,
    fr: `Transferts privés à ${cityTitle} | Taxi aéroport`,
    ar: `نقل خاص في ${cityTitle} | تاكسي المطار بسعر ثابت`,
  })
  const fallbackDesc = pick(locale, {
    en: `Private transfers in ${cityTitle} at a fixed price. Airport, port and city-to-city rides with a professional driver. Book online 24/7.`,
    es: `Transfers privados en ${cityTitle} con precio fijo. Aeropuerto, puerto y ciudad a ciudad con conductor profesional. Reserva online 24/7.`,
    it: `Trasferimenti privati a ${cityTitle} a prezzo fisso. Aeroporto, porto e città a città con autista professionale. Prenota online 24/7.`,
    de: `Private Transfers in ${cityTitle} zum Festpreis. Flughafen, Hafen und Stadt zu Stadt mit professionellem Fahrer. Buchen Sie online, rund um die Uhr.`,
    fr: `Transferts privés à ${cityTitle} à prix fixe. Aéroport, port et ville à ville avec chauffeur professionnel. Réservez en ligne 24h/24.`,
    ar: `نقل خاص في ${cityTitle} بسعر ثابت. المطار والميناء ومن مدينة إلى أخرى مع سائق محترف. احجز عبر الإنترنت على مدار الساعة.`,
  })

  const title = t?.seoTitle || city.seoTitle || fallbackTitle
  const description = t?.seoDescription || city.seoDescription || fallbackDesc
  return { title, description }
}

export function generateCountryMetadata(country: { title: string; seoTitle?: string; seoDescription?: string; translations?: Record<string, { title?: string; seoTitle?: string; seoDescription?: string }> }, locale: Locale) {
  const t = locale !== defaultLocale ? country.translations?.[locale] : undefined
  const countryTitle = t?.title || country.title

  const fallbackTitle = pick(locale, {
    en: `Airport Transfers in ${countryTitle} | Fixed Price Taxi`,
    es: `Traslados privados en ${countryTitle} | Taxi precio fijo`,
    it: `Trasferimenti privati in ${countryTitle} | Prezzo fisso`,
    de: `Private Transfers in ${countryTitle} | Festpreis-Taxi`,
    fr: `Transferts privés en ${countryTitle} | Taxi prix fixe`,
    ar: `نقل خاص في ${countryTitle} | تاكسي بسعر ثابت`,
  })
  const fallbackDesc = pick(locale, {
    en: `Book private transfers across ${countryTitle}. Airport, port and city rides at a fixed price with professional drivers. 24/7 support.`,
    es: `Reserva tu transfer privado en ${countryTitle}. Aeropuertos, puertos y ciudades con precio fijo y conductor profesional. Soporte 24/7.`,
    it: `Prenota il tuo transfer privato in ${countryTitle}. Aeroporti, porti e città a prezzo fisso con autista professionale. Assistenza 24/7.`,
    de: `Buchen Sie private Transfers in ${countryTitle}. Flughäfen, Häfen und Städte zum Festpreis mit professionellem Fahrer. 24/7-Support.`,
    fr: `Réservez votre transfert privé en ${countryTitle}. Aéroports, ports et villes à prix fixe avec chauffeur professionnel. Assistance 24h/24.`,
    ar: `احجز نقلك الخاص في ${countryTitle}. المطارات والموانئ والمدن بسعر ثابت مع سائقين محترفين. دعم على مدار الساعة.`,
  })

  const title = t?.seoTitle || country.seoTitle || fallbackTitle
  const description = t?.seoDescription || country.seoDescription || fallbackDesc
  return { title, description }
}

export function generateRegionMetadata(region: { title: string; seoTitle?: string; seoDescription?: string; translations?: Record<string, { title?: string; seoTitle?: string; seoDescription?: string }> }, locale: Locale) {
  const t = locale !== defaultLocale ? region.translations?.[locale] : undefined
  const regionTitle = t?.title || region.title

  const fallbackTitle = pick(locale, {
    en: `Private Transfers in ${regionTitle} | Airport & Resort Taxi`,
    es: `Traslados privados en ${regionTitle} | Taxi aeropuerto`,
    it: `Trasferimenti privati in ${regionTitle} | Taxi aeroporto`,
    de: `Private Transfers in ${regionTitle} | Flughafen- & Resort-Taxi`,
    fr: `Transferts privés en ${regionTitle} | Taxi aéroport`,
    ar: `نقل خاص في ${regionTitle} | تاكسي المطار والمنتجعات`,
  })
  const fallbackDesc = pick(locale, {
    en: `Private transfers in ${regionTitle} at a fixed price. Airport to resort, city-to-city and more. Professional driver, free cancellation.`,
    es: `Traslados privados en ${regionTitle} con precio fijo. Aeropuerto a resort, ciudad a ciudad y más. Conductor profesional, cancelación gratis.`,
    it: `Trasferimenti privati in ${regionTitle} a prezzo fisso. Aeroporto, resort e città a città. Autista professionale, cancellazione gratuita.`,
    de: `Private Transfers in ${regionTitle} zum Festpreis. Flughafen zu Resort, Stadt zu Stadt und mehr. Professioneller Fahrer, kostenlose Stornierung.`,
    fr: `Transferts privés en ${regionTitle} à prix fixe. Aéroport vers resort, ville à ville et plus. Chauffeur professionnel, annulation gratuite.`,
    ar: `نقل خاص في ${regionTitle} بسعر ثابت. من المطار إلى المنتجع ومن مدينة إلى أخرى. سائق محترف وإلغاء مجاني.`,
  })

  const title = t?.seoTitle || region.seoTitle || fallbackTitle
  const description = t?.seoDescription || region.seoDescription || fallbackDesc
  return { title, description }
}

export function generateBlogMetadata(post: { title: string; seoTitle?: string; seoDescription?: string; excerpt?: string; translations?: Record<string, { title?: string; seoTitle?: string; seoDescription?: string }> }, locale: Locale) {
  const t = locale !== defaultLocale ? post.translations?.[locale] : undefined
  const title = t?.seoTitle || post.seoTitle || `${t?.title || post.title} | ${SITE_NAME} Blog`
  const description = t?.seoDescription || post.seoDescription || post.excerpt || post.title
  return { title, description }
}
