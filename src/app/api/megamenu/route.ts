import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'

const query = `{
  "airports": *[_type == "airport"] | order(title asc) {
    _id, title, iataCode,
    "slug": slug.current,
    "esSlug": translations.es.slug.current,
    "city": city->title,
    "country": country->title,
    "countrySlug": country->slug.current,
  },
  "cities": *[_type == "city"] | order(title asc) {
    _id, title,
    "slug": slug.current,
    "esSlug": translations.es.slug.current,
    "country": country->title,
    "countrySlug": country->slug.current,
  },
  "countries": *[_type == "country"] | order(title asc) {
    _id, title,
    "slug": slug.current,
    "esSlug": translations.es.slug.current,
    "airportCount": count(*[_type == "airport" && country._ref == ^._id]),
    "cityCount": count(*[_type == "city" && country._ref == ^._id]),
  }
}`

let cache: { data: unknown; ts: number } | null = null
const TTL = 5 * 60 * 1000 // 5 min

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL) {
    return NextResponse.json(cache.data)
  }
  const data = await sanityClient.fetch(query)
  cache = { data, ts: Date.now() }
  return NextResponse.json(data)
}
