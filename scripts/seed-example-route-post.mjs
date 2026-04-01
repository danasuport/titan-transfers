/**
 * Seed script: post tipo RUTA con interlinking SEO
 * "How to get from Barcelona airport to Sitges — complete transfer guide"
 *
 * Ejecutar: SANITY_TOKEN="sk-..." node scripts/seed-example-route-post.mjs
 */

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '6iu2za90',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

// ─── Portable Text helpers ────────────────────────────────────────────────────

function key() { return Math.random().toString(36).slice(2) }

function p(...segments) {
  const children = []
  const markDefs = []
  for (const seg of segments) {
    if (typeof seg === 'string') {
      children.push({ _type: 'span', _key: key(), text: seg, marks: [] })
    } else {
      // { text, href } — internal link
      const linkKey = key()
      markDefs.push({ _key: linkKey, _type: 'link', href: seg.href })
      children.push({ _type: 'span', _key: key(), text: seg.text, marks: [linkKey] })
    }
  }
  return { _type: 'block', _key: key(), style: 'normal', children, markDefs }
}

function h2(text) {
  return { _type: 'block', _key: key(), style: 'h2', children: [{ _type: 'span', _key: key(), text, marks: [] }], markDefs: [] }
}
function h3(text) {
  return { _type: 'block', _key: key(), style: 'h3', children: [{ _type: 'span', _key: key(), text, marks: [] }], markDefs: [] }
}

function ul(items) {
  return items.map(item => ({
    _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1,
    children: [{ _type: 'span', _key: key(), text: item, marks: [] }],
    markDefs: [],
  }))
}

// ─── Internal link targets ────────────────────────────────────────────────────
// These are the actual landing pages we want to rank and pass authority to

const ROUTE   = '/airport/barcelona-el-prat-airport/barcelona-el-prat-to-sitges/'
const AIRPORT = '/airport/barcelona-el-prat-airport/'
const CITY    = '/city/sitges/'
const ROUTES_FROM_BCN = '/airport/barcelona-el-prat-airport/'

// ─── Content with SEO interlinking ───────────────────────────────────────────

const content = [

  p(
    'Barcelona El Prat airport (BCN) is the main gateway to the Costa Garraf. If you\'re heading to Sitges — one of the most popular beach towns near Barcelona — you have several transport options for the 40 km journey. In this guide we compare all of them so you can choose the best fit for your trip.',
  ),

  p(
    'Spoiler: if you\'re travelling with luggage, a group, or simply want to arrive relaxed, booking a private transfer is by far the most convenient option. But let\'s go through all of them.',
  ),

  h2('Transfer options from Barcelona airport to Sitges'),

  h3('Private transfer — door to door, fixed price'),

  p(
    'A private airport transfer to Sitges takes between 30 and 45 minutes depending on traffic, with no stops and no changes. Your driver meets you at the arrivals hall with a name sign, helps with luggage, and takes you directly to your hotel or apartment in Sitges.',
  ),

  p(
    'This is the only option where the price is fixed before you travel — no meter running, no surge pricing. For groups of 3 or more, it\'s often cheaper per person than a taxi.',
  ),

  ...ul([
    'Door-to-door service with no transfers or waiting',
    'Fixed price confirmed at booking — no surprises',
    'Driver monitors your flight and adjusts pickup if delayed',
    'Available 24/7, including early morning and late night arrivals',
    'Vehicles from economy sedan to 7-seat minivan',
  ]),

  h3('Taxi from Barcelona airport to Sitges'),

  p(
    'Official taxis operate from ',
    { text: 'Barcelona El Prat airport', href: AIRPORT },
    ' T1 and T2 taxi ranks. A taxi to Sitges typically costs between €55 and €75 depending on traffic and time of day. Unlike a private transfer, the price is metered — so delays on the C-32 motorway will increase your final fare. There\'s also a €3.10 airport supplement and additional charges for luggage.',
  ),

  p('Taxis are a reasonable option for solo travellers, but for families or anyone with heavy luggage, the cost and uncertainty of a metered fare often makes a pre-booked transfer the better choice.'),

  h3('Public transport — train and bus'),

  p('The cheapest option, but also the most complex. There is no direct train from Barcelona airport to Sitges. The most common route involves:'),

  ...ul([
    'Rodalies R2 Nord from T2 (or free shuttle from T1) to Passeig de Gràcia or Sant Vicenç de Calders',
    'Change to R2 Sud line at Passeig de Gràcia',
    'Continue to Sitges station',
    'Total journey: 1h 15min to 1h 45min including waiting and connections',
  ]),

  p('With luggage or a group, the time and complexity rarely justify the saving.'),

  h2('How much does a transfer from Barcelona airport to Sitges cost?'),

  p('Here\'s a realistic cost comparison for this route:'),

  ...ul([
    'Private transfer (1–3 pax): from €65 fixed price',
    'Private transfer (4–7 pax): from €85 fixed price',
    'Taxi: €55–€75 (metered, variable)',
    'Train: €5–€8 per person',
  ]),

  p('For a family of four with luggage, a private transfer at €85 total works out at €21 per person — comparable to taxis but with the certainty of a fixed price and a driver waiting at arrivals.'),

  h2('How long does the journey take?'),

  p(
    'The distance from Barcelona El Prat airport to ',
    { text: 'Sitges town centre', href: CITY },
    ' is approximately 38 km. Journey time by private transfer or taxi is typically 30–45 minutes via the C-32 motorway. In peak summer months (July–August) allow 45–60 minutes.',
  ),

  p('By public transport, the combined train journey takes between 75 and 105 minutes including connections and waiting times.'),

  h2('Meeting your driver at Barcelona airport'),

  p('Your driver will be waiting in the arrivals hall of T1 or T2 holding a sign with your name. We monitor all flights in real time — if your flight is delayed, your driver automatically adjusts the pickup time at no extra cost.'),

  h2('About Sitges'),

  p(
    'Sitges is a cosmopolitan beach town 35 km southwest of Barcelona, known for its modernista architecture, white sandy beaches, and vibrant nightlife. It\'s one of the most visited day trips from Barcelona, but many visitors choose to stay for several nights — particularly for the international film festival in October and the famous carnival in February.',
  ),

  h2('Top things to do in Sitges'),

  ...ul([
    'Spend the morning on Platja de la Ribera — the main beach in front of the old town',
    'Visit the Museu Cau Ferrat, the former home of artist Santiago Rusiñol',
    'Walk the Passeig Marítim at sunset and stop at one of the terrace bars',
    'Take the short train or taxi to the Penedès wine region for a vineyard tour',
    'Explore the boutique shops and tapas bars in the old town lanes',
    'Attend the Sitges Film Festival if visiting in October',
  ]),

  h2('Other popular routes from Barcelona airport'),

  p(
    'If you\'re looking for transfers to other destinations, we cover routes to Barcelona city centre, Tarragona, Castelldefels, Vilanova and many more destinations along the Catalan coast.',
  ),

  h2('Practical tips for your transfer'),

  ...ul([
    'Book in advance during summer (June–September) — demand is very high',
    'If you\'re arriving at T1, the arrivals hall is on level 0. At T2, arrivals are on the ground floor',
    'The C-32 motorway is tolled — this is included in your transfer price',
    'If you have an early morning flight the next day, book your return transfer at the same time',
    'Sitges has limited parking in summer — a door-to-door transfer avoids the parking problem entirely',
  ]),

  h2('Frequently asked questions'),

  h3('Is there a direct train from Barcelona airport to Sitges?'),
  p('No — there is no direct train. You need to take the Rodalies R2 Nord to Passeig de Gràcia, then change to the R2 Sud line to Sitges. Total journey time is 1h 15min to 1h 45min.'),

  h3('How far is Sitges from Barcelona airport?'),
  p('Sitges is approximately 38 km from Barcelona El Prat airport via the C-32 motorway. By private transfer or taxi the journey takes 30–45 minutes.'),

  h3('Can I book a transfer in advance?'),
  p(
    'Yes — and we strongly recommend it, especially in summer. Book your ',
    { text: 'Barcelona airport to Sitges transfer', href: ROUTE },
    ' online and receive instant confirmation. Your driver will be waiting at arrivals regardless of any flight delays.',
  ),

  h3('What happens if my flight is delayed?'),
  p('We track all flights in real time. If your flight is delayed, your driver automatically adjusts pickup time at no extra cost. You don\'t need to call or send a message.'),

  h3('Do you offer return transfers from Sitges to Barcelona airport?'),
  p('Yes. You can book a one-way or return transfer at the time of booking. For return transfers we recommend booking at least 24 hours in advance.'),
]

// ─── Run ──────────────────────────────────────────────────────────────────────

async function run() {
  const airport = await client.fetch(`*[_type == "airport" && iataCode == "BCN"][0]{ _id }`)
  const city    = await client.fetch(`*[_type == "city" && slug.current == "sitges"][0]{ _id }`)
  const route   = await client.fetch(`*[_type == "route" && origin->iataCode == "BCN" && destination->slug.current == "sitges"][0]{ _id }`)

  const existing = await client.fetch(`*[_type == "blogPost" && slug.current == "barcelona-airport-to-sitges-transfer-guide"][0]._id`)
  if (existing) { await client.delete(existing); console.log('Deleted existing') }

  const doc = {
    _type: 'blogPost',
    title: 'How to get from Barcelona airport to Sitges — complete transfer guide',
    slug: { _type: 'slug', current: 'barcelona-airport-to-sitges-transfer-guide' },
    category: 'guide',
    excerpt: 'Everything you need to know about getting from Barcelona El Prat airport to Sitges: private transfer, taxi, train, prices, journey times and practical tips.',
    publishDate: new Date().toISOString().split('T')[0],
    content,
    seoTitle: 'Barcelona airport to Sitges transfer — prices, options & booking guide',
    seoDescription: 'How to get from Barcelona El Prat airport to Sitges. Compare private transfer, taxi and train options. Fixed prices from €65. Book online, instant confirmation.',
    ...(airport?._id ? { relatedAirports: [{ _type: 'reference', _ref: airport._id }] } : {}),
    ...(city?._id    ? { relatedCities:   [{ _type: 'reference', _ref: city._id }]    } : {}),
    ...(route?._id   ? { relatedRoutes:   [{ _type: 'reference', _ref: route._id }]   } : {}),
    translations: {
      es: {
        title: 'Cómo ir del aeropuerto de Barcelona a Sitges — guía completa de traslados',
        slug: { _type: 'slug', current: 'aeropuerto-barcelona-a-sitges-guia-traslado' },
        excerpt: 'Todo lo que necesitas saber para ir del aeropuerto El Prat a Sitges: transfer privado, taxi, tren, precios y tiempos de viaje.',
      },
    },
  }

  const result = await client.create(doc)
  console.log('Created:', result._id)
  console.log('URL: /blog/barcelona-airport-to-sitges-transfer-guide')
}

run().catch(console.error)
