import type { MetadataRoute } from 'next'
import { sanityClient } from '@/lib/sanity/client'
import {
  sitemapAirportsQuery,
  sitemapRoutesQuery,
  sitemapCitiesQuery,
  sitemapCountriesQuery,
  sitemapRegionsQuery,
  sitemapServicesQuery,
  sitemapBlogPostsQuery,
} from '@/lib/sanity/queries'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://titantransfers.com'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [airports, routes, cities, countries, regions, services, blogPosts] = await Promise.all([
    sanityClient.fetch(sitemapAirportsQuery).catch(() => []),
    sanityClient.fetch(sitemapRoutesQuery).catch(() => []),
    sanityClient.fetch(sitemapCitiesQuery).catch(() => []),
    sanityClient.fetch(sitemapCountriesQuery).catch(() => []),
    sanityClient.fetch(sitemapRegionsQuery).catch(() => []),
    sanityClient.fetch(sitemapServicesQuery).catch(() => []),
    sanityClient.fetch(sitemapBlogPostsQuery).catch(() => []),
  ])

  const entries: MetadataRoute.Sitemap = []

  // Static pages
  const staticPages = [
    { path: '', freq: 'daily' as const, priority: 1.0 },
    { path: '/airports/', freq: 'weekly' as const, priority: 0.9 },
    { path: '/cities/', freq: 'weekly' as const, priority: 0.9 },
    { path: '/countries/', freq: 'weekly' as const, priority: 0.8 },
    { path: '/regions/', freq: 'weekly' as const, priority: 0.8 },
    { path: '/services/', freq: 'weekly' as const, priority: 0.9 },
    { path: '/blog/', freq: 'daily' as const, priority: 0.8 },
    { path: '/contact/', freq: 'monthly' as const, priority: 0.6 },
    { path: '/about/', freq: 'monthly' as const, priority: 0.6 },
    { path: '/faq/', freq: 'monthly' as const, priority: 0.7 },
  ]
  for (const page of staticPages) {
    entries.push({
      url: `${SITE_URL}${page.path}`,
      lastModified: new Date().toISOString(),
      changeFrequency: page.freq,
      priority: page.priority,
      alternates: {
        languages: {
          en: `${SITE_URL}${page.path}`,
          es: `${SITE_URL}/es${page.path || '/'}`,
        },
      },
    })
  }

  // Airports
  for (const airport of airports) {
    const esSlug = airport.translations?.es?.slug?.current || airport.slug.current
    entries.push({
      url: `${SITE_URL}/airport/${airport.slug.current}/`,
      lastModified: airport._updatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          en: `${SITE_URL}/airport/${airport.slug.current}/`,
          es: `${SITE_URL}/es/aeropuerto/${esSlug}/`,
        },
      },
    })
  }

  // Routes
  for (const route of routes) {
    if (!route.origin?.slug?.current) continue
    const esSlug = route.translations?.es?.slug?.current || route.slug.current
    entries.push({
      url: `${SITE_URL}/airport/${route.origin.slug.current}/${route.slug.current}/`,
      lastModified: route._updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${SITE_URL}/airport/${route.origin.slug.current}/${route.slug.current}/`,
          es: `${SITE_URL}/es/aeropuerto/${route.origin.slug.current}/${esSlug}/`,
        },
      },
    })
  }

  // Cities
  for (const city of cities) {
    const esSlug = city.translations?.es?.slug?.current || city.slug.current
    entries.push({
      url: `${SITE_URL}/city/${city.slug.current}/`,
      lastModified: city._updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${SITE_URL}/city/${city.slug.current}/`,
          es: `${SITE_URL}/es/ciudad/${esSlug}/`,
        },
      },
    })
  }

  // Countries
  for (const country of countries) {
    const esSlug = country.translations?.es?.slug?.current || country.slug.current
    entries.push({
      url: `${SITE_URL}/country/${country.slug.current}/`,
      lastModified: country._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/country/${country.slug.current}/`,
          es: `${SITE_URL}/es/pais/${esSlug}/`,
        },
      },
    })
  }

  // Regions
  for (const region of regions) {
    const esSlug = region.translations?.es?.slug?.current || region.slug.current
    entries.push({
      url: `${SITE_URL}/region/${region.slug.current}/`,
      lastModified: region._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/region/${region.slug.current}/`,
          es: `${SITE_URL}/es/region/${esSlug}/`,
        },
      },
    })
  }

  // Services
  for (const service of services) {
    const esSlug = service.translations?.es?.slug?.current || service.slug.current
    entries.push({
      url: `${SITE_URL}/services/${service.slug.current}/`,
      lastModified: service._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${SITE_URL}/services/${service.slug.current}/`,
          es: `${SITE_URL}/es/servicios/${esSlug}/`,
        },
      },
    })
  }

  // Blog Posts
  for (const post of blogPosts) {
    const esSlug = post.translations?.es?.slug?.current || post.slug.current
    entries.push({
      url: `${SITE_URL}/blog/${post.slug.current}/`,
      lastModified: post._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: {
          en: `${SITE_URL}/blog/${post.slug.current}/`,
          es: `${SITE_URL}/es/blog/${esSlug}/`,
        },
      },
    })
  }

  return entries
}
