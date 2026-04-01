# Blog content strategy — Titan Transfers

## Objetivo

Posicionar rutas, aeropuertos, ciudades y eventos mediante contenido extenso
(2.000–4.000 palabras) con intención informacional-transaccional y el mejor
interlinking posible hacia las landing pages de producto.

## Prioridad de tipos de contenido

1. **Rutas** — mayor intención de compra ("barcelona airport to sitges")
2. **Aeropuertos** — hub que agrupa todas las rutas de ese aeropuerto
3. **Destinos** — ciudades y regiones, menor intención pero más volumen
4. **Eventos** — tráfico puntual y muy cualificado (F1, festival, etc.)

---

## Tipo 1 — Post de RUTA

**Keyword objetivo:** "how to get from [aeropuerto] to [destino]"  
**Longitud mínima:** 2.000 palabras  
**Internal links:** exactamente 1 por URL destino — ruta (1), aeropuerto origen (1), ciudad destino (1)

### Estructura

```
H1: How to get from [Airport] to [Destination] — complete transfer guide

Intro (150 palabras)
— Contexto: dónde está el aeropuerto, por qué la gente va a ese destino
— Hook: "you have X options — here's what each one really involves"

H2: Transfer options from [Airport] to [Destination]
  H3: Private transfer — door to door, fixed price          ← NUESTRO SERVICIO PRIMERO
    - Tiempo, precio fijo, ventajas, qué incluye
    - Lista bullet: ventajas clave
    - BookingCTA block aquí ← INJECTION A MITAD DEL CONTENIDO
  H3: Taxi
    - Precio estimado, recargo aeropuerto, riesgo de precio variable
  H3: Public transport
    - Ruta exacta, transbordos, tiempo total, precio
    - Por qué no es ideal con equipaje/grupos

H2: How much does a transfer from [Airport] to [Destination] cost?
  — Tabla comparativa de opciones (lista bullet con precios)
  — Cálculo por persona para grupos

H2: How long does the journey take?
  — Tiempo en condiciones normales y en temporada alta
  — Distancia exacta en km

H2: Meeting your driver at [Airport]
  — Dónde espera el conductor (terminal, planta)
  — Qué pasa si el vuelo se retrasa
  — Sin coste adicional por retraso

H2: About [Destination]
  — Descripción del destino (150–200 palabras)
  — Por qué la gente lo visita

H2: Top things to do in [Destination]
  — Lista bullet (5–8 items) para dar valor informacional

H2: Practical tips for your transfer
  — Lista bullet (5–6 consejos prácticos)

H2: Frequently asked questions
  H3: Is there a direct train from [Airport] to [Destination]?
  H3: How far is [Destination] from [Airport]?
  H3: Can I book a transfer in advance?
  H3: What happens if my flight is delayed?
  H3: Do you offer return transfers?
```

### Internal linking checklist
- [ ] 1 único link a `/airport/[slug]/[route-slug]/` — en zona de conversión (FAQ o CTA)
- [ ] 1 único link a `/airport/[slug]/` — en zona informativa (sección taxi o transporte)
- [ ] 1 único link a `/city/[slug]/` — en zona descriptiva (sección distancia o about)
- [ ] Cada URL aparece como máximo 1 vez — repetir la misma URL es black hat
- [ ] Anchor text natural y descriptivo — nunca keyword stuffing
- [ ] BookingCTA block inyectado a mitad del artículo (automático en el código)

---

## Tipo 2 — Post de AEROPUERTO (hub)

**Keyword objetivo:** "[airport name] transfers guide" / "[airport name] airport transport"  
**Longitud mínima:** 3.000 palabras  
**Internal links mínimos:** landing aeropuerto (1), TODAS las rutas de ese aeropuerto

### Estructura

```
H1: [Airport Name] airport transfers — complete guide to getting around

Intro
— Terminal overview (T1, T2, etc.), dónde llega cada tipo de vuelo
— "This guide covers every transfer option from [Airport] to the most popular destinations"

H2: Private transfers from [Airport] — all destinations
  — Intro al servicio
  — Lista de destinos principales con precio estimado y tiempo
  — Cada destino enlaza a su landing de ruta
  — BookingCTA block

H2: How to find your driver at [Airport]
  — Instrucciones exactas por terminal
  — Punto de encuentro, señalización, etc.

H2: [Airport] arrivals — what to expect
  — Proceso de llegada, control de pasaportes, recogida de equipaje
  — Tiempo estimado desde aterrizaje hasta salida

H2: Transport options from [Airport]
  H3: Private transfer
  H3: Official taxis
  H3: Airport buses
  H3: Train connections
  H3: Car rental

H2: Most popular routes from [Airport]
  — 6–10 rutas más populares con distancia, tiempo y precio
  — Cada una enlaza a su landing de ruta

H2: [Airport] practical information
  — Terminales, horarios, wi-fi, consignas, etc.

H2: Frequently asked questions
  — 5–6 preguntas sobre el aeropuerto
```

### Internal linking checklist
- [ ] 1 único link a `/airport/[slug]/` (la landing del aeropuerto)
- [ ] Cada ruta mencionada: 1 único link a su `/airport/[slug]/[route-slug]/` — sin repetir
- [ ] Ciudades de destino: 1 único link a `/city/[slug]/` por ciudad — sin repetir

---

## Tipo 3 — Post de DESTINO (ciudad/región)

**Keyword objetivo:** "transfers to [city]" / "[city] airport connections"  
**Longitud mínima:** 2.000 palabras

### Estructura

```
H1: Getting to [City]: airport transfers, transport options and travel guide

Intro
— Qué hace especial a este destino
— Desde qué aeropuertos se llega normalmente

H2: How to get to [City] from the airport
  H3: From [Airport 1] (más cercano)
    — Enlaza a las rutas de ese aeropuerto a la ciudad
  H3: From [Airport 2] (si aplica)
  — BookingCTA block

H2: Private transfers to [City] — prices and options
  — Lista de aeropuertos de origen con precio estimado
  — Cada uno enlaza a la ruta correspondiente

H2: About [City]
  — 200–300 palabras sobre el destino

H2: Where to stay in [City]
  — Zonas/barrios principales y por qué son convenientes para transfers

H2: Getting around [City]
  — Transporte local, taxi, metro, etc.

H2: Top things to do in [City]
  — 6–8 actividades

H2: Best time to visit [City]
  — Temporadas, eventos, precios

H2: Frequently asked questions
```

---

## Tipo 4 — Post de EVENTO

**Keyword objetivo:** "[event name] [year] transfer" / "how to get to [event] from [airport]"  
**Longitud mínima:** 1.500 palabras  
**Publicar:** 6–8 semanas antes del evento

### Estructura

```
H1: [Event Name] [Year]: airport transfer guide and travel tips

Intro
— Qué es el evento, fechas, dónde se celebra
— Por qué el transfer privado es la mejor opción para este evento

H2: Getting to [Venue/City] for [Event]
  H3: From [Airport 1]
  H3: From [Airport 2]
  — BookingCTA block

H2: [Event] transfer tips
  — Reservar con antelación (alta demanda)
  — Opciones de grupo si viajan varios
  — Horarios de llegada recomendados

H2: About [Event]
  — Programa, entradas, información práctica

H2: Where to stay near [Event venue]
  — Zonas recomendadas, distancia al venue

H2: Frequently asked questions sobre el evento + transfers
```

---

## Reglas de interlinking

1. **1 link por URL destino, sin excepciones** — enlazar la misma URL más de una vez en el mismo post es sobreoptimización (black hat). Google lo penaliza.

2. **Máximo 3 internal links por post** para posts de ruta (ruta + aeropuerto + ciudad). Posts de aeropuerto hub pueden tener más porque enlazan a múltiples rutas distintas.

3. **Anchor text natural** — una sola frase descriptiva, nunca repetida. No keyword stuffing.

4. **Distribución a lo largo del artículo** — intro/medio/final. Nunca todos los links juntos.

5. **BookingCTA siempre inyectado** a mitad del contenido (automático en el código)

6. **RouteInlineBlock** si hay rutas relacionadas en Sanity (widget visual, no cuenta como link de texto)

7. **Nunca enlazar externamente** a competidores o comparadores de precio

---

## Volumen y roadmap

| Fase | Tipo | Cantidad | Prioridad |
|------|------|----------|-----------|
| 1 | Aeropuertos hub (top 20) | 20 posts | Máxima |
| 2 | Rutas principales (top 50) | 50 posts | Alta |
| 3 | Ciudades destino (top 30) | 30 posts | Media |
| 4 | Eventos calendario | 15–20/año | Oportunista |

---

## Ejemplo implementado

`scripts/seed-example-route-post.mjs` — post tipo RUTA completo:
"How to get from Barcelona airport to Sitges — complete transfer guide"
