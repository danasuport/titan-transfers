import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'

const query = `{
  "airports": *[_type == "airport"] | order(title asc) {
    _id, title, iataCode,
    "slug": slug.current,
    "esSlug": translations.es.slug.current,
    "arSlug": translations.ar.slug.current,
    "arTitle": translations.ar.title,
    "city": city->title,
    "country": country->title,
    "countryAr": country->translations.ar.title,
    "countrySlug": country->slug.current,
  },
  "cities": *[_type == "city"] | order(title asc) {
    _id, title,
    "slug": slug.current,
    "esSlug": translations.es.slug.current,
    "arSlug": translations.ar.slug.current,
    "arTitle": translations.ar.title,
    "country": country->title,
    "countryAr": country->translations.ar.title,
    "countrySlug": country->slug.current,
    "isAirportCity": count(*[_type == "airport" && city._ref == ^._id]) > 0,
    "origins": count(array::unique(*[_type == "route" && destination._ref == ^._id].origin._ref)),
    "hasText": defined(description) || count(contentSections) > 0,
    "hasPhoto": defined(featuredImage.asset),
  },
  "countries": *[_type == "country"] | order(title asc) {
    _id, title,
    "slug": slug.current,
    "esSlug": translations.es.slug.current,
    "arSlug": translations.ar.slug.current,
    "arTitle": translations.ar.title,
    "airportCount": count(*[_type == "airport" && country._ref == ^._id]),
    "cityCount": count(*[_type == "city" && country._ref == ^._id]),
  }
}`

/**
 * Every route destination becomes a city document, so "cities" holds the
 * client's own wording for pickup points: campsites, golf resorts, hotel
 * complexes, bare IATA codes, and names carrying a suffix from the pricing
 * sheet ("Bilbao ciudad", "Copenhagen City Centre"). Those are fine as a
 * destination on a transfer page and wrong in a menu of cities, so they never
 * reach the menu at all — not even through its search box.
 */
const NOT_A_CITY = [
  /c[áa]mping/i,
  /\b(hotel|hostel|resort|villas?|apartments?|lodge|inn|spa|golf club|club med|bungalow)\b/i,
  /^[A-Z]{3}$/,
  /\b(airport|aeropuerto|pier|terminal|cruiseport)\b/i,
  /\b(city cent(er|re)|centro ciudad|downtown|outskirts|beach hotels)\b/i,
  /\bciudad\b/i,
  /\bzona \d/i,
  /^\d/,
]

/**
 * How many of a country's cities the menu shows before it stops. Spain alone
 * has 446 of them — mostly single-route villages around Málaga — and listing
 * every one turns the panel into a wall of names nobody scrolls. The country
 * heading is already a link to the country page, which does list them all.
 */
const PER_COUNTRY = 12

interface MenuCity {
  _id: string
  title: string
  country?: string
  isAirportCity?: boolean
  origins?: number
  hasText?: boolean
  hasPhoto?: boolean
  primary?: boolean
}

/**
 * Ranks a city by how likely someone is to browse for it. A city we fly into
 * beats one we only drive to; a destination served from several airports beats
 * one served from a single route; written-up and photographed ones edge ahead
 * of bare entries. Nothing is dropped by this — it only decides who makes the
 * first twelve.
 */
function rank(c: MenuCity): number {
  return (c.isAirportCity ? 1000 : 0) + (c.origins ?? 0) * 10 + (c.hasText ? 5 : 0) + (c.hasPhoto ? 1 : 0)
}

/**
 * A place earns its spot in the menu by being somewhere we fly into, somewhere
 * reachable from more than one airport, or somewhere we've written about. A
 * village served by a single route is a fine destination and a poor menu entry,
 * and there are hundreds of them — without this line the menu fills up
 * alphabetically with whatever happens to start with A.
 */
function worthBrowsing(c: MenuCity): boolean {
  return Boolean(c.isAirportCity) || (c.origins ?? 0) >= 2 || Boolean(c.hasText)
}

/** Marks the cities the menu shows by default; the rest surface on search. */
function markPrimary(cities: MenuCity[]): MenuCity[] {
  const byCountry = new Map<string, MenuCity[]>()
  for (const c of cities) {
    const key = c.country || 'Other'
    const list = byCountry.get(key)
    if (list) list.push(c)
    else byCountry.set(key, [c])
  }
  const primary = new Set<string>()
  for (const list of byCountry.values()) {
    const ranked = [...list].sort((a, b) => rank(b) - rank(a) || a.title.localeCompare(b.title))
    // A country that clears the bar nowhere still gets its best few, so it
    // never drops out of the menu altogether.
    const picked = ranked.filter(worthBrowsing).slice(0, PER_COUNTRY)
    for (const c of picked.length ? picked : ranked.slice(0, 3)) primary.add(c._id)
  }
  return cities.map((c) => ({ ...c, primary: primary.has(c._id) }))
}

let cache: { data: unknown; ts: number } | null = null
const TTL = 5 * 60 * 1000 // 5 min

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL) {
    return NextResponse.json(cache.data)
  }
  const raw = (await sanityClient.fetch(query)) as { cities?: MenuCity[] } & Record<string, unknown>
  const cities = markPrimary((raw.cities ?? []).filter((c) => !NOT_A_CITY.some((re) => re.test(c.title))))
  const data = { ...raw, cities }
  cache = { data, ts: Date.now() }
  return NextResponse.json(data)
}
