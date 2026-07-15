// Reads the client's pricing sheet — the same Drive CSV the dashboard reads.
//
// This mirrors src/lib/admin/catalog.ts and src/lib/route-key.ts, which scripts
// can't import (they're TypeScript, and these are plain .mjs). If the sheet URL,
// the column names or the key format change there, change them here too — the
// whole point is that the script publishes exactly what the panel says is missing.

const SHEET_CSV_URL =
  process.env.ROUTES_SHEET_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1Av3de0RAoJpHEI1_fEPIdUXPlvXahaMfloCpWG42IG4/export?format=csv&gid=0'

const COL_COUNTRY = 'Country'
const COL_AIRPORT = 'Airport'
const COL_RESORT = 'Resort'

/** Accent- and case-insensitive: "Vilanova i la Geltrú" == "vilanova i la geltru". */
export function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** "BCN|cubelles", or null if either half is missing. */
export function routeKey(iata, city) {
  const a = norm(iata).toUpperCase()
  const c = norm(city)
  return a && c ? `${a}|${c}` : null
}

/**
 * RFC 4180 enough for Drive's export: quoted fields, doubled quotes, commas and
 * newlines inside them. The sheet's prices are quoted ("30,00" — Spanish
 * decimals), so a naive split(',') shifts every column after Vehicle. That is
 * exactly what the old scripts/excel_routes.csv reader did.
 */
function parseCsv(text) {
  const rows = []
  let row = [], cell = '', quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch !== '"') cell += ch
      else if (text[i + 1] === '"') { cell += '"'; i++ }
      else quoted = false
      continue
    }
    if (ch === '"') quoted = true
    else if (ch === ',') { row.push(cell); cell = '' }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
    else if (ch !== '\r') cell += ch
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows
}

/**
 * One entry per distinct route in the sheet: { country, iata, resort }.
 * The sheet has a row per vehicle type, so ~5 rows collapse into each route.
 */
export async function fetchSheetRoutes() {
  const res = await fetch(SHEET_CSV_URL, { redirect: 'follow' })
  if (!res.ok) throw new Error(`la hoja respondió ${res.status} — ¿sigue compartida por enlace?`)

  const rows = parseCsv(await res.text())
  const header = rows.shift()
  if (!header) throw new Error('la hoja está vacía')

  const iC = header.indexOf(COL_COUNTRY)
  const iA = header.indexOf(COL_AIRPORT)
  const iR = header.indexOf(COL_RESORT)
  if (iC === -1 || iA === -1 || iR === -1) {
    throw new Error(`la hoja no tiene las columnas "${COL_COUNTRY}"/"${COL_AIRPORT}"/"${COL_RESORT}"`)
  }

  const out = new Map()
  for (const r of rows) {
    const country = (r[iC] || '').trim()
    const iata = (r[iA] || '').trim().toUpperCase()
    const resort = (r[iR] || '').replace(/\s+/g, ' ').trim()
    if (!country || !iata || !resort) continue
    const key = routeKey(iata, resort)
    if (key && !out.has(key)) out.set(key, { country, iata, resort })
  }
  if (out.size === 0) throw new Error('la hoja no dio ninguna ruta')
  return [...out.values()]
}
