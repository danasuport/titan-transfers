import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'

const searchQuery = `{
  "airports": *[_type == "airport" && (
    title match $q + "*" ||
    iataCode match $q + "*" ||
    city->title match $q + "*"
  )] | order(title asc) [0...5] {
    _id, title, iataCode,
    "slug": slug.current,
    "esSlug": translations.es.slug.current,
    "city": city->title,
    "country": country->title,
  },
  "cities": *[_type == "city" && (
    title match $q + "*" ||
    translations.es.title match $q + "*"
  )] | order(title asc) [0...5] {
    _id, title,
    "slug": slug.current,
    "esSlug": translations.es.slug.current,
    "country": country->title,
  },
  "countries": *[_type == "country" && (
    title match $q + "*" ||
    translations.es.title match $q + "*"
  )] | order(title asc) [0...4] {
    _id, title,
    "slug": slug.current,
    "esSlug": translations.es.slug.current,
  }
}`

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ airports: [], cities: [], countries: [] })

  const results = await sanityClient.fetch(searchQuery, { q })
  return NextResponse.json(results)
}
