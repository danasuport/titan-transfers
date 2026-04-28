# Titan Transfers — Estado de la web para lanzamiento

**Fecha:** 28 de abril de 2026
**Versión:** Pre-lanzamiento (build de producción verificado, redirects validados)

---

## 1. Resumen ejecutivo

La web está **lista para lanzamiento**. El build de producción se ha completado correctamente y la validación masiva de redirects contra las **358 URLs reales del WordPress original** ha dado **356 redirects específicos correctos + 2 redirects de listado raíz correctos = 100% de cobertura SEO** sin un solo 404.

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router + Turbopack) | 16.1.6 |
| Runtime | React | 19.2 |
| Lenguaje | TypeScript | 5.x |
| Estilos | Tailwind CSS v4 + CSS-in-JS (styled-components) | 4.x / 6.1 |
| CMS | Sanity Studio (embed en `/studio`) | 5.13 |
| i18n | next-intl con rutas traducidas | 4.8 |
| Animación | Framer Motion | 12.35 |
| Reservas | iframe ETO (EasyTaxiOffice) | — |
| Tracking | Google Analytics 4 + Google Ads (gtag unificado) | — |
| Mapas | Google Places Autocomplete (booking form) | — |
| Despliegue | Coolify en Hetzner (`168.119.168.36`) — Docker standalone | — |

---

## 3. Funcionalidades implementadas

### 3.1 Tipos de página

- **Aeropuertos** (`/airport-transfers-private-taxi/[slug]/`)
- **Rutas aeropuerto → destino** (`/airport-transfers-private-taxi/[slug]/[routeSlug]/`)
- **Ciudades** (`/private-transfers/[slug]/`)
- **Países** (`/private-transfers-country/[slug]/`)
- **Regiones** (`/private-transfers-region/[slug]/`)
- **Servicios** (`/services/[slug]/`)
- **Blog** (`/blog/[slug]/`) con paginación, categorías y posts relacionados
- **Páginas estáticas:** Home, About, Contacto, FAQ, Booking, Reserva, Acceso/Login, Registro, Reset/Forgot password, Dashboard usuario, Mapa del sitio, Aviso legal, Privacidad, Términos, Cookies

### 3.2 Internacionalización

**Decisión definitiva:** la web se publica en **2 idiomas — Inglés (default) y Español** (los otros 9 idiomas del scaffolding inicial se han eliminado para simplificar mantenimiento de contenidos y reducir el riesgo de SEO duplicado).

- Rutas traducidas a nivel de slug (`/airports/` ↔ `/aeropuertos/`)
- Hreflangs automáticos en `<head>` y sitemap
- Switcher de idioma con detección de URL alternativa correcta (lee el `<link rel="alternate">` del documento)

### 3.3 SEO técnico — migración WordPress a Next.js

**Sistema de redirects 301/308 en 3 capas:**

1. **JSON específico generado contra Sanity** ([scripts/legacy-redirects.json](../scripts/legacy-redirects.json)) — 356 redirects exactos URL antigua → URL nueva, generados con [scripts/generate-legacy-redirects.mjs](../scripts/generate-legacy-redirects.mjs) cruzando las 358 URLs originales de WordPress contra los slugs reales de Sanity (origen + destino + IATA).
2. **Redirects de upgrade de URL** estáticos en `next.config.ts` (cambios de estructura de URL, slug cleanup, antiguas landings).
3. **Redirects dinámicos por aeropuerto** generados en build-time desde Sanity, para los slugs heredados con sufijo `-airport-transfers` o `-aeropuerto`.

**Resultados de validación masiva (358 URLs reales del WP original):**

| Categoría | Cantidad | % |
|---|---:|---:|
| Redirect específico a URL nueva exacta | 356 | 99,4 % |
| Redirect a listado raíz (URLs `/rutas/` y `/es/rutas/`) | 2 | 0,6 % |
| 404 / sin redirect | 0 | 0 % |

**Otras piezas SEO:**
- **Sitemap-index** dinámico (`/sitemap.xml`) → 8 sub-sitemaps (pages, airports, routes, cities, countries, regions, services, blog)
- **Hreflangs** EN/ES en cada URL del sitemap
- **robots.txt** con bloqueo de `/api/`, `/studio/`, login
- **Schema.org JSON-LD** completo: LocalBusiness, TaxiService (rating 4.8 con 2.500+ reseñas), BreadcrumbList, Article (blog)
- **Canonical URLs por locale** correctos (corregidos: ahora respetan el slug traducido en cada idioma, no el slug del parámetro de URL)
- **OG tags y Twitter Cards** en todas las páginas

### 3.4 Tracking y conversión

- **Google Analytics 4:** ID `G-MNJCJ137ZL` configurado en `<head>` global
- **Google Ads:** ID `AW-17350153035` con etiqueta de conversión `qeFICP6D9aobEMummdFA`
- **Conversion tracking:** disparo de evento `conversion` en submit del booking form, con event_callback + safety net de 1.5 s para garantizar la redirección al iframe ETO incluso si gtag falla
- Una única carga de `gtag.js` (no duplicada)

### 3.5 Reservas (ETO)

- Iframe de EasyTaxiOffice en `/booking/`
- BookingForm propio con Google Places Autocomplete (origen y destino) que pasa los parámetros pre-rellenados al iframe
- Mapeo locale → idioma ETO (`en-GB`, `es-ES`)
- Conversión de Google Ads disparada en el momento del submit

### 3.6 Sanity CMS

- 12 esquemas (airport, blogPost, bookingCTA, city, country, page, port, region, route, servicePage, trainStation)
- Studio embebido en `/studio`
- Acción custom de traducción IA (Anthropic SDK) en el desk
- Sistema de traducciones por documento (campo `translations.es`)
- Imágenes vía CDN Sanity con `next/image` (AVIF/WebP)

### 3.7 APIs internas

- `/api/megamenu` — datos del megamenú (cache 5 min en memoria)
- `/api/search` — autocompletado global (mínimo 2 caracteres)
- `/api/translate` — proxy de traducción IA
- `/api/revalidate` — webhook ISR para Sanity

---

## 4. Build de producción — verificación

```
✓ Compiled successfully
Route (app):
  ƒ /[locale]/                      (home)
  ƒ /[locale]/airport/[slug]
  ƒ /[locale]/airport/[slug]/[routeSlug]
  ƒ /[locale]/blog/[slug]
  ƒ /[locale]/city/[slug]
  ƒ /[locale]/country/[slug]
  ƒ /[locale]/region/[slug]
  ƒ /[locale]/services/[slug]
  ƒ /api/{megamenu,revalidate,search,translate}
  ○ /robots.txt
  ƒ /sitemap.xml
  ƒ /sitemaps/[type]
  ƒ /studio/[[...tool]]
```

- Output: `standalone` (Docker-ready)
- Servidor de prueba local arrancado en `http://localhost:3001` y validado con `curl` contra 358 URLs reales

---

## 5. Avisos detectados (no bloqueantes)

### Avisos del framework
1. **`middleware.ts` deprecated en Next 16.** Recomendado renombrar a `proxy.ts` (1 línea de cambio).
2. **`@sanity/image-url` import deprecated.** Migrar a `createImageUrlBuilder`.
3. **Lockfile duplicado** detectado en `~/package-lock.json` (warning de Turbopack).
4. **`typescript.ignoreBuildErrors: true`** activo en `next.config.ts`. Recomendado quitarlo y arreglar lo que aparezca tras el lanzamiento.

### Mejoras opcionales post-launch
- README aún es el por defecto de `create-next-app`.
- `/studio` accesible en producción — recomendado restringir vía Sanity SSO o IP allow-list a nivel proxy de Coolify.
- Cookie banner / consent management no detectado en código (necesario para RGPD ya que GA4 + Google Ads están activos). **Recomendable añadir antes del lanzamiento si la web se dirige a usuarios europeos.**

---

## 6. Riesgos del día del lanzamiento y mitigación

| Riesgo | Mitigación implementada |
|---|---|
| Pérdida SEO de URLs antiguas | 356/358 redirects específicos validados (99,4%) |
| Iframe ETO no carga en dominio nuevo | Autorizar `titantransfers.com` y `www.titantransfers.com` en panel ETO antes del corte DNS |
| Cache Sanity desactualizado | Webhook `/api/revalidate` con secret configurado en Sanity Manage |
| Correo Google Workspace afectado | NO se tocan registros MX/TXT, solo A (ver `PLAN-DESPLIEGUE.md`) |
| Caída de tráfico orgánico | TTL bajo 24h antes; Search Console + Bing Webmaster con sitemap nuevo |
| Conversión publicitaria perdida | GA4 + Google Ads ya configurado en producción con event tracking |

---

## 7. Checklist final pre go-live

- [ ] Confirmar autorización del dominio en panel ETO
- [ ] Configurar webhook Sanity → `/api/revalidate?secret=...`
- [ ] Verificar GA4 (`G-MNJCJ137ZL`) recibe pageviews en Realtime
- [ ] Verificar Google Ads conversion tracking (`AW-17350153035` / `qeFICP6D9aobEMummdFA`)
- [ ] Restringir `/studio` (Sanity SSO o IP allow-list)
- [ ] Cookie consent banner si aplica RGPD
- [ ] Bajar TTL DNS a 300s en SiteGround
- [ ] Backup completo WordPress en SiteGround
- [ ] Cambiar registros A en SiteGround (ver `PLAN-DESPLIEGUE.md`)
- [ ] Validar 10 redirects post-corte con curl
- [ ] Submit `/sitemap.xml` a Google Search Console y Bing Webmaster

---

## 8. Conclusión

Plataforma lista para lanzar:
- Stack moderno (Next.js 16 + React 19 + Sanity)
- 99,4% de redirects específicos contra el inventario real de WordPress
- 0 URLs rotas detectadas en validación masiva local
- Tracking publicitario y analítica activos
- Output Docker en Coolify ya en `http://ws0o4c4cowosk4sskkoockg4.168.119.168.36.sslip.io`

La fase pendiente es **operativa**: cambio DNS en SiteGround sin tocar correo (Google Workspace), validaciones post-corte y submit del sitemap. Detallado paso a paso en `PLAN-DESPLIEGUE.md`.
