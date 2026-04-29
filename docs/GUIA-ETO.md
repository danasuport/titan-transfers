# Guía operativa del sistema ETO (reservas)

**Fecha:** 29 de abril de 2026
**Estado:** Pre-lanzamiento — bug crítico de recursión arreglado en commit `d54bdd6`

---

## 1. Resumen ejecutivo

**ETO (EasyTaxiOffice)** es el sistema externo que gestiona las reservas de Titan Transfers. La web Next.js **NO procesa reservas internamente** — actúa como capa de captación que reenvía al ETO real con los parámetros que el usuario rellena.

**ETO está alojado en:** `https://www.titantransfers.es/eto/` — un servidor independiente detrás de Cloudflare. Sigue siendo el mismo sistema que usa el WordPress actual; **la migración DNS del lunes no toca ETO**, solo la capa de captación.

**Bug crítico encontrado y arreglado:** la versión anterior del código tenía un iframe que se llamaba a sí mismo (`titantransfers.com/booking/` cargaba `titantransfers.com/booking/`), funcionando solo porque WordPress aún servía esa URL. Tras el corte DNS habría sido recursión infinita. Arreglado en commit `d54bdd6` apuntando el iframe directamente al ETO real (`titantransfers.es/eto/`).

---

## 2. Arquitectura completa

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   USUARIO                                                        │
│      │                                                           │
│      │ rellena origen, destino, fecha, pasajeros, maletas       │
│      ▼                                                           │
│   ┌─────────────────────────────────────────────────────┐       │
│   │  BookingForm  (en home, pages de aeropuerto, etc.)  │       │
│   │  src/components/ui/BookingForm.tsx                  │       │
│   │  · Google Places Autocomplete (origen + destino)    │       │
│   │  · Dispara conversión Google Ads                    │       │
│   └─────────────────────────────────────────────────────┘       │
│      │                                                           │
│      │ submit → window.location.href = `/booking/?...params`    │
│      ▼                                                           │
│   ┌─────────────────────────────────────────────────────┐       │
│   │  Página /booking/  (titantransfers.com)             │       │
│   │  src/app/[locale]/booking/page.tsx                  │       │
│   │  Renderiza <ETOBookingIframe />                     │       │
│   └─────────────────────────────────────────────────────┘       │
│      │                                                           │
│      │ <iframe src="https://www.titantransfers.es/eto/?..." />  │
│      ▼                                                           │
│   ┌─────────────────────────────────────────────────────┐       │
│   │  ETO REAL  (servidor de reservas externo)           │       │
│   │  https://www.titantransfers.es/eto/                 │       │
│   │  Cloudflare + cookies de sesión + Stripe/payments   │       │
│   └─────────────────────────────────────────────────────┘       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Variables de entorno de ETO

Estas variables están en `.env.local` del proyecto y **deben replicarse en Coolify**:

| Variable | Valor actual | Uso | Tipo |
|---|---|---|---|
| `NEXT_PUBLIC_ETO_URL` | `https://www.titantransfers.es/eto/` | URL del iframe ETO | Pública (cliente) |
| `NEXT_PUBLIC_ETO_SITE_KEY` | (vacío) | Identificador opcional de sitio | Pública (cliente) |
| `ETO_API_KEY` | `tbp_8ylG...` | API key para llamadas server-side | Privada |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | (configurado) | Autocomplete de direcciones | Pública (cliente) |

> ⚠️ Las variables `NEXT_PUBLIC_*` se **inyectan en build time** dentro del bundle JS del cliente. Si en Coolify no están configuradas antes de hacer deploy, el bundle se construye con `undefined` y el iframe usará el fallback hard-codeado del código (`https://www.titantransfers.es/eto/`).
>
> **Acción crítica antes del corte DNS:** verificar en Coolify → Configuration → Environment Variables que `NEXT_PUBLIC_ETO_URL` está como variable Build-time.

---

## 4. Componentes del flujo

### 4.1 `src/components/ui/BookingForm.tsx`
- **Dónde aparece:** home, fichas de aeropuerto, ciudad, ruta, blog, services
- **Comportamiento:** captura datos en cliente, hace `window.location.href = '/booking/?type=transfer&step=2&pickup=...'`
- **Cambios recientes:**
  - Aria-labels en todos los inputs/selects (Round 2 Lighthouse)
  - Conversion tracking de Google Ads con `event_callback` y safety net
  - Google Places Autocomplete integrado

### 4.2 `src/components/blog/BlogBookingForm.tsx`
- **Dónde aparece:** dentro de posts del blog
- **Comportamiento:** idéntico al BookingForm principal
- **Cambio crítico (commit `d54bdd6`):** `ETO_BASE` cambiado de `https://titantransfers.com/booking/` (incorrecto, hard-codeado) a `/booking/` (relativo)

### 4.3 `src/components/ui/ETOBookingIframe.tsx`
- **Dónde aparece:** `/booking/` page (carga el iframe)
- **Comportamiento:** lee los `searchParams` de la URL y construye un iframe a `${NEXT_PUBLIC_ETO_URL}?...`
- **Cambio crítico (commit `d54bdd6`):** iframe ya no apunta a `titantransfers.com/booking/` (que era recursión); ahora apunta a `titantransfers.es/eto/` (ETO real)

### 4.4 `src/app/[locale]/booking/page.tsx`
- Página simple que envuelve `<ETOBookingIframe />` con breadcrumbs y un h1
- Metadatos SEO independientes (no es lo mismo que el formulario captador)
- Slugs traducidos: `/booking/` (EN) ↔ `/reserva/` (ES)

### 4.5 `src/lib/eto/config.ts`
- Helper centralizado con `buildETOUrl(type, params)`
- Conoce los nombres de parámetros que ETO espera: `r1cs`, `r1ls`, `r1d`, `lang`, `site_key`, etc.
- **No se usa actualmente** en BookingForm (que usa nombres simples como `pickup`, `dest`, `date` — que ETO también acepta)

### 4.6 `src/components/customer/CustomerPortal.tsx`
- Iframe del portal de cliente ETO en `/user-dashboard/`
- Apunta al ETO via `buildETOUrl('customer', ...)`

---

## 5. Parámetros de URL — qué se envía a ETO

> ⚠️ **Importante (commit `4f1183a`):** los nombres de parámetros que ETO entiende NO son `pickup`/`dest`/`date`. Hay que usar los nombres del plugin oficial de WordPress (verificados leyendo `easytaxioffice.php` del `etoplugin.zip` que está en la raíz del repo).

El BookingForm envía estos params a ETO via la URL del iframe:

| Param | Significado | Ejemplo |
|---|---|---|
| `r1ls` | Origen (route 1 location start) | `Barcelona Airport` |
| `r1le` | Destino (route 1 location end) | `Sitges Hotel Plaza` |
| `r1d` | Fecha + hora `YYYY-MM-DD HH:MM` | `2026-06-15 14:30` |
| `pax` | Número pasajeros (no leído por ETO en URL pero se mantiene) | `2` |
| `lug` | Número maletas (idem) | `3` |
| `r1cs` | Categoría origen (opcional) | — |
| `r1ce` | Categoría destino (opcional) | — |
| `r1wp` | Waypoints separados por `\|` (opcional) | — |
| `r2*` | Misma serie para retorno (`r=2`) | — |
| `s` | Service ID (servicio específico) | — |
| `bookingType` | `to-airport`, `from-airport`, etc. | — |
| `site_key` | Identificador opcional de sitio | — |

URL final del iframe: `https://www.titantransfers.es/eto/booking?r1ls=...&r1le=...&r1d=...`

> Nota: el path correcto es `/booking` (no la raíz). El plugin original de WordPress también construía la URL así (`$url .= 'booking'`).

---

## 6. Headers de seguridad — confirmado que permite iframes

Comprobé los headers HTTP del ETO real:

```
HTTP/2 200
server: cloudflare
content-type: text/html; charset=UTF-8
cache-control: no-cache, private
set-cookie: XSRF-TOKEN=...
set-cookie: titan_transfers_session=...
strict-transport-security: max-age=31536000
```

**No hay** `X-Frame-Options`. **No hay** `Content-Security-Policy frame-ancestors`. Esto significa que **el iframe carga sin problemas desde cualquier dominio**, incluido `titantransfers.com` (Next.js).

> Si en algún momento alguien cambia la config de Cloudflare/ETO y añade `X-Frame-Options: DENY` o `frame-ancestors 'self'`, el booking se romperá. Hay que vigilarlo y, si pasa, configurar la lista blanca para incluir `titantransfers.com` y `*.titantransfers.com`.

---

## 7. Riesgos en el día del lanzamiento

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| `NEXT_PUBLIC_ETO_URL` no está en Coolify env vars | Media | Web carga, fallback funciona; pero si cambia el dominio de ETO el día de mañana habrá que rebuild | Verificar en Coolify ANTES del corte DNS |
| ETO añade `X-Frame-Options` el día del lanzamiento | Baja | Iframe muere | Avisar al admin de ETO antes |
| ETO bloquea el origen `titantransfers.com` por su lista blanca | Baja | Iframe muere o pide auth | Confirmar en panel ETO que está autorizado |
| Cookies del iframe no funcionan (cookies third-party blocked en Safari/Firefox) | Media | Sesión ETO no persiste, usuario tiene que reintroducir datos | ETO debe usar cookies SameSite=None; Secure (probable que ya lo haga) |
| El iframe carga lento y degrada CWV | Baja | Cuenta como LCP en algunas páginas | El iframe SOLO se monta en `/booking/`, no en home — sin impacto general |
| Conversion tracking de Google Ads no dispara | Media | No se contabilizan leads | Hay safety net de 1.5s (`fireConversion` con timeout) |
| Submit del form se queda colgado | Baja | Usuario pulsa "Calcular precio" y no pasa nada | El `event_callback` con timeout garantiza redirect aunque gtag falle |

---

## 8. Cómo testear ETO antes del corte DNS

Hacer estas 5 pruebas **el día anterior al corte**, contra la URL de Coolify (sslip.io):

### 8.1 Test 1 — flujo completo de reserva
1. Ir a `http://ws0o4c4cowosk4sskkoockg4.168.119.168.36.sslip.io/`
2. Rellenar booking form: origen "Barcelona Airport", destino "Sitges", fecha futura, 2 pax, 1 maleta
3. Pulsar "Get a price"
4. Verificar que cambia a `/booking/?type=transfer&step=2&pickup=...&...`
5. Verificar que el iframe se carga y muestra el wizard de ETO en paso 2 con datos pre-rellenados

### 8.2 Test 2 — abrir DevTools y comprobar URL del iframe
1. En `/booking/` con datos
2. F12 → Elements → buscar `<iframe>`
3. **Debe tener** `src="https://www.titantransfers.es/eto/?..."` ✅
4. **NO debe tener** `src="https://titantransfers.com/booking/?..."` ❌

### 8.3 Test 3 — Network tab
1. F12 → Network → reload `/booking/`
2. Filtrar por "iframe" o por dominio
3. Debe haber peticiones a `www.titantransfers.es/eto/...`
4. Status 200 OK
5. No debe haber errores de CORS/X-Frame-Options en consola

### 8.4 Test 4 — conversión Google Ads
1. F12 → Network → filtrar `googleadservices` o `googletagmanager`
2. Pulsar "Get a price" en el form
3. Debe haber petición POST a Google Ads con `conversion` event
4. Verificar en Google Ads → Conversions → "Recent conversions" en realtime

### 8.5 Test 5 — Pago de prueba (opcional pero recomendado)
1. Completar el wizard ETO hasta el paso de datos personales
2. Usar tarjeta de prueba si ETO/Stripe lo permite (no procesar pago real)
3. Si todo va bien hasta la confirmación, el flujo está perfecto

---

## 9. Plan de rollback específico de ETO

Si el día del lanzamiento se rompe el booking:

### Síntoma A — el iframe no carga (en blanco)
1. Abrir `/booking/?test=1` en producción
2. F12 → Console → buscar errores de CORS, X-Frame-Options o CSP
3. Si es CORS → contactar ETO/Cloudflare para añadir `Access-Control-Allow-Origin: https://titantransfers.com`
4. Si es X-Frame-Options → ETO ha cambiado config; pedir reverter
5. Mientras se arregla: **revertir DNS a SiteGround** (vuelve a WordPress, que sí funciona)

### Síntoma B — el iframe carga pero los params no se aplican
1. ETO ha cambiado la API. Comprobar `lib/eto/config.ts` y los nombres de params
2. Mientras se arregla: hacer un release del Next.js con el form simplificado (sin pre-rellenar params, solo redirige a `${NEXT_PUBLIC_ETO_URL}/`)
3. El usuario tendrá que rellenar todo otra vez en el iframe — feo pero funciona

### Síntoma C — booking funciona pero el conversion tracking no
1. NO bloquea reservas (los usuarios pueden seguir comprando)
2. Debugear con calma: F12 → Network → buscar pings de Google Ads
3. Verificar `GADS_ID` y `CONVERSION_LABEL` en `BookingForm.tsx`

---

## 10. Acciones requeridas antes del corte DNS

Checklist:

- [ ] **En Coolify → Environment Variables:** verificar que `NEXT_PUBLIC_ETO_URL=https://www.titantransfers.es/eto/` está configurada como **Build-time variable**
- [ ] **En Coolify:** verificar que `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` también está
- [ ] **En Coolify:** verificar `ETO_API_KEY` (server-side, NO public)
- [ ] **Hacer Redeploy** después de añadir las variables (las public vars solo se inyectan en build, no en runtime)
- [ ] **En el panel ETO:** confirmar con el admin de ETO que `https://titantransfers.com` y `https://www.titantransfers.com` están autorizados como origen para iframe (si tienen lista blanca de origins)
- [ ] **Ejecutar Tests 1-4 de la sección 8** contra la URL test de Coolify
- [ ] **(Opcional)** Test 5 de pago real con tarjeta del equipo

---

## 11. Después del corte DNS

Las primeras 24 h tras el corte:
- Vigilar logs de Coolify por errores 5xx en `/booking/`
- Vigilar Google Analytics 4 → "Realtime" → eventos `conversion`
- Vigilar reservas reales en el panel admin de ETO (`https://www.titantransfers.es/eto/admin/`)
- Comparar volumen de reservas con el día anterior — si baja >50%, alarma

Si alguien reporta "no funciona el formulario": pedirle screenshot del DevTools Console + Network. 90% serán bugs específicos de su navegador (cookies bloqueadas, adblockers, etc.) que no afectan al global.

---

**KM Adisseny** · kmadisseny.es
