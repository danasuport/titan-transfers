# Prompt para continuar la integración del booking

> Copia todo lo que hay debajo de la línea horizontal y pégalo como primer mensaje en un chat nuevo de Claude.

---

Hola Claude. Estoy a mitad de integrar el sistema de reservas de Titan Transfers en una web nueva Next.js. Lee primero todo este contexto antes de actuar.

---

## CONTEXTO GENERAL

- **Web nueva**: Next.js 16 + React 19 + Sanity, desplegada en **Coolify @ Hetzner** (`168.119.168.36`). URL test: `http://ws0o4c4cowosk4sskkoockg4.168.119.168.36.sslip.io/`
- **Web vieja (la del cliente)**: WordPress en SiteGround (IP `35.214.235.91`), accesible hoy en `https://titantransfers.com` porque el DNS apunta ahí. **No la vamos a cancelar**, el cliente paga un plan SiteGround con 200+ webs.
- **Working dir local**: `/Users/WEBKMABCN/Documents/titan` (macOS).
- **Repo Git**: `https://github.com/danasuport/titan-transfers` — rama `main` desplegada por Coolify.
- **Trabajamos en castellano**. KM Adisseny (Barcelona). Email: `teamkmadisseny@gmail.com`.
- **Coolify NO auto-deploya con cada push** (webhook GitHub App roto). Cada vez hay que pulsar **Redeploy** manual en el panel.

---

## ESTADO DEL DESPLIEGUE

### Lo que ya se hizo (todo OK)

1. Configuración Coolify completa: vars de entorno, dominios, CORS Sanity, webhook revalidate, Studio, Cookie consent banner (Google Consent Mode v2 RGPD).
2. Bugs pre-corte arreglados (NEXT_PUBLIC_SITE_URL, sitemaps, imagen port-transfers, env var Google Maps).
3. **Corte DNS realizado y revertido el mismo día** porque descubrimos que faltaba migrar el sistema de booking. Los DNS volvieron a apuntar a SiteGround (rollback en 5 min con TTL 300). El cliente NO ha perdido reservas.
4. Web nueva está desplegada en Coolify pero sin DNS público apuntando hacia ella.

### El problema que hizo fallar el corte

El cliente tenía un **plugin custom de pago en WordPress** llamado **Taxi Booking Plugin by M-Rehan** (jrartech.com), v16. NO estaba documentado en el repo ni en la entrega inicial; en el repo solo había `etoplugin.zip` que es el plugin oficial de EasyTaxiOffice (un simple iframe wrapper, sin UI rica).

Ese plugin custom es **el sistema de reservas real del cliente**:
- 8.024 líneas PHP, 23.183 líneas JS, 21.021 líneas CSS, 4 clases (Ajax, API, Shortcode, principal)
- Crea 6 páginas WP automáticas (`/booking/`, `/choose-vehicle/`, `/confirm-booking/`, `/login/`, `/register/`, `/dashboard/`, etc.)
- Crea 2 tablas MySQL (`wp_taxi_bookings`, `wp_tbk_sessions`)
- 22 acciones AJAX: `taxi_calculate_price`, `taxi_create_booking`, `taxi_search_address`, `taxi_user_login`, etc.
- Renderiza UI custom con currency selector, mapa, autocompletado, dashboard de cliente, login/register, etc.
- Conecta a una API Laravel/ETO en `https://www.titantransfers.es/eto/api`

### El plugin tiene su zip extraído en

`/tmp/taxi-plugin/taxi-booking-plugin/` (probablemente borrado al reiniciar). El zip está en `/Users/WEBKMABCN/Documents/taxi-booking-plugin.zip` (FUERA del repo, está en `.gitignore`).

---

## INTENTOS DE INTEGRACIÓN Y POR QUÉ FALLARON

### Intento 1: iframe directo al WP

Iframe a `https://titantransfers.com/booking/`. Funciona pero el cliente lo rechazó: "iframe cutre, no podemos mostrar esto así".

### Intento 2: SSR fetch + embed nativo + proxy AJAX

- Componente Server: fetch al WP, extrae `<div id="taxi-booking-widget">` y `taxi_booking_ajax = {...}`, embeber en página Next.js.
- API route `/api/taxi-booking-ajax` proxea AJAX a `admin-ajax.php` con cookie forwarding bidireccional.
- Plugin JS y CSS servidos desde `/public/taxi-booking/`.
- CSS overrides Titan-themed (`titan-overrides.css`) más reescritura de variables `--taxi-*` heredadas del WP.

**Funcionó visualmente** (verde Titan, sin iframe, integrado), **pero**: cualquier AJAX devolvía `{"success":false,"data":{"message":"Security check failed"}}` o `Server Error`. **El nonce de WordPress no validaba** ni siquiera contra el WP directamente (verificado con curl, mismo nonce + cookies completas + headers de browser).

### Diagnóstico final del fallo del nonce

Hicimos curl directo a `https://titantransfers.com/wp-admin/admin-ajax.php` con:
- nonce extraído del HTML
- cookies del WP (PHPSESSID + las demás)
- headers de browser real (User-Agent, Referer, X-Requested-With, Origin)
- llamada a `taxi_init_v1` primero (devolvió `-1` = nonce inválido)

**El nonce nunca valida desde fuera de un browser real**. El plugin tiene alguna validación adicional que solo se cumple en un browser completo cargando todos los scripts. Replicarlo requeriría headless browser (Playwright/Puppeteer), demasiado complejo.

---

## EL PLAN ACTUAL — Iframe a WP "chrome-less" via MU-plugin

Volvemos al iframe **pero bien hecho**: el plugin se ejecuta en su entorno natural (WP) y nuestro Next.js solo lo embebe. Para que el iframe sea indistinguible de una integración nativa:

1. **MU-plugin en el WP del cliente** que:
   - Detecta `?embed=1` en la URL
   - Oculta header / footer / admin bar / sidebar / breadcrumbs del theme
   - Carga `iframeResizer.contentWindow` para auto-altura del iframe
   - Inyecta CSS Titan-themed (verde `#8BAA1D`, etc.) dentro del iframe
   - Pre-rellena los campos del booking desde URL params (`pickup`, `dest`, `pickup_lat`, `pickup_lng`, `dest_lat`, `dest_lng`, `date`, `time`, `pax`, `lug`) y auto-clica `#calculate-price-btn` si llegan completos → step 2 directo
2. **Iframe en Next.js** a `https://titantransfers.com/booking/?embed=1&...` con `@iframe-resizer/parent` para auto-altura sin scroll, full width.
3. Form de la home (`BookingForm.tsx` y `BlogBookingForm.tsx`) ya emite los URL params correctos con lat/lng de Google Places. Eso ya está commiteado.

### Archivos preparados localmente

```
src/components/booking/TaxiBookingIframe.tsx   ← iframe + iframe-resizer parent
src/components/booking/BookingPageShell.tsx    ← shell mínimo (sin scripts del plugin)
src/app/[locale]/booking/page.tsx              ← página /booking/ usa TaxiBookingIframe
src/components/ui/BookingForm.tsx              ← form home con lat/lng
src/components/blog/BlogBookingForm.tsx        ← form blog con lat/lng
wp-mu-plugin/titan-booking-embed.php           ← MU-plugin para subir al WP cliente
wp-mu-plugin/templates/embed-page.php          ← template chrome-less
```

Los archivos de `wp-mu-plugin/` NO se desplegan con Next.js — el usuario los sube manualmente a SiteGround File Manager en `public_html/wp-content/mu-plugins/`.

### Archivos eliminados (arquitectura del intento 2)

```
src/app/api/taxi-booking-ajax/route.ts         ← proxy AJAX
src/app/api/taxi-booking-html/route.ts         ← proxy HTML
src/components/booking/TaxiBookingWidget.tsx   ← client component
public/taxi-booking/js/titan-prefill.js        ← prefill bridge
public/taxi-booking/css/titan-overrides.css    ← overrides Titan (lo lleva ahora el MU-plugin)
public/taxi-booking/css/taxi-booking.min.css   ← (ya no se usa)
public/taxi-booking/js/taxi-booking*.js        ← (ya no se usan)
```

Algunos pueden no estar borrados todavía — el último commit (`73017e7`) tenía la arquitectura del intento 2. **El siguiente commit que toca hacer es** la limpieza + el iframe nuevo.

---

## ÚLTIMOS COMMITS EN `main`

```
73017e7  Move widget fetch + plugin bootstrap to the client to keep PHP session alive  ← intento 2 (no funcionó por nonce)
7692161  Prefill addresses silently to avoid retriggering the plugin autocomplete
71f3149  Auto-advance to step 2 when /booking/ is loaded with a complete URL state
11ea11b  Prefill plugin step-1 from home/blog booking form URL params
fa366ae  Brand the embedded booking widget so it looks native to titantransfers.com
51e9799  Forward Next.js searchParams to upstream WP fetch for step 2/3
cb21f7e  Forward user cookies on SSR fetch so WP renders the right step state
3b3924c  Add /choose-vehicle/ and /confirm-booking/ pages, override step URLs  ← luego se borraron, plugin usa /booking/?step=N
51e9799  …
0857c41  Embed Taxi Booking Plugin natively (no iframe) via SSR fetch + AJAX proxy
9a31e20  Fix broken port-transfers image reference on services section
deaeee4  Fix CRITICAL sitemap URLs leaking internal container origin
4f1183a  Fix ETO param names + iframe path so booking pre-fills correctly  ← (ETO viejo, ya no aplica)
```

El estado actual local NO está commiteado: tiene los borrados de la arquitectura intento 2 + la nueva con iframe + MU-plugin.

---

## ACCIÓN INMEDIATA QUE TOCA

**Bloqueado en**: el usuario tiene que subir 2 archivos al WP del cliente. Tiene **acceso completo** (SiteGround File Manager + SFTP + WP admin).

### Pasos para el usuario

1. **SiteGround Site Tools → Sitio Web → Gestor de archivos**
2. Navegar a `public_html/wp-content/`
3. Si no existe, crear carpeta `mu-plugins/`
4. Subir `/Users/WEBKMABCN/Documents/titan/wp-mu-plugin/titan-booking-embed.php` a `public_html/wp-content/mu-plugins/`
5. Crear subcarpeta `templates/` dentro de `mu-plugins/`
6. Subir `/Users/WEBKMABCN/Documents/titan/wp-mu-plugin/templates/embed-page.php` ahí

### Verificación

Abrir en incógnito:
```
https://titantransfers.com/booking/?embed=1
```

Debe verse **solo el widget del booking** (sin header / footer / menu del WP). Si se ve eso, el MU-plugin está activo.

### Después de eso

1. Hacer commit + push del estado local de Next.js (iframe + shell + page nuevos, eliminación de proxy/widget client component, etc.)
2. Coolify → Redeploy manual
3. Probar en `http://ws0o4c4cowosk4sskkoockg4.168.119.168.36.sslip.io/booking/`:
   - Carga el iframe a `titantransfers.com/booking/?embed=1`
   - Sin scrolls (gracias a iframe-resizer)
   - Look idéntico a un componente nativo Next.js
4. Probar el flujo completo desde la home (Get a price → llega con params → auto-step2)

---

## STACK RESUMIDO

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16.1.6 (App Router), React 19.2, TypeScript 5 |
| Estilos | Tailwind v4, CSS-in-JS inline |
| CMS | Sanity headless (projectId `6iu2za90`, dataset `production`) |
| i18n | next-intl 4.8 — EN + ES |
| Tracking | GA4 `G-MNJCJ137ZL` + Ads `AW-17350153035` + Google Consent Mode v2 |
| Maps | Google Places Autocomplete (key en env) |
| Hosting nuevo | Coolify v4 → Hetzner CX22, Docker standalone |
| Hosting viejo | SiteGround compartido (200+ webs del cliente, no se cancela) |
| Booking | WP Taxi Booking Plugin by M-Rehan (en SiteGround) embebido vía iframe |

---

## CÓMO TRABAJAR CONMIGO

- **Idioma**: castellano siempre.
- **Tono**: directo, técnico, conciso. Sin parrafadas.
- **Antes de cambios destructivos** (push --force, reset --hard, rm), preguntar.
- **NO TOCAR** registros DNS MX/TXT/CNAME del cliente (correo Google Workspace `info@titantransfers.com`).
- **Coolify NO auto-deploya** — siempre Redeploy manual tras push.
- **Estoy cansado de iteraciones largas** — si algo no funciona en un par de intentos, reconocerlo y proponer alternativa pragmática.
- **Cliente paga SiteGround igual** → mantener WP vivo es viable, no es un "coste extra" para él.

---

## EMPIEZA AQUÍ

1. Recuérdame que tengo que **subir los 2 archivos** del MU-plugin al WP del cliente (rutas y pasos arriba).
2. Cuando confirme que están subidos y `https://titantransfers.com/booking/?embed=1` se ve sin chrome, **haz commit + push** del estado local Next.js (iframe + shell + page + limpieza de la arquitectura del intento 2).
3. Coolify Redeploy manual.
4. Verificamos el flujo en `sslip.io/booking/`.

Si el iframe queda bien, podemos seguir con la FASE 6 (SEO post-corte) y FASE 7 (limpieza) cuando volvamos a cortar el DNS hacia Hetzner. Pero eso lo decidimos cuando todo esté validado.
