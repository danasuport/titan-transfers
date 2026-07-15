import { getPool, ensureSchema } from './client'

// Turns a raw search ("Sitges, 08870 Sitges, Barcelona, España") into something
// a human can group by: country, city, and whether it's an airport.
//
// Uses the Geocoding API (not Places) because it's the one enabled on our key,
// and a place_id lookup already returns everything we need. Results are cached
// per place_id in place_cache — the same airports/hotels repeat constantly, so
// the Google bill stays near zero.

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json'

export interface PlaceInfo {
  place_id: string
  name: string | null
  country: string | null
  country_code: string | null
  city: string | null
  is_airport: boolean
  types: string[]
  /** IATA code parsed from the formatted address, e.g. "(BCN)" → BCN. */
  iata: string | null
}

interface GeocodeComponent {
  long_name: string
  short_name: string
  types: string[]
}

function pickComponent(components: GeocodeComponent[], type: string): GeocodeComponent | undefined {
  return components.find(c => c.types.includes(type))
}

function parseGeocodeResult(placeId: string, result: {
  types?: string[]
  formatted_address?: string
  address_components?: GeocodeComponent[]
}): PlaceInfo {
  const types = result.types || []
  const components = result.address_components || []
  const isAirport = types.includes('airport')

  const country = pickComponent(components, 'country')
  // locality is the usual city. Some countries use postal_town instead, and
  // rural spots only resolve to a province/region — hence the fallback chain.
  const city =
    pickComponent(components, 'locality') ||
    pickComponent(components, 'postal_town') ||
    pickComponent(components, 'administrative_area_level_2') ||
    pickComponent(components, 'administrative_area_level_1')

  // For airports the establishment component carries the airport name, which is
  // far more useful in a report than its host town (BCN's locality is
  // "El Prat de Llobregat", not "Barcelona").
  const airportComp = pickComponent(components, 'airport')
  const establishment = pickComponent(components, 'establishment')
  const name = (airportComp || establishment)?.long_name || null

  // "…Barcelona-El Prat Airport (BCN), 08820 El Prat…" → BCN
  const iataMatch = (result.formatted_address || '').match(/\(([A-Z]{3})\)/)

  return {
    place_id: placeId,
    name,
    country: country?.long_name ?? null,
    country_code: country?.short_name ?? null,
    city: city?.long_name ?? null,
    is_airport: isAirport,
    types,
    iata: isAirport && iataMatch ? iataMatch[1] : null,
  }
}

async function geocodePlaceId(placeId: string, apiKey: string): Promise<PlaceInfo | null> {
  const url = `${GEOCODE_URL}?place_id=${encodeURIComponent(placeId)}&key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  if (data.status !== 'OK' || !data.results?.length) {
    // ZERO_RESULTS / INVALID_REQUEST — nothing to cache, let it retry later.
    if (data.status !== 'ZERO_RESULTS') {
      console.error(`[enrich] geocode ${placeId}: ${data.status} ${data.error_message || ''}`)
    }
    return null
  }
  return parseGeocodeResult(placeId, data.results[0])
}

/** place_cache lookup, falling back to Google and caching the result. */
export async function resolvePlace(placeId: string, apiKey: string): Promise<PlaceInfo | null> {
  const pool = getPool()

  const cached = await pool.query(
    `SELECT place_id, name, country, country_code, city, is_airport, iata, types
       FROM place_cache WHERE place_id = $1`,
    [placeId]
  )
  if (cached.rowCount) {
    const r = cached.rows[0]
    return {
      place_id: r.place_id,
      name: r.name,
      country: r.country,
      country_code: r.country_code,
      city: r.city,
      is_airport: r.is_airport,
      types: r.types || [],
      iata: r.iata,
    }
  }

  const info = await geocodePlaceId(placeId, apiKey)
  if (!info) return null

  await pool.query(
    `INSERT INTO place_cache (place_id, name, country, country_code, city, is_airport, iata, types)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (place_id) DO UPDATE SET
       name = EXCLUDED.name, country = EXCLUDED.country, country_code = EXCLUDED.country_code,
       city = EXCLUDED.city, is_airport = EXCLUDED.is_airport, iata = EXCLUDED.iata,
       types = EXCLUDED.types, fetched_at = now()`,
    [info.place_id, info.name, info.country, info.country_code, info.city,
     info.is_airport, info.iata, info.types]
  )
  return info
}

/**
 * What the report groups by: the airport name when it's an airport, the city
 * otherwise. Falls back to the raw text the user typed.
 */
export function placeLabel(info: PlaceInfo | null, rawText: string): string {
  if (!info) return rawText
  if (info.is_airport && info.name) return info.name
  return info.city || info.name || rawText
}

export { ensureSchema }
