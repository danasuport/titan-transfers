# Traspaso — Publicación de rutas por lotes (Titan Transfers)

> Documento para retomar en otra sesión sin perder contexto. Estado a 2026-07-24.
> Pégale a un chat nuevo el bloque "PROMPT PARA CONTINUAR" del final, o lee esto entero.

---

## Qué es esto

**titantransfers.com** — web de traslados privados. Next.js 16 + Sanity (CMS) + Postgres (analítica de búsquedas). Despliegue en **Coolify (Hetzner), NO Vercel**. Push a `main` en GitHub → auto-despliega (a veces hay que darle a **redeploy** en el panel de Coolify manualmente). El push lo hace Claude.

Las rutas de traslado (`_type == "route"` en Sanity) son páginas aeropuerto→destino, en **5 idiomas** (en raíz, es/it/de/ar en `translations`). El cliente mantiene una **hoja de Google Drive pública** con todas las rutas que vende y sus precios; la web las lee en vivo.

- Hoja: `https://docs.google.com/spreadsheets/d/1Av3de0RAoJpHEI1_fEPIdUXPlvXahaMfloCpWG42IG4/`
- Columnas: `Country, Airport (IATA), Resort (destino), Vehicle, price (col E), Our Target, …` (una fila por vehículo).
- **~17.670 rutas** en la hoja; **960 publicadas** en la web tras el lote de Málaga.

---

## Estado actual (2026-07-24)

- **Lote MÁLAGA (AGP) COMPLETO Y EN PRODUCCIÓN.** 265 rutas nuevas creadas, completas y reveladas. Web: 695 → **960 rutas visibles**.
  - Contenido EN+ES nativo (Claude Opus 4.8), IT/DE/AR (OpenAI gpt-4o-mini).
  - 215 con foto real del pueblo (Wikipedia) + crédito visible. 50 sin foto (resorts/urbanizaciones sin artículo) — activadas igualmente por decisión del cliente ("todo de golpe"); tienen texto+precio+tabla, solo les falta imagen.
  - Distancia/duración por ruta, precio "Desde X €" y tabla de precios por vehículo.
  - Coste: **~$19 Anthropic + ~$2 OpenAI**.
- **Verificado en producción:** index/follow correcto, noindex mientras estuvieron ocultas, hreflang 5 idiomas, canonical, JSON-LD (Organization/Breadcrumb/FAQ/AggregateRating/TaxiService), crédito de imagen legal, sitemap con las 960, cero rutas ocultas filtradas.

### Próximos lotes (recomendación por estacionalidad — es verano)
Quedan ~16.700 rutas por crear. Prioridad por importancia/estación:
1. **VLC** (Valencia) — costa levantina, verano. ~293 nuevas.
2. **BUD** (Budapest + Balatón), **BCN** (área metropolitana, máximo volumen), **PRG** (Praga).
3. **MAD** — dejar para septiembre (Madrid en verano es temporada baja).
4. **Esquí (LYS, GNB, CMF, INN, SZG, VCE, TSF…)** — ~10.000 rutas, preparar en **octubre-noviembre** para llegar indexadas a la temporada de nieve. Son el grueso de la hoja pero fuera de temporada ahora.

**Estrategia acordada:** publicar por lotes, medir indexación/posiciones de Málaga 1-2 semanas antes de escalar. No soltar las 17.000 a ciegas (riesgo *scaled content abuse* de Google si fueran plantilla; se mitiga con contenido único real + tabla de precios).

---

## El pipeline (scripts)

Todos en `scripts/`, se corren en **local** (`node scripts/…`), escriben en la Sanity de producción. **Dry-run por defecto, requieren `--apply`.**

### 1. Crear rutas — `publish-routes.mjs`
Lee la hoja en vivo, crea país/aeropuerto/ciudad si faltan, y la ruta con contenido EN+ES (Claude Opus 4.8). **Nacen ocultas** (`hidden: true`).
```bash
node scripts/publish-routes.mjs --airport=VLC --limit=5            # dry-run
node scripts/publish-routes.mjs --airport=VLC --apply              # crear todas las de VLC
node scripts/publish-routes.mjs --route="BCN:Sitges" --apply       # una concreta
node scripts/publish-routes.mjs --airport=VLC --effort=high --apply # más razonamiento (medium por defecto)
node scripts/publish-routes.mjs --airport=VLC --visible --apply    # crear ya visibles (raro)
```
- Deduplica por `_id` de documento (imposible duplicar). `_id` determinista `route-<iata>-<slug>`.
- **Si Claude falla, no crea nada** (guarda anti-thin-content). Se reintenta relanzando.
- Brief SEO anti-duplicación (nombra sitios reales, prohíbe relleno). Coste medido: **~$0,07/ruta** con effort medium.
- Reporta coste API al final.
- **Faltan IATA en `AIRPORT_NAMES`** bloquean todo ese aeropuerto en silencio → el script los lista alto. Añadir el que falte antes de relanzar.
- **Limitación:** la columna `Country` de la hoja es la del AEROPUERTO. Rutas transfronterizas (BCN→Andorra) crean la ciudad en el país equivocado → hacerlas a mano.

### 2. Imágenes — `add-route-images-wikipedia.mjs`
Foto real del municipio desde su artículo de Wikipedia, con licencia y autor. **CC BY/BY-SA exigen crédito visible** (ya renderizado en la página).
```bash
node scripts/add-route-images-wikipedia.mjs --airport=VLC --limit=5   # dry-run
node scripts/add-route-images-wikipedia.mjs --airport=VLC --apply
```
- Solo acepta fotos cuyo nombre de archivo nombre al destino. Descarta grabados, escaneos antiguos, escudos, embalses. **Sin foto válida → deja la ruta sin imagen** (no pone una equivocada). Cobertura ~80%.
- Alternativa `add-route-images-pexels.mjs` (con verificación de veracidad) para destinos que Pexels sí cubra sin atribución, pero Wikipedia dio mejor cobertura. Wikimedia Commons (`add-route-images.mjs`, el viejo) NO sirve — cero cobertura para pueblos pequeños.

### 3. Traducciones — `translate-to-{italian,german,arabic}.mjs`
Por **OpenAI gpt-4o-mini** (cuenta OpenAI, NO toca créditos Anthropic). Idempotentes (saltan las ya traducidas). El español ya lo genera `publish-routes` nativo.
```bash
node scripts/translate-to-italian.mjs --type=route
node scripts/translate-to-german.mjs --type=route
node scripts/translate-to-arabic.mjs --type=route
```

### 4. Revelar/ocultar — `reveal-routes.mjs`
Saca rutas a Google (quita `hidden`) por tandas.
```bash
node scripts/reveal-routes.mjs --airport=VLC --limit=10 --apply     # revela 10 completas
node scripts/reveal-routes.mjs --airport=VLC --force --apply        # incluye incompletas (sin foto)
node scripts/reveal-routes.mjs --route="BCN:Sitges" --hide --apply  # botón de pánico: re-ocultar
```
- **Se niega a revelar incompletas** (sin imagen/contenido/traducción) salvo `--force`.
- 265 patches tardan ~2-3 min (rate limit Sanity). Puede pasar a background.

### 5. Duplicados — `dedupe-routes.mjs`
Ya se usó una vez (limpió 43 duplicados históricos). Fusiona + borra + genera 301. Solo si reaparecen duplicados.

---

## Arquitectura de precios (lo nuevo importante)

- **`src/lib/admin/catalog.ts`** — lee la hoja (7MB) con `unstable_cache` (TTL 1h, key `routes-sheet-v3`). Funciones: `getSheetIndex()` (¿la vendemos?), `getSheetPrices()` (mínimo = "Desde"), **`getVehiclePrices()`** (tabla por vehículo). Una sola descarga alimenta todo.
- **`src/lib/route-price.ts`** — `priceForRoute()`, `vehiclePricesForRoute()`, `vehicleRows()` (traduce nombres de vehículo + capacidad a 5 idiomas), `formatPrice()`/`formatFromPrice()`.
- **Página de ruta** (`src/app/[locale]/airport/[slug]/[routeSlug]/page.tsx`): hero "Desde X €" + componente `VehiclePrices` (tabla entre bloques) + `ImageCredit` (crédito legal, esquina inf. izquierda).
- **Columna de precio:** por ruta, `price` (col E) si está bien rellena, si no `Our Target`. Nunca mezcla. El "Desde" = fila más barata de la tabla (coherencia).
- **Todo dinámico:** cambio en la hoja → web en <10s-1h. Cero regeneración.

## Campo `hidden`
- `route.hidden == true` → fuera del sitemap, fuera de listados (aeropuerto/ciudad/región), `noindex` en la página. URL sigue accesible (previsualizar).
- Filtro `hidden != true` en `sitemapRoutesQuery`, `airportBySlugQuery`, city, region. `noindex` vía `route.hidden` en la página.

---

## Trampas / decisiones registradas

1. **Todo es dinámico (ƒ), no ISR.** El fetch a Sanity no está en el data cache de Next. Contenido nuevo aparece en <10s (CDN Sanity). El webhook `/api/revalidate` es casi no-op (arreglado igual: acepta secret por header o `?secret=`). No existe el "retraso de 1h" del contenido.
2. **Hoja de 7MB — rendimiento ARREGLADO (2026-07-24, commit `2124b4e`).** Antes cada página de ruta tardaba ~4s porque `unstable_cache` NO cacheaba en producción (página dinámica `no-store` no persiste su data cache) → cada visita re-descargaba+parseaba los 7MB. Ahora **caché en memoria de módulo con stale-while-revalidate** en `catalog.ts`: página lee de memoria al instante (~0,3s), descarga 1/hora en background, stale-on-error. Solo la 1ª visita tras arrancar el contenedor paga la descarga. Verificado 4s→0,3s. **Palanca futura si la hoja crece mucho más:** mover precios a Postgres con cron diario (aún no necesario).
3. **Riesgo precio vs ETO:** `Our Target`/`price` es la tarifa objetivo del cliente, no necesariamente lo que cobra el motor de reservas ETO. El cliente asumió el riesgo. Si divergen, la web muestra un precio y el widget cobra otro.
4. **Las 695 rutas antiguas** usaron el script viejo de Wikimedia → pueden tener imágenes sin crédito visible (posible atribución pendiente preexistente, no causada por este trabajo). Revisar si preocupa legalmente.
5. **50 rutas de Málaga sin foto** (resorts de golf/urbanizaciones). Activadas igual. Pendiente decidir si darles imagen genérica de comarca (hay `comarcas.json` mapeado en scratchpad, y `add-route-images-pexels.mjs` con lógica de comarca) o dejarlas.
6. **ANTHROPIC_API_KEY** en `.env.local` de Titan (cuenta compartida con webmetalextremo). Se recargaron $30, quedan ~$10. **OPENAI_API_KEY** también en `.env.local` (traducciones).
7. **Comunicar en castellano** con el cliente/usuario.

---

## Commits de esta tanda (todos en `main`, desplegados)
- Campo `hidden` + reveal-routes
- Precio "Desde X €" en vivo de la hoja
- publish-routes.mjs + dedupe-routes.mjs (reemplazan al viejo create-missing-routes)
- Fotos reales de Wikipedia + crédito (schema + componente)
- Tabla de precios por vehículo (`b36f550`)
- Rendimiento: caché de la hoja en memoria, 4s→0,3s (`2124b4e`)

---

## PROMPT PARA CONTINUAR (pegar en chat nuevo)

```
Retomo la publicación por lotes de rutas en titantransfers.com (Next.js+Sanity,
Coolify). Lee docs/HANDOFF-RUTAS-2026-07-24.md para todo el contexto.

Estado: lote de MÁLAGA (AGP, 265 rutas) COMPLETO y en producción (web = 960 rutas
visibles). Pipeline montado: publish-routes.mjs (crea, oculto), 
add-route-images-wikipedia.mjs (fotos+crédito), translate-to-{it,de,ar}.mjs, 
reveal-routes.mjs (revela por tandas). Precio "Desde X€" + tabla de precios por 
vehículo, en vivo de la hoja de Drive.

Quiero hacer el siguiente lote: [ELIGE — recomendado VLC/Valencia por ser costa y
verano]. Antes de crear, haz dry-run de publish-routes.mjs para ese aeropuerto,
revisa casos raros, y confírmame el nº de rutas y coste estimado. Luego, en orden:
crear (oculto) → imágenes → traducciones IT/DE/AR → revelar por tandas.
Comunícate en castellano. No reveles nada a Google sin que el código esté 
desplegado (crédito de imagen es requisito legal de las fotos CC BY-SA).
```
