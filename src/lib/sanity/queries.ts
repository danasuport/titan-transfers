const groq = String.raw

// Translation fields helper
const translationFields = (locale: string) => `
  "translatedTitle": translations.${locale}.title,
  "translatedSlug": translations.${locale}.slug.current,
  "translatedDescription": translations.${locale}.description,
  "translatedSeoTitle": translations.${locale}.seoTitle,
  "translatedSeoDescription": translations.${locale}.seoDescription,
`

// Airport queries
export const allAirportsQuery = groq`*[_type == "airport"] | order(title asc) {
  _id, title, slug, iataCode,
  country->{ _id, title, slug },
  city->{ _id, title, slug },
  region->{ _id, title, slug },
  featuredImage,
  seoTitle, seoDescription,
  translations
}`

export const airportBySlugQuery = groq`*[_type == "airport" && (
  slug.current == $slug ||
  translations.es.slug.current == $slug ||
  city->slug.current + "-airport-transfers" == $slug
)][0] {
  _id, title, slug, iataCode,
  country->{ _id, title, slug, translations },
  city->{ _id, title, slug, translations },
  region->{ _id, title, slug, translations },
  coordinates,
  description,
  seoTitle, seoDescription,
  featuredImage, gallery,
  "routes": *[_type == "route" && origin._ref == ^._id] {
    _id, title, slug, distance, estimatedDuration,
    destination->{ _id, title, slug, translations },
    etoFromLocation, etoToLocation, etoFromCategory, etoToCategory,
    translations
  } | order(title asc),
  nearbyAirports[]->{ _id, title, slug, iataCode, translations },
  translations
}`

// Route queries
export const routeBySlugQuery = groq`*[_type == "route" && (slug.current == $routeSlug || translations.es.slug.current == $routeSlug) && (origin->slug.current == $originSlug || origin->translations.es.slug.current == $originSlug)][0] {
  _id, title, slug,
  origin->{
    _id, _type, title, slug, iataCode,
    city->{ _id, title, slug },
    translations
  },
  originType,
  destination->{ _id, title, slug, country->{ title, slug }, translations },
  country->{ _id, title, slug, translations },
  region->{ _id, title, slug, translations },
  distance, estimatedDuration,
  description,
  seoTitle, seoDescription,
  featuredImage{ asset->{ url }, alt },
  contentSections[]{ title, body, imagePosition, imageAlt, image{ asset->{ url } } },
  etoFromLocation, etoToLocation, etoFromCategory, etoToCategory,
  translations{
    es{
      title, slug, description, seoTitle, seoDescription,
      contentSections[]{ title, body, imagePosition, imageAlt, image{ asset->{ url } } }
    }
  }
}`

// City queries
export const allCitiesQuery = groq`*[_type == "city"] | order(title asc) {
  _id, title, slug,
  country->{ _id, title, slug },
  region->{ _id, title, slug },
  featuredImage,
  seoTitle, seoDescription,
  translations
}`

export const cityBySlugQuery = groq`*[_type == "city" && (slug.current == $slug || translations.es.slug.current == $slug)][0] {
  _id, title, slug,
  country->{ _id, title, slug, translations },
  region->{ _id, title, slug, translations },
  coordinates,
  description,
  seoTitle, seoDescription,
  featuredImage,
  nearbyAirports[]->{ _id, title, slug, iataCode, translations },
  nearbyPorts[]->{ _id, title, slug, translations },
  nearbyTrainStations[]->{ _id, title, slug, translations },
  relatedCities[]->{ _id, title, slug, country->{ title, slug }, translations },
  "routesTo": *[_type == "route" && destination._ref == ^._id] {
    _id, title, slug, distance, estimatedDuration,
    origin->{ _id, _type, title, slug, iataCode, translations },
    originType, translations
  } | order(title asc),
  "routesFrom": *[_type == "route" && origin._ref == ^._id] {
    _id, title, slug, distance, estimatedDuration,
    destination->{ _id, title, slug, translations },
    translations
  } | order(title asc),
  translations
}`

// Country queries
export const allCountriesQuery = groq`*[_type == "country"] | order(title asc) {
  _id, title, slug,
  featuredImage,
  seoTitle, seoDescription,
  "airportCount": count(*[_type == "airport" && country._ref == ^._id]),
  "cityCount": count(*[_type == "city" && country._ref == ^._id]),
  translations
}`

export const countryBySlugQuery = groq`*[_type == "country" && (slug.current == $slug || translations.es.slug.current == $slug)][0] {
  _id, title, slug,
  description,
  seoTitle, seoDescription,
  featuredImage,
  "airports": *[_type == "airport" && country._ref == ^._id] | order(title asc) {
    _id, title, slug, iataCode, translations
  },
  "cities": *[_type == "city" && country._ref == ^._id] | order(title asc) {
    _id, title, slug, translations
  },
  "regions": *[_type == "region" && country._ref == ^._id] | order(title asc) {
    _id, title, slug, translations
  },
  translations
}`

// Region queries
export const allRegionsQuery = groq`*[_type == "region"] | order(title asc) {
  _id, title, slug,
  country->{ _id, title, slug },
  featuredImage,
  seoTitle, seoDescription,
  translations
}`

export const regionBySlugQuery = groq`*[_type == "region" && (slug.current == $slug || translations.es.slug.current == $slug)][0] {
  _id, title, slug,
  country->{ _id, title, slug, translations },
  description,
  seoTitle, seoDescription,
  featuredImage,
  "cities": *[_type == "city" && region._ref == ^._id] | order(title asc) {
    _id, title, slug, translations
  },
  "airports": *[_type == "airport" && region._ref == ^._id] | order(title asc) {
    _id, title, slug, iataCode, translations
  },
  "routes": *[_type == "route" && region._ref == ^._id] | order(title asc) {
    _id, title, slug, distance, estimatedDuration,
    origin->{ _id, title, slug, translations },
    destination->{ _id, title, slug, translations },
    translations
  },
  translations
}`

// Service queries
export const allServicesQuery = groq`*[_type == "servicePage"] | order(title asc) {
  _id, title, slug, serviceType,
  featuredImage,
  seoTitle, seoDescription,
  translations
}`

export const serviceBySlugQuery = groq`*[_type == "servicePage" && (slug.current == $slug || translations.es.slug.current == $slug)][0] {
  _id, title, slug, serviceType,
  description,
  seoTitle, seoDescription,
  featuredImage,
  translations
}`

// Blog queries
export const allBlogPostsQuery = groq`*[_type == "blogPost"] | order(publishDate desc) {
  _id, title, slug, category, excerpt, publishDate,
  featuredImage { asset->{ url } },
  seoTitle, seoDescription,
  relatedCities[]->{ _id, title, slug },
  translations
}`

export const blogPostBySlugQuery = groq`*[_type == "blogPost" && (slug.current == $slug || translations.es.slug.current == $slug)][0] {
  _id, title, slug, category, content, excerpt, publishDate,
  featuredImage { asset->{ url } },
  seoTitle, seoDescription,
  relatedCities[]->{ _id, title, slug, country->{ title, slug }, translations },
  relatedAirports[]->{ _id, title, slug, iataCode, translations },
  relatedCountries[]->{ _id, title, slug, translations },
  relatedRegions[]->{ _id, title, slug, translations },
  relatedRoutes[]->{ _id, title, slug,
    origin->{ _id, title, slug, translations },
    destination->{ _id, title, slug, translations },
    translations
  },
  relatedServiceType,
  translations
}`

export const relatedBlogPostsQuery = groq`*[_type == "blogPost" && (
  ($type == "airport" && $id in relatedAirports[]._ref) ||
  ($type == "city" && $id in relatedCities[]._ref) ||
  ($type == "country" && $id in relatedCountries[]._ref) ||
  ($type == "region" && $id in relatedRegions[]._ref) ||
  ($type == "service" && relatedServiceType == $serviceType)
)] | order(publishDate desc) [0...$limit] {
  _id, title, slug, category, excerpt, publishDate,
  featuredImage,
  translations
}`

// Page queries
export const pageBySlugQuery = groq`*[_type == "page" && (slug.current == $slug || translations.es.slug.current == $slug)][0] {
  _id, title, slug, content,
  seoTitle, seoDescription,
  translations
}`

// Search query
export const searchQuery = groq`{
  "airports": *[_type == "airport" && (title match $searchTerm || iataCode match $searchTerm)] [0...5] {
    _id, title, slug, iataCode, _type, translations
  },
  "cities": *[_type == "city" && title match $searchTerm] [0...5] {
    _id, title, slug, _type, country->{ title }, translations
  },
  "countries": *[_type == "country" && title match $searchTerm] [0...3] {
    _id, title, slug, _type, translations
  },
  "regions": *[_type == "region" && title match $searchTerm] [0...3] {
    _id, title, slug, _type, translations
  }
}`

// Sitemap queries
export const sitemapAirportsQuery = groq`*[_type == "airport"] { slug, translations, _updatedAt }`
export const sitemapRoutesQuery = groq`*[_type == "route"] { slug, origin->{ slug }, translations, _updatedAt }`
export const sitemapCitiesQuery = groq`*[_type == "city"] { slug, translations, _updatedAt }`
export const sitemapCountriesQuery = groq`*[_type == "country"] { slug, translations, _updatedAt }`
export const sitemapRegionsQuery = groq`*[_type == "region"] { slug, translations, _updatedAt }`
export const sitemapServicesQuery = groq`*[_type == "servicePage"] { slug, translations, _updatedAt }`
export const sitemapBlogPostsQuery = groq`*[_type == "blogPost"] { slug, translations, _updatedAt }`
