import { richText } from './portable-text.mjs'

// ── Hash-based variant selector (deterministic per slug) ─────────────────
function hashCode(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
  return Math.abs(h)
}
function pick(arr, slug, offset = 0) {
  return arr[(hashCode(slug) + offset) % arr.length]
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AIRPORT CONTENT — EN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const airportIntrosEN = [
  (d) => `${d.airport} (${d.iata}) is the principal international airport serving ${d.city} and the surrounding ${d.country} region. Handling millions of passengers annually, it connects ${d.city} with major destinations across the globe. Our private transfer service ensures a seamless door-to-door journey from the terminal to your accommodation, with no queues, no meters, and no surprises.`,
  (d) => `Welcome to ${d.airport} (${d.iata}), the main gateway to ${d.city}, ${d.country}. Whether you are arriving for business or leisure, our professional chauffeurs are ready to meet you at arrivals with a name board, assist with your luggage, and drive you directly to your destination at a fixed, pre-agreed fare.`,
  (d) => `Located ${d.distanceToCenter || 'a short drive'} from the heart of ${d.city}, ${d.airport} (${d.iata}) is one of ${d.country}'s busiest aviation hubs. Skip the taxi queue and book a private transfer with Titan Transfers — enjoy fixed pricing, complimentary flight monitoring, and free cancellation up to 24 hours before pickup.`,
  (d) => `Planning a trip to ${d.city}? ${d.airport} (${d.iata}) is your most convenient arrival point. With ${d.terminals || 'multiple'} terminals serving domestic and international flights, navigating the airport can be daunting. Let our experienced drivers handle the logistics while you relax in a clean, modern vehicle with all-inclusive pricing.`,
]

const whyBookEN = [
  (d) => `After a long flight, the last thing you want is to figure out complicated public transport connections or haggle with taxi drivers. With Titan Transfers, your professional driver will be waiting at the arrivals hall with a name board, ready to help with your luggage and take you directly to your destination in a clean, comfortable vehicle.`,
  (d) => `Booking a private transfer from ${d.airport} means peace of mind from the moment you land. We offer transparent, fixed fares with no hidden charges — the price you see at booking is the price you pay. Our drivers monitor your flight in real time, so if your arrival is delayed, your pickup time adjusts automatically at no extra cost.`,
  (d) => `Why stress over ground transportation when you can pre-book a reliable private transfer? Our service includes meet and greet at the terminal, complimentary waiting time, child seats on request, and 24/7 customer support. We cover all destinations in ${d.city} and the wider ${d.country} region.`,
  (d) => `A private airport transfer is the most comfortable and efficient way to reach ${d.city} from ${d.airport}. Unlike shared shuttles that make multiple stops, our door-to-door service takes you straight to your hotel, apartment, or any address you choose. Fixed prices, professional drivers, and vehicles for every group size.`,
]

const destinationsEN = [
  (d) => `Our most popular routes from ${d.airport} include transfers to ${d.city} city centre${d.landmarks ? `, as well as nearby destinations such as ${d.landmarks}` : ''}. Whether you need a quick ride to your hotel or a longer transfer to a coastal resort, beach town, or business district, we have you covered with competitive fixed rates.`,
  (d) => `From ${d.airport}, we operate private transfers to all areas of ${d.city} and beyond. Popular destinations include the city centre, major hotels, cruise ports, convention centres, and neighbouring towns. All our vehicles are fully licensed and insured, driven by local professionals who know the roads and traffic patterns.`,
  (d) => `Titan Transfers connects ${d.airport} with every corner of ${d.city} and the surrounding region. Business travellers, families, and groups of all sizes trust us for reliable point-to-point transfers at transparent prices${d.landmarks ? `. Don't miss the chance to visit ${d.landmarks} during your stay` : ''}.`,
]

const cityInfoEN = [
  (d) => `${d.city} is a vibrant destination that blends ${d.cityVibe || 'rich history with modern culture'}. From world-class museums and architectural landmarks to bustling markets and exquisite gastronomy, there is something for every traveller. After landing at ${d.airport}, your private transfer will have you exploring in no time.`,
  (d) => `As one of ${d.country}'s most visited cities, ${d.city} offers a captivating mix of ${d.cityVibe || 'culture, cuisine, and natural beauty'}. Whether you are here for a weekend getaway or an extended stay, starting your trip with a comfortable, stress-free transfer sets the tone for an unforgettable visit.`,
  (d) => `There is a reason millions of travellers choose ${d.city} every year. The city's ${d.cityVibe || 'unique blend of tradition and innovation'} creates an atmosphere that captivates visitors from around the world. Book your airport transfer with Titan Transfers and step into the ${d.city} experience the moment you leave the terminal.`,
]

export function generateAirportEN(d) {
  const slug = d.slug || ''
  return richText([
    { text: `Private Transfers from ${d.airport}`, style: 'h2' },
    pick(airportIntrosEN, slug, 0)(d),
    { text: `Why Book a Private Transfer from ${d.airport}?`, style: 'h3' },
    pick(whyBookEN, slug, 1)(d),
    { text: `Popular Destinations from ${d.airport}`, style: 'h3' },
    pick(destinationsEN, slug, 2)(d),
    { text: `About ${d.city}`, style: 'h3' },
    pick(cityInfoEN, slug, 3)(d),
  ])
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AIRPORT CONTENT — ES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const airportIntrosES = [
  (d) => `El ${d.esTitle || d.airport} (${d.iata}) es el principal aeropuerto internacional que da servicio a ${d.city} y toda la region de ${d.country}. Con millones de pasajeros al año, conecta ${d.city} con destinos principales de todo el mundo. Nuestro servicio de transfer privado garantiza un viaje puerta a puerta sin colas, sin taximetros y sin sorpresas.`,
  (d) => `Bienvenido al ${d.esTitle || d.airport} (${d.iata}), la principal puerta de entrada a ${d.city}, ${d.country}. Ya viajes por negocios o por placer, nuestros choferes profesionales te esperaran en la zona de llegadas con un cartel con tu nombre, te ayudaran con el equipaje y te llevaran directamente a tu destino a una tarifa fija acordada previamente.`,
  (d) => `Situado ${d.distanceToCenter ? `a ${d.distanceToCenter}` : 'a poca distancia'} del centro de ${d.city}, el ${d.esTitle || d.airport} (${d.iata}) es uno de los aeropuertos mas transitados de ${d.country}. Evita las colas de taxis y reserva un transfer privado con Titan Transfers: precio fijo, monitorizacion de vuelo gratuita y cancelacion sin coste hasta 24 horas antes.`,
  (d) => `¿Planeas un viaje a ${d.city}? El ${d.esTitle || d.airport} (${d.iata}) es tu punto de llegada mas conveniente. Con ${d.terminals || 'varias'} terminales para vuelos nacionales e internacionales, navegar por el aeropuerto puede resultar complicado. Deja que nuestros conductores experimentados se encarguen de todo mientras tu te relajas en un vehiculo limpio y moderno.`,
]

const whyBookES = [
  (d) => `Despues de un largo vuelo, lo ultimo que quieres es descifrar conexiones complicadas de transporte publico o negociar con taxistas. Con Titan Transfers, tu conductor profesional te estara esperando en la sala de llegadas con un cartel con tu nombre, listo para ayudarte con el equipaje y llevarte directamente a tu destino en un vehiculo limpio y confortable.`,
  (d) => `Reservar un transfer privado desde el ${d.esTitle || d.airport} significa tranquilidad desde el momento en que aterrizas. Ofrecemos tarifas fijas y transparentes sin cargos ocultos: el precio que ves al reservar es el que pagas. Nuestros conductores monitorizan tu vuelo en tiempo real, asi que si tu llegada se retrasa, la hora de recogida se ajusta automaticamente sin coste adicional.`,
  (d) => `¿Por que estresarte con el transporte terrestre cuando puedes reservar un transfer privado fiable? Nuestro servicio incluye recogida personalizada en la terminal, tiempo de espera gratuito, sillas infantiles bajo peticion y soporte al cliente 24/7. Cubrimos todos los destinos en ${d.city} y toda la region de ${d.country}.`,
  (d) => `Un transfer privado desde el aeropuerto es la forma mas comoda y eficiente de llegar a ${d.city} desde el ${d.esTitle || d.airport}. A diferencia de los shuttles compartidos que hacen multiples paradas, nuestro servicio puerta a puerta te lleva directamente a tu hotel, apartamento o cualquier direccion que elijas. Precios fijos, conductores profesionales y vehiculos para todos los tamaños de grupo.`,
]

const destinationsES = [
  (d) => `Nuestras rutas mas populares desde el ${d.esTitle || d.airport} incluyen transfers al centro de ${d.city}${d.landmarks ? `, asi como destinos cercanos como ${d.landmarks}` : ''}. Ya necesites un trayecto rapido a tu hotel o un transfer mas largo a una zona costera, pueblo de playa o distrito de negocios, te ofrecemos tarifas fijas competitivas.`,
  (d) => `Desde el ${d.esTitle || d.airport}, operamos transfers privados a todas las zonas de ${d.city} y alrededores. Los destinos mas solicitados incluyen el centro de la ciudad, hoteles principales, puertos de cruceros, centros de convenciones y localidades vecinas. Todos nuestros vehiculos estan totalmente licenciados y asegurados, conducidos por profesionales locales.`,
  (d) => `Titan Transfers conecta el ${d.esTitle || d.airport} con cada rincon de ${d.city} y la region circundante. Viajeros de negocios, familias y grupos de todos los tamaños confian en nosotros para transfers fiables punto a punto a precios transparentes${d.landmarks ? `. No te pierdas la oportunidad de visitar ${d.landmarks} durante tu estancia` : ''}.`,
]

const cityInfoES = [
  (d) => `${d.city} es un destino vibrante que combina ${d.cityVibeEs || 'una rica historia con cultura moderna'}. Desde museos de talla mundial y monumentos arquitectonicos hasta mercados bulliciosos y una gastronomia exquisita, hay algo para cada viajero. Tras aterrizar en el ${d.esTitle || d.airport}, tu transfer privado te tendra explorando en cuestion de minutos.`,
  (d) => `Como una de las ciudades mas visitadas de ${d.country}, ${d.city} ofrece una mezcla cautivadora de ${d.cityVibeEs || 'cultura, gastronomia y belleza natural'}. Ya vengas para una escapada de fin de semana o una estancia prolongada, empezar tu viaje con un transfer comodo y sin estres marca la pauta de una visita inolvidable.`,
  (d) => `Hay una razon por la que millones de viajeros eligen ${d.city} cada año. La ${d.cityVibeEs || 'singular mezcla de tradicion e innovacion'} de la ciudad crea una atmosfera que cautiva a visitantes de todo el mundo. Reserva tu transfer con Titan Transfers y sumérgete en la experiencia ${d.city} desde el momento en que sales de la terminal.`,
]

export function generateAirportES(d) {
  const slug = d.slug || ''
  return richText([
    { text: `Transfers Privados desde el ${d.esTitle || d.airport}`, style: 'h2' },
    pick(airportIntrosES, slug, 0)(d),
    { text: `¿Por qué reservar un transfer privado desde el ${d.esTitle || d.airport}?`, style: 'h3' },
    pick(whyBookES, slug, 1)(d),
    { text: `Destinos populares desde el ${d.esTitle || d.airport}`, style: 'h3' },
    pick(destinationsES, slug, 2)(d),
    { text: `Sobre ${d.city}`, style: 'h3' },
    pick(cityInfoES, slug, 3)(d),
  ])
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COUNTRY CONTENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function generateCountryEN(d) {
  return richText([
    { text: `Private Transfers in ${d.name}`, style: 'h2' },
    `Titan Transfers operates professional private transfer services across ${d.name}, connecting major airports with cities, resorts, and business districts. Whether you are landing at ${d.mainAirport || 'the main international airport'} or any regional hub, our licensed drivers and modern fleet guarantee a comfortable, punctual journey at a fixed price.`,
    `${d.name} welcomes millions of international visitors each year, attracted by its ${d.vibe || 'diverse landscapes, rich cultural heritage, and vibrant cities'}. From the moment you step off the plane, our meet-and-greet service ensures a stress-free start to your trip with no hidden charges, complimentary flight monitoring, and free cancellation up to 24 hours before pickup.`,
    { text: `Why Choose Titan Transfers in ${d.name}?`, style: 'h3' },
    `We offer fixed-price airport transfers throughout ${d.name} with transparent billing, professional chauffeurs, and a range of vehicles including sedans, MPVs, executive cars, and minibuses for groups of up to 16 passengers. Child seats, wheelchair-accessible vehicles, and VIP services are available on request.`,
  ])
}

export function generateCountryES(d) {
  return richText([
    { text: `Transfers Privados en ${d.esName || d.name}`, style: 'h2' },
    `Titan Transfers ofrece servicios profesionales de transfer privado en todo ${d.esName || d.name}, conectando los principales aeropuertos con ciudades, complejos turisticos y distritos de negocios. Ya aterrices en ${d.mainAirport || 'el aeropuerto internacional principal'} o en cualquier hub regional, nuestros conductores licenciados y flota moderna garantizan un viaje comodo y puntual a precio fijo.`,
    `${d.esName || d.name} recibe millones de visitantes internacionales cada año, atraidos por ${d.vibeEs || 'sus paisajes diversos, su rico patrimonio cultural y sus ciudades vibrantes'}. Desde el momento en que bajas del avion, nuestro servicio de recogida personalizada te garantiza un inicio de viaje sin estres, sin cargos ocultos, con monitorizacion de vuelo gratuita y cancelacion sin coste hasta 24 horas antes.`,
    { text: `¿Por qué elegir Titan Transfers en ${d.esName || d.name}?`, style: 'h3' },
    `Ofrecemos transfers a precio fijo en todo ${d.esName || d.name} con facturacion transparente, choferes profesionales y una gama de vehiculos que incluye berlinas, MPV, coches ejecutivos y minibuses para grupos de hasta 16 pasajeros. Sillas infantiles, vehiculos adaptados y servicios VIP disponibles bajo peticion.`,
  ])
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CITY CONTENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function generateCityEN(d) {
  return richText([
    { text: `Private Transfers in ${d.name}`, style: 'h2' },
    `Book reliable private transfers in ${d.name}, ${d.country}. Our professional drivers cover all routes between airports, hotels, cruise ports, and city attractions. Enjoy fixed pricing with no hidden charges, meet and greet at your arrival point, and complimentary cancellation up to 24 hours before your transfer.`,
    `${d.name} is ${d.vibe || `one of ${d.country}'s most captivating destinations, offering visitors a blend of culture, history, and modern amenities`}. Whether you are visiting for business or pleasure, starting your journey with a comfortable, pre-booked transfer ensures you arrive relaxed and ready to explore.`,
    { text: `Getting Around ${d.name}`, style: 'h3' },
    `From ${d.nearestAirport || 'the nearest airport'} to your hotel, from the cruise terminal to the city centre, or from one attraction to another — Titan Transfers has you covered. Our fleet includes sedans for couples, spacious MPVs for families, executive vehicles for corporate travellers, and minibuses for groups of up to 16 passengers.`,
  ])
}

export function generateCityES(d) {
  return richText([
    { text: `Transfers Privados en ${d.esName || d.name}`, style: 'h2' },
    `Reserva transfers privados fiables en ${d.esName || d.name}, ${d.country}. Nuestros conductores profesionales cubren todas las rutas entre aeropuertos, hoteles, puertos de cruceros y atracciones de la ciudad. Disfruta de precios fijos sin cargos ocultos, recogida personalizada en tu punto de llegada y cancelacion gratuita hasta 24 horas antes del transfer.`,
    `${d.esName || d.name} es ${d.vibeEs || `uno de los destinos mas cautivadores de ${d.country}, que ofrece a los visitantes una mezcla de cultura, historia y comodidades modernas`}. Ya viajes por negocios o por placer, comenzar tu viaje con un transfer comodo y reservado con antelacion te asegura llegar relajado y listo para explorar.`,
    { text: `Moverse por ${d.esName || d.name}`, style: 'h3' },
    `Desde ${d.nearestAirport || 'el aeropuerto mas cercano'} a tu hotel, desde la terminal de cruceros al centro o de una atraccion a otra — Titan Transfers lo tiene cubierto. Nuestra flota incluye berlinas para parejas, MPV espaciosos para familias, vehiculos ejecutivos para viajeros corporativos y minibuses para grupos de hasta 16 pasajeros.`,
  ])
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE CONTENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function generateRouteEN(d) {
  return richText([
    { text: `Private Transfer from ${d.origin} to ${d.destination}`, style: 'h2' },
    `Book a private transfer from ${d.origin} to ${d.destination}${d.distance ? ` (approximately ${d.distance} km, ${d.duration || '~1 hour'} drive)` : ''}. Our professional drivers will meet you at the terminal with a name board and take you door-to-door in a comfortable, modern vehicle. Fixed price, no hidden charges, and free cancellation up to 24 hours before your transfer.`,
    `This is one of our most popular routes${d.originCity ? ` in the ${d.originCity} area` : ''}. Whether you are travelling alone, with family, or as part of a larger group, we have the right vehicle for you — from luxury sedans to spacious minibuses for up to 16 passengers.`,
  ])
}

export function generateRouteES(d) {
  return richText([
    { text: `Transfer Privado de ${d.esOrigin || d.origin} a ${d.esDestination || d.destination}`, style: 'h2' },
    `Reserva un transfer privado de ${d.esOrigin || d.origin} a ${d.esDestination || d.destination}${d.distance ? ` (aproximadamente ${d.distance} km, ${d.duration || '~1 hora'} de trayecto)` : ''}. Nuestros conductores profesionales te esperaran en la terminal con un cartel con tu nombre y te llevaran puerta a puerta en un vehiculo comodo y moderno. Precio fijo, sin cargos ocultos y cancelacion gratuita hasta 24 horas antes del transfer.`,
    `Esta es una de nuestras rutas mas populares${d.originCity ? ` en la zona de ${d.originCity}` : ''}. Ya viajes solo, en familia o en grupo, tenemos el vehiculo adecuado para ti — desde berlinas de lujo hasta minibuses espaciosos para hasta 16 pasajeros.`,
  ])
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEO GENERATORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function seoTitle(type, name, locale = 'en') {
  const templates = {
    airport: {
      en: `${name} Transfers | Private Taxi & Chauffeur Service | Titan Transfers`,
      es: `Traslados ${name} | Taxi Privado y Chófer | Titan Transfers`,
    },
    city: {
      en: `Private Transfers in ${name} | Door-to-Door Service | Titan Transfers`,
      es: `Transfers Privados en ${name} | Servicio Puerta a Puerta | Titan Transfers`,
    },
    country: {
      en: `Airport Transfers in ${name} | Professional Chauffeur Service`,
      es: `Traslados en ${name} | Servicio Profesional de Chófer`,
    },
    route: {
      en: `${name} | Private Transfer | Fixed Price | Titan Transfers`,
      es: `${name} | Transfer Privado | Precio Fijo | Titan Transfers`,
    },
  }
  return templates[type]?.[locale] || name
}

export function seoDesc(type, name, locale = 'en') {
  const templates = {
    airport: {
      en: `Book private transfers from ${name}. Fixed prices, meet & greet, free cancellation. Professional door-to-door service with Titan Transfers.`,
      es: `Reserva traslados privados desde ${name}. Precios fijos, recogida personalizada, cancelación gratuita. Servicio profesional puerta a puerta con Titan Transfers.`,
    },
    city: {
      en: `Professional private transfer service in ${name}. Airport pickups, hotel transfers & city rides. Fixed prices, 24/7 support. Book online with Titan Transfers.`,
      es: `Servicio profesional de transfer privado en ${name}. Recogida en aeropuerto, traslados a hotel y trayectos urbanos. Precios fijos, soporte 24/7.`,
    },
    country: {
      en: `Private airport transfer service across ${name}. Professional drivers, fixed prices, modern vehicles. Book your transfer with Titan Transfers.`,
      es: `Servicio de transfer privado en todo ${name}. Conductores profesionales, precios fijos, vehículos modernos. Reserva tu transfer con Titan Transfers.`,
    },
    route: {
      en: `Book a private transfer ${name}. Fixed price, meet & greet, free cancellation up to 24h. Door-to-door service with Titan Transfers.`,
      es: `Reserva un transfer privado ${name}. Precio fijo, recogida personalizada, cancelación gratuita hasta 24h. Servicio puerta a puerta con Titan Transfers.`,
    },
  }
  return templates[type]?.[locale] || ''
}
