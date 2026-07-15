import { Pool } from 'pg'

// Single pool per Node process. Cached on globalThis so Next's dev HMR doesn't
// open a new pool on every reload (which would exhaust Postgres connections).
const globalForDb = globalThis as unknown as { __titanPool?: Pool; __titanSchemaReady?: Promise<void> }

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set — analytics DB is unavailable')
  }
  if (!globalForDb.__titanPool) {
    globalForDb.__titanPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
  }
  return globalForDb.__titanPool
}

// Idempotent schema. Runs once per process on first use, so production (where
// the Postgres is only reachable from inside the Docker network) provisions
// itself without anyone needing direct DB access.
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS booking_search (
  id                BIGSERIAL PRIMARY KEY,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  locale            TEXT,

  -- raw search, exactly as the user entered it
  pickup_text       TEXT NOT NULL,
  pickup_lat        DOUBLE PRECISION,
  pickup_lng        DOUBLE PRECISION,
  pickup_pid        TEXT,
  dest_text         TEXT NOT NULL,
  dest_lat          DOUBLE PRECISION,
  dest_lng          DOUBLE PRECISION,
  dest_pid          TEXT,
  travel_date       DATE,
  travel_time       TEXT,
  pax               SMALLINT,
  lug               SMALLINT,

  -- enrichment, filled in later from the Google place_id + our Sanity catalogue
  pickup_country    TEXT,
  pickup_city       TEXT,
  pickup_is_airport BOOLEAN,
  -- What the report groups by: the airport name when it's an airport, the city
  -- otherwise. Denormalised on purpose so the dashboard can GROUP BY directly
  -- (BCN's city is "El Prat de Llobregat", which nobody would recognise).
  pickup_label      TEXT,
  dest_country      TEXT,
  dest_city         TEXT,
  dest_is_airport   BOOLEAN,
  dest_label        TEXT,
  route_exists      BOOLEAN,
  enriched_at       TIMESTAMPTZ,

  -- same search re-submitted / page reloaded within a short window
  dedupe_hash       TEXT NOT NULL
);

-- Added after the first deploy; keeps existing installs in sync.
ALTER TABLE booking_search ADD COLUMN IF NOT EXISTS pickup_label TEXT;
ALTER TABLE booking_search ADD COLUMN IF NOT EXISTS dest_label   TEXT;

CREATE INDEX IF NOT EXISTS booking_search_created_at_idx ON booking_search (created_at DESC);
CREATE INDEX IF NOT EXISTS booking_search_dedupe_idx     ON booking_search (dedupe_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS booking_search_route_idx      ON booking_search (pickup_label, dest_label);
CREATE INDEX IF NOT EXISTS booking_search_pending_idx    ON booking_search (created_at) WHERE enriched_at IS NULL;

-- place_id -> structured geo. Places repeat constantly (airports, hotels), so
-- caching keeps the Google Places bill near zero.
CREATE TABLE IF NOT EXISTS place_cache (
  place_id     TEXT PRIMARY KEY,
  name         TEXT,
  country      TEXT,
  country_code TEXT,
  city         TEXT,
  is_airport   BOOLEAN,
  iata         TEXT,
  types        TEXT[],
  fetched_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Added after the first deploy; keeps existing installs in sync.
ALTER TABLE place_cache ADD COLUMN IF NOT EXISTS iata TEXT;
`

export function ensureSchema(): Promise<void> {
  if (!globalForDb.__titanSchemaReady) {
    globalForDb.__titanSchemaReady = getPool()
      .query(SCHEMA_SQL)
      .then(() => undefined)
      .catch((err) => {
        // Let the next call retry instead of caching a failed bootstrap.
        globalForDb.__titanSchemaReady = undefined
        throw err
      })
  }
  return globalForDb.__titanSchemaReady
}
