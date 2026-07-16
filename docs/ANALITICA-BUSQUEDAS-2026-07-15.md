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
| `src/lib/route-key.ts` | La clave `"BCN\|cubelles"` y la regla de qué extremo es el aeropuerto. **Única definición**: la comparten el enriquecedor y el panel |
| `src/lib/admin/catalog.ts` | Los dos catálogos vivos: hoja de tarifas (CSV de Drive) y Sanity, + `verdictFor()` + `getSheetPrices()` |
| `src/lib/route-price.ts` | Precio "Desde X €" de una ruta desde la hoja (`priceForRoute` + `formatFromPrice` por idioma) |
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
| `scripts/lib/routes-sheet.mjs` | Lee la hoja de tarifas desde scripts (espejo de `catalog.ts` + `route-key.ts`) |
| `scripts/publish-routes.mjs` | **Crea rutas de la hoja, OCULTAS por defecto** (`--airport=`, `--country=`, `--route=`, `--limit=`, `--visible`, `--apply`) |
| `scripts/reveal-routes.mjs` | **Revela/oculta rutas por tandas** (`--airport=`, `--route=`, `--limit=`, `--hide`, `--force`, `--apply`) |
| `scripts/dedupe-routes.mjs` | Fusiona y borra rutas duplicadas + genera sus 301 (`--apply`) |
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
- Variables de **la app** (runtime, **no** buildtime): `DATABASE_URL` (URL interna de Coolify), `ADMIN_PASSWORD`.
  *(Todo va en la app, no en la BD: la BD solo tiene que existir y estar en verde.)*
- `ROUTES_SHEET_CSV_URL` es **opcional**: la hoja en uso hoy es el valor por defecto en `catalog.ts`.
  Solo hace falta para apuntar a otra hoja, con el formato
  `https://docs.google.com/spreadsheets/d/<id>/export?format=csv&gid=0`.
  La hoja debe seguir compartida por enlace y conservar sus columnas `Airport` y `Resort`.
- Panel: `https://titantransfers.com/admin/`
- **Clasificar a mano** sin esperar al cron: botón **"Clasificar ahora"** en el aviso amarillo del panel.
  Recalcular todo (tras cambiar el criterio de cruce): `/api/admin/enrich/?force=1&limit=1000` estando logueado.

---

## 7. Trampas conocidas (para no volver a tropezar)

1. **Los `place_id` NO se pueden inventar.** Google los rechaza (`ZERO_RESULTS: Place ID is no longer valid`). Perdí un rato con datos de prueba fabricados. Para probar, saca `place_id` reales geocodificando por nombre:
   `https://maps.googleapis.com/maps/api/geocode/json?address=Toledo,Spain&key=…`
2. **`trailingSlash: true`** → las API routes necesitan barra final (`/api/search-log/`), si no comen un 308.
3. **Bug ya arreglado:** el caché no guardaba el `iata` → el cruce se rompía en silencio en cuanto un sitio se cacheaba (el caso normal). Si tocas `place_cache`, mantén la columna `iata`.
4. **Criterio ya corregido:** el primer intento marcaba "✅ tenemos" rutas ciudad→ciudad que no existen. Ver decisión de `route_exists = NULL`.
5. `/admin` debe seguir **excluido del matcher del middleware**, o el i18n lo prefijará con idioma.
6. **Los redirects deben ser relativos.** Detrás del proxy de Coolify la app solo ve su dirección interna, así que `NextResponse.redirect(new URL(path, req.url))` manda al navegador a `https://0.0.0.0:3000/…`. Usa `new NextResponse(null, {status:303, headers:{Location:'/ruta/'}})`.
7. **Horas: `created_at` es `timestamptz` y el servidor va en UTC.** Todo lo que lea el cliente debe convertirse con `AT TIME ZONE 'Europe/Madrid'` — texto Y rangos de fecha (si no, un "día" va de 02:00 a 02:00). No sumes 2h a mano: se rompería en invierno.
8. **Google devuelve el nombre LOCAL de la ciudad para direcciones.** Para el `place_id` de la ciudad devuelve el exónimo inglés ("Rome"), pero para una dirección DENTRO de ella (un hotel — que es lo que busca la gente) devuelve el local ("Roma"). `language=en` **NO lo arregla** (comprobado: Roma, Milano, Firenze, München siguen en local). Por eso `loadRouteIndex()` indexa la ciudad destino bajo **todos sus nombres traducidos** en Sanity. Si tocas eso, romperás el cruce de toda ciudad con exónimo.
9. Las tablas de rutas del panel **solo muestran filas enriquecidas**: una fila sin enriquecer no tiene etiqueta y agruparía bajo una clave distinta que la misma ruta ya enriquecida, partiendo una ruta en dos filas y falseando los recuentos.
10. **"¿La tenemos?" y "¿En la web?" son dos preguntas distintas.** La hoja de tarifas del cliente tiene 1.754 rutas y Sanity 738; **ninguna contiene a la otra** (1.095 están vendidas sin publicar, 52 publicadas sin estar en la hoja). Por eso "la tenemos" = hoja ∪ web, y "en la web" = solo Sanity. Si vuelves a fundir las dos en una sola columna, el panel dirá "no tenemos esa ruta" de 1.095 rutas que sí se venden — que es exactamente la queja que originó esto.
11. **Los dos catálogos se leen en vivo, no desde `route_exists`.** `route_exists` se congela al enriquecer la búsqueda: una ruta publicada hoy seguiría saliendo como ausente en toda búsqueda anterior. El panel y el export usan `getSheetIndex()` / `getWebIndex()` (caché de 1 h).
12. **Si un catálogo no se puede leer, el veredicto es `null`, nunca `false`.** Un "No" inventado es peor que un "—": manda al cliente a crear una tarifa que ya tiene. `sanityClient.fetch` se traga sus errores y devuelve `[]`, así que `getWebIndex()` trata "0 rutas" como caída (el catálogo nunca está legítimamente vacío).
13. **La URL de la hoja va como argumento de `unstable_cache`, no como constante capturada.** Si no, la clave de caché no depende de ella y repuntar `ROUTES_SHEET_CSV_URL` a otra hoja seguiría sirviendo la anterior una hora. Ya pasó una vez, en pruebas.
14. **Nunca deduplicar rutas por texto.** `create-missing-routes.mjs` comparaba el `resort` del CSV contra el `title` de la ciudad, pero buscaba la ciudad por *slug*: slugify quita acentos y la comparación de títulos no. "Mataro" en la hoja encontraba `city-mataro`, no reconocía la ruta "BCN|Mataró" existente y creaba una segunda ruta sobre la misma ciudad → **43 duplicados**. `publish-routes.mjs` deduplica por `origin._id + '|' + destination._id` y usa `_id` determinista. Ese script y su `excel_routes.csv` ya no existen.
15. **Un IATA que falte en `AIRPORT_NAMES` bloquea TODAS las rutas de ese aeropuerto, en silencio.** Así es como **Valencia (VLC), el 2º aeropuerto del cliente con 319 rutas, nunca llegó a publicarse**. `KIX` estaba escrito `KIK` por lo mismo. `publish-routes.mjs` ahora lo lista alto y por aeropuerto en vez de soltar una línea perdida.
16. **Si Claude falla, no se crea nada.** El script viejo capturaba el error y publicaba igual con `contentSections: []` → página con hero + widget y nada más, indexable y en silencio. Ahora el contenido se genera *antes* de tocar Sanity y un fallo aborta la ruta entera, que se reintenta relanzando el mismo comando.
17. **La columna `Country` de la hoja es la del AEROPUERTO, no la del destino.** Al crear una ciudad nueva se le asigna ese país, lo cual falla al cruzar fronteras (BCN → Andorra la Vella crearía Andorra la Vella en España). Esas hay que hacerlas a mano.
18. **El cruce con la hoja es por texto libre** (`Airport` + `Resort`), así que falla en algunos nombres (`Kadiköy` en la hoja vs. `Kadıköy` de Google — la `ı` turca no la arregla quitar acentos). Son pocos y salen como "no tenemos" siendo falso. Si renombran esas columnas en Drive o dejan de compartir la hoja, salta el aviso rojo del panel y todo pasa a "—".

---

## 7-ter. Precio "Desde X €" en las páginas de ruta

Desde 2026-07-16 la página de ruta muestra **"Desde X € por vehículo"** en el hero, leído **en vivo de la hoja** (columna `Our Target`). Decisión del cliente: usar `Our Target` directamente (no una columna de precios de ETO, que se descartó). **Dinámico**: cambia el precio en la hoja y la web lo refleja en ≤1-2 h (caché de la hoja 1 h + ISR de la página 1 h), sin re-publicar.

- El precio es el **mínimo de los ~5 vehículos** de esa ruta (por eso "Desde"). Formato por idioma con `Intl.NumberFormat` (es/it/de → "60,89 €", en → "€60.89", ar → RTL).
- Cruce por `routeKey(iata, nombre-destino)` probando el título y todas las traducciones (la hoja puede decir "Roma" y Sanity "Rome").
- Misma descarga cacheada que el panel (`fetchSheetRows`, key `routes-sheet-v2`): una sola bajada sirve al panel y a las páginas.
- **Degrada a nada**: ruta sin precio en la hoja, o hoja caída → no se muestra badge, la página va normal.
- ⚠ **Aviso de coherencia (documentado, decisión del cliente):** `Our Target` es la tarifa *objetivo*, no necesariamente lo que cobra el motor ETO en la reserva. Si divergen, el visitante ve "Desde 60,89 €" y el widget cobra otra cosa. El cliente asumió ese riesgo al elegir `Our Target`.

## 7-bis. Publicar rutas sin asustar a Google (campo `hidden`)

El riesgo de subir 1.079 rutas no es el ritmo — Google no penaliza crear muchas URLs — sino soltar de golpe 1.079 páginas de plantilla generadas con IA (*scaled content abuse*). El campo `hidden` de `route` separa las dos operaciones caras: **generar el contenido** (Claude) y **exponer la URL a Google** (SEO).

- `hidden: true` → la ruta existe y su URL es accesible (para previsualizar), pero **NO** entra en el sitemap, **NO** se enlaza desde aeropuerto/ciudad/región, y su página emite `noindex, nofollow`. Todo eso lo controla el mismo flag en un sitio: `hidden != true` en las queries (`sitemapRoutesQuery`, `airportBySlugQuery`, city, region) y `noindex` en `generatePageMetadata` vía `route.hidden`.
- **Flujo recomendado:** `publish-routes.mjs` crea **ocultas por defecto** (genera todo el contenido sin tocar Google). Luego `reveal-routes.mjs --airport=X --limit=N --apply` va revelando por tandas, en el orden de demanda que da el panel. `reveal` **se niega a revelar rutas incompletas** (sin imagen/contenido/traducción) salvo `--force`.
- **Marcha atrás:** `reveal-routes.mjs --route="IATA:Ciudad" --hide --apply` vuelve a ocultar una ruta ya viva. Es el botón de pánico que antes no existía (la única forma de "despublicar" era borrar el documento y montar 301).
- `--visible` en `publish-routes` crea ya expuestas, para el puñado de rutas de alta demanda que quieras live desde el minuto uno.
- Revelar/ocultar tarda ≤1 h en reflejarse (revalidate del sitemap y listados).

---

## 8. Pendiente

- [x] **Desplegado y funcionando** (último commit relevante: `c97fd6e`). Verificado en prod: web y reservas OK, `/admin/` pide contraseña, la app escribe en Postgres (el esquema se auto-creó), y el panel muestra datos reales.
- [x] **`ADMIN_PASSWORD` en Coolify** — puesta.
- [x] **Bugs corregidos tras el primer despliegue** (todos salieron solo con uso real; ver "Trampas conocidas"): redirect a `0.0.0.0`, filas sin clasificar duplicando recuentos, desfase horario UTC en 4 sitios, y exónimos de ciudad ("Roma" vs "Rome") marcando como ausentes rutas que sí existen.
- [ ] **Tras desplegar el fix de exónimos** (`c97fd6e`): recalcular las filas ya clasificadas, que conservan el veredicto antiguo. Estando logueado en el panel:
      `https://titantransfers.com/api/admin/enrich/?force=1&limit=1000`
      No cuesta llamadas extra a Google (la caché de sitios ya está poblada); solo rehace el cruce.
- [ ] **Verificar que el Scheduled Task se ejecuta** (mirar sus logs en Coolify). Si "Clasificar ahora" funciona pero las búsquedas nuevas siguen pendientes >15 min, el cron no corre.
- [ ] **Programar el enriquecimiento**: Coolify → **la app** → **Scheduled Tasks** → cada 15 min (`*/15 * * * *`):
      ```
      curl -fsS -X POST https://titantransfers.com/api/admin/enrich/ -H "Authorization: Bearer $ADMIN_PASSWORD"
      ```
      *(Sin esto, las búsquedas se guardan pero salen sin país/ciudad/ruta.)*
      **Ojo:** NO uses `npx tsx scripts/enrich-searches.mjs` en producción — el build es standalone: no hay devDependencies (`tsx`) ni carpeta `scripts/`. Por eso existe el endpoint. El script y el endpoint comparten el mismo código (`src/lib/db/enrich-runner.ts`).
- [ ] Borrar la fila de prueba `ZZZ TEST despliegue (ignorar)` de producción.
- [ ] **Política de privacidad**: declarar el registro de búsquedas + retención. Los `pickup`/`dest` pueden ser el domicilio de alguien = dato personal. Base legal: interés legítimo (analítica agregada de negocio, sin perfilado ni identificación). Recomendado: **retención 12-24 meses** + borrado automático.
- [ ] Opcional: capturar también los cambios de origen/destino **dentro** del iframe de ETO (tocando el MU-plugin de WP).
- [ ] Opcional: `openGraph` completo en páginas de listado (tema SEO aparte).
