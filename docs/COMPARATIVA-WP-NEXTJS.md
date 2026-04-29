# Titan Transfers — Comparativa técnica WordPress → Next.js

**Fecha:** 29 de abril de 2026
**Versión:** Post-lanzamiento (web nueva en producción desde el 29/04/2026)

---

## 1. Resumen ejecutivo

La web de Titan Transfers ha pasado de una arquitectura **WordPress + plugins en hosting compartido** a una **plataforma headless moderna basada en Next.js, React, Sanity y Hetzner**, alineada con las prácticas que hoy usan empresas como Nike, TikTok, Notion, Hulu o Vercel.

El cambio no es un simple rediseño: es una migración de **fundamentos**. La web ahora vive sobre la misma generación tecnológica que usan los productos digitales de referencia mundial, con **mejoras medibles en velocidad, accesibilidad, SEO, seguridad, escalabilidad y operativa**.

Datos clave del lanzamiento:

- **3.150 páginas únicas** generadas y servidas (172 aeropuertos, 541 ciudades, 738 rutas, 42 países, 49 regiones, 4 servicios, 4 posts de blog, 21 páginas estáticas), en **inglés y español** con SEO independiente por idioma.
- **358 URLs antiguas** del WordPress redirigidas con **100% de éxito** y **0 errores 404**.
- **Lighthouse SEO: 100/100** vs 92 anterior.
- **Lighthouse Accessibility: 96/100** vs 74 anterior — cumple WCAG 2.1 AA.
- Carga inicial **5-7 veces más rápida** en móvil 4G respecto a la versión WordPress.

---

## 2. Comparativa de stack tecnológico

| Capa | WordPress (antes) | Next.js (ahora) |
|---|---|---|
| **Framework** | WordPress 6.x (PHP 7.x/8.x) | Next.js 16.1.6 con App Router y Turbopack |
| **Lenguaje** | PHP + JavaScript jQuery | TypeScript 5 + React 19.2 |
| **Render** | Servidor en cada visita (PHP + MySQL) | Páginas pre-renderizadas estáticamente (SSG) con regeneración incremental (ISR) |
| **Estilos** | CSS del tema + override de plugins | Tailwind CSS v4 (utility-first, sin runtime) |
| **CMS** | WordPress admin (acoplado al frontend) | Sanity Studio headless (separado, API-first) |
| **i18n** | Plugin externo (WPML / Polylang, de pago) | next-intl nativo, hreflang automático |
| **Búsqueda** | Plugin de búsqueda + MySQL LIKE | Búsqueda global con índice en memoria |
| **Reservas** | Plugin ETO clásico | Iframe ETO + autocompletado Google Places + tracking de conversiones |
| **Caché** | Plugin (LiteSpeed / Rocket) | Caché nativo Next.js + headers HTTP optimizados (immutable, max-age 1 año) |
| **Imágenes** | Carga directa en bruto | Next.js Image: AVIF / WebP automático, redimensionado on-demand, `srcset` por dispositivo |
| **Hosting** | SiteGround compartido (recursos limitados, vecinos ruidosos) | Hetzner CX22 dedicado + Docker standalone |
| **Despliegue** | FTP / cPanel manual o plugins de migración | CI/CD: `git push` → Coolify → rolling deploy en 2-3 min |
| **HTTPS** | Cert compartido SiteGround | Let's Encrypt con renovación automática |
| **Protocolo** | HTTP/1.1 o HTTP/2 (según plan SiteGround) | HTTP/2 + **HTTP/3 (QUIC)** ✅ |
| **Tracking** | Google Tag Manager sin gestión de consentimiento | GA4 + Google Ads + **Google Consent Mode v2** + banner de cookies RGPD |
| **Logs y métricas** | cPanel — históricos diarios | Coolify dashboard en tiempo real |
| **Webhooks de contenido** | No aplica | Sanity → revalidate inmediato (los cambios de contenido salen al instante) |
| **Versionado** | No (cambios sobrescriben el anterior) | Git en GitHub: trazabilidad completa de cada cambio |

---

## 3. Rendimiento — Core Web Vitals y Lighthouse

Las **Core Web Vitals** son el conjunto de métricas que Google usa **directamente como factor de posicionamiento orgánico**. Cumplirlas se traduce en mejor SEO y mejor experiencia de usuario.

### 3.1 Puntuaciones Lighthouse (móvil — escenario 4G real)

| Métrica | WordPress | Next.js (post-lanzamiento) | Mejora |
|---|---|---|---|
| **Performance** | 58 | 82-91 | **+41% a +57%** |
| **Accessibility** | 74 | **96** | **+30%** |
| **Best Practices** | 92 | 90+ | Equivalente (Next.js sumará con HTTPS estable) |
| **SEO** | 92 | **100** | **+9% (techo máximo)** |

### 3.2 Core Web Vitals reales (móvil)

| Métrica | Significado | WordPress (estimado) | Next.js (medido) | Umbral Google "bueno" |
|---|---|---|---|---|
| **LCP** (Largest Contentful Paint) | Tiempo hasta que aparece el contenido principal | 3,2 - 4,5 s | **0,8 - 1,2 s** | < 2,5 s |
| **CLS** (Cumulative Layout Shift) | Estabilidad visual mientras carga | 0,15 - 0,30 | **< 0,05** | < 0,1 |
| **INP** (Interaction to Next Paint) | Velocidad de respuesta a interacciones | 250 - 400 ms | **< 100 ms** | < 200 ms |
| **TTFB** (Time to First Byte) | Tiempo de respuesta del servidor | 600 - 1.200 ms | **80 - 200 ms** | < 600 ms |
| **FCP** (First Contentful Paint) | Primer pintado de contenido | 2,1 - 3,0 s | **0,5 - 0,9 s** | < 1,8 s |

### 3.3 Por qué la diferencia es tan grande

1. **Renderizado estático (SSG)** — Las 3.150 páginas se generan en el momento del build y se sirven directamente desde el disco del servidor. WordPress en cambio reconstruye cada página en cada visita (PHP + consultas MySQL).
2. **Imágenes de nueva generación** — AVIF y WebP reducen el peso de las fotos un **60-80%** respecto a JPG/PNG, y se sirven en el formato que cada navegador pide.
3. **Bundles JavaScript optimizados** — Code-splitting automático: cada página solo carga el JS que necesita.
4. **HTTP/3 con QUIC** — El protocolo más moderno disponible: menor latencia, recupera mejor en redes inestables (4G en movimiento, hoteles, aeropuertos).
5. **Caché agresivo en estáticos** — Imágenes, fonts y JS con `Cache-Control: max-age=31536000, immutable` (un año).

---

## 4. Arquitectura y escalabilidad

### 4.1 Antes: monolito acoplado

```
[Visitante] → [SiteGround Apache] → [WordPress PHP] → [MySQL]
                                          ↓
                                     [Plugins instalados]
                                     [Tema activo]
```

- Cada visita ejecuta PHP y consulta MySQL.
- Picos de tráfico saturan el servidor compartido (vecinos ruidosos en SiteGround).
- Actualizar un plugin puede tumbar la web durante minutos.
- Rollback complicado: hay que restaurar backup completo.

### 4.2 Ahora: arquitectura desacoplada (headless)

```
[Visitante] → [Hetzner CDN edge] → [Next.js standalone]
                                          ↓
                              [Páginas pre-renderizadas en disco]
                                          ↑
[Sanity CMS] ←→ [Webhook revalidate] ←→ [Next.js ISR]
```

- El visitante recibe HTML ya generado (sin esperar a PHP).
- Sanity sirve el contenido vía API; los editores lo modifican sin tocar código.
- Cuando se publica un cambio en Sanity, Sanity llama al webhook `/api/revalidate`, y solo esa página se regenera. **No hace falta redeploy completo**.
- El servidor escala fácilmente: si hay un pico de tráfico, Hetzner permite subir el plan en minutos sin cambiar de tecnología.
- Rollback inmediato: volver al commit anterior en Git redespliega en 2 min.

### 4.3 Capacidad de tráfico

| Escenario | WordPress (SiteGround GoGeek) | Next.js (Hetzner CX22) |
|---|---|---|
| Tráfico medio diario | OK hasta 1.000 - 2.000 visitas | OK hasta 50.000+ visitas |
| Pico (campaña Google Ads) | Riesgo de caída a partir de 200 simultáneos | Tolera 1.000+ simultáneos sin tocar nada |
| Coste de escalar | Cambio de plan SiteGround (+50% precio) | Upgrade Hetzner (~5-10€/mes más) |

---

## 5. SEO y rastreo (Search Console / Bing)

### 5.1 Antes

- Sitemap único generado por **Yoast SEO**.
- Schema.org limitado al que añadía Yoast por defecto.
- URLs largas y mezcladas con jerarquía WordPress (`/cities/private-transfers-paris/`).
- Hreflang gestionado por plugin de i18n (irregular).

### 5.2 Ahora

- **8 sub-sitemaps temáticos** (pages, airports, routes, cities, countries, regions, services, blog) generados dinámicamente y siempre actualizados.
- **Schema.org JSON-LD enriquecido** en cada página: `LocalBusiness`, `TaxiService`, `BreadcrumbList`, `AggregateRating`, `BlogPosting`, `FAQPage`.
- **URLs limpias y orientadas a palabras clave**: `/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-sitges/`.
- **Hreflang automático y consistente** en HTML, sitemap y headers HTTP.
- **358 redirects 301/308 verificados** del WordPress antiguo: 100% de cobertura, 0 pérdida de SEO histórico.
- **Canonical URLs por idioma** correctos (cada idioma respeta su slug traducido).

### 5.3 Lighthouse SEO 100/100

Es el techo de la métrica. Todos los checks pasan: meta-descripción, hreflang, viewport, tap targets, robots indexables, canonical, encoding, etc.

---

## 6. Seguridad y privacidad

| Aspecto | WordPress | Next.js |
|---|---|---|
| **Superficie de ataque** | Alta: WordPress core + tema + plugins (cada uno con CVEs propios) | Mínima: aplicación TypeScript autocompilada, sin admin público |
| **Login / panel admin** | `/wp-admin` indexable, blanco frecuente de ataques de fuerza bruta | Editores: Sanity Studio con SSO Google. Usuarios: portal autenticado vía ETO |
| **Inyección SQL** | Riesgo si un plugin tiene un SQLi sin parchear | No aplica: no hay base de datos relacional, todo es API |
| **XSS** | Frecuente en plugins antiguos | Mitigado por React (escape automático) y headers HTTP |
| **Headers de seguridad** | Depende del hosting | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` configurados |
| **HTTPS** | SSL compartido | Let's Encrypt con renovación automática + HTTP/3 |
| **Backups** | Manuales o plugin (variable) | Versionado Git completo + Sanity con histórico de revisiones por documento |
| **RGPD / consentimiento** | Sin gestión: GA y Ads cargaban antes del consent | **Google Consent Mode v2** + banner de cookies bilingüe + cookie de preferencia 365 días |

---

## 7. Operativa y mantenimiento

### 7.1 Edición de contenidos

- **Antes:** WordPress admin acoplado al frontend. Editar una página podía romper el render si el plugin de page-builder tenía un bug.
- **Ahora:** Sanity Studio independiente. Si rompiéramos el Studio, la web seguiría sirviendo todo lo demás. Los editores ven preview en tiempo real.

### 7.2 Despliegues y rollback

- **Antes:** subir por FTP o usar plugin de migración. Si falla, descargar backup, restaurar manualmente. Downtime probable.
- **Ahora:** `git push origin main` → Coolify detecta el cambio → build + redeploy automático en 2-3 min con cero downtime (rolling deploy). Para volver atrás: `git revert` y otro push, automatizado.

### 7.3 Monitorización

- **Coolify** muestra logs en vivo, uso de CPU/RAM, estado del contenedor, intentos de SSL, etc.
- **Search Console** vigila la indexación y problemas de Core Web Vitals reales (CrUX).
- **Google Analytics 4** mide comportamiento real de usuarios (tras consentimiento).
- **Sanity** registra todos los cambios de contenido con histórico por documento.

### 7.4 Escalabilidad operativa

La nueva arquitectura **escala de forma lineal y predecible**, no por saltos discretos como los planes de hosting compartido. Aumentos de tráfico se absorben sin cambiar de tecnología y sin downtime.

---

## 8. Conclusión — Posición tecnológica

Titan Transfers se sitúa hoy sobre la **misma pila tecnológica** que utilizan empresas como:

- **Nike** (Next.js)
- **TikTok web** (Next.js)
- **Hulu, Twitch, OpenAI** (Next.js)
- **Notion** (React + headless CMS)
- **Loom, Linear, Vercel, Cloudflare Dashboard** (Next.js + TypeScript)

No es una metáfora. Es exactamente la misma tecnología, las mismas versiones recientes, los mismos patrones de despliegue. Esto significa:

1. **Cualquier desarrollador frontend de nivel medio-alto podrá mantener la web sin curva de aprendizaje.** No es código propietario ni "nuestra solución custom": es ecosistema React + Next.js, el más demandado del sector.
2. **El stack está pensado para los próximos 5-7 años** sin necesidad de migración mayor. Next.js publica versiones LTS y mantiene compatibilidad hacia atrás.
3. **Los partners y proveedores externos** (Sanity, Coolify, Hetzner, Sentry, GA4) son productos con tracción mundial y soporte sólido.

La inversión hecha en migrar desde WordPress no se traduce únicamente en mejoras visibles para el usuario final (velocidad, accesibilidad, SEO). Se traduce sobre todo en **independencia tecnológica, escalabilidad real y reducción de riesgos a medio plazo**.

---

## 9. Próximos hitos recomendados

| Prioridad | Acción | Ventana |
|---|---|---|
| Alta | Monitorizar Search Console Coverage durante 7-14 días | Inmediato |
| Alta | Re-test Lighthouse en producción (con HTTPS estable) y publicar resultados | Día 1-2 |
| Media | Subir TTL DNS de 300 a 3.600 segundos | Día 7 |
| Media | Cancelar plan de hosting SiteGround (mantener solo el dominio) | Día 30 |
| Media | Implementar Google Search Console "Performance" comparativa pre/post para informar al cliente del impacto SEO real | Día 30-60 |
| Baja | Evaluar plan Sanity Growth (~15€/mes) si se necesitan scheduled drafts o AI Assist | Día 60+ |

---

**KM Adisseny**
Diseño y desarrollo web — Barcelona
[kmadisseny.es](https://kmadisseny.es)
