# Revisión técnica de la web — cambios publicados

**Titan Transfers · 15 de agosto de 2026**

*Todos los enlaces de este documento son clicables y llevan a la página real, ya publicada.*

---

## Resumen

Revisión completa de las páginas de aeropuerto y de los listados. Se han corregido cinco problemas que afectaban al posicionamiento y a la experiencia del visitante, y se han añadido fotografías a 79 páginas que no tenían ninguna.

| | Antes | Ahora |
|---|---|---|
| Páginas de aeropuerto con el titular roto | **87 de 211** | 0 |
| Direcciones que devolvían "página no encontrada" | **17** | 0 |
| Aeropuertos sin fotografía | **88** | 9 |
| Contador de la página de aeropuertos | 124 aeropuertos · 30 países | **211 · 51** |
| Buscador de reservas en páginas de servicio | A la izquierda | A la derecha, como el resto |

---

## 1. El titular de las páginas de aeropuerto

Era el problema más serio. El titular (el texto grande que encabeza la página, y una de las señales que más pesan para Google) se construía a partir de la ciudad del aeropuerto. **87 de los 211 aeropuertos no tienen ciudad asociada**, así que su titular se quedaba literalmente en *"airport transfers"*, sin nombre de sitio. Además estaba escrito en inglés para los seis idiomas.

Ahora usa el nombre del aeropuerto cuando no hay ciudad, y está traducido:

| Página | Titular |
|---|---|
| [Dalaman (inglés)](https://titantransfers.com/airport-transfers-private-taxi/dalaman/) | Dalaman Airport Transfers |
| [Dalaman (español)](https://titantransfers.com/es/traslados-aeropuerto-privados-taxi/dalaman/) | Traslados Aeropuerto de Dalaman |
| [Dalaman (italiano)](https://titantransfers.com/it/trasferimenti-aeroporto-taxi-privato/dalaman/) | Trasferimenti Aeroporto di Dalaman |
| [Dalaman (alemán)](https://titantransfers.com/de/flughafentransfer-privat-taxi/dalaman/) | Transfers Flughafen Dalaman |
| [Venecia](https://titantransfers.com/airport-transfers-private-taxi/venice-marco-polo/) | Venice Marco Polo Airport Transfers |
| [Niza (francés)](https://titantransfers.com/fr/transferts-aeroport-taxi-prive/aeroport-nice-cote-d-azur/) | Transferts Aéroport Nice Côte d'Azur |

**Conviene pedir la reindexación de estas páginas en Search Console**, para que Google vuelva a leerlas cuanto antes en lugar de esperar a su siguiente pasada.

## 2. Diecisiete direcciones daban error 404

Se detectaron dos, y al revisarlas resultó ser un patrón: la raíz de **cada** sección devolvía "página no encontrada", en **cada** idioma. Son direcciones que se enlazan desde las migas de navegación y que los visitantes escriben a mano.

Cada una lleva ahora a su listado correspondiente, con una redirección permanente (301), que es la que traslada el valor de posicionamiento:

| Antes daba error | Ahora lleva a |
|---|---|
| `/airport-transfers-private-taxi/` | [Aeropuertos](https://titantransfers.com/airports/) |
| `/private-transfers/` | [Ciudades](https://titantransfers.com/cities/) |
| `/private-transfers-country/` | [Países](https://titantransfers.com/countries/) |
| `/private-transfers-region/` y `/region/` | [Regiones](https://titantransfers.com/regions/) |
| `/es/traslados-aeropuerto-privados-taxi/` | [Aeropuertos (es)](https://titantransfers.com/es/aeropuertos/) |
| `/es/traslados-privados-taxi/` | [Ciudades (es)](https://titantransfers.com/es/ciudades/) |
| …y los equivalentes en italiano, alemán, francés y árabe | su listado |

Comprobado: las 17 redirigen y terminan en una página válida.

## 3. Los contadores estaban congelados

La página de aeropuertos anunciaba *124 aeropuertos en 30 países* cuando el catálogo tiene **211 en 51 países**. Lo mismo en ciudades y países. Ahora se calculan solos a partir del catálogo, de modo que no vuelven a quedarse desfasados.

- [Aeropuertos](https://titantransfers.com/airports/) — 211 · 51
- [Ciudades](https://titantransfers.com/cities/) — 1.171 · 51
- [Países](https://titantransfers.com/countries/) — 51 · 211 · 1.171

## 4. Fotografías: 88 páginas sin imagen

Los aeropuertos sin foto se mostraban como un rectángulo negro en el listado. Se han añadido **79 fotografías reales**, todas con licencia libre y su crédito visible en la página, buscando siempre una vista **de la ciudad**, nunca de la terminal.

Puede verse en el [listado de aeropuertos](https://titantransfers.com/airports/). Algunos ejemplos:

[Agadir](https://titantransfers.com/airport-transfers-private-taxi/agadir-al-massira/) · [Bari](https://titantransfers.com/airport-transfers-private-taxi/bari-karol-wojty-a/) · [Belgrado](https://titantransfers.com/airport-transfers-private-taxi/belgrade-nikola-tesla/) · [Sevilla](https://titantransfers.com/airport-transfers-private-taxi/seville/) · [Split](https://titantransfers.com/airport-transfers-private-taxi/split/) · [Venecia](https://titantransfers.com/airport-transfers-private-taxi/venice-marco-polo/)

Las 9 restantes no tienen todavía ninguna imagen de licencia libre que muestre realmente el lugar. Se ha preferido dejarlas con la imagen corporativa antes que ilustrarlas con una fotografía que no les corresponde: durante el proceso el buscador automático propuso un mapa de densidad de población para Ginebra, una etapa del Tour de Francia para Tarbes y un avión para Bangkok, y todas ésas se descartaron a mano.

## 5. El buscador de reservas estaba al lado contrario

En las páginas de servicio, el formulario de reserva aparecía a la izquierda, mientras que en el resto del sitio —ciudades, aeropuertos y rutas— está a la derecha. No era un problema de un idioma concreto: ocurría en los seis. Ya está alineado con el resto:

[Traslados de aeropuerto](https://titantransfers.com/services/airport-transfers/) · [en italiano](https://titantransfers.com/it/servizi/trasferimenti-aeroportuali/) · [en español](https://titantransfers.com/es/servicios/traslados-aeropuerto/)

## 6. Títulos, descripciones e idiomas

- Los listados de regiones, blog y servicios tenían títulos de hasta 86 caracteres, de los que Google solo muestra unos 60. Ajustados.
- Las páginas de servicio **no declaraban su versión en francés** ante Google, y su dirección canónica apuntaba a la inglesa. Corregido.

---

## Comprobación final

Revisadas **74 páginas** en los seis idiomas: todas con título dentro de la longitud visible, descripción, titular y dirección canónica correctos. Sin errores 404. Sin imágenes rotas.

Las únicas excepciones son deliberadas: las páginas de acceso de clientes no se indexan (no tiene sentido que compitan en Google), y las páginas de inicio conservan la marca en el título aunque eso alargue unos caracteres, porque "Titan Transfers" es la búsqueda donde el sitio aparece en primera posición.

---

## Además, esta misma semana

Se publicaron **60 rutas nuevas** desde los aeropuertos de **Sarajevo** (47) y **Tánger** (13), elegidas porque son plazas donde el sitio ya aparece en la primera página de Google y sin embargo solo tenía una ruta publicada en cada una. Detalle completo en el documento *Nuevas rutas publicadas — Sarajevo y Tánger*.
