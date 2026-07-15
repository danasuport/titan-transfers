// The key that identifies one airport↔city route across our three sources: the
// Sanity catalogue (what's published), the client's pricing sheet (what's sold)
// and a visitor's search. They only line up if all three normalise names the
// same way, so the format lives here and nowhere else.

/** Accent- and case-insensitive: "Vilanova i la Geltrú" == "vilanova i la geltru". */
export function norm(s: string | null | undefined): string {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** "BCN|cubelles", or null if either half is missing. */
export function routeKey(iata: string | null | undefined, city: string | null | undefined): string | null {
  const a = norm(iata).toUpperCase()
  const c = norm(city)
  return a && c ? `${a}|${c}` : null
}

/**
 * The route key for a search, from the airport end's IATA and the other end's
 * city — whichever way round the visitor entered it.
 *
 * Returns null when neither end is an airport: the catalogue only models
 * airport↔city, so there is no route to look up and "do we have it?" has no
 * answer rather than a negative one.
 */
export function searchRouteKey(s: RouteEnds): string | null {
  if (s.pickup_is_airport && s.pickup_iata) return routeKey(s.pickup_iata, s.dest_city)
  if (s.dest_is_airport && s.dest_iata) return routeKey(s.dest_iata, s.pickup_city)
  return null
}

export interface RouteEnds {
  pickup_is_airport: boolean | null
  pickup_iata: string | null
  pickup_city: string | null
  dest_is_airport: boolean | null
  dest_iata: string | null
  dest_city: string | null
}

/** The IATA of whichever end is the airport — the code the sheet files it under. */
export function airportIata(s: RouteEnds): string | null {
  if (s.pickup_is_airport && s.pickup_iata) return s.pickup_iata.toUpperCase()
  if (s.dest_is_airport && s.dest_iata) return s.dest_iata.toUpperCase()
  return null
}
