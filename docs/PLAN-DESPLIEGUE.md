# Plan de despliegue Titan Transfers — paso a paso

**Fecha:** 28 de abril de 2026
**Versión:** 2.0 — guía operativa de migración WordPress → Next.js (Coolify @ Hetzner)
**Tiempo estimado total:** 3-4 horas trabajo directo + 24-48 h de propagación DNS

---

## 0. Aviso crítico sobre el correo

> ⚠️ **El correo NO está en SiteGround. Está en Google Workspace.**
>
> Comprobación con `dig titantransfers.com MX`:
> ```
> 1 smtp.google.com.
> ```
> SiteGround únicamente:
> - Aloja el WordPress actual (IP `35.214.235.91`)
> - Gestiona los nameservers (`ns1.siteground.net`, `ns2.siteground.net`)
> - Es el panel donde se editan los registros DNS
>
> **Mientras NO toquemos los registros MX, TXT (SPF, Google verify), DKIM ni DMARC, el correo no se romperá.** Solo cambiamos los registros A.

---

## 1. Inventario actual

### Lo que NO se debe tocar

| Registro | Valor actual | Por qué |
|---|---|---|
| **NS** | ns1.siteground.net, ns2.siteground.net | Los DNS siguen en SiteGround |
| **MX** | 1 smtp.google.com | Correo Google Workspace |
| **TXT (SPF)** | `v=spf1 include:one.zoho.eu ~all` | Autorización envío correo |
| **TXT (Google verify)** | `google-site-verification=t3v4VsBpC0ZOfPXsk_jN-YuEjoNLU0fGrilAg8PNiJw` | Search Console |
| **DKIM** (`*._domainkey`) | si existe | Firma DKIM correo |
| **DMARC** (`_dmarc`) | si existe | Política DMARC |

### Lo que sí se cambia

| Registro | Antes | Después |
|---|---|---|
| **A @** (raíz) | 35.214.235.91 (SiteGround) | **168.119.168.36** (Hetzner) |
| **A www** | 35.214.235.91 | **168.119.168.36** |

> Antes de tocar nada en el panel DNS, **exportar la zona DNS actual** desde SiteGround → DNS Zone Editor (botón "Export"). Esa es tu copia de seguridad.

---

## 2. Resumen del flujo

```
FASE 1 — Preparación servidor Coolify (sin tocar producción)
FASE 2 — Validación previa con /etc/hosts
FASE 3 — Bajar TTL DNS (24h antes del corte)
FASE 4 — CORTE: cambio de registros A en SiteGround
FASE 5 — Verificación post-corte (15 min después)
FASE 6 — SEO: avisar a Google y Bing
FASE 7 — Limpieza y monitorización (días 1-30)
```

---

## FASE 1 — Preparación del servidor en Coolify (1h, sin riesgo)

### 1.1. Confirmar acceso a Coolify
La URL de test `ws0o4c4cowosk4sskkoockg4.168.119.168.36.sslip.io` indica que la app corre en **Coolify** sobre Hetzner (IP `168.119.168.36`).

- Entrar a Coolify
- Localizar el proyecto **titan-transfers**
- Confirmar contenedor running + healthy

### 1.2. Hacer push del repo y desplegar la última versión

Antes de tocar el DNS, asegurar que la versión desplegada en Coolify incluye:
- Los cambios de redirects específicos (`scripts/legacy-redirects.json`, 356 mappings)
- Reducción a 2 idiomas (EN + ES)
- GA4 (`G-MNJCJ137ZL`) y Google Ads (`AW-17350153035`)
- Google Places Autocomplete en BookingForm
- Fix de canonical URLs por locale

```bash
git push origin main
```

Coolify detectará el push y redesplegará automáticamente. Esperar a que el contenedor pase a "healthy" antes de continuar.

### 1.3. Añadir el dominio al servicio en Coolify

Coolify → app titan-transfers → **Domains**:
```
https://titantransfers.com
https://www.titantransfers.com
```

Coolify intentará emitir certificado Let's Encrypt — **fallará hasta que el DNS apunte al servidor**. Es esperado. Lo dejamos preparado para que se autoemita en cuanto el DNS resuelva.

### 1.4. Variables de entorno en Coolify

Replicar exactamente las del `.env.local` local:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=6iu2za90
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...
NEXT_PUBLIC_SITE_URL=https://titantransfers.com
NEXT_PUBLIC_ETO_URL=https://www.titantransfers.es/eto/
NEXT_PUBLIC_ETO_SITE_KEY=...
ETO_API_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
OPENAI_API_KEY=...
SANITY_REVALIDATE_SECRET=...
NODE_ENV=production
```

> ⚠️ `NEXT_PUBLIC_SITE_URL` ya tiene que ser `https://titantransfers.com` antes del corte DNS, porque ese valor se usa para canonical, sitemap, OG tags y schema.org.

### 1.5. Autorizar el dominio en el panel ETO

El BookingForm hace submit a `https://titantransfers.com/booking/` y de ahí salta al iframe de ETO. Antes del corte:

- Entrar al panel admin de **EasyTaxiOffice**
- En la lista blanca de dominios autorizados a embeber el iframe + recibir parámetros de booking, añadir:
  - `https://titantransfers.com`
  - `https://www.titantransfers.com`
- Confirmar que `NEXT_PUBLIC_ETO_SITE_KEY` es válido para esos dominios

### 1.6. Webhook de Sanity → revalidate

Sanity Manage → proyecto `6iu2za90` → API → **Webhooks**:
- Nombre: `Production revalidate`
- URL: `https://titantransfers.com/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>`
- Trigger: `Create / Update / Delete` cualquier documento
- HTTP method: `POST`
- Filter (GROQ): vacío (todo)

Funcionará en cuanto el dominio resuelva al servidor nuevo.

### 1.7. Sanity Studio — restringir acceso

`/studio` es accesible públicamente. Opciones:
- **(Recomendada)** Sanity Manage → proyecto → **Members** → configurar SSO o limitar a la lista de emails del equipo. Studio pedirá login y rechazará a desconocidos.
- (Alternativa) IP allow-list a nivel de Coolify (Caddy/Traefik) sobre `/studio/*`.

### 1.8. Cookie consent (si aplica RGPD)

Si la web se dirige a usuarios europeos, GA4 + Google Ads requieren consent management.
- Implementar Google Consent Mode v2 + un banner (ej. Cookiebot, Iubenda, o solución propia)
- Si no se implementa antes del lanzamiento, GA4 podrá colectar datos pero existirá riesgo legal RGPD

> Esto **no bloquea el deploy técnico**, pero se debe contemplar antes de tráfico real.

---

## FASE 2 — Validación previa con `/etc/hosts` (30 min, sin riesgo)

### 2.1. Forzar resolución a Hetzner desde tu máquina

Editar `/etc/hosts`:
```bash
sudo nano /etc/hosts
```
Añadir al final:
```
168.119.168.36   titantransfers.com
168.119.168.36   www.titantransfers.com
```

Limpiar cache DNS:
```bash
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

Abrir `http://titantransfers.com/` en el navegador (HTTP, no HTTPS — el cert no estará todavía). Debe cargar la web nueva.

### 2.2. Validar redirects con Host header

Desde el terminal:
```bash
# Test redirects clave con Host header forzado a la IP de Hetzner
for path in \
  "/airport/barcelona-airport-transfers/" \
  "/cities/private-transfers-rome/" \
  "/rutas/transfers-from-barcelona-airport-to-castelldefels/" \
  "/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-sitges/" \
  "/es/aeropuertos/madrid-airport-transfers/"
do
  echo "$path"
  curl -sI -H "Host: titantransfers.com" "http://168.119.168.36$path" | grep -iE "^(HTTP|location)"
  echo ""
done
```

Cada uno debe responder `308 Permanent Redirect` con `Location: ...` apuntando a la URL nueva específica.

### 2.3. Limpiar `/etc/hosts` cuando termines

Quitar las dos líneas + flushear DNS, si no durante la propagación seguirás viendo Hetzner.

---

## FASE 3 — Bajar TTL del DNS (24h antes del corte)

Reduce el tiempo de propagación post-corte.

1. SiteGround → **Site Tools** → dominio titantransfers.com
2. **Domain → DNS Zone Editor**
3. Editar:
   - `A @` → cambiar TTL a `300` (no tocar valor)
   - `A www` → TTL `300`
4. Guardar
5. Esperar **mínimo 1h** (idealmente 24h) antes del corte real

---

## FASE 4 — Backup y CORTE DNS (~30 min)

### 4.1. Backup completo del WordPress

SiteGround → **Site Tools → Security → Backups** → **Create New Backup** (manual). Anotar el ID.

> Red de seguridad. Solo se restaura en escenario catastrófico.

### 4.2. Cambio de registros A en SiteGround

SiteGround → **Site Tools → Domain → DNS Zone Editor**:

| Tipo | Nombre | Valor antiguo | Valor nuevo | TTL |
|---|---|---|---|---|
| A | `@` | 35.214.235.91 | **168.119.168.36** | 300 |
| A | `www` | 35.214.235.91 | **168.119.168.36** | 300 |

**NO TOCAR:** MX, TXT, NS, CNAME de Google Workspace (calendar, autodiscover, etc.).

Guardar.

### 4.3. Verificación inmediata de propagación

```bash
dig +short titantransfers.com @8.8.8.8
dig +short titantransfers.com @1.1.1.1
dig +short titantransfers.com @9.9.9.9
```

En cuanto aparezca `168.119.168.36` desde algún resolver, está propagando. Suele tardar 5–30 min con TTL 300. Coolify detectará la resolución y emitirá el certificado Let's Encrypt automáticamente (1–3 min adicionales).

---

## FASE 5 — Verificación post-corte (15-30 min después del cambio)

### 5.1. SSL y carga

```bash
curl -sI https://titantransfers.com/ --resolve titantransfers.com:443:168.119.168.36 | head -5
curl -sI https://www.titantransfers.com/ --resolve www.titantransfers.com:443:168.119.168.36 | head -5
```

Esperado: `HTTP/2 200`. Si responde error SSL, esperar 2-3 min más para que Let's Encrypt termine.

### 5.2. Verificar que el correo Google Workspace sigue funcionando

```bash
dig +short titantransfers.com MX
# Esperado: 1 smtp.google.com.
```

Pruebas reales:
- Enviar email desde Gmail externo a `info@titantransfers.com` → debe llegar a Workspace
- Enviar desde `info@titantransfers.com` a un Gmail externo → debe llegar

Si fallan, **STOP — algo del MX o SPF ha sido afectado**. Revisar inmediatamente.

### 5.3. Validación masiva de redirects en producción

Crear `validate-redirects.sh`:

```bash
#!/bin/bash
ok=0; listing=0; rest=0; total=0
while IFS= read -r url; do
  [ -z "$url" ] && continue
  total=$((total+1))
  path="${url#https://titantransfers.com}"
  resp=$(curl -sI -m 5 "https://titantransfers.com${path}")
  code=$(echo "$resp" | head -1 | awk '{print $2}')
  loc=$(echo "$resp" | grep -i "^location:" | awk '{print $2}' | tr -d '\r' | sed 's|https://titantransfers.com||')
  if [[ "$code" == "308" || "$code" == "301" ]]; then
    if [[ "$loc" == "/airport-transfers-private-taxi/" || "$loc" == "/es/traslados-aeropuerto-privados-taxi/" ]]; then
      listing=$((listing+1))
    else
      ok=$((ok+1))
    fi
  else
    rest=$((rest+1))
    [ $rest -le 10 ] && echo "  $code  $path"
  fi
done < scripts/old-rutas-urls.txt
echo ""
echo "Total: $total | Específicos: $ok | Listado: $listing | Otros: $rest"
```

Esperado: ~99% específicos + 2 al listado raíz + 0 errores. Si aparece más de un puñado de "Otros", investigar.

### 5.4. Páginas críticas dan 200

```bash
for url in / /airport-transfers-private-taxi/barcelona/ /private-transfers/rome/ /es/ /es/traslados-aeropuerto-privados-taxi/barcelona/ /sitemap.xml /robots.txt; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://titantransfers.com${url}")
  echo "$code  $url"
done
```

Todos deben dar `200`.

### 5.5. Iframe ETO funciona

Abrir `https://titantransfers.com/booking/` en el navegador. Hacer una reserva de prueba completa (sin pagar) para confirmar que:
- El form de Google Places Autocomplete funciona
- El iframe ETO carga
- Los parámetros de origen/destino se pasan correctamente
- Se dispara el evento de conversión Google Ads (verificar en Google Ads → Conversions → Realtime)

### 5.6. GA4 recibe datos

Google Analytics 4 → **Realtime** report. Navegar por la web mientras miras el panel. Debes ver tu sesión activa.

---

## FASE 6 — SEO post-migración (mismo día)

### 6.1. Google Search Console

Como el dominio es el mismo (titantransfers.com), no hace falta "Change of address".

1. Search Console → propiedad titantransfers.com
2. **Sitemaps** → eliminar el sitemap antiguo de Yoast (`/sitemap_index.xml` u otros)
3. Añadir: `https://titantransfers.com/sitemap.xml`
4. **URL Inspection** → solicitar indexación de:
   - `/`
   - `/airport-transfers-private-taxi/barcelona/`
   - `/airport-transfers-private-taxi/madrid/`
   - `/private-transfers/rome/`
   - `/blog/`
5. Vigilar **Coverage** los 7-14 días siguientes: las URLs viejas pasarán a estado `Page with redirect` (esperado).

### 6.2. Bing Webmaster Tools

Añadir el sitemap nuevo si tienes cuenta. Si no, registrar.

---

## FASE 7 — Limpieza y monitorización (días 1-30)

**Día 1:**
- Subir TTL DNS de 300 → 3600 en SiteGround
- Limpiar `/etc/hosts` local
- Confirmar Let's Encrypt activo y auto-renovación habilitada en Coolify

**Día 2-7:**
- Search Console → Coverage diario (URLs antiguas pasando a "Page with redirect")
- Logs de Coolify: vigilar errores 5xx
- Errores 404: si aparece alguna URL muy traficada que no contemplamos, añadir redirect específico

**Día 7-30:**
- Tráfico orgánico GA4: comparar contra baseline pre-migración. Caída sostenida > 30% es señal de alarma
- Lighthouse: objetivo > 90 performance / > 95 SEO
- Decidir si cancelar plan SiteGround a los 30 días (mantener el dominio, cancelar solo el hosting)

---

## 8. Plan de marcha atrás (rollback)

Si en las primeras 4h post-corte algo va catastróficamente mal:

1. SiteGround → DNS Zone Editor → revertir A @ y A www a `35.214.235.91`
2. Esperar 5-30 min (TTL 300)
3. La web vuelve a servir desde WordPress
4. Investigar el problema en Hetzner antes de reintentar

> Riesgo del rollback: si un usuario hizo una búsqueda durante la ventana del corte y cacheó una URL nueva (ej. `/airport-transfers-private-taxi/barcelona/`), al volver a WordPress dará 404. Por eso es crítico haber validado todo en FASE 2 antes del corte.

El correo no se ve afectado por un rollback porque MX/TXT no se han tocado.

---

## 9. Checklist final imprimible

```
PREPARACIÓN
[ ] git push de la versión final con redirects validados
[ ] Coolify: app desplegada y healthy
[ ] Coolify: dominios titantransfers.com + www añadidos
[ ] Coolify: variables de entorno completas
[ ] ETO: dominios autorizados en lista blanca
[ ] Sanity: webhook revalidate configurado
[ ] Sanity Studio: SSO o restricción de acceso
[ ] Cookie consent banner implementado (si aplica RGPD)
[ ] /etc/hosts local: web y redirects validados con Host header
[ ] Backup completo de WordPress en SiteGround
[ ] Zona DNS exportada de SiteGround (red de seguridad)

CORTE DNS
[ ] TTL bajado a 300 hace 24h
[ ] A @: 35.214.235.91 → 168.119.168.36
[ ] A www: 35.214.235.91 → 168.119.168.36
[ ] MX intacto (smtp.google.com)
[ ] TXT intactos (SPF + Google verify + DKIM + DMARC)
[ ] CNAME de Google Workspace intactos

POST-CORTE
[ ] DNS resuelve a 168.119.168.36 desde 8.8.8.8 / 1.1.1.1 / 9.9.9.9
[ ] HTTPS funciona (Let's Encrypt emitido)
[ ] Email entrante y saliente validado
[ ] Validación masiva: 358 redirects ≥ 99% éxito
[ ] Iframe ETO + Google Places funcionan
[ ] GA4 recibe pageviews en Realtime
[ ] Google Ads conversion tracking validado
[ ] Sitemap.xml accesible
[ ] /studio protegido

SEO
[ ] Sitemap antiguo eliminado de Search Console
[ ] Sitemap nuevo enviado: https://titantransfers.com/sitemap.xml
[ ] Sitemap nuevo enviado a Bing Webmaster
[ ] 5 URLs críticas solicitadas indexar manualmente

LIMPIEZA (24-48h después)
[ ] TTL DNS subido a 3600
[ ] /etc/hosts local limpiado
[ ] Documentación entregada al cliente
[ ] WordPress de SiteGround → cancelar solo hosting a los 30 días
```

---

## 10. Datos de referencia

| Recurso | Acceso |
|---|---|
| Coolify | Panel admin de Hetzner (`168.119.168.36`) |
| URL test actual | http://ws0o4c4cowosk4sskkoockg4.168.119.168.36.sslip.io |
| SiteGround | Site Tools → DNS Zone Editor |
| Google Search Console | search.google.com/search-console |
| Google Analytics 4 | ID `G-MNJCJ137ZL` |
| Google Ads | ID `AW-17350153035`, conversion `qeFICP6D9aobEMummdFA` |
| Sanity Studio | https://titantransfers.com/studio (post-deploy) |
| Sanity Manage | sanity.io/manage → `6iu2za90` |
| Repo Git | github.com/danasuport/titan-transfers |
| ETO admin | (panel del proveedor) |

---

**KM Adisseny**
Diseño y desarrollo web Barcelona — kmadisseny.es
