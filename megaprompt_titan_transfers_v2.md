# MEGAPROMPT — Titan Transfers: Migración completa de WordPress a Next.js 15

## CONTEXTO DEL PROYECTO

Titan Transfers (titantransfers.com) es una empresa de transporte privado que opera en +100 destinos mundiales, ofreciendo transfers desde aeropuertos, puertos, estaciones de tren y city-to-city. Actualmente funciona con WordPress + Salient theme + WPML + Yoast SEO + plugin EasyTaxiOffice (iframe-based booking widget).

El objetivo es migrar a un stack moderno (Next.js 15 + Sanity CMS) para conseguir:
1. Rendimiento excepcional (< 1 seg carga, Lighthouse 95+)
2. Arquitectura SEO masiva con miles de URLs programáticas
3. Enlazado interno automático basado en relaciones geográficas
4. Multiidioma escalable (EN base + ES inicial, un idioma nuevo por mes)
5. Hreflangs perfectos en todas las páginas
6. Widget de reservas EasyTaxiOffice integrado con diseño mejorado
7. Área de cliente (login) embebida desde EasyTaxiOffice
8. CMS autogestionable para el equipo de Titan Transfers
9. Blog de contenidos con relaciones dinámicas a localidades y servicios

---

## STACK TECNOLÓGICO

```
Frontend:       Next.js 15 + TypeScript + Tailwind CSS 4 + Framer Motion
CMS:            Sanity.io (headless, panel personalizado)
Hosting:        Vercel (CDN global, +300 nodes)
Almacenamiento: Cloudflare R2 (zero egress)
Base de datos:  PostgreSQL serverless (Supabase) — solo si se necesita data relacional fuera de Sanity
Multiidioma:    next-intl con routing por prefijo (/es/, /fr/, /de/...)
SEO:            Schema.org Transport + sitemap dinámico + metadatos dinámicos
Traducción IA:  API de GPT integrada en Sanity para traducción automática
Seguridad:      Cloudflare WAF + protección DDoS
Analytics:      Google Analytics 4 + Google Search Console
```

---

## ARQUITECTURA DE URLS (SEO CORE)

Esta es la parte más crítica del proyecto. Cada URL es una landing page SEO potencial. La estructura debe ser jerárquica, semántica y con enlazado interno automático.

### Idioma base: inglés (sin prefijo). Otros idiomas con prefijo.

```
ESTRUCTURA EN (base):
/                                                    → Homepage
/airports/                                           → Listado de todos los aeropuertos
/airport/barcelona-el-prat/                          → Ficha aeropuerto Barcelona
/airport/barcelona-el-prat/to-sitges/                → Ruta: BCN Airport → Sitges
/airport/barcelona-el-prat/to-castelldefels/         → Ruta: BCN Airport → Castelldefels
/airport/barcelona-el-prat/to-tarragona/             → Ruta: BCN Airport → Tarragona
/airport/malaga/                                     → Ficha aeropuerto Málaga
/airport/malaga/to-marbella/                         → Ruta: Málaga Airport → Marbella
/cities/                                             → Listado de todas las ciudades
/city/barcelona/                                     → Ficha ciudad Barcelona
/city/sitges/                                        → Ficha ciudad Sitges
/countries/                                          → Listado de todos los países
/country/spain/                                      → Ficha país España
/regions/                                            → Listado de todas las regiones
/region/costa-brava/                                 → Ficha región Costa Brava
/services/                                           → Listado de servicios
/services/airport-transfers/                         → Landing airport transfers global
/services/port-transfers/                            → Landing port transfers global
/services/train-station-transfers/                   → Landing train station transfers
/services/city-to-city/                              → Landing city-to-city transfers
/blog/                                               → Listado de artículos
/blog/barcelona-f1-grand-prix-2026/                  → Artículo individual
/contact/                                            → Contacto
/login/                                              → Área de cliente (iframe ETO customer)
/about/                                              → Sobre nosotros
/faq/                                                → Preguntas frecuentes

ESTRUCTURA ES (con prefijo /es/):
/es/                                                 → Homepage español
/es/aeropuertos/                                     → Listado aeropuertos
/es/aeropuerto/barcelona-el-prat/                    → Ficha aeropuerto BCN
/es/aeropuerto/barcelona-el-prat/a-sitges/           → Ruta: BCN → Sitges
/es/ciudades/                                        → Listado ciudades
/es/ciudad/barcelona/                                → Ficha ciudad Barcelona
/es/paises/                                          → Listado países
/es/pais/espana/                                     → Ficha país España
/es/regiones/                                        → Listado regiones
/es/region/costa-brava/                              → Ficha región Costa Brava
/es/servicios/                                       → Listado servicios
/es/servicios/traslados-aeropuerto/                  → Landing traslados aeropuerto
/es/blog/                                            → Listado blog
/es/blog/gran-premio-f1-barcelona-2026/              → Artículo individual
/es/contacto/                                        → Contacto
/es/acceso/                                          → Área cliente
... (mismo patrón para cada idioma futuro: /fr/, /de/, /it/, /pt/...)
```

### REGLAS DE URLS:
- Inglés SIN prefijo (es el idioma base y x-default)
- Resto de idiomas CON prefijo
- URLs siempre en el idioma de la página (no mezclar idiomas en la URL)
- Cada página tiene hreflangs apuntando a todas sus versiones en otros idiomas
- x-default siempre apunta a la versión EN
- Trailing slash consistente en todas las URLs

---

## MODELOS DE DATOS EN SANITY

### airport
```typescript
{
  title: string,                    // "Barcelona El Prat Airport"
  slug: slug,                       // "barcelona-el-prat"
  iataCode: string,                 // "BCN"
  country: reference → country,
  city: reference → city,
  region: reference → region,       // opcional
  coordinates: geopoint,
  description: portableText,        // contenido SEO rico
  seoTitle: string,
  seoDescription: string,
  featuredImage: image,
  gallery: image[],
  routes: reference[] → route[],
  nearbyAirports: reference[] → airport[],
  translations: {
    es: { title, slug, description, seoTitle, seoDescription },
    fr: { title, slug, description, seoTitle, seoDescription },
  }
}
```

### route
```typescript
{
  title: string,                    // "Barcelona Airport to Sitges"
  slug: slug,                       // "to-sitges"
  origin: reference → airport | city | port | trainStation,
  originType: 'airport' | 'city' | 'port' | 'trainStation',
  destination: reference → city,
  country: reference → country,
  region: reference → region,
  distance: number,                 // km
  estimatedDuration: number,        // minutos
  description: portableText,
  seoTitle: string,
  seoDescription: string,
  featuredImage: image,
  etoFromLocation: string,          // "Barcelona El Prat Airport, Spain"
  etoToLocation: string,            // "Sitges, Spain"
  etoFromCategory: string,          // "5"
  etoToCategory: string,            // "5"
  translations: { ... }
}
```

### city
```typescript
{
  title: string,                    // "Barcelona"
  slug: slug,                       // "barcelona"
  country: reference → country,
  region: reference → region,
  coordinates: geopoint,
  description: portableText,
  seoTitle: string,
  seoDescription: string,
  featuredImage: image,
  nearbyAirports: reference[] → airport[],
  nearbyPorts: reference[] → port[],
  nearbyTrainStations: reference[] → trainStation[],
  relatedCities: reference[] → city[],
  translations: { ... }
}
```

### country
```typescript
{
  title: string,                    // "Spain"
  slug: slug,                       // "spain"
  description: portableText,
  seoTitle: string,
  seoDescription: string,
  featuredImage: image,
  airports: reference[] → airport[],
  cities: reference[] → city[],
  regions: reference[] → region[],
  translations: { ... }
}
```

### region
```typescript
{
  title: string,                    // "Costa Brava"
  slug: slug,                       // "costa-brava"
  country: reference → country,
  description: portableText,
  seoTitle: string,
  seoDescription: string,
  featuredImage: image,
  cities: reference[] → city[],
  airports: reference[] → airport[],
  translations: { ... }
}
```

### port
```typescript
{
  title: string,                    // "Barcelona Cruise Port"
  slug: slug,
  city: reference → city,
  country: reference → country,
  coordinates: geopoint,
  description: portableText,
  seoTitle: string,
  seoDescription: string,
  routes: reference[] → route[],
  translations: { ... }
}
```

### trainStation
```typescript
{
  title: string,                    // "Barcelona Sants Station"
  slug: slug,
  city: reference → city,
  country: reference → country,
  coordinates: geopoint,
  description: portableText,
  seoTitle: string,
  seoDescription: string,
  routes: reference[] → route[],
  translations: { ... }
}
```

### servicePage
```typescript
{
  title: string,                    // "Airport Transfers"
  slug: slug,                       // "airport-transfers"
  serviceType: 'airport' | 'port' | 'trainStation' | 'cityToCity',
  description: portableText,
  seoTitle: string,
  seoDescription: string,
  featuredImage: image,
  translations: { ... }
}
```

### blogPost
```typescript
{
  title: string,                    // "Formula 1 Grand Prix Barcelona 2026"
  slug: slug,                       // "barcelona-f1-grand-prix-2026"
  category: 'event' | 'guide' | 'news' | 'tips',
  content: portableText,            // incluye custom block BookingCTA
  excerpt: string,
  featuredImage: image,
  publishDate: date,
  seoTitle: string,
  seoDescription: string,
  // RELACIONES DINÁMICAS
  relatedCities: reference[] → city[],
  relatedAirports: reference[] → airport[],
  relatedCountries: reference[] → country[],
  relatedRegions: reference[] → region[],
  relatedRoutes: reference[] → route[],
  relatedServiceType: 'airport' | 'port' | 'trainStation' | 'cityToCity' | null,
  translations: { ... }
}
```

### Custom block para portableText — BookingCTA
```typescript
// Bloque insertable dentro del contenido de cualquier blogPost
bookingCTA: {
  type: 'auto' | 'manual',
  // auto: coge la primera ciudad/aeropuerto relacionado del post
  // manual: el editor elige
  linkedAirport: reference → airport,   // opcional
  linkedCity: reference → city,         // opcional
  linkedRoute: reference → route,       // opcional
  ctaText: string,                      // "Book your transfer to Barcelona"
}
// Renderiza: bloque visual con botón enlazando a la ficha + widget ETO inline pre-rellenado
```

### page (páginas estáticas)
```typescript
{
  title: string,
  slug: slug,
  content: portableText,
  seoTitle: string,
  seoDescription: string,
  translations: { ... }
}
```

---

## ESTRUCTURA DE CARPETAS NEXT.JS

```
/src
  /app
    /[locale]
      /page.tsx                        → Homepage
      /airports/page.tsx               → Listado aeropuertos
      /airport/[slug]/page.tsx         → Ficha aeropuerto
      /airport/[slug]/[routeSlug]/page.tsx → Ficha ruta desde aeropuerto
      /cities/page.tsx                 → Listado ciudades
      /city/[slug]/page.tsx            → Ficha ciudad
      /countries/page.tsx              → Listado países
      /country/[slug]/page.tsx         → Ficha país
      /regions/page.tsx                → Listado regiones
      /region/[slug]/page.tsx          → Ficha región
      /services/page.tsx               → Listado servicios
      /services/[slug]/page.tsx        → Landing servicio
      /blog/page.tsx                   → Listado blog
      /blog/[slug]/page.tsx            → Artículo individual
      /contact/page.tsx
      /login/page.tsx                  → Área cliente (iframe ETO)
      /about/page.tsx
      /faq/page.tsx
    /api
      /revalidate/route.ts             → Webhook Sanity para ISR
      /translate/route.ts              → Endpoint traducción IA
    /sitemap.ts                        → Sitemap dinámico programático
    /robots.ts
    /layout.tsx
  /components
    /booking
      /BookingWidget.tsx               → Wrapper iframe ETO (booking-widget)
      /BookingFull.tsx                 → Wrapper iframe ETO (booking full)
      /BookingWidgetWrapper.tsx        → Lógica pre-relleno según contexto
    /customer
      /CustomerPortal.tsx              → Iframe ETO customer area
    /blog
      /BlogCard.tsx                    → Card de artículo
      /BlogGrid.tsx                    → Grid de artículos
      /RelatedPosts.tsx                → Posts relacionados dinámicos
      /BookingCTABlock.tsx             → Renderizador del custom block BookingCTA
      /CategoryFilter.tsx              → Filtros por categoría/destino
    /layout
      /Header.tsx
      /Footer.tsx
      /Navigation.tsx
      /LanguageSwitcher.tsx
      /SearchBar.tsx                   → Buscador de rutas/destinos
      /Breadcrumbs.tsx
    /seo
      /SchemaOrg.tsx
      /Hreflangs.tsx
      /MetaTags.tsx
    /sections
      /HeroSection.tsx
      /RoutesList.tsx
      /NearbyAirports.tsx
      /RelatedCities.tsx
      /CountryOverview.tsx
      /RegionOverview.tsx
      /ServiceTypes.tsx
      /Testimonials.tsx
      /TrustSignals.tsx
      /FAQ.tsx
      /InternalLinks.tsx
      /LatestNews.tsx                  → Bloque dinámico de noticias relacionadas
    /ui
      /Button.tsx
      /Card.tsx
      /Badge.tsx
      /Skeleton.tsx
  /lib
    /sanity
      /client.ts
      /queries.ts
      /schemas/
    /i18n
      /config.ts
      /dictionaries/
        /en.json
        /es.json
    /seo
      /generateMetadata.ts
      /generateHreflangs.ts
      /schemaOrg.ts
    /utils
      /formatters.ts
      /slugHelpers.ts
  /messages
    /en.json
    /es.json
  /public
    /images
    /icons
  /sanity
    /schemas/
    /desk/
```

---

## COMPONENTE DE BOOKING WIDGET (EasyTaxiOffice)

El sistema de reservas funciona mediante iframes que cargan la aplicación de EasyTaxiOffice desde su servidor. NO hay que replicar la lógica de reservas. Hay que crear componentes React que embeben estos iframes de forma inteligente.

### Configuración base:
```typescript
// /lib/eto/config.ts
export const ETO_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_ETO_URL || 'https://[dominio]/eto/',
  siteKey: process.env.NEXT_PUBLIC_ETO_SITE_KEY || '',
  defaultLang: 'en-GB',
}
```

### Tipos de iframe disponibles:
```
booking-widget  → Widget mini de reserva (altura ~250px)
booking         → Formulario completo de reserva (altura ~345px)
customer        → Área de cliente / login (altura ~270px)
driver          → Área de conductor (altura ~500px)
admin           → Área de admin (altura ~500px)
```

### BookingWidget.tsx — Componente principal:
```
Debe:
1. Generar la URL del iframe con todos los parámetros
2. Pre-rellenar origen/destino según la página donde está:
   - En /airport/barcelona-el-prat/to-sitges/ → from="Barcelona El Prat Airport" to="Sitges"
   - En /airport/barcelona-el-prat/ → from="Barcelona El Prat Airport" to=""
   - En /city/barcelona/ → from="" to="Barcelona"
   - En /blog/f1-barcelona/ → destino de la primera ciudad relacionada
3. Pasar el idioma actual desde next-intl al parámetro lang del iframe
4. Cargar iframeResizer para ajustar altura automáticamente
5. Diseño envolvente premium:
   - Título contextual ("Book your transfer from Barcelona Airport to Sitges")
   - Trust signals (4.8★ rating, 100+ destinations, 24/7 support)
   - CTA claro
6. Ser responsive y perfecto en móvil
7. Lazy-load del iframe para no penalizar Lighthouse

Parámetros del iframe (del plugin original):
site_key, lang, bookingType, r1cs (from_category), r1ls (from_location),
r1ce (to_category), r1le (to_location), r1d (date), r (return: "2"),
r2cs, r2ls, r2ce, r2le, r2d, s (service_id), sd (service_duration)
```

### CustomerPortal.tsx — Área de cliente:
```
Iframe tipo "customer" de ETO
Página /login/ o /es/acceso/
El iframe gestiona todo: login, registro, historial de reservas
Envolver con el diseño de la web
Pasar lang según idioma actual
```

### iframeResizer:
- Plugin original usa v3.6.2
- En Next.js: paquete npm iframe-resizer-react o cargar script
- Config: { log: false, targetOrigin: '*', checkOrigin: false }
- Detectar Lighthouse para lazy-load (como hace el plugin original)

---

## ESTRUCTURA DE CONTENIDOS Y JERARQUÍA H POR TIPO DE PÁGINA

Cada tipo de contenido tiene una estructura de encabezados definida. Todo el contenido bajo cada H es editable desde Sanity. Los H no se repiten dentro de la misma página.

### AEROPUERTO — Ejemplo: Barcelona El Prat Airport

```
H1: Barcelona Airport Transfers — Private Door-to-Door Service

H2: Book Your Private Transfer from Barcelona Airport
    [Widget ETO pre-rellenado con BCN como origen]

H2: Why Choose Titan Transfers at Barcelona El Prat Airport
    [Trust signals, rating, precio fijo, 24/7, meet & greet]

H2: Private Taxi from Barcelona Airport
    H3: Private Taxi vs Regular Airport Taxi
    H3: How to Book a Private Taxi at Barcelona Airport

H2: Barcelona Airport Transfer Routes
    H3: Most Popular Routes from Barcelona Airport
    H3: Costa Brava Destinations
    H3: Costa Dorada Destinations
    [Grid de TODAS las rutas disponibles desde BCN — generado dinámicamente]

H2: Getting Around Barcelona El Prat Airport
    H3: Terminal 1 Pickup & Drop-off
    H3: Terminal 2 Pickup & Drop-off
    H3: Meeting Point and Driver Instructions

H2: Barcelona Airport Transfer Prices
    [Tabla orientativa por destino, "from €XX"]

H2: Types of Vehicles Available
    H3: Private Car (1-3 passengers)
    H3: MPV / Minivan (4-6 passengers)
    H3: Executive & Luxury Transfers
    H3: Minibus (7-16 passengers)

H2: Barcelona Airport Information
    H3: Airport Code & Location
    H3: Operating Hours and Airlines
    H3: Facilities and Services

H2: Nearby Airports
    [Enlaces internos a Girona, Reus]

H2: Latest News & Events near Barcelona Airport
    [Bloque dinámico: blogPosts where relatedAirports contains this airport
     OR relatedCities contains cities served by this airport
     ORDER BY publishDate DESC, LIMIT 4]

H2: Frequently Asked Questions — Barcelona Airport Transfers
    H3: How much does a private transfer from Barcelona Airport cost?
    H3: How do I find my driver at Barcelona Airport?
    H3: Can I book a return transfer?
    H3: What if my flight is delayed?
    H3: How far is Barcelona Airport from the city centre?
    H3: Is a private taxi from Barcelona Airport better than a regular taxi?
    [Schema FAQPage]
```

### RUTA — Ejemplo: Barcelona Airport to Sitges

```
H1: Private Transfer from Barcelona Airport to Sitges

H2: Book Your Transfer to Sitges
    [Widget ETO pre-rellenado BCN → Sitges]

H2: Barcelona Airport to Sitges — Route Details
    H3: Distance and Travel Time
    H3: Route Description

H2: Transfer Prices from Barcelona Airport to Sitges
    H3: Private Car
    H3: MPV / Minivan
    H3: Executive & Luxury

H2: Private Taxi from Barcelona Airport to Sitges
    [Posicionamiento "taxi privado precio fijo"]

H2: Why Book a Private Transfer to Sitges
    [Ventajas vs tren, bus, taxi convencional]

H2: Meeting Your Driver at Barcelona Airport
    H3: Pickup at Terminal 1
    H3: Pickup at Terminal 2

H2: About Sitges
    H3: Best Things to Do in Sitges
    H3: Best Time to Visit

H2: Other Ways to Get to Sitges
    H3: Other Airports Near Sitges
    H3: Train and Bus Options

H2: Other Popular Routes from Barcelona Airport
    [Grid de rutas — enlazado interno masivo]

H2: News & Events in Sitges
    [Bloque dinámico: blogPosts where relatedCities contains destination city
     ORDER BY publishDate DESC, LIMIT 3]

H2: Frequently Asked Questions
    H3: How long is the transfer from Barcelona Airport to Sitges?
    H3: How much does a private transfer to Sitges cost?
    H3: How much is a private taxi from Barcelona Airport to Sitges?
    H3: Can the driver wait if my flight is delayed?
    H3: Is it cheaper than a taxi?
    [Schema FAQPage]
```

### CIUDAD — Ejemplo: Private Transfers Barcelona

```
H1: Private Transfers in Barcelona

H2: Book Your Transfer in Barcelona
    [Widget ETO con Barcelona como destino genérico]

H2: Airport Transfers to Barcelona
    H3: From Barcelona El Prat Airport (BCN)
    H3: From Girona-Costa Brava Airport (GRO)
    H3: From Reus Airport (REU)

H2: Private Taxi Service in Barcelona
    H3: Airport Taxi to Barcelona
    H3: Barcelona Private Taxi for Day Trips

H2: Port Transfers in Barcelona
    H3: Barcelona Cruise Port Transfers

H2: Train Station Transfers in Barcelona
    H3: Barcelona Sants Station
    H3: Barcelona Passeig de Gràcia

H2: City-to-City Transfers from Barcelona
    H3: Barcelona to Sitges
    H3: Barcelona to Tarragona
    H3: Barcelona to Girona

H2: Areas We Cover in Barcelona
    H3: Barcelona City Centre
    H3: Barcelona Beach Area
    H3: Eixample
    H3: Gothic Quarter

H2: Why Choose Titan Transfers in Barcelona

H2: Latest News & Events in Barcelona
    [Bloque dinámico: blogPosts where relatedCities contains this city
     ORDER BY publishDate DESC, LIMIT 4]

H2: Frequently Asked Questions
    H3: How do I book a private transfer in Barcelona?
    H3: How do I book a private taxi in Barcelona?
    H3: Do you offer round-trip transfers?
    H3: What areas of Barcelona do you cover?
    [Schema FAQPage]
```

### PAÍS — Ejemplo: Private Transfers Spain

```
H1: Private Transfers in Spain

H2: Book Your Transfer in Spain
    [Widget ETO genérico]

H2: Spanish Airports We Cover
    H3: Main International Airports
    H3: Regional Airports

H2: Popular Cities in Spain

H2: Regions of Spain
    H3: Costa Brava Transfers
    H3: Costa del Sol Transfers
    H3: Balearic Islands Transfers
    H3: Canary Islands Transfers

H2: Private Taxi Services in Spain

H2: Most Popular Routes in Spain

H2: About Travelling in Spain
    H3: Best Time to Visit
    H3: Transportation Tips

H2: Latest News & Events in Spain
    [Bloque dinámico: blogPosts where relatedCountries contains this country
     ORDER BY publishDate DESC, LIMIT 6]

H2: Frequently Asked Questions
    H3: How do I book a private transfer in Spain?
    H3: Which Spanish airports do you cover?
    H3: Is a private taxi available in all Spanish cities?
    H3: How much does an airport transfer cost in Spain?
    [Schema FAQPage]
```

### REGIÓN — Ejemplo: Costa Brava Transfers

```
H1: Private Transfers in Costa Brava

H2: Book Your Costa Brava Transfer
    [Widget ETO]

H2: Airports Serving Costa Brava
    H3: Barcelona El Prat Airport
    H3: Girona-Costa Brava Airport

H2: Popular Destinations in Costa Brava
    H3: Lloret de Mar Transfers
    H3: Tossa de Mar Transfers
    H3: Blanes Transfers
    H3: Platja d'Aro Transfers

H2: Private Taxi in Costa Brava
    H3: Airport Taxi to Costa Brava Resorts
    H3: Private Taxi Between Costa Brava Towns

H2: Costa Brava Transfer Routes
    [Todas las rutas de la región]

H2: About Costa Brava
    H3: Best Things to Do
    H3: Best Time to Visit

H2: Latest News & Events in Costa Brava
    [Bloque dinámico: blogPosts where relatedRegions contains this region
     ORDER BY publishDate DESC, LIMIT 4]

H2: Frequently Asked Questions
    H3: How do I get from Barcelona Airport to Costa Brava?
    H3: Is there a private taxi service in Costa Brava?
    H3: Which airport is closest to Costa Brava?
    [Schema FAQPage]
```

### SERVICIO — Ejemplo: Airport Transfers

```
H1: Private Airport Transfers Worldwide

H2: Book Your Airport Transfer
    [Widget ETO]

H2: How Our Airport Transfer Service Works
    H3: 1. Book Online in Minutes
    H3: 2. Meet Your Driver at the Airport
    H3: 3. Enjoy Your Ride

H2: Private Airport Taxi — Fixed Price, No Surprises

H2: Airports We Cover
    H3: Europe
    H3: Americas
    H3: Asia
    H3: Middle East

H2: Types of Airport Transfer Vehicles

H2: Why Choose Titan for Airport Transfers

H2: Latest Airport Transfer News
    [Bloque dinámico: blogPosts where relatedServiceType == "airport"
     ORDER BY publishDate DESC, LIMIT 4]

H2: Frequently Asked Questions
    H3: How do I book a private airport transfer?
    H3: What is the difference between a private transfer and a taxi?
    H3: Is a private airport taxi cheaper than a regular taxi?
    H3: Can I book a round-trip airport transfer?
    [Schema FAQPage]
```

### BLOG POST — Ejemplo: F1 Grand Prix Barcelona 2026

```
H1: Formula 1 Grand Prix Barcelona 2026 — How to Get There

H2: About the Event
    [Qué es, fechas, ubicación]

H2: How to Get to the Barcelona F1 Grand Prix
    H3: From Barcelona El Prat Airport
        [Enlace dinámico a ficha aeropuerto + ruta si existe]
    H3: From Girona Airport
    H3: From Barcelona City Centre

H2: Book Your Transfer to the F1 Grand Prix
    [Widget ETO pre-rellenado + BookingCTA dinámico]

H2: Private Taxi to the F1 Circuit de Catalunya

H2: Where to Stay Near the Circuit

H2: Tips for Attending the Barcelona Grand Prix
    H3: Best Time to Arrive
    H3: What to Bring
    H3: Getting Back After the Race

H2: More Events in Barcelona
    [Otros artículos relacionados con la misma ciudad]

H2: Related Transfers
    [Grid dinámico de rutas vinculadas a las ciudades/aeropuertos del post]
```

### BLOG LISTADO

```
H1: Travel News, Events & Transfer Guides

H2: Latest Articles
    [Grid paginado de artículos]

H2: Browse by Destination
    [Filtros: por ciudad, por país, por tipo de servicio]

H2: Popular Destinations
    [Tags/badges de las ciudades con más artículos]
```

---

## SISTEMA DE BLOG Y CONTENIDO DINÁMICO

### Flujo de producción de contenido:
1. Scrapear eventos/noticias de ciudades principales (festivals, F1, concerts, conferences, cruise arrivals, etc.)
2. Generar artículo con IA (texto, estructura H, meta tags)
3. Subir a Sanity como borrador
4. Vincular relaciones (city, airport, country, region, serviceType)
5. Insertar bloques BookingCTA donde convenga dentro del portableText
6. Pulsar "Generate Translation" para los idiomas activos
7. Publicar

### Bloque dinámico "Latest News" en cada CPT:

El componente LatestNews.tsx recibe como props el tipo de relación y el ID del contenido, y hace la query correspondiente:

```
En aeropuerto: blogPosts where relatedAirports contains THIS_AIRPORT or relatedCities contains CITIES_SERVED_BY_THIS_AIRPORT → LIMIT 4
En ciudad: blogPosts where relatedCities contains THIS_CITY → LIMIT 4
En país: blogPosts where relatedCountries contains THIS_COUNTRY → LIMIT 6
En región: blogPosts where relatedRegions contains THIS_REGION → LIMIT 4
En ruta: blogPosts where relatedCities contains DESTINATION_CITY → LIMIT 3
En servicio: blogPosts where relatedServiceType == THIS_SERVICE_TYPE → LIMIT 4
```

### BookingCTA dentro de artículos:

Cuando el renderizador de portableText encuentra un bloque BookingCTA:
- Si type == 'auto': busca la primera ciudad o aeropuerto de las relaciones del post y genera el enlace + widget
- Si type == 'manual': usa el airport/city/route específico que eligió el editor
- Renderiza: bloque visual con título contextual, botón "Book Now" enlazando a la ficha, y opcionalmente widget ETO inline pre-rellenado

---

## SEO TÉCNICO

### Hreflangs
Cada página incluye hreflangs en <head> para TODAS las versiones de idioma:
```html
<link rel="alternate" hreflang="en" href="https://titantransfers.com/airport/barcelona-el-prat/" />
<link rel="alternate" hreflang="es" href="https://titantransfers.com/es/aeropuerto/barcelona-el-prat/" />
<link rel="alternate" hreflang="x-default" href="https://titantransfers.com/airport/barcelona-el-prat/" />
```

### Schema.org
- TaxiService / TransportationService en páginas de aeropuerto y ruta
- LocalBusiness con geo coordinates
- BreadcrumbList en todas las páginas
- FAQPage en todas las páginas con sección FAQ
- AggregateRating donde aplique
- BlogPosting en artículos de blog

### Sitemap dinámico
- Generar programáticamente desde Sanity
- Un sitemap por tipo de contenido y por idioma
- Incluir hreflangs dentro del sitemap XML
- Sitemap index que agrupe todos

### Metadatos dinámicos por tipo:
```
Aeropuerto: "{airport} Transfers | Private Airport Transfers | Titan Transfers"
Ruta: "Private Transfer from {airport} to {city} | From €{price} | Titan Transfers"
Ciudad: "Private Transfers in {city} | Airport, Port & City Transfers | Titan Transfers"
País: "Private Transfers in {country} | {count} Airports | Titan Transfers"
Región: "Private Transfers in {region} | Book Your Ride | Titan Transfers"
Servicio: "Private {service} Worldwide | Titan Transfers"
Blog: "{title} | Titan Transfers Blog"
```

### Redirecciones 301
Migración completa de todas las URLs actuales:
- /airport/{slug} → /airport/{new-slug}/
- /rutas/{slug} → /airport/{airport-slug}/{route-slug}/
- /city/{slug} → /city/{new-slug}/
- /country/{slug} → /country/{new-slug}/
- /es/airport/{slug} → /es/aeropuerto/{new-slug}/
- /es/rutas/{slug} → /es/aeropuerto/{airport-slug}/{route-slug}/
Implementar en next.config.js o middleware.

---

## ENLAZADO INTERNO AUTOMÁTICO

### En página de aeropuerto:
- Lista todas las rutas desde este aeropuerto
- Aeropuertos cercanos con enlace
- Ciudad principal enlazada
- País enlazado
- Región enlazada
- Servicios relacionados
- Blog posts relacionados

### En página de ruta:
- Enlace al aeropuerto de origen
- Enlace a la ciudad de destino
- Otras rutas desde el mismo aeropuerto
- Otras formas de llegar al mismo destino (desde otros aeropuertos)
- Rutas cercanas
- Blog posts del destino
- Breadcrumb: Home > Spain > Barcelona Airport > To Sitges

### En página de ciudad:
- Aeropuertos cercanos con enlaces
- Puertos y estaciones de tren
- Ciudades cercanas (city-to-city)
- Rutas más populares desde/hacia
- País y región enlazados
- Blog posts de la ciudad

### En página de país:
- Todos los aeropuertos con enlaces
- Todas las ciudades con enlaces
- Todas las regiones con enlaces
- Blog posts del país

### En página de región:
- Aeropuertos que sirven la región
- Ciudades de la región
- Rutas populares
- Blog posts de la región

### En blog post:
- Enlaces a todas las entidades relacionadas (cities, airports, countries)
- Otros artículos de la misma ciudad/región
- Grid de rutas vinculadas

---

## MULTIIDIOMA CON TRADUCCIÓN IA

### Configuración:
```typescript
export const locales = ['en', 'es'] as const; // Inicial
// Futuro: ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'ru', 'zh', 'ja', 'ko', 'ar']
export const defaultLocale = 'en';
```

### Flujo de traducción en Sanity:
1. Editor crea/edita contenido en inglés
2. Pulsa "Generate Translation" en el panel
3. API de GPT traduce el contenido
4. Traducción se guarda en campo translations
5. Dos flujos: publicación automática o pendiente de revisión (configurable)

### Routing:
- EN: / (sin prefijo)
- ES: /es/
- FR: /fr/ (futuro)
- URLs traducidas al idioma de la página
- Middleware Next.js para detección y redirección

---

## DISEÑO Y UX

### Principios:
- Diseño premium, limpio y orientado a conversión
- Widget de reserva visible en posiciones estratégicas
- Mobile-first
- Velocidad < 1 segundo
- Animaciones sutiles con Framer Motion
- Trust signals visibles: rating, destinos, 24/7, precio fijo

### Buscador global:
- En header, accesible desde todas las páginas
- Autocompletado con aeropuertos, ciudades, países
- Al seleccionar, redirige a la página correspondiente
- Funciona en todos los idiomas

---

## ORDEN DE IMPLEMENTACIÓN

### Sprint 1 (Semana 1-2): Fundamentos
1. Inicializar Next.js 15 + TypeScript + Tailwind
2. Configurar Sanity con todos los schemas (airport, route, city, country, region, port, trainStation, servicePage, blogPost, page)
3. Configurar next-intl con EN + ES
4. Estructura de carpetas completa
5. Layout base: Header, Footer, Navigation, LanguageSwitcher
6. Configurar Vercel + dominio

### Sprint 2 (Semana 2-3): Core pages
1. Homepage
2. Página de aeropuerto con estructura H completa
3. Página de ruta con estructura H completa
4. Página de ciudad con estructura H completa
5. Página de país
6. Página de región
7. BookingWidget con iframe ETO integrado
8. Pre-relleno automático del widget según contexto

### Sprint 3 (Semana 3-4): SEO y enlazado
1. Sitemap dinámico programático
2. Metadatos dinámicos por tipo
3. Schema.org por tipo (TaxiService, BreadcrumbList, FAQPage, BlogPosting)
4. Hreflangs en todas las páginas
5. Componente enlazado interno automático
6. Breadcrumbs
7. Robots.txt

### Sprint 4 (Semana 4-5): Funcionalidades
1. Buscador global con autocompletado
2. Login / área cliente (iframe ETO customer)
3. Páginas de servicios (airport, port, train, city-to-city)
4. Listados (aeropuertos, ciudades, países, regiones)
5. FAQ component con Schema
6. Testimonials / reviews
7. Trust signals

### Sprint 5 (Semana 5-6): Blog y contenido dinámico
1. Schema blogPost en Sanity con relaciones dinámicas
2. Custom block BookingCTA en portableText
3. Página listado blog con filtros
4. Página artículo individual con estructura H
5. Componente LatestNews dinámico
6. Integrar LatestNews en todas las fichas (airport, city, country, region, route, service)
7. Renderizador BookingCTA inline

### Sprint 6 (Semana 6-7): Multiidioma y traducción
1. Traducción de toda la UI (botones, labels, textos fijos)
2. URLs traducidas por idioma
3. Integración API GPT para traducción en Sanity
4. Botón "Generate Translation" en Sanity desk
5. Verificar hreflangs
6. Testear switching de idioma

### Sprint 7 (Semana 7-8): Migración
1. Script migración WP → Sanity
2. Migración imágenes → Cloudflare R2
3. Mapeo URLs antiguas → nuevas
4. Redirecciones 301
5. Crear contenido nuevo (regiones, puertos, estaciones)

### Sprint 8 (Semana 8-10): QA y lanzamiento
1. Testing completo: rendimiento, SEO, funcionalidad, responsive
2. Lighthouse audit (95+ en todas las métricas)
3. Verificar todas las redirecciones 301
4. Verificar todos los hreflangs
5. Verificar widget ETO en todos los idiomas
6. Verificar área de cliente
7. Verificar blog con relaciones dinámicas
8. Formación al equipo
9. Publicación y verificación Search Console

---

## COMPETENCIA A SUPERAR

Webs en top 5 que hay que desbancar:
- hoppa.com (usa Next.js — referencia técnica)
- shuttlespaintransfers.com
- welcomepickups.com
- mytransfers.com
- gettransfer.com
- airportstaxitransfers.com
- suntransfers.com
- transfeero.com

### Ventajas competitivas de Titan Transfers:
1. Más URLs indexadas (generación programática masiva de rutas)
2. Contenido único por ruta (no plantillas genéricas)
3. Enlazado interno superior (automático basado en relaciones)
4. Velocidad de carga inferior (< 1 seg)
5. Mejor experiencia móvil
6. Schema.org más rico (Transport, Breadcrumb, FAQ, AggregateRating, BlogPosting)
7. Multiidioma nativo con hreflangs perfectos
8. Widget de reserva contextualizado por página
9. Blog con contenido fresco vinculado dinámicamente a localidades
10. Cobertura de keyword "private taxi" en todas las fichas

---

## NOTAS IMPORTANTES

1. **NO reescribir la lógica de reservas.** EasyTaxiOffice se consume via iframe. Solo mejorar presentación.
2. **Idioma base INGLÉS.** Español segundo. Un idioma nuevo por mes.
3. **Generación programática masiva.** Cada aeropuerto puede tener 50-200 rutas = miles de landing pages SEO.
4. **Enlazado interno AUTOMÁTICO.** Basado en relaciones de Sanity. No manual.
5. **Traducciones de contenido con IA (API GPT)** integrada en Sanity.
6. **Traducciones de UI** en archivos JSON de next-intl.
7. **ISR** para páginas de contenido. Revalidación via webhook Sanity.
8. **Imágenes** optimizadas (WebP/AVIF) via CDN.
9. **"Private taxi"** como keyword secundaria en al menos un H2 y un H3 de FAQ en cada tipo de contenido.
10. **Blog dinámico** con relaciones a localidades. Cada post alimenta las fichas relacionadas con noticias frescas.
11. **BookingCTA** es un custom block insertable en cualquier artículo que genera enlaces + widget contextualizado.
12. **Dossier de documentación técnica** al final del proyecto detallando cada módulo.
