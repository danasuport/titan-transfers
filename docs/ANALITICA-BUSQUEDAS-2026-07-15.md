# Analítica de búsquedas del buscador de traslados

**Estado:** funcionando en local, pendiente de desplegar · **Creado:** 2026-07-15

Documento de referencia autocontenido: si abres un chat nuevo, con esto basta para retomar.

---

## 1. Para qué es

El cliente (Titan) quiere saber **qué buscan los visitantes en el buscador de traslados**, para:

1. **Ajustar precios** → qué países / ciudades / aeropuertos tiran más.
2. **Descubrir rutas que no tiene** → gente que busca un traslado que no existe en la web = demanda sin cubrir.

> El motor de reservas (**Easy Taxi Office**, plugin WordPress en `wp.titantransfers.com`) **no registra búsquedas**, solo reservas. Se comprobó. Por eso construimos la captura propia. GA4 tampoco sirve: retención por defecto de 2 meses, alta cardinalidad (colapsa en "(other)") y el Consent Mode deniega por defecto → datos parciales.

---

## 2. Cómo funciona (flujo)

```
BookingPanel (React + Google Places autocomplete)
   ↓  navega a
/booking/?pickup=…&pickup_pid=…&dest=…&dest_pid=…&date=…&pax=…&lug=…
   ↓  TaxiBookingIframe dispara un beacon (fire-and-forget)
POST /api/search-log/          → guarda la búsqueda cruda en Postgres (con dedupe)
   ↓  después, en diferido
scripts/enrich-searches.mjs    → Google Geocoding (place_id → país/ciudad/¿aeropuerto?/IATA)
                               → cruce con Sanity (¿existe esa ruta?)
   ↓
/admin/searches                → panel para el cliente (+ export CSV)
```

**Importante:** el beacon **nunca bloquea ni rompe la reserva**. Si falla, se traga el error. El iframe de ETO sigue funcionando igual.

---

## 3. Arquitectura y decisiones (con su porqué)

| Decisión | Por qué |
|---|---|
| **Postgres** (no Sanity) | Sanity es un CMS: 100-300 búsquedas/día = 50-100k docs/año → infla el dataset, encarece la API y el Studio se vuelve inusable para agregar. |
| **Captura en `/booking/`** (no en WordPress) | Todas las búsquedas pasan por ahí. **Limitación conocida:** si el usuario cambia origen/destino *dentro* del iframe de ETO, eso no se captura (no pasa por nuestra URL). Se capturaría tocando el MU-plugin de WP — pendiente si hace falta. |
| **Geocoding API, no Places API** | La Places API (v1) está **bloqueada** en la clave del proyecto (`API_KEY_SERVICE_BLOCKED`). La Geocoding API **sí funciona server-side** con `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` y da todo: `types` (detecta `airport`), `address_components` (país, ciudad) y el IATA dentro del `formatted_address`. |
| **Caché por `place_id`** (`place_cache`) | Los sitios se repiten muchísimo (aeropuertos, hoteles) → la factura de Google se queda casi a cero. |
| **Etiqueta = nombre del aeropuerto, no la ciudad** | Google dice que BCN está en *"El Prat de Llobregat"*. En el informe eso sería irreconocible. Por eso `pickup_label`/`dest_label` = nombre del aeropuerto si es aeropuerto, ciudad si no. |
| **Cruce por código IATA** | 172/172 aeropuertos de Sanity tienen `iataCode` → cruce exacto, no por nombre aproximado. El IATA se extrae del `formatted_address` con `/\(([A-Z]{3})\)/`. |
| **`route_exists = NULL` cuando ningún extremo es aeropuerto** | Se verificó: **las 738 rutas de Sanity son todas aeropuerto→ciudad** (0 ciudad→ciudad). Así que una búsqueda ciudad→ciudad no es una ruta que "falte": marcarla ❌ llenaría de ruido la lista de oportunidades. Se muestra como `—`. |
| **Se comprueban ambos sentidos** | Ida y vuelta (aeropuerto→hotel y hotel→aeropuerto) son demanda de la misma ruta. |
| **Cero PII** | No se guarda IP, ni user-agent, ni cookies, ni identificador alguno. Solo la búsqueda. |

---

## 4. Modelo de datos

### `booking_search`
| Campo | Notas |
|---|---|
| `id`, `created_at`, `locale` | |
| `pickup_text/lat/lng/pid`, `dest_text/lat/lng/pid` | Crudo, tal cual lo envió el buscador |
| `travel_date`, `travel_time`, `pax`, `lug` | |
| `pickup_country/city/is_airport/label` | Enriquecido |
| `dest_country/city/is_airport/label` | Enriquecido |
| `route_exists` | `true` = la tenemos · `false` = **oportunidad** · `NULL` = no aplica |
| `enriched_at` | `NULL` = pendiente de procesar |
| `dedupe_hash` | sha256 de origen+destino+fecha+hora+pax+lug. Misma búsqueda en **30 min** → se ignora (recargas, doble submit). |

### `place_cache`
`place_id` (PK), `name`, `country`, `country_code`, `city`, `is_airport`, `iata`, `types`, `fetched_at`

**El esquema es idempotente** (`CREATE TABLE IF NOT EXISTS` + `ALTER … ADD COLUMN IF NOT EXISTS`) y se ejecuta solo en la primera llamada a la API → **producción se auto-configura**, no hace falta acceso manual a su BD.

---

## 5. Ficheros

| Fichero | Qué es |
|---|---|
| `src/lib/db/client.ts` | Pool de Postgres + `ensureSchema()` (el esquema vive aquí) |
| `src/lib/db/enrich.ts` | `resolvePlace()` (Geocoding + caché), `placeLabel()` |
| `src/app/api/search-log/route.ts` | Captura + dedupe |
| `src/components/booking/TaxiBookingIframe.tsx` | Dispara el beacon |
| `src/lib/admin/auth.ts` | Cookie firmada HMAC + `ADMIN_PASSWORD` |
| `src/lib/admin/queries.ts` | Agregaciones del panel |
| `src/app/admin/page.tsx` | Login |
| `src/app/admin/searches/page.tsx` | El panel |
| `src/app/api/admin/login/route.ts` | Login POST |
| `src/app/api/admin/export/route.ts` | Export CSV (`;` + BOM → Excel español) |
| `scripts/db-init.mjs` | Crea/verifica el esquema |
| `scripts/enrich-searches.mjs` | **El enriquecedor** (`--limit`, `--force`) |
| `src/middleware.ts` | `admin` excluido del i18n (como `studio`) |
| `src/app/robots.txt/route.ts` | `Disallow: /admin/` |

---

## 6. Operación

### Local
```bash
brew services start postgresql@17      # si no está arrancado
npx tsx scripts/db-init.mjs            # crear/verificar esquema
npx tsx scripts/enrich-searches.mjs    # procesar búsquedas pendientes
PORT=3001 pnpm dev                     # panel en http://localhost:3001/admin/searches/
```
`.env.local` → `DATABASE_URL=postgres://WEBKMABCN@localhost:5432/titan_analytics` · `ADMIN_PASSWORD=titan-local-dev-2026`

### Producción (Coolify, Hetzner)
- BD: recurso **`titan-analytics`** (PostgreSQL 17, **solo interna**, sin puerto público).
- Variables de la app (runtime, **no** buildtime): `DATABASE_URL` (URL interna de Coolify), `ADMIN_PASSWORD`.
- Panel: `https://titantransfers.com/admin/`

---

## 7. Trampas conocidas (para no volver a tropezar)

1. **Los `place_id` NO se pueden inventar.** Google los rechaza (`ZERO_RESULTS: Place ID is no longer valid`). Perdí un rato con datos de prueba fabricados. Para probar, saca `place_id` reales geocodificando por nombre:
   `https://maps.googleapis.com/maps/api/geocode/json?address=Toledo,Spain&key=…`
2. **`trailingSlash: true`** → las API routes necesitan barra final (`/api/search-log/`), si no comen un 308.
3. **Bug ya arreglado:** el caché no guardaba el `iata` → el cruce se rompía en silencio en cuanto un sitio se cacheaba (el caso normal). Si tocas `place_cache`, mantén la columna `iata`.
4. **Criterio ya corregido:** el primer intento marcaba "✅ tenemos" rutas ciudad→ciudad que no existen. Ver decisión de `route_exists = NULL`.
5. `/admin` debe seguir **excluido del matcher del middleware**, o el i18n lo prefijará con idioma.

---

## 8. Pendiente

- [ ] **Desplegar** (commit + push + redeploy en Coolify).
- [ ] **`ADMIN_PASSWORD` en Coolify** — contraseña fuerte, distinta de la local.
- [ ] **Programar el enriquecimiento**: Coolify → app → **Scheduled Tasks** → cada 15 min:
      `npx tsx scripts/enrich-searches.mjs --limit=500`
      *(Sin esto, las búsquedas se guardan pero salen sin país/ciudad/ruta.)*
- [ ] **Política de privacidad**: declarar el registro de búsquedas + retención. Los `pickup`/`dest` pueden ser el domicilio de alguien = dato personal. Base legal: interés legítimo (analítica agregada de negocio, sin perfilado ni identificación). Recomendado: **retención 12-24 meses** + borrado automático.
- [ ] Opcional: capturar también los cambios de origen/destino **dentro** del iframe de ETO (tocando el MU-plugin de WP).
- [ ] Opcional: `openGraph` completo en páginas de listado (tema SEO aparte).
