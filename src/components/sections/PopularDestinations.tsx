import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { sanityClient } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'

const FEATURED_SLUGS = [
  'barcelona', 'london', 'dubai', 'paris', 'rome', 'amsterdam', 'new-york', 'istanbul',
]

export async function PopularDestinations({ locale = 'en' }: { locale?: string }) {
  const t = await getTranslations({ locale, namespace: 'home' })

  const cities = await sanityClient.fetch(
    `*[_type == "city" && slug.current in $slugs]{
      _id, title, slug, featuredImage,
      country->{ title, slug },
      translations
    }`,
    { slugs: FEATURED_SLUGS }
  )

  const sorted = FEATURED_SLUGS
    .map(s => cities.find((c: { slug: { current: string } }) => c.slug.current === s))
    .filter(Boolean)

  if (sorted.length === 0) return null

  return (
    <section className="bg-dark-light py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-brand-500" />
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
            {t('popularDestinations')}
          </h2>
          <p className="text-lg text-body">{t('popularDestinationsDesc')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {sorted.map((city: { _id: string; title: string; slug: { current: string }; featuredImage?: { asset?: { _ref?: string } }; country?: { title: string; slug: { current: string } }; translations?: Record<string, { title?: string; slug?: { current: string } }> }) => {
            const cityTitle = (locale !== 'en' && city.translations?.[locale]?.title) || city.title
            const citySlug = (locale !== 'en' && city.translations?.[locale]?.slug?.current) || city.slug.current
            const imgUrl = urlFor(city.featuredImage)?.width(600).height(600).quality(75).auto('format').url()

            return (
              <Link
                key={city._id}
                href={`/city/${citySlug}/` as any}
                className="group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-glass-ring transition-all duration-500 hover:-translate-y-1 hover:ring-brand-500/40 hover:shadow-2xl hover:shadow-brand-500/10"
              >
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={`Private transfers in ${cityTitle}`}
                    fill
                    loading="lazy"
                    quality={75}
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-dark-card to-dark" />
                )}

                {/* Overlay — always dark on images */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-colors duration-500 group-hover:from-black/70" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Content — on image, text stays white */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  {city.country && (
                    <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-md ring-1 ring-white/10">
                      {city.country.title}
                    </span>
                  )}
                  <h3 className="text-lg font-extrabold text-white sm:text-xl">
                    {cityTitle}
                  </h3>
                </div>

                {/* Arrow — on image */}
                <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white opacity-0 backdrop-blur-md ring-1 ring-white/10 transition-all duration-300 group-hover:opacity-100 group-hover:bg-brand-500 group-hover:ring-brand-500/50 group-hover:shadow-lg group-hover:shadow-brand-500/25">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
