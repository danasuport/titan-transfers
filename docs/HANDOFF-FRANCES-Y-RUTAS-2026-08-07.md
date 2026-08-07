# Traspaso — Lote 350 rutas + 6º idioma Francés (2026-08-07)

Estado al cierre de la sesión. Todo LISTO EN LOCAL para revisión; **nada revelado ni desplegado** aún.

## Qué se ha hecho

### 1. Lote de 350 rutas turísticas (agosto–septiembre)
- Selección curada en `docs/SELECCION-RUTAS-350-2026-08-07.csv/.md` (Italia, Croacia, España, Portugal, Turquía, Chipre, Francia, Montenegro, Malta, Grecia).
- Creadas con `publish-routes.mjs --routes-file=scripts/_routes-350.txt --apply` (contenido EN+ES nativo, Claude Opus). **350/350 creadas, 0 fallos.** Coste Anthropic ~$26.
- **Nacen OCULTAS** (`hidden:true`): fuera de sitemap y de Google hasta revelarlas.
- Auto-creó lo que faltaba: 4 países (Croacia, Chipre, Malta, Montenegro), ~19 aeropuertos (VLC, NAP, OLB, NCE, DBV...), ~345 ciudades.
- Cambios en `publish-routes.mjs`: nueva opción `--routes-file=`; añadidos al `COUNTRY_MAP`/`COUNTRY_TITLES`/`AIRPORT_NAMES` los países y aeropuertos mediterráneos que faltaban.

### 2. Traducciones (gpt-4o-mini, OpenAI)
- **Rutas: es/it/de/ar/fr = 1310/1310** en TODOS los idiomas (960 antiguas + 350 nuevas).
- Ciudades/aeropuertos/países nuevos traducidos también.

### 3. Imágenes de las rutas nuevas
- `add-route-images-wikipedia.mjs` (es) + nuevo `add-route-images-intl.mjs` (EN + wiki local por país). **~289/350 con foto real** (con crédito CC). Las ~61 sin foto son aldeas/playas sin artículo → las cubre el fallback de página (Capa A: ruta→ciudad→genérica de transfer).

### 4. Francés = 6º idioma (réplica del alemán)
- `config.ts`: `fr` en `locales`, `localeNames`, slugs SEO en `pathTranslations`/`routePrefixTranslations`.
- `routing.ts`: `fr` en TODOS los pathnames (slugs franceses).
- `messages/fr.json` (UI) + `fr` en 286 `pick()` inline de 47 ficheros (`translate-pick-inline-french.mjs`).
- SEO: `fr` en hreflang de las 7 plantillas de página + `sitemaps/[type]/route.ts` + `og:locale` + fallbacks de `generateMetadata.ts` + `catalog.ts` LOCALES.
- Selector de idioma con bandera 🇫🇷 (`LanguageSwitcher.tsx`).
- **Motor de reservas ETO: `fr-FR` ya estaba mapeado** → sin cambios, sin riesgo.
- **Build de producción: verde (exit 0)** con los 6 idiomas.

## PENDIENTE (tras revisión del usuario) — go-live
1. **Push del código a `main`** (Coolify auto-despliega) — el andamiaje francés.
2. **Revelar las 350 rutas**: `node scripts/reveal-routes.mjs --airport=XXX --limit=N --apply` por tandas. Ojo: el gate de reveal ahora exige los 6 idiomas + imagen; las ~61 sin imagen requieren `--force` (el fallback de página las cubre).

## Notas
- Scripts nuevos: `translate-to-french.mjs`, `translate-messages-to-french.mjs`, `translate-pick-inline-french.mjs`, `add-route-images-intl.mjs`.
- Temp: `scripts/_routes-350.txt` (lista de las 350; se puede borrar).
- Cross-border (limitación conocida): unas pocas rutas quedan bajo el país del aeropuerto (p.ej. DBV→Sveti Stefan/Bar bajo Croacia, TIV→Dubrovnik bajo Montenegro). Ajustar a mano en Studio si molesta.
