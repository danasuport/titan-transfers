import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import { PopularDestinationsCarousel } from './PopularDestinationsCarousel'

const FEATURED_SLUGS = [
  'spain', 'united-kingdom', 'france', 'italy', 'united-arab-emirates',
  'netherlands', 'united-states', 'turkey', 'germany', 'portugal',
  'czech-republic', 'greece', 'thailand', 'japan', 'australia',
]

const STATIC_FALLBACK = [
  { slug: 'spain',          title: 'Spain',           img: '/destinations/barcelona.jpg' },
  { slug: 'united-kingdom', title: 'United Kingdom',  img: '/destinations/london.jpg' },
  { slug: 'france',         title: 'France',          img: '/destinations/paris.jpg' },
  { slug: 'italy',          title: 'Italy',           img: '/destinations/rome.jpg' },
  { slug: 'united-arab-emirates', title: 'UAE',       img: '/destinations/dubai.jpg' },
  { slug: 'netherlands',    title: 'Netherlands',     img: '/destinations/amsterdam.jpg' },
  { slug: 'united-states',  title: 'United States',   img: '/destinations/new-york.jpg' },
  { slug: 'turkey',         title: 'Turkey',          img: '/destinations/istanbul.jpg' },
  { slug: 'germany',        title: 'Germany',         img: '/destinations/berlin.jpg' },
  { slug: 'portugal',       title: 'Portugal',        img: '/destinations/lisbon.jpg' },
  { slug: 'czech-republic', title: 'Czech Republic',  img: '/destinations/prague.jpg' },
  { slug: 'greece',         title: 'Greece',          img: '/destinations/athens.jpg' },
  { slug: 'thailand',       title: 'Thailand',        img: '/destinations/bangkok.jpg' },
  { slug: 'japan',          title: 'Japan',           img: '/destinations/tokyo.jpg' },
  { slug: 'australia',      title: 'Australia',       img: '/destinations/sydney.jpg' },
]

export async function PopularDestinations({ locale = 'en' }: { locale?: string }) {
  const t = await getTranslations({ locale, namespace: 'home' })

  const countries = await sanityClient.fetch(
    `*[_type == "country" && slug.current in $slugs]{
      _id, title, slug, featuredImage, translations
    }`,
    { slugs: FEATURED_SLUGS }
  )

  const sorted = FEATURED_SLUGS
    .map(s => countries.find((c: { slug: { current: string } }) => c.slug.current === s))
    .filter(Boolean)

  const mapped = sorted.length > 0
    ? sorted.map((country: {
        _id: string
        title: string
        slug: { current: string }
        featuredImage?: object
        translations?: Record<string, { title?: string; slug?: { current: string } }>
      }) => ({
        _id: country._id,
        title: country.title,
        slug: country.slug,
        imgUrl: urlFor(country.featuredImage)?.width(600).height(750).quality(75).auto('format').url() ?? `/destinations/${country.slug.current}.jpg`,
        country: undefined,
        localTitle: (locale !== 'en' && country.translations?.[locale]?.title) || country.title,
        localSlug: (locale !== 'en' && country.translations?.[locale]?.slug?.current) || country.slug.current,
        linkPrefix: locale === 'es' ? '/traslados-privados-taxi/pais/' : '/private-transfers/country/',
      }))
    : STATIC_FALLBACK.map(c => ({
        _id: c.slug,
        title: c.title,
        slug: { current: c.slug },
        imgUrl: c.img,
        country: undefined,
        localTitle: c.title,
        localSlug: c.slug,
        linkPrefix: locale === 'es' ? '/traslados-privados-taxi/pais/' : '/private-transfers/country/',
      }))

  return (
    <PopularDestinationsCarousel
      cities={mapped}
      heading={locale === 'es' ? 'Transfers privados en los destinos más populares' : 'Private transfers in the most popular destinations'}
      subheading={t('popularDestinationsDesc')}
    />
  )
}
