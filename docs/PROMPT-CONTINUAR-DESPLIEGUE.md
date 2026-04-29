# Prompt para continuar el despliegue en chat nuevo

> Copia todo lo que hay debajo de la línea horizontal y pégalo como primer mensaje en un chat nuevo de Claude. El asistente nuevo retomará exactamente donde estamos.

---

Hola Claude. Estoy migrando la web **Titan Transfers** desde un WordPress en SiteGround hacia un Next.js nuevo en Coolify (Hetzner). El despliegue está casi listo y necesito tu ayuda para terminar las últimas fases. Lee primero el contexto entero antes de actuar.

---

## CONTEXTO

### El proyecto y los actores

- **Web actual (WordPress):** `https://titantransfers.com`, hospedada en **SiteGround** (IP `35.214.235.91`)
- **Web nueva (Next.js 16 + Sanity + Tailwind v4):** desplegada en **Coolify @ Hetzner** (IP `168.119.168.36`). URL de test actual: `http://ws0o4c4cowosk4sskkoockg4.168.119.168.36.sslip.io/`
- **DNS gestionado por:** SiteGround (nameservers `ns1.siteground.net`, `ns2.siteground.net`)
- **Correo:** Google Workspace (`MX: smtp.google.com`). NO está en SiteGround. Crítico: NO TOCAR los registros MX/TXT al cambiar DNS.
- **Sistema de reservas:** ETO (EasyTaxiOffice) externo, en `https://www.titantransfers.es/eto/`
- **Repo Git:** `https://github.com/danasuport/titan-transfers` (rama `main`). Coolify conecta a este repo vía GitHub App "coolify-kma".
- **Trabajamos 2 personas:** yo (KM Adisseny) y mi hijo Sergio (gelhzz@gmail.com). Hay un repo paralelo `GELHZZ/titan-transfers-main` que ya no usamos — todo va a `danasuport/titan-transfers`.
- **Working dir local:** `/Users/WEBKMABCN/Documents/titan`
- **Mi máquina:** macOS

### Stack y servicios

| Servicio | Detalle |
|---|---|
| Next.js | 16.1.6 (App Router + Turbopack) |
| React | 19.2 |
| TypeScript | 5.x (con `ignoreBuildErrors: true` en next.config.ts — debt conocido) |
| Tailwind | v4 + CSS-in-JS inline |
| CMS | Sanity (`projectId: 6iu2za90`, dataset `production`) |
| i18n | next-intl 4.8 — **EN + ES** únicamente (los otros 9 idiomas iniciales se eliminaron) |
| Tracking | Google Analytics 4 (`G-MNJCJ137ZL`) + Google Ads (`AW-17350153035`, conversion `qeFICP6D9aobEMummdFA`) |
| Maps | Google Places Autocomplete (autocompletado de origen/destino) |
| Hosting | Coolify v4 → Hetzner CX22, output Docker standalone |

### Volumen de contenido en Sanity

172 aeropuertos · 541 ciudades · 738 rutas · 42 países · 49 regiones · 4 servicios · 4 blog posts · 21 páginas estáticas. **~3.150 URLs públicas** entre EN+ES.

---

## LO QUE YA SE HA HECHO

### Migración SEO (ya pusheado y desplegado)

- 358 URLs de WordPress mapeadas a las nuevas vía `scripts/legacy-redirects.json` cross-referenciado contra Sanity. **99,4% de redirects 301 específicos** verificados con curl, 0 errores 404.
- Wildcard fallback al final del array para URLs `/rutas/...` no mapeadas.
- Sitemaps dinámicos (`/sitemap.xml` + 8 sub-sitemaps).
- Hreflangs EN/ES en todas las páginas.
- Schema.org JSON-LD (LocalBusiness, TaxiService, BreadcrumbList, Article).
- Canonical URLs por locale corregidos (cada idioma respeta su slug traducido).
- **Bug de seguridad ya solucionado:** `.claude/settings.local.json` contenía API keys hardcoded; eliminado del tracking, `.claude/` añadido a `.gitignore`. Ya no era riesgo (familia, repo privado) pero documentado.

### Bugs específicos arreglados (ya en main)

- **404 de URLs invertidas en página de ciudad** (commit `6da5965`): RoutesList usaba `airportSlug` compartido → URLs como `/airport-transfers-private-taxi/adelianos-kambos/...` que daban 404. Solución: cada `RouteCard` usa `route.origin.slug.current`. Validado en producción.
- **Recursión infinita del iframe ETO** (commit `d54bdd6`, **CRÍTICO**): el `ETOBookingIframe` apuntaba a `https://titantransfers.com/booking/` (recursivo). Funcionaba solo porque hoy WordPress sirve esa URL; tras el corte DNS habría sido bucle infinito. Ahora apunta a `${NEXT_PUBLIC_ETO_URL}` (= `https://www.titantransfers.es/eto/`). Verificado en bundle JS — 0 referencias a la URL incorrecta.

### Optimizaciones Lighthouse (commits `fc32da7` y `0330901`)

| | Baseline | Round 2 | WordPress |
|---|---|---|---|
| Performance mobile | 91 | 82 (variabilidad HTTP) | 58 |
| Accessibility | 78 | **96** | 74 |
| Best Practices | 74 | 74 (subirá con HTTPS) | 92 |
| **SEO** | 92 | **100** | 92 |

Cambios aplicados:
- `<html lang>` dinámico vía `getLocale()` de next-intl
- Aria-labels en BookingForm, BlogBookingForm, Header (login mobile, accordion)
- ariaLabel prop añadido a `SkewButton` y `Button`
- "Learn more" CTA con texto descriptivo visible (no solo aria-label)
- LCP image: `fetchPriority="high"` + sizes mejorado + quality 85
- Contraste: `#94a3b8` → `#64748b` (slate-500, ratio 4.83:1) — 140 cambios
- Verde marca como TEXTO: `#8BAA1D` → `#6B8313` (ratio 4.95:1). Backgrounds y bordes intactos.

### Documentación entregada

En `docs/`:
- `ESTADO-WEB-LANZAMIENTO.pdf` — estado pre-launch
- `PLAN-DESPLIEGUE.pdf` — plan de migración DNS paso a paso (sección 8 sobre wildcard de redirects ya está obsoleta — saltársela)
- `VALORACION-ECONOMICA.pdf` — 34.500 € sin IVA
- `GUIA-ETO.pdf` — **importante**, contiene arquitectura ETO, riesgos, tests pre-corte y plan rollback

---

## LO QUE FALTA POR HACER (orden de ejecución)

### FASE 1 — Configuración Coolify (~30 min)

1. **Variables de entorno en Coolify** → Configuration → Environment Variables. Replicar exactamente las del `.env.local`:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=6iu2za90
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=...
   NEXT_PUBLIC_SITE_URL=https://titantransfers.com
   NEXT_PUBLIC_ETO_URL=https://www.titantransfers.es/eto/
   NEXT_PUBLIC_ETO_SITE_KEY=
   ETO_API_KEY=tbp_8ylG...
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
   NEXT_PUBLIC_GOOGLE_MAPS_KEY=...
   OPENAI_API_KEY=...
   SANITY_REVALIDATE_SECRET=...
   NODE_ENV=production
   ```
   ⚠️ Las `NEXT_PUBLIC_*` se inyectan en **build time** → tras añadirlas hay que **Redeploy** para que entren en el bundle JS.

2. **Añadir dominios en Coolify** → Configuration → General → Domains:
   ```
   https://titantransfers.com
   https://www.titantransfers.com
   ```
   La canónica es **sin www**. Direction "Allow www & non-www" debe estar activa. El cert Let's Encrypt fallará hasta el corte DNS — eso es esperado.

3. **Webhook Sanity → revalidate**: en Sanity Manage → proyecto `6iu2za90` → API → Webhooks:
   - URL: `https://titantransfers.com/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>`
   - Trigger: Create/Update/Delete cualquier documento

4. **Sanity Studio**: limitar acceso vía Sanity Manage → Members (es público en `/studio` por defecto)

### FASE 2 — Tests con `/etc/hosts` (sin riesgo, antes del corte)

Añadir en `/etc/hosts`:
```
168.119.168.36   titantransfers.com
168.119.168.36   www.titantransfers.com
```

Ejecutar los **5 tests de la sección 8 del GUIA-ETO.pdf** para verificar que el flujo de booking funciona contra el dominio real (todavía con HTTP por la falta de cert):
1. Flujo completo de reserva
2. URL del iframe (`titantransfers.es/eto/...`, no `titantransfers.com/booking/...`)
3. Network tab sin errores CORS
4. Conversión Google Ads dispara
5. Pago de prueba (opcional)

### FASE 3 — TTL DNS bajo (24h antes del corte)

En SiteGround → Site Tools → Domain → DNS Zone Editor:
- A `@` → cambiar TTL a `300` (no tocar valor)
- A `www` → cambiar TTL a `300`

### FASE 4 — CORTE DNS (~30 min, momento crítico)

1. **Backup completo** del WordPress en SiteGround Site Tools → Security → Backups
2. **Exportar zona DNS** desde DNS Zone Editor (red de seguridad)
3. **Cambiar SOLO los registros A**:
   - `A @` (raíz): `35.214.235.91` → **`168.119.168.36`**
   - `A www`: `35.214.235.91` → **`168.119.168.36`**
4. **NO TOCAR**: registros MX, TXT (SPF, Google verify, DKIM, DMARC), NS, CNAME de Google Workspace.
5. Esperar 5-30 min de propagación. Coolify emitirá Let's Encrypt automáticamente.

### FASE 5 — Verificación post-corte

1. `dig +short titantransfers.com @8.8.8.8` debe responder `168.119.168.36`
2. `curl -sI https://titantransfers.com/` debe devolver 200 con HTTP/2
3. **Test correo Workspace**: enviar email entrante y saliente desde `info@titantransfers.com`
4. Validación masiva con curl de las 358 URLs del WP (script en sección 5.3 del PLAN-DESPLIEGUE.pdf)
5. Re-test Lighthouse — debe subir Best Practices a 90+ con HTTPS activo

### FASE 6 — SEO post-migración

- Google Search Console → Sitemaps → eliminar el sitemap viejo de Yoast, añadir `https://titantransfers.com/sitemap.xml`
- URL Inspection → solicitar indexación de 5 URLs críticas (home, Barcelona, Madrid, Roma, blog)
- Bing Webmaster Tools idem

### FASE 7 — Limpieza

- Día 1: subir TTL DNS de 300 → 3600
- Día 1: limpiar `/etc/hosts` local
- Día 2-7: monitorizar logs Coolify, Coverage de Search Console
- Día 30: decidir si cancelar plan SiteGround (mantener el dominio, cancelar solo hosting)

---

## ARQUITECTURA ETO (crítica, no romper)

```
Form submit
   ↓
window.location.href = '/booking/?type=transfer&pickup=...&...'
   ↓
Página /booking/ de Next.js (en titantransfers.com)
   ↓
<iframe src="https://www.titantransfers.es/eto/?..." />
   ↓
ETO REAL (servidor externo Cloudflare, gestiona el wizard + pago)
```

Componentes clave:
- `src/components/ui/BookingForm.tsx` — form principal, `ETO_BASE = '/booking/'` (relativo)
- `src/components/blog/BlogBookingForm.tsx` — variante blog, mismo `ETO_BASE`
- `src/components/ui/ETOBookingIframe.tsx` — iframe a `${NEXT_PUBLIC_ETO_URL}`
- `src/lib/eto/config.ts` — helper `buildETOUrl()` con tabla de params (`r1cs`, `r1ls`, etc.)
- `src/components/customer/CustomerPortal.tsx` — iframe del portal cliente

ETO NO tiene `X-Frame-Options` ni CSP `frame-ancestors` → permite embed desde cualquier origen. Verificado.

---

## ÚLTIMOS COMMITS EN `main`

```
d54bdd6  Fix CRITICAL ETO iframe recursion bug — would break bookings on launch
0330901  Fine-tune accessibility & SEO after Lighthouse re-test
fc32da7  Improve accessibility, SEO score and LCP for Lighthouse
6da5965  Fix 404 on city pages: route links used wrong airport slug
665529a  chore: stop tracking .claude config (contained leaked secrets)
ad0ecb3  docs: deployment plan, status and pricing PDFs
```

Estado del repo local cuando dejé el chat anterior: clean, sincronizado con `origin/main`.

---

## CÓMO TRABAJAR CONMIGO

- **Idioma:** español (castellano). Soy de Barcelona (KM Adisseny — kmadisseny.es). Mi email es `teamkmadisseny@gmail.com`.
- **Estilo de respuesta:** conciso, paso a paso, técnico pero claro. Evita parrafadas.
- **Antes de hacer cambios destructivos** (push --force, reset --hard, rm, etc.): pregúntame.
- **Antes de tocar el DNS de SiteGround**: confírmame qué vas a hacer y qué se va a quedar intacto. NO TOCAR MX/TXT.
- **Si ves un follón** entre `danasuport` y `GELHZZ`: ya está resuelto, todo va a `danasuport`. Si en Coolify ves referencia a `GELHZZ`, es histórica de cuando lo intenté antes.
- **PATs de GitHub:** ya creé 2 (`titan-deploy` y `titan-deploy-2`). El último funcional es `titan-deploy-2` (expira 7 días desde el 28 abr). Si necesitas hacer push y falla la auth, te lo paso.
- **Para PDFs de docs:** uso `node scripts/md-to-pdf.mjs <archivo.md>` que ya está creado. Necesita `marked` instalado (`pnpm add -D marked`).
- **Variables `.env.local`:** las tengo localmente, las puedo pasar si las necesitas para algo (NO HACER PUSH del .env).

---

## EMPIEZA AQUÍ

Acabo de hacer Redeploy en Coolify del último commit (`d54bdd6` con el fix de ETO). Espera a que termine (~3 min) y luego:

1. **Comprueba que el deploy nuevo está activo**:
   ```
   curl -s "http://ws0o4c4cowosk4sskkoockg4.168.119.168.36.sslip.io/booking/?test=1" | head -200
   ```
   En la respuesta debe haber un placeholder "Loading..." y el JS bundle apuntará a `titantransfers.es/eto/`.

2. **Pregúntame** si quiero ir directo a la **FASE 1 (variables de entorno + dominio en Coolify)** o si prefiero hacer antes los **5 tests de ETO de la sección 8 de GUIA-ETO.pdf** contra la URL test actual.

3. **A partir de ahí**, vamos paso a paso siguiendo el orden FASE 1 → 7. Voy a estar contigo en el navegador para ir tomando capturas de Coolify, SiteGround y demás.

Cualquier duda, pregunta antes de actuar.
