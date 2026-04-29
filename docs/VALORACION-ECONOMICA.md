# Titan Transfers — Valoración del proyecto en el mercado

**Fecha:** 29 de abril de 2026
**Documento:** Valoración técnico-económica objetiva del desarrollo realizado, según tarifas de mercado España 2025–2026.

---

## 1. Resumen ejecutivo

El portal de Titan Transfers desarrollado en Next.js 16 + Sanity + Hetzner es, en términos de mercado, un proyecto que **encaja en la franja media-alta de portales corporativos complejos con CMS headless multi-idioma**.

Cifras de referencia:

- **Esfuerzo estimado del proyecto:** 575 horas
- **Valor en el mercado (agencia digital media):** **30.000 - 40.000 €** (sin IVA)
- **Valor en el mercado (agencia premium Madrid/BCN):** **50.000 - 70.000 €** (sin IVA)
- **Resultado entregado:** ~3.150 páginas únicas, bilingüe EN+ES, 358 URLs WordPress migradas con 0 errores 404, Lighthouse SEO 100/100, Accessibility 96/100.

> El objetivo de este documento es **dar contexto del valor objetivo de lo que se ha construido**, según tarifas habituales de mercado. No es una propuesta comercial.

---

## 2. Contexto de mercado (España, 2025–2026)

### 2.1 Tarifas medias por tipo de proveedor

| Tipo de proveedor | €/hora |
|---|---:|
| Freelance junior (WordPress básico) | 25–40 €/h |
| Freelance senior (full-stack, React/Next.js) | 55–80 €/h |
| **Agencia digital media (perfil de este proyecto)** | **60–90 €/h** |
| Agencia top / consultora premium (Madrid/BCN) | 90–150 €/h |

### 2.2 Bandas de precio según complejidad del proyecto

| Tipo de web | Precio mercado |
|---|---:|
| Web corporativa simple (5-10 páginas, sin CMS) | 1.500 - 4.000 € |
| Web con CMS y blog (15-30 páginas) | 4.000 - 9.000 € |
| Tienda online / portal multi-idioma medio | 8.000 - 18.000 € |
| **Portal complejo + CMS headless + i18n + SEO migración avanzada (caso Titan)** | **25.000 - 60.000 €** |

Titan Transfers entra en la franja **media-alta de la última categoría**: 3.150 páginas dinámicas, 2 idiomas con SEO independiente, migración SEO de un WordPress productivo, integración con sistema de reservas externo y tracking publicitario.

---

## 3. Desglose por partidas

### 3.1 Análisis, arquitectura y estrategia (40 h × 70 €/h = 2.800 €)
- Reuniones iniciales y levantamiento de requisitos
- Auditoría del WordPress original (358 URLs en sitemap real)
- Diseño de arquitectura técnica (Next.js 16 App Router + Sanity headless)
- Estrategia de migración SEO con cross-referencing contra Sanity
- Decisiones de stack (i18n, CMS, hosting Coolify/Hetzner, ETO, GA4)

### 3.2 Diseño UI/UX (50 h × 65 €/h = 3.250 €)
- Identidad visual (verde corporativo `#8BAA1D`, gris `#242426`)
- Diseño responsive de Home, fichas aeropuerto, ciudad, ruta, blog y formularios
- 50+ componentes con animaciones (skew, transiciones)
- Mockups, iteraciones y validaciones

### 3.3 Desarrollo frontend (170 h × 75 €/h = 12.750 €)
- Next.js 16 + React 19 + TypeScript
- ~6.200 líneas de TSX, ~50 componentes reutilizables
- Layouts: Header con MegaMenu animado, Footer responsive con acordeón
- Páginas dinámicas (aeropuertos, ciudades, países, regiones, rutas, blog, servicios) y estáticas (about, contacto, FAQ, login, dashboard, legales)
- Animaciones con Framer Motion, estilos Tailwind v4 + CSS-in-JS
- Optimización de imágenes (`next/image` + AVIF/WebP)
- ISR + lazy loading + code splitting

### 3.4 Backend, CMS Sanity y modelado de datos (55 h × 75 €/h = 4.125 €)
- Studio Sanity embebido en `/studio`
- 12 esquemas de contenido
- Sistema de traducciones por documento (`translations.es`)
- Acción custom de traducción IA
- 4 API Routes: megamenu (cache), search (autocomplete), translate (proxy IA), revalidate (webhook ISR)
- Cliente Sanity con queries GROQ optimizadas

### 3.5 Internacionalización EN + ES (30 h × 70 €/h = 2.100 €)
- next-intl con rutas traducidas a nivel slug
- 2 archivos de mensajes (~325 strings cada uno)
- Hreflangs automáticos
- Switcher de idioma con detección de URL alternativa correcta
- Decisión de producto: simplificar a 2 idiomas (en lugar de 11) para reducir mantenimiento de contenido

### 3.6 SEO técnico avanzado y migración de URLs (60 h × 80 €/h = 4.800 €)

**La partida más diferencial del proyecto.** Trabajos:

- Sitemap-index dinámico + 8 sub-sitemaps (pages, airports, routes, cities, countries, regions, services, blog)
- Generadores de metadata específicos por tipo de contenido
- Schema.org JSON-LD (LocalBusiness, TaxiService, BlogPosting, BreadcrumbList, AggregateRating)
- Canonical URLs por locale (cada idioma usa su slug traducido)
- OG tags y Twitter Cards
- robots.txt + protección de áreas privadas
- **Sistema de redirects en 3 capas con cross-referencing contra Sanity:**
  - Script Node.js que cruza las 358 URLs antiguas de `/rutas/` con los slugs reales de Sanity (origen + IATA + destino) y genera mapping específico
  - 356 redirects exactos URL antigua → URL nueva
  - Validación masiva con curl: **100% redirects válidos, 0 errores 404**
  - Reglas estáticas para upgrades de URL (cities, countries, regions, contact, etc.)
  - Reglas dinámicas en build-time desde Sanity para slugs heredados
- 358 URLs originales validadas una a una en producción

### 3.7 Migración de contenido WordPress → Sanity (60 h × 60 €/h = 3.600 €)
- 12 scripts de migración (`scripts/migrate-*.mjs`) por tipo de CPT
- Importación de aeropuertos, ciudades, países, regiones, rutas, blog
- Limpieza de slugs (`clean-airport-slugs`, etc.)
- Enriquecimiento de datos (`enrich-airports`, `generate-route-content`)
- Patch de imágenes (`add-city-images`, `add-country-images`)
- Auditoría de imágenes
- Generación masiva de redirects + scripts de URLs antiguas
- Seeding de contenido ejemplo

### 3.8 Integración del sistema de reservas ETO (30 h × 75 €/h = 2.250 €)
- Configuración del iframe EasyTaxiOffice
- Mapeo locale → idioma ETO
- Builder de URLs con parámetros pre-rellenados (`buildETOUrl`)
- Componentes: BookingForm, BookingFull, BookingWidget, ETOBookingIframe, CustomerPortal
- Soporte de iframe responsivo
- **Google Places Autocomplete** integrado en el formulario para origen y destino

### 3.9 Tracking y conversión Google (15 h × 70 €/h = 1.050 €)
- Configuración de Google Analytics 4
- Configuración de Google Ads
- Carga unificada de gtag.js (sin duplicación)
- Disparo de evento `conversion` en submit del booking form
- Event callback + safety net para garantizar redirección al iframe ETO incluso si gtag falla
- **Google Consent Mode v2** con banner de cookies bilingüe (RGPD)

### 3.10 Funcionalidades adicionales (20 h × 70 €/h = 1.400 €)
- Búsqueda global con autocompletado
- MegaMenu dinámico con datos de Sanity (cache 5 min)
- Blog con paginación, categoría, posts relacionados
- Formulario de contacto
- Footer con widgets de reseñas (Trustpilot, Trusted Shops, Google) y métodos de pago
- Botón flotante de ayuda

### 3.11 QA, testing y optimización (20 h × 65 €/h = 1.300 €)
- Tests cross-browser y responsive
- Build de producción verificado
- Validación masiva de los 358 redirects
- Auditoría Lighthouse (Performance, Accessibility, Best Practices, SEO)
- Corrección de bugs detectados

### 3.12 Despliegue Hetzner/Coolify y configuración cloud (15 h × 75 €/h = 1.125 €)
- Dockerfile listo (output `standalone`)
- Configuración Coolify en Hetzner
- Migración DNS desde SiteGround sin romper el correo Google Workspace
- Configuración del dominio + Let's Encrypt automático
- Setup del webhook Sanity → revalidate

### 3.13 Documentación y entrega (10 h × 60 €/h = 600 €)
- Documentación técnica del proyecto
- Plan de despliegue paso a paso
- Manual operativo del CMS
- Plantillas de contenido para blog
- Comparativa técnica WordPress → Next.js

---

## 4. Suma total y valor de mercado

| Partida | Horas | Importe |
|---|---:|---:|
| Análisis y arquitectura | 40 h | 2.800 € |
| Diseño UI/UX | 50 h | 3.250 € |
| Desarrollo frontend | 170 h | 12.750 € |
| Backend / CMS Sanity | 55 h | 4.125 € |
| i18n EN+ES | 30 h | 2.100 € |
| SEO técnico + migración URLs | 60 h | 4.800 € |
| Migración contenido WP→Sanity | 60 h | 3.600 € |
| Integración ETO + Google Places | 30 h | 2.250 € |
| Tracking GA4 + Google Ads + Consent | 15 h | 1.050 € |
| Funcionalidades adicionales | 20 h | 1.400 € |
| QA / testing | 20 h | 1.300 € |
| Despliegue Hetzner/Coolify | 15 h | 1.125 € |
| Documentación y entrega | 10 h | 600 € |
| **TOTAL desarrollo (esfuerzo a tarifa media)** | **575 h** | **41.150 €** |

### Comparativa de mercado para este alcance (2026)

| Tipo de proveedor | Estimación equivalente |
|---|---:|
| Agencia premium Madrid/BCN | 50.000 - 70.000 € |
| **Agencia digital media** | **30.000 - 40.000 €** |
| Equipo freelance senior coordinado | 25.000 - 32.000 € |
| Freelance único senior (riesgo: bus factor) | 16.000 - 24.000 € |

---

## 5. Justificación del valor

Este proyecto **no es una web corporativa estándar**. Justifican el valor:

1. **Volumen de páginas dinámicas:** Sanity alimenta más de 3.000 URLs públicas (aeropuertos, ciudades, países, regiones, rutas, blog) — escala enterprise, no escala folleto. Cada cambio en el CMS regenera solo la página afectada gracias a ISR + webhook revalidate.

2. **Migración SEO crítica desde WordPress:** **358 URLs cross-referenciadas con Sanity para generar redirects específicos**. Validación masiva en producción con 100% de redirects funcionando y 0 errores 404. Esto **preserva el ranking SEO histórico** que ya tenía la web.

3. **Stack moderno y mantenible:** Next.js 16 + React 19 + Sanity headless + TypeScript. Es la misma pila tecnológica que usan empresas como Nike, TikTok, Hulu, Notion, OpenAI o Vercel. Requiere perfil senior, lo cual encarece desarrollo pero **abarata mantenimiento futuro** y mejora performance, SEO y UX de forma estructural.

4. **Integraciones críticas:** ETO (reservas) + Google Places (autocomplete) + GA4 + Google Ads conversion tracking + Google Consent Mode v2 (RGPD). No son features triviales; cada una requiere su propio análisis de seguridad, privacidad y rendimiento.

5. **Hosting cloud-native:** Docker standalone + Coolify + Hetzner. Más rápido y escalable que el WordPress en SiteGround anterior, con mayor control técnico y trazabilidad operativa.

6. **Documentación operativa:** documentación técnica completa, plan de despliegue paso a paso, comparativa WordPress → Next.js. El plan de despliegue cubre el cambio DNS sin romper Google Workspace ni el SEO indexado.

7. **Resultados medibles en producción:**
   - Lighthouse SEO **100/100** (techo de la métrica)
   - Lighthouse Accessibility **96/100** (WCAG 2.1 AA)
   - Carga inicial 5-7 veces más rápida que la versión WordPress en móvil 4G
   - 100% de los redirects WP → Next.js funcionando

Una **agencia premium** facturaría este mismo proyecto entre **50.000 € y 70.000 €**.

---

**KM Adisseny**
Diseño y desarrollo web Barcelona — kmadisseny.es
