# Titan Transfers — Valoración económica del proyecto

**Cliente:** Titan Transfers
**Proveedor:** KM Adisseny
**Fecha:** 28 de abril de 2026
**Documento:** Propuesta y valoración económica del desarrollo realizado

---

## 1. Resumen económico

| Concepto | Importe (sin IVA) |
|---|---:|
| **Total desarrollo** | **34.500 €** |
| Mantenimiento mensual recomendado (opcional) | 480 €/mes |
| Hosting Hetzner + servicios cloud (estimado mensual) | 65 €/mes |

> Las cifras siguen las **tarifas medias del mercado español 2025–2026** para un proyecto Next.js + headless CMS multi-idioma de esta envergadura, ejecutado por agencia con perfil senior.

---

## 2. Contexto de mercado (España, 2025–2026)

| Tipo de proveedor | €/hora |
|---|---:|
| Freelance junior (WordPress básico) | 25–40 €/h |
| Freelance senior (full-stack, React/Next.js) | 55–80 €/h |
| **Agencia digital media (perfil de este proyecto)** | **60–90 €/h** |
| Agencia top / consultora premium (Madrid/BCN) | 90–150 €/h |

**Una web tipo Titan Transfers** (portal multi-idioma, headless CMS, migración SEO de 358 URLs, integración con sistema de reservas externo, tracking publicitario) suele costar:

- Web corporativa simple (5-10 páginas, sin CMS): 1.500 - 4.000 €
- Web con CMS y blog (15-30 páginas): 4.000 - 9.000 €
- Tienda online / portal multi-idioma medio: 8.000 - 18.000 €
- **Portal complejo + CMS headless + i18n + SEO migración avanzada (caso Titan):** **25.000 - 60.000 €**

Titan Transfers entra en la franja media-alta de la última categoría.

---

## 3. Desglose por partidas

### 3.1 Análisis, arquitectura y estrategia (40 h × 70 €/h = 2.800 €)
- Reuniones iniciales, levantamiento de requisitos
- Auditoría del WordPress original (358 URLs en sitemap real)
- Diseño de arquitectura técnica (Next.js 16 App Router + Sanity headless)
- Estrategia de migración SEO con cross-referencing contra Sanity
- Decisiones de stack (i18n, CMS, hosting Coolify/Hetzner, ETO, GA4)

### 3.2 Diseño UI/UX (50 h × 65 €/h = 3.250 €)
- Identidad visual (verde corporativo `#8BAA1D`, gris `#242426`)
- Diseño responsive de Home, fichas aeropuerto, ciudad, ruta, blog, formularios
- 50+ componentes con animaciones (skew, transiciones)
- Mockups, iteraciones y validaciones con cliente

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
- Acción custom de traducción IA (Anthropic SDK)
- 4 API Routes: megamenu (cache), search (autocomplete), translate (proxy IA), revalidate (webhook ISR)
- Cliente Sanity con queries GROQ optimizadas

### 3.5 Internacionalización EN + ES (30 h × 70 €/h = 2.100 €)
- next-intl con rutas traducidas a nivel slug
- 2 archivos de mensajes (~325 strings cada uno)
- Hreflangs automáticos
- Switcher de idioma con detección de URL alternativa correcta vía `<link rel="alternate">`
- Decisión de producto: simplificar a 2 idiomas (en lugar de 11) para reducir mantenimiento de contenido

### 3.6 SEO técnico avanzado y migración de URLs (60 h × 80 €/h = 4.800 €)

**Esta es la partida más diferencial del proyecto.** Trabajos:
- Sitemap-index dinámico + 8 sub-sitemaps (pages, airports, routes, cities, countries, regions, services, blog)
- Generadores de metadata específicos por tipo de contenido
- Schema.org JSON-LD (LocalBusiness, TaxiService, Article, BreadcrumbList)
- Canonical URLs por locale (cada idioma usa su slug traducido)
- OG tags y Twitter Cards
- robots.txt + protección de áreas privadas
- **Sistema de redirects en 3 capas con cross-referencing contra Sanity:**
  - Script Node.js que cruza las 358 URLs antiguas de `/rutas/` con los slugs reales de Sanity (origen + IATA + destino) y genera mapping específico
  - 356 redirects exactos URL antigua → URL nueva
  - Validación masiva con curl: **99,4% redirects específicos, 0 errores 404**
  - Reglas estáticas para upgrades de URL (cities, countries, regions, contact, etc.)
  - Reglas dinámicas en build-time desde Sanity para slugs heredados
- 358 URLs originales validadas una a una contra el JSON generado

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
- **Google Places Autocomplete** integrado en BookingForm para origen y destino

### 3.9 Tracking y conversión Google (15 h × 70 €/h = 1.050 €)
- Configuración de Google Analytics 4 (`G-MNJCJ137ZL`)
- Configuración de Google Ads (`AW-17350153035`)
- Carga unificada de gtag.js (sin duplicación)
- Disparo de evento `conversion` en submit del booking form
- Etiqueta de conversión `qeFICP6D9aobEMummdFA`
- Event callback + safety net de 1.5 s para garantizar redirección al iframe ETO incluso si gtag falla

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
- Validación masiva de 358 redirects
- Auditoría Lighthouse
- Corrección de bugs detectados

### 3.12 Despliegue Hetzner/Coolify y configuración cloud (15 h × 75 €/h = 1.125 €)
- Dockerfile listo (output `standalone`)
- Configuración Coolify en Hetzner
- Subdominio temporal de test (sslip.io) operativo
- Plan de migración DNS desde SiteGround (sin romper Google Workspace)
- Configuración del dominio + Let's Encrypt
- Setup del webhook Sanity → revalidate

### 3.13 Documentación y entrega (10 h × 60 €/h = 600 €)
- 3 documentos PDF de cliente (Estado, Plan de despliegue, Valoración)
- Manual de uso del CMS
- Plantillas de contenido para blog (`docs/blog-content-templates.md`)
- Mega-prompt de migración (`megaprompt_titan_transfers_v2.md`)

---

## 4. Suma total y horquillas de mercado

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
| Tracking GA4 + Google Ads | 15 h | 1.050 € |
| Funcionalidades adicionales | 20 h | 1.400 € |
| QA / testing | 20 h | 1.300 € |
| Despliegue Hetzner/Coolify | 15 h | 1.125 € |
| Documentación y entrega | 10 h | 600 € |
| **TOTAL desarrollo** | **575 h** | **41.150 €** |
| **Descuento comercial / cierre de proyecto** | | **−6.650 €** |
| **PRECIO FINAL (sin IVA)** | | **34.500 €** |
| IVA 21% | | 7.245 € |
| **TOTAL CON IVA** | | **41.745 €** |

### Comparativa de mercado para este alcance (2026)

| Tipo de proveedor | Estimación equivalente |
|---|---:|
| Agencia premium Madrid/BCN | 50.000 - 70.000 € |
| **Agencia digital media (este precio)** | **30.000 - 40.000 €** |
| Equipo freelance senior coordinado | 25.000 - 32.000 € |
| Freelance único senior (riesgo: bus factor) | 16.000 - 24.000 € |

---

## 5. Servicios opcionales recurrentes

### 5.1 Mantenimiento mensual recomendado — 480 €/mes

Incluye:
- Actualización mensual de dependencias (Next.js, React, Sanity)
- Monitorización de errores y rendimiento (Sentry / Coolify metrics)
- Soporte técnico por email/WhatsApp (respuesta < 24h laborables)
- Hasta **4h mensuales** de cambios menores
- Backup mensual de la BBDD Sanity
- Revisión SEO trimestral (Search Console + posicionamiento de keywords)

### 5.2 Hosting y servicios cloud — ~65 €/mes

| Servicio | Coste mensual |
|---|---:|
| Coolify en Hetzner (CX22 / CPX21) | 8 - 15 € |
| Sanity (free hasta cierto uso, después Growth $99/mes solo si crece mucho) | 0 - 30 € |
| Sanity CDN (imágenes) | incluido |
| Dominio + SSL (Let's Encrypt gratis) | 1 - 2 €/mes |
| Email transaccional (Resend / SendGrid) | 0 - 15 € |
| OpenAI API (traducciones bajo demanda) | 5 - 25 € |
| **Total** | **~65 €/mes** |

> **Ahorro vs SiteGround:** SiteGround GoGeek suele ser 25-30 €/mes solo para hosting. Hetzner + Coolify cuesta menos y da más control.

### 5.3 Servicios adicionales bajo demanda

| Servicio | Precio orientativo |
|---|---|
| Bolsa de horas de desarrollo (10 h) | 750 € (75 €/h) |
| Nuevo idioma completo (traducción + integración) | 800 - 1.200 € |
| Integración nueva (CRM, mailing, payment gateway) | 600 - 2.500 € |
| Auditoría SEO completa + plan de acción | 850 € |
| Campaña de blog (10 posts SEO con IA + revisión humana) | 1.200 € |

---

## 6. Forma de pago propuesta

| Hito | % | Importe (sin IVA) |
|---|---:|---:|
| 1. Reserva de proyecto / arranque | 30 % | 10.350 € |
| 2. Entrega de diseño y maquetación inicial | 20 % | 6.900 € |
| 3. Entrega de funcionalidades + Sanity | 25 % | 8.625 € |
| 4. Lanzamiento en producción | 25 % | 8.625 € |
| **Total** | **100 %** | **34.500 €** |

> Si el proyecto ya está prácticamente entregado (caso actual), se factura en los 1-2 hitos restantes.

---

## 7. Garantía y postventa

- **Garantía de 60 días post-lanzamiento** sobre bugs imputables al desarrollo (sin coste)
- **Soporte gratuito durante 30 días** para resolución de dudas de uso del CMS
- Documentación entregada (3 PDFs) + manual CMS
- Código fuente entregado en el repo Git del cliente con licencia de uso indefinida

---

## 8. Justificación del precio

Este proyecto **no es una web corporativa estándar**. Justifican el precio:

1. **Volumen de páginas dinámicas:** Sanity alimenta cientos de URLs (aeropuertos, ciudades, países, regiones, rutas, blog) — escala enterprise, no escala folleto.

2. **Migración SEO crítica desde WordPress:** **358 URLs cross-referenciadas con Sanity para generar redirects específicos**. Validación masiva con 99,4% de redirects específicos exactos. Esto **preserva el ranking SEO** que ya tiene la web.

3. **Stack moderno y mantenible:** Next.js 16 + React 19 + Sanity headless. No es un WordPress que cualquier freelance puede tocar; requiere perfil senior. Esto encarece desarrollo pero **abarata mantenimiento futuro** y mejora performance, SEO y UX.

4. **Integraciones críticas:** ETO (reservas) + Google Places (autocomplete) + GA4 + Google Ads conversion tracking. No son features triviales.

5. **Hosting cloud-native:** Docker standalone + Coolify + Hetzner. Más barato y rápido que el WordPress en SiteGround anterior, manteniendo control total.

6. **Documentación operativa:** 3 PDFs profesionales (Estado, Plan de despliegue paso a paso, Valoración). Plan de despliegue cubre el cambio DNS sin romper Google Workspace ni el SEO.

Una **agencia premium** facturaría este mismo proyecto entre **50.000 € y 70.000 €**. El precio propuesto está **un 30-40% por debajo**, manteniendo el mismo nivel técnico.

---

## 9. Validez de la oferta

Esta valoración tiene **una validez de 30 días naturales** desde la fecha del documento. Pasado ese plazo, los importes pueden revisarse al alza por actualización de tarifas internas (incremento medio anual del 4-6%).

---

**KM Adisseny**
Diseño y desarrollo web Barcelona — kmadisseny.es
