# Traspaso — Mejora SEO en profundidad (Titan Transfers)

> Documento autocontenido para retomar en un chat nuevo. Estado a 2026-08-11.
> Pega el bloque "PROMPT PARA CONTINUAR" del final en el chat nuevo, o lee esto entero.

---

## 0. Qué es esto / stack
**titantransfers.com** — web de traslados privados. **Next.js 16 (App Router) + Sanity (CMS) + Postgres (analítica)**. Despliegue en **Coolify (Hetzner), NO Vercel**: push a `main` en GitHub → hay que darle a **Redeploy** en el panel Coolify (el push lo hace Claude; el redeploy lo hace el usuario). Comunicación con el usuario **en castellano**.

- **6 idiomas**: en (raíz), es, ar, it, de, **fr** (añadido 2026-08-11). Config en `src/lib/i18n/config.ts` y `routing.ts`.
- **1.368 rutas visibles · 211 aeropuertos · ~1.100 ciudades · 51 países.**
- **Precios dinámicos** (se leen en vivo de una hoja Google Drive vía `src/lib/admin/catalog.ts`). Desde 2026-08-11 se **fuerza siempre la columna E (`price`)** de la hoja (antes caía a F `Our Target`).
- Páginas de detalle (ruta/ciudad/aeropuerto/país/región/blog/servicio) **NO llevan `generateStaticParams`** → renderizan bajo demanda (ISR con `revalidate=3600`). Importante: añadir `generateStaticParams` rompe el build (OOM) y provoca 500 `DYNAMIC_SERVER_USAGE`.

## 1. Estado de despliegue (a 2026-08-11)
Commits en `main` recientes (algunos pendientes de que el usuario dé Redeploy):
- `bafc044` contadores dinámicos "Explora por categoría" + textos "100+"→"200+"
- `6bfedcb` fix contacto móvil (doble prefijo `/es/es/contacto`) + botón ayuda/login
- `e0d1378` precios: siempre columna E
→ Confirmar con el usuario si ya hizo el último Redeploy.

## 2. Ficheros clave para trabajo SEO
- **`src/lib/seo/generateMetadata.ts`** — genera `<title>`, meta description, canonical y hreflang de cada tipo de página. **Aquí se mejora el CTR** (títulos/metas). Tiene fallbacks por idioma (`generateAirportMetadata`, `generateRouteMetadata`, `generateCityMetadata`, `generateCountryMetadata`, `generateRegionMetadata`, `generateBlogMetadata`). Los seoTitle/seoDescription "buenos" vienen de Sanity (por doc); si faltan, usa estos fallbacks.
- **`src/lib/sanity/queries.ts`** — todas las queries. Los `*BySlugQuery` matchean el slug en los 6 idiomas (incluido `translations.fr.slug`). La `routeBySlugQuery` proyecta bloques de traducción es/ar/it/de/fr.
- **`src/app/sitemaps/[type]/route.ts`** — sitemap con hreflang de los 6 idiomas.
- **`src/app/[locale]/**/page.tsx`** — plantillas de cada tipo. La de ruta: `src/app/[locale]/airport/[slug]/[routeSlug]/page.tsx`.
- **`scripts/publish-routes.mjs`** — crea rutas (EN+ES nativo con Claude Opus, ~$0.07/ruta). Opción `--routes-file=`. Nacen ocultas.
- **`scripts/translate-to-{spanish,italian,german,arabic,french}.mjs`** — traducción con OpenAI gpt-4o-mini (barato). Idempotentes.
- **`scripts/add-route-images-{wikipedia,intl}.mjs`** — imágenes reales con crédito. `intl` = EN + wiki local (mejor cobertura internacional).
- **`scripts/reveal-routes.mjs`** — revela rutas ocultas por tandas (gate: exige 6 idiomas + imagen + contenido; `--force` para saltarse imagen).
- Contenido programático de EE.UU.: buscar páginas "servicio de auto privado en el aeropuerto XXX" y "taxi al aeropuerto XXX" (probablemente rutas/ciudades de EE.UU. en Sanity).

## 3. Diagnóstico SEO (Google Search Console, últimos 3 meses)
Datos globales: **~3.444 clics · ~203.378 impresiones · posición media ~16 · CTR ~1,7%**. Móvil rankea mucho mejor (11,8) que escritorio (19,7).

### ✅ Lo que va bien
- **Tendencia al alza real**: clics/día ~27 → ~49 (+88%), impresiones +27%, posición 20 → ~15 en 3 meses.
- **Marca #1-3**: "titan transfers" (325 clics, pos 1,7), variantes, "titan transfers barcelona" (pos 1,3).
- **Nichos ganadores en página 1**: Balcanes (Pristina 8,4 · Tirana 9,9 · Sarajevo · Mostar 6-7), Abu Dhabi (zayed international airport pos 2,6), Tánger (ar, pos 7,1).
- Blog "dubai-vs-abu-dhabi" = imán de impresiones (7.462 impr, pos 5,1).
- Home fuerte: 862 clics, pos 6,0.

### ⚠️ Problemas / oportunidades (ordenados por impacto)
1. **Términos comerciales de alto volumen rankean en página 2-5** (donde está el dinero):
   - "airport transfers" pos **42** · "airport transfer" **47** · "private transfer" **25**.
   - España/Barcelona: "transfer privado barcelona" **1.016 impr, pos 20, 0 clics** · "traslados privados barcelona" (página `/es/traslados-privados-taxi/barcelona/`) **7.560 impr, pos 21** · "transfers privados barcelona" 598 impr pos 15,8 · "transporte privado barcelona" 760 impr pos 18,6.
2. **CTR bajo (1,7%; escritorio 1,2%)** — incluso en posición 8-15 se clica poco → **mejorar títulos/metas** (ganancia más rápida).
3. **Cientos de páginas programáticas con muchas impresiones y 0 clics** (EE.UU.): "servicio de auto privado en el aeropuerto {MCI,PHL,SLC,DTW,...}" y "taxi al aeropuerto {...}" (200-440 impr c/u, pos 10-25, CTR 0). **Riesgo de "scaled content" / calidad baja del dominio.** Auditar: mejorar o `noindex`.
4. **Escritorio rankea peor que móvil** (19,7 vs 11,8) — revisar (SERP features / intención).
5. **España**: mucho volumen, mala posición media (~20) en lo competitivo.
6. **Las +400 rutas nuevas (verano) + francés AÚN no rankean** — recién indexándose. Medir en 4-8 semanas (objetivo: finales sep / oct 2026).
7. Ruido: blog trae tráfico que no convierte (Filipinas 159 clics, "best tapas", "espetos malaga", "ski resorts near milan").

## 4. Plan de acción SEO propuesto (por prioridad)
1. **Subir CTR de lo que ya está en pos 5-15**: reescribir seoTitle/seoDescription (en `generateMetadata.ts` fallbacks y/o en Sanity por doc) más atractivos y con la keyword + "precio fijo / meet & greet / 24h". Empezar por las páginas top de la tabla de "Páginas" del GSC.
2. **Atacar Barcelona/España competitivo**: la página `/es/traslados-privados-taxi/barcelona/` (7.560 impr, pos 21) y las de "traslados/transfer privado barcelona". Mejorar contenido, enlazado interno desde home/rutas, y metas. Es la mayor bolsa de impresiones desperdiciadas.
3. **Auditar las páginas programáticas de EE.UU.** ("servicio de auto privado en el aeropuerto XXX"): decidir mejorar (contenido único real) o `noindex` las que solo generan impresiones sin clics.
4. **Medir el efecto de las rutas nuevas + francés** en 4-8 semanas (nuevo export GSC).
5. (Opcional) Montar `scripts/gsc-report.mjs` con cuenta de servicio de Google + API Search Console para no exportar a mano (ver Opción B más abajo).

## 4-bis. PENDIENTE DE DECISIÓN — reseñas ficticias + `aggregateRating` (apuntado 2026-08-12)
Comprobado con el código y con las plataformas. **No decidido: el usuario lo dejó apuntado para más adelante.**

**Hechos:**
- Los 12 testimonios de `src/components/sections/Testimonials.tsx` (líneas 72-115) están **escritos a mano**: nombres inventados ("Sarah M., London"), cada uno con el logo de **Trustpilot / Google / Trusted Shops** encima. No hay esquema en Sanity, ni API, ni fichero de datos detrás.
- La cabecera del bloque muestra **"4.8/5 · +2.500 reseñas"** con los tres logos.
- Ese 4.8 con `reviewCount` 500-2.500 se emite como `aggregateRating` JSON-LD (`src/lib/seo/schemaOrg.ts:101` y `generateTaxiServiceSchema`) en **cada** página de ciudad, región, país, aeropuerto y ruta → **~17.000 URLs**.
- **Trustpilot es real y bueno**: perfil de titantransfers.com con **~4,8-4,9 y ~440 reseñas** (snapshots entre 405 y 476). Hay perfil aparte de titantransfers.net. **No** se encontró perfil de Trusted Shops. TripAdvisor tiene ficha con reseñas mixtas.
- → La **nota 4.8 sí tiene respaldo**; el **"+2.500" no** (lo verificable es ~440, un 18%).

**Por qué importa:**
- **SEO**: Google **ignora desde 2019** el `aggregateRating` autoreferenciado en `LocalBusiness` → no da estrellas en el SERP, **no aporta CTR**. Se asume riesgo de acción manual por datos estructurados no respaldados a cambio de cero beneficio. Repetir "2.500 reseñas" en 17.000 URLs con `areaServed` distinto es el patrón típico que marcan los revisores de calidad.
- **Legal** (más serio que el SEO): mostrar reseñas ficticias con el logo de la plataforma choca con la Directiva Omnibus (traspuesta en la Ley de Consumidores española), que prohíbe presentar como auténticas reseñas sin verificar su procedencia. Decisión del cliente, pero que la tome informado.

**Opciones (de menor a mayor):**
1. **Mínimo (~30 min)**: quitar `aggregateRating` del JSON-LD (no se pierde nada, ya lo ignora Google) + bajar el contador al número real de Trustpilot.
2. **Recomendado**: sustituir los 12 testimonios por **reseñas reales de Trustpilot** (nombre y fecha reales), dejar solo los logos de plataformas donde haya perfil, contador real.
3. **Completo**: integrar el **widget oficial de Trustpilot** (se actualiza solo y permite marcado de reseñas legítimo bajo su licencia).

> Oportunidad, no solo recorte: hay **440 reseñas reales de 4,8** que la web no está aprovechando.

## 5. Fuente de datos GSC
El usuario TIENE Google Search Console. Hoy pasó un **export manual** (Rendimiento → Exportar → CSV/Sheets: pestañas Consultas, Páginas, Países, Dispositivos, Gráfico, últimos 3 meses). Para automatizar: crear **cuenta de servicio** en Google Cloud → habilitar "Google Search Console API" → añadirla como usuario (Restringido) en la propiedad de GSC → guardar el JSON fuera de git → script con la API. (No hay integración GSC ni rank-tracker en el repo todavía; solo `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.)

Informe para el cliente generado hoy: `docs/INFORME-SEO-2026-08-11.pdf`.

## 6. Trampas / notas
- **Precios**: columna E de la hoja siempre. 32 rutas cambiaron (todas subieron; la mayor: REU→Montecarlo Tarragona 163€→267€, revisar por si es typo en la hoja). 2 rutas sin E (SDU/GIG→Arraial do Cabo) muestran sin precio.
- **Contacto**: en `<Link>` de next-intl usar la ruta canónica (`/contact/`), NUNCA `/${locale}/...` (dobla el prefijo). En `<a>` planos y SkewButton sí se prefija a mano.
- **Build ligero**: no reintroducir `generateStaticParams` en páginas de detalle.
- **ANTHROPIC_API_KEY** y **OPENAI_API_KEY** en `.env.local` (cuenta compartida con webmetalextremo). Recargar Anthropic en https://console.anthropic.com/settings/billing si se van a crear muchas rutas.
- Fechas: hoy es **2026-08-11** (ojo, en docs previos de esta tanda se coló "08-07" por error).

---

## PROMPT PARA CONTINUAR (pegar en chat nuevo)

```
Retomo la MEJORA SEO de titantransfers.com (Next.js 16 + Sanity + Coolify, 6 idiomas
incl. francés, 1.368 rutas / 211 aeropuertos, precios dinámicos col E de la hoja).
Lee docs/HANDOFF-SEO-2026-08-11.md para todo el contexto (diagnóstico GSC + plan).

Quiero entrar a fondo a mejorar posicionamiento. Diagnóstico clave de Search Console
(3 meses): tendencia al alza (clics +88%, pos 20→15), marca #1-3, fuertes en Balcanes/
Abu Dhabi/Tánger, PERO rankeamos mal en términos comerciales de volumen ("airport
transfers" pos 42, "transfer privado barcelona" 1.016 impr pos 20 con 0 clics), CTR
bajo (1,7%), y cientos de páginas programáticas de EE.UU. con muchas impresiones y 0
clics (riesgo scaled content).

Empieza por [ELIGE: subir CTR con mejores títulos/metas en generateMetadata.ts | atacar
Barcelona/España competitivo | auditar las páginas programáticas de EE.UU.]. Propón un
plan concreto y ejecútalo en local; nada de revelar/desplegar sin mi OK. En castellano.
```
