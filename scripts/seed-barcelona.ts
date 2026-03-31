/**
 * Seed script: Barcelona El Prat Airport + Routes (Spanish test content)
 *
 * Creates:
 *   - Country: España
 *   - Region: Cataluña
 *   - Cities: Barcelona, Sitges, Tarragona, Girona, Salou
 *   - Airport: Aeropuerto de Barcelona-El Prat (BCN)
 *   - Nearby airports: Girona-Costa Brava, Reus
 *   - Routes: BCN → Sitges, BCN → Tarragona, BCN → Girona, BCN → Salou, BCN → Barcelona Centro
 *
 * Usage: npx tsx scripts/seed-barcelona.ts
 */

import { createClient } from '@sanity/client'
import https from 'https'
import { Buffer } from 'buffer'

const client = createClient({
  projectId: '6iu2za90',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

// ─── Image helpers ───────────────────────────────────────────────────────────

interface ImageMeta {
  url: string
  title: string
  alt: string
  credit: string
}

const IMAGES: Record<string, ImageMeta> = {
  airport: {
    url: 'https://images.pexels.com/photos/28603501/pexels-photo-28603501.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Terminal moderna del Aeropuerto de Barcelona-El Prat',
    alt: 'Interior de la terminal del Aeropuerto de Barcelona-El Prat con arquitectura moderna y pasajeros',
    credit: 'Photo by Shuaizhi Tian on Pexels',
  },
  barcelona: {
    url: 'https://images.pexels.com/photos/31405655/pexels-photo-31405655.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Vista aerea de Barcelona con la Sagrada Familia',
    alt: 'Vista aerea de la ciudad de Barcelona con la Sagrada Familia y el skyline urbano',
    credit: 'Photo by Johnson Hie on Pexels',
  },
  vehicle: {
    url: 'https://images.pexels.com/photos/804130/pexels-photo-804130.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Vehiculo de transfer privado Aeropuerto Barcelona',
    alt: 'Vehiculo de lujo para servicio de transfer privado desde el Aeropuerto de Barcelona-El Prat',
    credit: 'Photo by Hassan OUAJBIR on Pexels',
  },
  beach: {
    url: 'https://images.pexels.com/photos/5515735/pexels-photo-5515735.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Playa de Barcelona - Barceloneta',
    alt: 'Playa de la Barceloneta en Barcelona con escultura L Estel Ferit junto al mar',
    credit: 'Photo by Jo Kassis on Pexels',
  },
  driver: {
    url: 'https://images.pexels.com/photos/8425360/pexels-photo-8425360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Conductor profesional de transfer Aeropuerto Barcelona-El Prat',
    alt: 'Conductor profesional con traje gris al volante de un vehiculo de transfer del Aeropuerto de Barcelona',
    credit: 'Photo by Pavel Danilyuk on Pexels',
  },
}

async function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const request = (u: string) => {
      https.get(u, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          request(res.headers.location!)
          return
        }
        const chunks: Buffer[] = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => resolve(Buffer.concat(chunks)))
        res.on('error', reject)
      }).on('error', reject)
    }
    request(url)
  })
}

async function uploadImage(key: string) {
  const meta = IMAGES[key]
  console.log(`  Uploading image: ${key}...`)
  const buffer = await downloadImage(meta.url)
  const asset = await client.assets.upload('image', buffer, {
    filename: `${key}-barcelona-airport.jpg`,
    title: meta.title,
  })
  return {
    _type: 'image' as const,
    _sanityAsset: undefined,
    asset: { _type: 'reference' as const, _ref: asset._id },
    hotspot: { x: 0.5, y: 0.5, height: 1, width: 1 },
    alt: meta.alt,
    title: meta.title,
    credit: meta.credit,
  }
}

// ─── Rich text block helper ─────────────────────────────────────────────────

function textBlock(text: string, style: string = 'normal') {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style,
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: Math.random().toString(36).slice(2, 10),
        text,
        marks: [],
      },
    ],
  }
}

function richText(blocks: Array<{ text: string; style?: string }>) {
  return blocks.map((b) => textBlock(b.text, b.style || 'normal'))
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('=== Seeding Barcelona El Prat Airport content ===\n')

  // 1. Upload images
  console.log('1. Uploading images from Pexels...')
  const images: Record<string, Awaited<ReturnType<typeof uploadImage>>> = {}
  for (const key of Object.keys(IMAGES)) {
    images[key] = await uploadImage(key)
  }
  console.log('   Done.\n')

  // 2. Create Country: Spain
  console.log('2. Creating country: Spain...')
  const country = await client.createOrReplace({
    _id: 'country-spain',
    _type: 'country',
    title: 'Spain',
    slug: { _type: 'slug', current: 'spain' },
    description: richText([
      {
        text: 'Discover Spain',
        style: 'h2',
      },
      {
        text: 'Spain is one of the most visited countries in Europe, famous for its stunning beaches, vibrant cities, rich history, and world-class cuisine. From the cosmopolitan energy of Barcelona and Madrid to the sun-soaked coasts of the Costa Brava and Costa Dorada, Spain offers an unforgettable travel experience.',
      },
    ]),
    seoTitle: 'Airport Transfers in Spain | Private Taxi Service | Titan Transfers',
    seoDescription: 'Book private airport transfers across Spain. Door-to-door service from all major Spanish airports. Fixed prices, meet & greet, 24/7 availability.',
    featuredImage: images.barcelona,
    translations: {
      es: {
        title: 'Espana',
        slug: { _type: 'slug', current: 'espana' },
        description: richText([
          {
            text: 'Descubre Espana',
            style: 'h2',
          },
          {
            text: 'Espana es uno de los paises mas visitados de Europa, famoso por sus impresionantes playas, ciudades vibrantes, rica historia y gastronomia de primer nivel. Desde la energia cosmopolita de Barcelona y Madrid hasta las costas banadas por el sol de la Costa Brava y la Costa Dorada, Espana ofrece una experiencia de viaje inolvidable.',
          },
        ]),
        seoTitle: 'Transfers Aeropuerto en Espana | Taxi Privado | Titan Transfers',
        seoDescription: 'Reserva transfers privados desde los principales aeropuertos de Espana. Servicio puerta a puerta, precio fijo, recogida con cartel y disponibilidad 24/7.',
      },
    },
  })
  console.log(`   Created: ${country._id}\n`)

  // 3. Create Region: Catalonia
  console.log('3. Creating region: Catalonia...')
  const region = await client.createOrReplace({
    _id: 'region-catalonia',
    _type: 'region',
    title: 'Catalonia',
    slug: { _type: 'slug', current: 'catalonia' },
    country: { _type: 'reference', _ref: 'country-spain' },
    description: richText([
      {
        text: 'Catalonia is a vibrant autonomous community in northeastern Spain, home to Barcelona, the stunning Costa Brava coastline, and the Pyrenees mountains. With its own language, culture, and traditions, Catalonia offers travellers a unique blend of beach, city, and mountain experiences.',
      },
    ]),
    seoTitle: 'Airport Transfers in Catalonia | Private Taxi Service | Titan Transfers',
    seoDescription: 'Private transfer service across Catalonia. Airport pickups from Barcelona El Prat and Girona. Fixed prices and professional drivers.',
    featuredImage: images.barcelona,
    translations: {
      es: {
        title: 'Cataluna',
        slug: { _type: 'slug', current: 'cataluna' },
        description: richText([
          {
            text: 'Cataluna es una vibrante comunidad autonoma en el noreste de Espana, hogar de Barcelona, la impresionante costa de la Costa Brava y las montanas de los Pirineos. Con su propio idioma, cultura y tradiciones, Cataluna ofrece a los viajeros una combinacion unica de playa, ciudad y montana.',
          },
        ]),
        seoTitle: 'Transfers Aeropuerto en Cataluna | Taxi Privado | Titan Transfers',
        seoDescription: 'Servicio de transfer privado en toda Cataluna. Recogida en los aeropuertos de Barcelona El Prat y Girona. Precios fijos y conductores profesionales.',
      },
    },
  })
  console.log(`   Created: ${region._id}\n`)

  // 4. Create Cities
  console.log('4. Creating cities...')
  const cities = [
    {
      _id: 'city-barcelona',
      title: 'Barcelona',
      slug: 'barcelona',
      lat: 41.3874,
      lng: 2.1686,
      descEN: 'Barcelona is the cosmopolitan capital of Catalonia, world-renowned for its art, architecture, beaches, and nightlife. Home to Gaudi masterpieces like the Sagrada Familia and Park Guell, this Mediterranean gem attracts millions of visitors year-round.',
      descES: 'Barcelona es la cosmopolita capital de Cataluna, mundialmente reconocida por su arte, arquitectura, playas y vida nocturna. Hogar de obras maestras de Gaudi como la Sagrada Familia y el Park Guell, esta joya mediterranea atrae a millones de visitantes durante todo el ano.',
      seoTitleEN: 'Transfers to Barcelona | Private Taxi from Airport | Titan Transfers',
      seoTitleES: 'Transfer a Barcelona | Taxi Privado desde el Aeropuerto | Titan Transfers',
      seoDescEN: 'Book your private transfer to Barcelona city centre. Meet & greet at Barcelona El Prat Airport. Fixed price, comfortable vehicles, 24/7 service.',
      seoDescES: 'Reserva tu transfer privado al centro de Barcelona. Recogida con cartel en el Aeropuerto de Barcelona-El Prat. Precio fijo, vehiculos comodos y servicio 24/7.',
      titleES: 'Barcelona',
      slugES: 'barcelona',
      image: images.barcelona,
    },
    {
      _id: 'city-sitges',
      title: 'Sitges',
      slug: 'sitges',
      lat: 41.2371,
      lng: 1.8121,
      descEN: 'Sitges is a charming coastal town just 35 km south of Barcelona, famous for its beautiful beaches, lively nightlife, cultural festivals, and picturesque old town. A favourite destination for both international tourists and locals.',
      descES: 'Sitges es una encantadora localidad costera a solo 35 km al sur de Barcelona, famosa por sus hermosas playas, animada vida nocturna, festivales culturales y su pintoresco casco antiguo. Un destino favorito tanto de turistas internacionales como locales.',
      seoTitleEN: 'Transfers to Sitges | Private Taxi from Barcelona Airport | Titan Transfers',
      seoTitleES: 'Transfer a Sitges | Taxi Privado desde el Aeropuerto de Barcelona | Titan Transfers',
      seoDescEN: 'Private transfer from Barcelona El Prat Airport to Sitges. 30-minute drive, fixed price, professional driver. Book your Sitges airport transfer.',
      seoDescES: 'Transfer privado desde el Aeropuerto de Barcelona-El Prat a Sitges. 30 minutos de trayecto, precio fijo, conductor profesional. Reserva tu transfer a Sitges.',
      titleES: 'Sitges',
      slugES: 'sitges',
      image: images.beach,
    },
    {
      _id: 'city-tarragona',
      title: 'Tarragona',
      slug: 'tarragona',
      lat: 41.1189,
      lng: 1.2445,
      descEN: 'Tarragona is a historic port city on the Costa Dorada, famous for its remarkably preserved Roman ruins, a UNESCO World Heritage Site. Its golden beaches, medieval old quarter, and vibrant food scene make it a must-visit destination.',
      descES: 'Tarragona es una historica ciudad portuaria en la Costa Dorada, famosa por sus ruinas romanas excepcionalmente conservadas, declaradas Patrimonio de la Humanidad por la UNESCO. Sus playas doradas, su casco antiguo medieval y su vibrante escena gastronomica la convierten en un destino imprescindible.',
      seoTitleEN: 'Transfers to Tarragona | Private Taxi from Barcelona Airport | Titan Transfers',
      seoTitleES: 'Transfer a Tarragona | Taxi Privado desde el Aeropuerto de Barcelona | Titan Transfers',
      seoDescEN: 'Private transfer from Barcelona El Prat Airport to Tarragona. Comfortable 1-hour journey, fixed price, door-to-door service.',
      seoDescES: 'Transfer privado desde el Aeropuerto de Barcelona-El Prat a Tarragona. Trayecto comodo de 1 hora, precio fijo, servicio puerta a puerta.',
      titleES: 'Tarragona',
      slugES: 'tarragona',
      image: images.beach,
    },
    {
      _id: 'city-girona',
      title: 'Girona',
      slug: 'girona',
      lat: 41.9794,
      lng: 2.8214,
      descEN: 'Girona is a medieval city of extraordinary beauty in northern Catalonia, famous for its colourful riverside houses, Jewish Quarter, and the imposing Cathedral. Gateway to the Costa Brava, it\'s a destination that combines history with natural beauty.',
      descES: 'Girona es una ciudad medieval de extraordinaria belleza en el norte de Cataluna, famosa por sus coloridas casas junto al rio, su barrio judio y su imponente catedral. Puerta de entrada a la Costa Brava, es un destino que combina historia con belleza natural.',
      seoTitleEN: 'Transfers to Girona | Private Taxi from Barcelona Airport | Titan Transfers',
      seoTitleES: 'Transfer a Girona | Taxi Privado desde el Aeropuerto de Barcelona | Titan Transfers',
      seoDescEN: 'Private transfer from Barcelona El Prat Airport to Girona. 1h15 comfortable ride, fixed price, meet & greet included.',
      seoDescES: 'Transfer privado desde el Aeropuerto de Barcelona-El Prat a Girona. Trayecto comodo de 1h15, precio fijo, recogida con cartel incluida.',
      titleES: 'Girona',
      slugES: 'girona',
      image: images.barcelona,
    },
    {
      _id: 'city-salou',
      title: 'Salou',
      slug: 'salou',
      lat: 41.0769,
      lng: 1.1310,
      descEN: 'Salou is the most popular family resort on the Costa Dorada, known for its golden beaches, warm waters, and PortAventura World theme park. Located just south of Tarragona, it offers an ideal holiday base with plenty of entertainment and dining.',
      descES: 'Salou es el destino familiar mas popular de la Costa Dorada, conocido por sus playas doradas, aguas calidas y el parque tematico PortAventura World. Situado al sur de Tarragona, ofrece una base de vacaciones ideal con gran oferta de ocio y restauracion.',
      seoTitleEN: 'Transfers to Salou | Private Taxi from Barcelona Airport | Titan Transfers',
      seoTitleES: 'Transfer a Salou | Taxi Privado desde el Aeropuerto de Barcelona | Titan Transfers',
      seoDescEN: 'Private transfer from Barcelona Airport to Salou & PortAventura. 1h10 ride, fixed price, family-friendly vehicles available.',
      seoDescES: 'Transfer privado desde el Aeropuerto de Barcelona a Salou y PortAventura. Trayecto de 1h10, precio fijo, vehiculos familiares disponibles.',
      titleES: 'Salou',
      slugES: 'salou',
      image: images.beach,
    },
  ]

  for (const c of cities) {
    const doc = await client.createOrReplace({
      _id: c._id,
      _type: 'city',
      title: c.title,
      slug: { _type: 'slug', current: c.slug },
      country: { _type: 'reference', _ref: 'country-spain' },
      region: { _type: 'reference', _ref: 'region-catalonia' },
      coordinates: { _type: 'geopoint', lat: c.lat, lng: c.lng },
      description: richText([{ text: c.descEN }]),
      seoTitle: c.seoTitleEN,
      seoDescription: c.seoDescEN,
      featuredImage: c.image,
      translations: {
        es: {
          title: c.titleES,
          slug: { _type: 'slug', current: c.slugES },
          description: richText([{ text: c.descES }]),
          seoTitle: c.seoTitleES,
          seoDescription: c.seoDescES,
        },
      },
    })
    console.log(`   Created city: ${doc._id}`)
  }
  console.log('')

  // 5. Create nearby airports (Girona + Reus)
  console.log('5. Creating nearby airports...')
  const gironaAirport = await client.createOrReplace({
    _id: 'airport-girona',
    _type: 'airport',
    title: 'Girona-Costa Brava Airport',
    slug: { _type: 'slug', current: 'girona-costa-brava-airport' },
    iataCode: 'GRO',
    country: { _type: 'reference', _ref: 'country-spain' },
    city: { _type: 'reference', _ref: 'city-girona' },
    region: { _type: 'reference', _ref: 'region-catalonia' },
    coordinates: { _type: 'geopoint', lat: 41.901, lng: 2.7605 },
    description: richText([
      { text: 'Girona-Costa Brava Airport is a key gateway to the northern Costa Brava region and the medieval city of Girona. Located 12 km south of the city, it is served mainly by low-cost carriers.' },
    ]),
    seoTitle: 'Girona Airport Transfers | Private Taxi | Titan Transfers',
    seoDescription: 'Private transfers from Girona-Costa Brava Airport. Meet & greet, fixed prices, professional drivers. Book your airport taxi.',
    featuredImage: images.airport,
    translations: {
      es: {
        title: 'Aeropuerto de Girona-Costa Brava',
        slug: { _type: 'slug', current: 'aeropuerto-girona-costa-brava' },
        description: richText([
          { text: 'El Aeropuerto de Girona-Costa Brava es una puerta de entrada clave a la zona norte de la Costa Brava y a la ciudad medieval de Girona. Situado a 12 km al sur de la ciudad, opera principalmente con aerolineas de bajo coste.' },
        ]),
        seoTitle: 'Transfers Aeropuerto de Girona | Taxi Privado | Titan Transfers',
        seoDescription: 'Transfers privados desde el Aeropuerto de Girona-Costa Brava. Recogida con cartel, precios fijos, conductores profesionales.',
      },
    },
  })
  console.log(`   Created: ${gironaAirport._id}`)

  const reusAirport = await client.createOrReplace({
    _id: 'airport-reus',
    _type: 'airport',
    title: 'Reus Airport',
    slug: { _type: 'slug', current: 'reus-airport' },
    iataCode: 'REU',
    country: { _type: 'reference', _ref: 'country-spain' },
    region: { _type: 'reference', _ref: 'region-catalonia' },
    coordinates: { _type: 'geopoint', lat: 41.1474, lng: 1.1672 },
    description: richText([
      { text: 'Reus Airport serves the Costa Dorada resort area including Salou, Cambrils, and Tarragona. Located just 3 km from the city of Reus, it is a popular gateway for beach holiday travellers.' },
    ]),
    seoTitle: 'Reus Airport Transfers | Private Taxi | Titan Transfers',
    seoDescription: 'Private transfers from Reus Airport to Salou, Tarragona and the Costa Dorada. Fixed prices, meet & greet, comfortable vehicles.',
    featuredImage: images.airport,
    translations: {
      es: {
        title: 'Aeropuerto de Reus',
        slug: { _type: 'slug', current: 'aeropuerto-reus' },
        description: richText([
          { text: 'El Aeropuerto de Reus da servicio a la zona turistica de la Costa Dorada, incluyendo Salou, Cambrils y Tarragona. Situado a solo 3 km de la ciudad de Reus, es una puerta de entrada popular para los viajeros de vacaciones de playa.' },
        ]),
        seoTitle: 'Transfers Aeropuerto de Reus | Taxi Privado | Titan Transfers',
        seoDescription: 'Transfers privados desde el Aeropuerto de Reus a Salou, Tarragona y la Costa Dorada. Precios fijos, recogida con cartel, vehiculos comodos.',
      },
    },
  })
  console.log(`   Created: ${reusAirport._id}\n`)

  // 6. Create Barcelona El Prat Airport (without routes - added later)
  console.log('6. Creating Barcelona El Prat Airport (placeholder)...')
  await client.createOrReplace({
    _id: 'airport-barcelona-el-prat',
    _type: 'airport',
    title: 'Barcelona-El Prat Airport',
    slug: { _type: 'slug', current: 'barcelona-el-prat-airport' },
    iataCode: 'BCN',
    country: { _type: 'reference', _ref: 'country-spain' },
    city: { _type: 'reference', _ref: 'city-barcelona' },
    region: { _type: 'reference', _ref: 'region-catalonia' },
    coordinates: { _type: 'geopoint', lat: 41.2974, lng: 2.0833 },
    description: richText([{ text: 'Placeholder' }]),
    seoTitle: 'Barcelona Airport Transfers',
    seoDescription: 'Placeholder',
    featuredImage: images.airport,
    translations: {
      es: {
        title: 'Aeropuerto de Barcelona-El Prat',
        slug: { _type: 'slug', current: 'aeropuerto-barcelona-el-prat' },
      },
    },
  })
  console.log('   Created: airport-barcelona-el-prat\n')

  // 7. Create Routes from Barcelona El Prat
  console.log('7. Creating routes...')
  const routes = [
    {
      _id: 'route-bcn-barcelona-centro',
      title: 'Barcelona El Prat Airport to Barcelona City Centre',
      slug: 'barcelona-el-prat-to-barcelona-city-centre',
      destination: 'city-barcelona',
      distance: 18,
      duration: 25,
      etoFrom: 'Barcelona El Prat Airport',
      etoFromCat: '5',
      etoTo: 'Barcelona City Centre',
      eToCat: '1',
      descEN: [
        { text: 'Your private transfer from Barcelona El Prat Airport to the city centre', style: 'h2' },
        { text: 'Skip the queues and start your Barcelona experience the moment you land. Your professional driver will be waiting in the arrivals hall with a name sign, ready to help with your luggage and take you directly to your hotel or accommodation in central Barcelona.' },
        { text: 'The journey from El Prat Airport to the heart of Barcelona takes approximately 25 minutes via the C-31 motorway, depending on traffic conditions. Our drivers know Barcelona inside out and will take the fastest route to your destination, whether you are heading to Las Ramblas, the Gothic Quarter, Eixample, or the beachfront.' },
        { text: 'Why choose a private transfer over public transport?', style: 'h3' },
        { text: 'While the Aerobus and metro connect the airport to the city, a private transfer offers unmatched comfort, especially for families, groups, or travellers with heavy luggage. No waiting for connections, no navigating unfamiliar stations with suitcases, just a smooth, direct door-to-door ride.' },
      ],
      descES: [
        { text: 'Tu transfer privado del Aeropuerto de Barcelona-El Prat al centro de la ciudad', style: 'h2' },
        { text: 'Evita las colas y comienza tu experiencia en Barcelona desde el momento en que aterrizas. Tu conductor profesional te estara esperando en la sala de llegadas con un cartel con tu nombre, listo para ayudarte con el equipaje y llevarte directamente a tu hotel o alojamiento en el centro de Barcelona.' },
        { text: 'El trayecto desde el Aeropuerto de El Prat hasta el corazon de Barcelona dura aproximadamente 25 minutos por la autopista C-31, dependiendo del trafico. Nuestros conductores conocen Barcelona a la perfeccion y tomaran la ruta mas rapida hasta tu destino, ya sea Las Ramblas, el Barrio Gotico, el Eixample o el paseo maritimo.' },
        { text: 'Por que elegir un transfer privado frente al transporte publico?', style: 'h3' },
        { text: 'Aunque el Aerobus y el metro conectan el aeropuerto con la ciudad, un transfer privado ofrece una comodidad inigualable, especialmente para familias, grupos o viajeros con mucho equipaje. Sin esperas por conexiones, sin navegar por estaciones desconocidas con maletas, solo un trayecto directo y comodo puerta a puerta.' },
      ],
      seoTitleEN: 'Barcelona Airport to City Centre Transfer | Private Taxi | Titan Transfers',
      seoTitleES: 'Transfer Aeropuerto Barcelona al Centro | Taxi Privado | Titan Transfers',
      seoDescEN: 'Book a private transfer from Barcelona El Prat Airport to Barcelona city centre. 25-minute door-to-door service, fixed price, meet & greet. Available 24/7.',
      seoDescES: 'Reserva tu transfer privado del Aeropuerto de Barcelona-El Prat al centro de Barcelona. Servicio puerta a puerta en 25 minutos, precio fijo, recogida con cartel. Disponible 24/7.',
      slugES: 'aeropuerto-barcelona-el-prat-a-centro-de-barcelona',
      titleES: 'Transfer del Aeropuerto de Barcelona-El Prat al Centro de Barcelona',
    },
    {
      _id: 'route-bcn-sitges',
      title: 'Barcelona El Prat Airport to Sitges',
      slug: 'barcelona-el-prat-to-sitges',
      destination: 'city-sitges',
      distance: 35,
      duration: 30,
      etoFrom: 'Barcelona El Prat Airport',
      etoFromCat: '5',
      etoTo: 'Sitges',
      eToCat: '1',
      descEN: [
        { text: 'Private transfer from Barcelona Airport to Sitges', style: 'h2' },
        { text: 'Reach the beautiful coastal town of Sitges in just 30 minutes with our private airport transfer service. Your driver will meet you at Barcelona El Prat arrivals and drive you along the scenic coastal C-32 motorway directly to your hotel or villa in Sitges.' },
        { text: 'Sitges is famous for its 17 beaches, vibrant cultural scene, and charming old town. Whether you are visiting for the famous Carnival, the Film Festival, or simply to enjoy the Mediterranean lifestyle, arriving by private transfer is the most comfortable and stress-free option.' },
      ],
      descES: [
        { text: 'Transfer privado del Aeropuerto de Barcelona a Sitges', style: 'h2' },
        { text: 'Llega a la preciosa localidad costera de Sitges en solo 30 minutos con nuestro servicio de transfer privado desde el aeropuerto. Tu conductor te recogera en las llegadas del Aeropuerto de Barcelona-El Prat y te llevara por la panoramica autopista costera C-32 directamente a tu hotel o villa en Sitges.' },
        { text: 'Sitges es famoso por sus 17 playas, su vibrante escena cultural y su encantador casco antiguo. Ya sea que visites por el famoso Carnaval, el Festival de Cine o simplemente para disfrutar del estilo de vida mediterraneo, llegar en transfer privado es la opcion mas comoda y sin estres.' },
      ],
      seoTitleEN: 'Barcelona Airport to Sitges Transfer | Private Taxi | Titan Transfers',
      seoTitleES: 'Transfer Aeropuerto Barcelona a Sitges | Taxi Privado | Titan Transfers',
      seoDescEN: 'Private transfer from Barcelona El Prat Airport to Sitges. 30-minute coastal drive, fixed price, meet & greet. Book your Sitges airport transfer.',
      seoDescES: 'Transfer privado del Aeropuerto de Barcelona-El Prat a Sitges. Trayecto costero de 30 minutos, precio fijo, recogida con cartel. Reserva tu transfer a Sitges.',
      slugES: 'aeropuerto-barcelona-el-prat-a-sitges',
      titleES: 'Transfer del Aeropuerto de Barcelona-El Prat a Sitges',
    },
    {
      _id: 'route-bcn-tarragona',
      title: 'Barcelona El Prat Airport to Tarragona',
      slug: 'barcelona-el-prat-to-tarragona',
      destination: 'city-tarragona',
      distance: 100,
      duration: 65,
      etoFrom: 'Barcelona El Prat Airport',
      etoFromCat: '5',
      etoTo: 'Tarragona',
      eToCat: '1',
      descEN: [
        { text: 'Private transfer from Barcelona Airport to Tarragona', style: 'h2' },
        { text: 'Travel from Barcelona El Prat Airport to the historic city of Tarragona in comfort with our private transfer service. The 100 km journey takes approximately 65 minutes along the AP-7 motorway, passing through the beautiful Catalan countryside.' },
        { text: 'Tarragona is a UNESCO World Heritage Site with some of the finest Roman ruins outside Italy. Our door-to-door service takes you directly to your accommodation in the city centre, the beach area, or anywhere in the Tarragona province.' },
      ],
      descES: [
        { text: 'Transfer privado del Aeropuerto de Barcelona a Tarragona', style: 'h2' },
        { text: 'Viaja del Aeropuerto de Barcelona-El Prat a la historica ciudad de Tarragona con total comodidad gracias a nuestro servicio de transfer privado. El trayecto de 100 km dura aproximadamente 65 minutos por la autopista AP-7, atravesando el precioso paisaje catalan.' },
        { text: 'Tarragona es Patrimonio de la Humanidad por la UNESCO y alberga algunas de las mejores ruinas romanas fuera de Italia. Nuestro servicio puerta a puerta te lleva directamente a tu alojamiento en el centro de la ciudad, la zona de playa o cualquier punto de la provincia de Tarragona.' },
      ],
      seoTitleEN: 'Barcelona Airport to Tarragona Transfer | Private Taxi | Titan Transfers',
      seoTitleES: 'Transfer Aeropuerto Barcelona a Tarragona | Taxi Privado | Titan Transfers',
      seoDescEN: 'Private transfer from Barcelona El Prat Airport to Tarragona. 65-minute comfortable ride, fixed price, professional driver. Book now.',
      seoDescES: 'Transfer privado del Aeropuerto de Barcelona-El Prat a Tarragona. Trayecto comodo de 65 minutos, precio fijo, conductor profesional. Reserva ahora.',
      slugES: 'aeropuerto-barcelona-el-prat-a-tarragona',
      titleES: 'Transfer del Aeropuerto de Barcelona-El Prat a Tarragona',
    },
    {
      _id: 'route-bcn-girona',
      title: 'Barcelona El Prat Airport to Girona',
      slug: 'barcelona-el-prat-to-girona',
      destination: 'city-girona',
      distance: 110,
      duration: 75,
      etoFrom: 'Barcelona El Prat Airport',
      etoFromCat: '5',
      etoTo: 'Girona',
      eToCat: '1',
      descEN: [
        { text: 'Private transfer from Barcelona Airport to Girona', style: 'h2' },
        { text: 'Our private transfer from Barcelona El Prat Airport to Girona covers 110 km in approximately 75 minutes via the AP-7 motorway. Ideal for travellers heading to northern Catalonia, the Costa Brava, or the medieval beauty of Girona itself.' },
        { text: 'Made famous by Game of Thrones filming locations, Girona enchants visitors with its colourful riverside architecture, winding medieval streets, and outstanding gastronomy — home to the legendary El Celler de Can Roca restaurant.' },
      ],
      descES: [
        { text: 'Transfer privado del Aeropuerto de Barcelona a Girona', style: 'h2' },
        { text: 'Nuestro transfer privado del Aeropuerto de Barcelona-El Prat a Girona cubre 110 km en aproximadamente 75 minutos por la autopista AP-7. Ideal para viajeros que se dirigen al norte de Cataluna, la Costa Brava o la belleza medieval de la propia Girona.' },
        { text: 'Famosa por las localizaciones de rodaje de Juego de Tronos, Girona enamora a los visitantes con su colorida arquitectura junto al rio, sus sinuosas calles medievales y su gastronomia excepcional, hogar del legendario restaurante El Celler de Can Roca.' },
      ],
      seoTitleEN: 'Barcelona Airport to Girona Transfer | Private Taxi | Titan Transfers',
      seoTitleES: 'Transfer Aeropuerto Barcelona a Girona | Taxi Privado | Titan Transfers',
      seoDescEN: 'Private transfer from Barcelona El Prat Airport to Girona. 75-minute ride, fixed price, meet & greet, door-to-door service.',
      seoDescES: 'Transfer privado del Aeropuerto de Barcelona-El Prat a Girona. Trayecto de 75 minutos, precio fijo, recogida con cartel, servicio puerta a puerta.',
      slugES: 'aeropuerto-barcelona-el-prat-a-girona',
      titleES: 'Transfer del Aeropuerto de Barcelona-El Prat a Girona',
    },
    {
      _id: 'route-bcn-salou',
      title: 'Barcelona El Prat Airport to Salou',
      slug: 'barcelona-el-prat-to-salou',
      destination: 'city-salou',
      distance: 110,
      duration: 70,
      etoFrom: 'Barcelona El Prat Airport',
      etoFromCat: '5',
      etoTo: 'Salou',
      eToCat: '1',
      descEN: [
        { text: 'Private transfer from Barcelona Airport to Salou & PortAventura', style: 'h2' },
        { text: 'Travel directly from Barcelona El Prat Airport to Salou in just 70 minutes with our comfortable private transfer. Perfect for families heading to PortAventura World, or holidaymakers eager to reach the golden beaches of the Costa Dorada.' },
        { text: 'Our drivers are experienced with the route and will ensure a smooth, relaxing ride along the AP-7 motorway. Child seats and booster seats are available free of charge upon request — just let us know when booking.' },
      ],
      descES: [
        { text: 'Transfer privado del Aeropuerto de Barcelona a Salou y PortAventura', style: 'h2' },
        { text: 'Viaja directamente desde el Aeropuerto de Barcelona-El Prat a Salou en solo 70 minutos con nuestro comodo transfer privado. Perfecto para familias que se dirigen a PortAventura World o para vacacionistas deseosos de llegar a las playas doradas de la Costa Dorada.' },
        { text: 'Nuestros conductores conocen la ruta a la perfeccion y garantizan un viaje fluido y relajado por la autopista AP-7. Disponemos de sillas infantiles y elevadores gratuitos bajo peticion, solo indicalo al reservar.' },
      ],
      seoTitleEN: 'Barcelona Airport to Salou Transfer | Private Taxi | Titan Transfers',
      seoTitleES: 'Transfer Aeropuerto Barcelona a Salou | Taxi Privado | Titan Transfers',
      seoDescEN: 'Private transfer from Barcelona Airport to Salou & PortAventura. 70-minute ride, fixed price, free child seats. Family-friendly service.',
      seoDescES: 'Transfer privado del Aeropuerto de Barcelona a Salou y PortAventura. Trayecto de 70 minutos, precio fijo, sillas infantiles gratis. Servicio familiar.',
      slugES: 'aeropuerto-barcelona-el-prat-a-salou',
      titleES: 'Transfer del Aeropuerto de Barcelona-El Prat a Salou',
    },
  ]

  const routeRefs: Array<{ _type: string; _ref: string; _key: string }> = []

  for (const r of routes) {
    const doc = await client.createOrReplace({
      _id: r._id,
      _type: 'route',
      title: r.title,
      slug: { _type: 'slug', current: r.slug },
      origin: { _type: 'reference', _ref: 'airport-barcelona-el-prat' },
      originType: 'airport',
      destination: { _type: 'reference', _ref: r.destination },
      country: { _type: 'reference', _ref: 'country-spain' },
      region: { _type: 'reference', _ref: 'region-catalonia' },
      distance: r.distance,
      estimatedDuration: r.duration,
      description: richText(r.descEN),
      seoTitle: r.seoTitleEN,
      seoDescription: r.seoDescEN,
      featuredImage: images.vehicle,
      etoFromLocation: r.etoFrom,
      etoFromCategory: r.etoFromCat,
      etoToLocation: r.etoTo,
      etoToCategory: r.eToCat,
      translations: {
        es: {
          title: r.titleES,
          slug: { _type: 'slug', current: r.slugES },
          description: richText(r.descES),
          seoTitle: r.seoTitleES,
          seoDescription: r.seoDescES,
        },
      },
    })
    routeRefs.push({
      _type: 'reference',
      _ref: doc._id,
      _key: Math.random().toString(36).slice(2, 10),
    })
    console.log(`   Created route: ${doc._id}`)
  }
  console.log('')

  // 8. Update airport with full content + route refs
  console.log('8. Updating Barcelona El Prat Airport with full content...')
  const airport = await client.createOrReplace({
    _id: 'airport-barcelona-el-prat',
    _type: 'airport',
    title: 'Barcelona-El Prat Airport',
    slug: { _type: 'slug', current: 'barcelona-el-prat-airport' },
    iataCode: 'BCN',
    country: { _type: 'reference', _ref: 'country-spain' },
    city: { _type: 'reference', _ref: 'city-barcelona' },
    region: { _type: 'reference', _ref: 'region-catalonia' },
    coordinates: { _type: 'geopoint', lat: 41.2974, lng: 2.0833 },
    description: richText([
      {
        text: 'Private transfers from Barcelona-El Prat Airport',
        style: 'h2',
      },
      {
        text: 'Barcelona-El Prat Airport (BCN) is the main international airport serving Barcelona and the whole of Catalonia. As the second-busiest airport in Spain and one of the largest in Europe, it handles over 50 million passengers annually, connecting Barcelona with more than 200 destinations worldwide.',
      },
      {
        text: 'Located just 12 km southwest of Barcelona city centre, El Prat Airport has two terminals: Terminal 1 (T1), the main hub for major airlines and international flights, and Terminal 2 (T2), which serves low-cost and domestic carriers. Both terminals are connected by a free shuttle bus.',
      },
      {
        text: 'Why book a private airport transfer?',
        style: 'h3',
      },
      {
        text: 'After a long flight, the last thing you want is to figure out complex public transport connections or queue for a taxi. With Titan Transfers, your professional driver will be waiting in the arrivals hall with a name sign, ready to help with your luggage and drive you directly to your destination in a clean, comfortable vehicle.',
      },
      {
        text: 'We offer fixed prices with no hidden charges, free cancellation up to 24 hours before pickup, and 24/7 availability. Our drivers monitor your flight in real time, so even if your plane is delayed, your transfer will be adjusted accordingly at no extra cost.',
      },
      {
        text: 'Popular destinations from Barcelona-El Prat Airport',
        style: 'h3',
      },
      {
        text: 'Our most requested routes from BCN Airport include transfers to Barcelona city centre (25 min), Sitges (30 min), Tarragona (65 min), Salou and PortAventura (70 min), and Girona (75 min). We also cover the entire Costa Brava, Costa Dorada, and Andorra.',
      },
      {
        text: 'All our vehicles are licensed and fully insured, and our drivers are local professionals who know the roads perfectly. Choose from standard sedans, spacious MPVs for families, executive cars for business travellers, or minibuses for groups of up to 8 passengers.',
      },
    ]),
    seoTitle: 'Barcelona Airport Transfers | Private Taxi from El Prat BCN | Titan Transfers',
    seoDescription: 'Book private transfers from Barcelona-El Prat Airport (BCN). Meet & greet, fixed prices, 24/7 service. Professional door-to-door airport taxi to Barcelona, Sitges, Tarragona and more.',
    featuredImage: images.airport,
    gallery: [
      { ...images.airport, _key: 'g1' },
      { ...images.barcelona, _key: 'g2' },
      { ...images.vehicle, _key: 'g3' },
      { ...images.driver, _key: 'g4' },
      { ...images.beach, _key: 'g5' },
    ],
    routes: routeRefs,
    nearbyAirports: [
      { _type: 'reference', _ref: 'airport-girona', _key: 'na1' },
      { _type: 'reference', _ref: 'airport-reus', _key: 'na2' },
    ],
    translations: {
      es: {
        title: 'Aeropuerto de Barcelona-El Prat',
        slug: { _type: 'slug', current: 'aeropuerto-barcelona-el-prat' },
        description: richText([
          {
            text: 'Transfers privados desde el Aeropuerto de Barcelona-El Prat',
            style: 'h2',
          },
          {
            text: 'El Aeropuerto de Barcelona-El Prat (BCN) es el principal aeropuerto internacional de Barcelona y de toda Cataluna. Siendo el segundo aeropuerto con mas trafico de Espana y uno de los mas grandes de Europa, gestiona mas de 50 millones de pasajeros al ano, conectando Barcelona con mas de 200 destinos en todo el mundo.',
          },
          {
            text: 'Situado a tan solo 12 km al suroeste del centro de Barcelona, el Aeropuerto de El Prat cuenta con dos terminales: la Terminal 1 (T1), hub principal para las grandes aerolineas y vuelos internacionales, y la Terminal 2 (T2), que da servicio a aerolineas de bajo coste y vuelos nacionales. Ambas terminales estan conectadas por un autobus lanzadera gratuito.',
          },
          {
            text: 'Por que reservar un transfer privado desde el aeropuerto?',
            style: 'h3',
          },
          {
            text: 'Despues de un largo vuelo, lo ultimo que quieres es descifrar conexiones complejas de transporte publico o hacer cola para un taxi. Con Titan Transfers, tu conductor profesional te estara esperando en la sala de llegadas con un cartel con tu nombre, listo para ayudarte con el equipaje y llevarte directamente a tu destino en un vehiculo limpio y confortable.',
          },
          {
            text: 'Ofrecemos precios fijos sin cargos ocultos, cancelacion gratuita hasta 24 horas antes de la recogida y disponibilidad las 24 horas del dia, los 7 dias de la semana. Nuestros conductores monitorizan tu vuelo en tiempo real, por lo que, incluso si tu avion se retrasa, tu transfer se ajustara automaticamente sin coste adicional.',
          },
          {
            text: 'Destinos populares desde el Aeropuerto de Barcelona-El Prat',
            style: 'h3',
          },
          {
            text: 'Nuestras rutas mas solicitadas desde el Aeropuerto de Barcelona incluyen transfers al centro de Barcelona (25 min), Sitges (30 min), Tarragona (65 min), Salou y PortAventura (70 min) y Girona (75 min). Tambien cubrimos toda la Costa Brava, la Costa Dorada y Andorra.',
          },
          {
            text: 'Todos nuestros vehiculos estan licenciados y asegurados, y nuestros conductores son profesionales locales que conocen las carreteras a la perfeccion. Elige entre berlinas estandar, MPV espaciosos para familias, vehiculos ejecutivos para viajeros de negocios o minibuses para grupos de hasta 8 pasajeros.',
          },
        ]),
        seoTitle: 'Transfers Aeropuerto Barcelona-El Prat | Taxi Privado BCN | Titan Transfers',
        seoDescription: 'Reserva transfers privados desde el Aeropuerto de Barcelona-El Prat (BCN). Recogida con cartel, precios fijos, servicio 24/7. Taxi privado puerta a puerta a Barcelona, Sitges, Tarragona y mas.',
      },
    },
  })
  console.log(`   Created: ${airport._id}\n`)

  // 9. Update country and region references
  console.log('9. Updating country & region references...')
  await client.patch('country-spain').set({
    airports: [
      { _type: 'reference', _ref: 'airport-barcelona-el-prat', _key: 'a1' },
      { _type: 'reference', _ref: 'airport-girona', _key: 'a2' },
      { _type: 'reference', _ref: 'airport-reus', _key: 'a3' },
    ],
    cities: cities.map((c, i) => ({
      _type: 'reference',
      _ref: c._id,
      _key: `c${i}`,
    })),
    regions: [{ _type: 'reference', _ref: 'region-catalonia', _key: 'r1' }],
  }).commit()

  await client.patch('region-catalonia').set({
    airports: [
      { _type: 'reference', _ref: 'airport-barcelona-el-prat', _key: 'a1' },
      { _type: 'reference', _ref: 'airport-girona', _key: 'a2' },
      { _type: 'reference', _ref: 'airport-reus', _key: 'a3' },
    ],
    cities: cities.map((c, i) => ({
      _type: 'reference',
      _ref: c._id,
      _key: `c${i}`,
    })),
  }).commit()

  // Update city-barcelona with nearby airports
  await client.patch('city-barcelona').set({
    nearbyAirports: [
      { _type: 'reference', _ref: 'airport-barcelona-el-prat', _key: 'na1' },
      { _type: 'reference', _ref: 'airport-girona', _key: 'na2' },
    ],
    relatedCities: [
      { _type: 'reference', _ref: 'city-sitges', _key: 'rc1' },
      { _type: 'reference', _ref: 'city-tarragona', _key: 'rc2' },
      { _type: 'reference', _ref: 'city-girona', _key: 'rc3' },
    ],
  }).commit()

  console.log('   Done.\n')

  console.log('=== SEED COMPLETE ===')
  console.log('')
  console.log('Content created:')
  console.log('  - 1 Country (Spain / Espana)')
  console.log('  - 1 Region (Catalonia / Cataluna)')
  console.log('  - 5 Cities (Barcelona, Sitges, Tarragona, Girona, Salou)')
  console.log('  - 3 Airports (Barcelona-El Prat, Girona-Costa Brava, Reus)')
  console.log('  - 5 Routes (BCN -> Barcelona, Sitges, Tarragona, Girona, Salou)')
  console.log('  - 5 Images from Pexels (airport, city, vehicle, beach, driver)')
  console.log('')
  console.log('View in Spanish:')
  console.log('  http://localhost:3001/es/aeropuerto/aeropuerto-barcelona-el-prat/')
  console.log('')
  console.log('View in English:')
  console.log('  http://localhost:3001/airport/barcelona-el-prat-airport/')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
