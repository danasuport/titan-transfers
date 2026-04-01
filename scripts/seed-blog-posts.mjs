/**
 * Seed 3 sample blog posts to Sanity
 * Usage: SANITY_TOKEN=your_token node scripts/seed-blog-posts.mjs
 */

import { createClient } from '@sanity/client'

const token = process.env.SANITY_TOKEN
if (!token) {
  console.error('❌  Set SANITY_TOKEN=your_write_token before running')
  process.exit(1)
}

const client = createClient({
  projectId: '6iu2za90',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const posts = [
  {
    _type: 'blogPost',
    title: 'Barcelona F1 Grand Prix 2026: airport transfer guide',
    slug: { _type: 'slug', current: 'barcelona-f1-grand-prix-2026-airport-transfer-guide' },
    category: 'Events',
    publishDate: '2026-03-15',
    excerpt: 'The 2026 Spanish Grand Prix returns to Barcelona. Everything you need to know about getting from Barcelona El Prat Airport to the Circuit de Barcelona-Catalunya — without the race weekend chaos.',
    content: [
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', _key: 'span1', text: 'The Spanish Grand Prix is back at Circuit de Barcelona-Catalunya for 2026, and with it comes one of the busiest travel weekends of the year. If you\'re flying into Barcelona El Prat Airport (BCN), here\'s everything you need to know about reaching the circuit stress-free.' }],
      },
      {
        _type: 'block',
        _key: 'h2-1',
        style: 'h2',
        children: [{ _type: 'span', _key: 'span2', text: 'Why book a private transfer for race weekend?' }],
      },
      {
        _type: 'block',
        _key: 'p1',
        style: 'normal',
        children: [{ _type: 'span', _key: 'span3', text: 'Public transport during F1 race weekend is stretched to its limits. Trains are overcrowded, taxis queue for hours, and rideshare prices surge dramatically. A pre-booked private transfer means a fixed price, a driver waiting for you at arrivals with your name sign, and a direct route — no matter how delayed your flight is.' }],
      },
      {
        _type: 'block',
        _key: 'h2-2',
        style: 'h2',
        children: [{ _type: 'span', _key: 'span4', text: 'Distance and journey time from BCN Airport to Circuit' }],
      },
      {
        _type: 'block',
        _key: 'p2',
        style: 'normal',
        children: [{ _type: 'span', _key: 'span5', text: 'The Circuit de Barcelona-Catalunya is located in Montmeló, approximately 30 km northeast of Barcelona El Prat Airport. Under normal conditions the journey takes around 35–40 minutes. On race day, expect 60–90 minutes due to traffic. We recommend booking your transfer for at least 3 hours before the race start.' }],
      },
      {
        _type: 'block',
        _key: 'h2-3',
        style: 'h2',
        children: [{ _type: 'span', _key: 'span6', text: 'Tips for a smooth F1 weekend transfer' }],
      },
      {
        _type: 'block',
        _key: 'p3',
        style: 'normal',
        children: [{ _type: 'span', _key: 'span7', text: 'Book your return transfer in advance — availability disappears fast after the podium ceremony. Our drivers monitor flight arrivals in real time, so if your flight is delayed we adjust automatically. For groups of 4 or more, a minivan option keeps everyone together and saves cost per person.' }],
      },
    ],
  },
  {
    _type: 'blogPost',
    title: 'Dubai vs Abu Dhabi: which airport is better for your UAE visit?',
    slug: { _type: 'slug', current: 'dubai-vs-abu-dhabi-airport-guide' },
    category: 'Guides',
    publishDate: '2026-02-20',
    excerpt: 'Flying into the UAE but not sure whether to land in Dubai (DXB) or Abu Dhabi (AUH)? We break down the pros, cons and transfer options for each airport.',
    content: [
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', _key: 'span1', text: 'The United Arab Emirates has two world-class international airports — Dubai International (DXB) and Abu Dhabi International (AUH). Both are well connected globally, but the right choice depends entirely on where you\'re staying and what you plan to do.' }],
      },
      {
        _type: 'block',
        _key: 'h2-1',
        style: 'h2',
        children: [{ _type: 'span', _key: 'span2', text: 'Dubai International Airport (DXB)' }],
      },
      {
        _type: 'block',
        _key: 'p1',
        style: 'normal',
        children: [{ _type: 'span', _key: 'span3', text: 'DXB is the world\'s busiest international airport by passenger numbers. It sits just 15 minutes from Downtown Dubai by private transfer, making it the obvious choice if you\'re staying in the city. Emirates and Flydubai operate most routes here, and the airport has three terminals — make sure you know which one before you land.' }],
      },
      {
        _type: 'block',
        _key: 'h2-2',
        style: 'h2',
        children: [{ _type: 'span', _key: 'span4', text: 'Abu Dhabi International Airport (AUH)' }],
      },
      {
        _type: 'block',
        _key: 'p2',
        style: 'normal',
        children: [{ _type: 'span', _key: 'span5', text: 'AUH is the home of Etihad Airways and is far less crowded than DXB. The new Terminal A opened in 2023 and is genuinely impressive. If you\'re heading to Abu Dhabi city, Yas Island or Al Ain, this is the better option. The transfer to Abu Dhabi city centre takes about 30 minutes.' }],
      },
      {
        _type: 'block',
        _key: 'h2-3',
        style: 'h2',
        children: [{ _type: 'span', _key: 'span6', text: 'Travelling between the two cities' }],
      },
      {
        _type: 'block',
        _key: 'p3',
        style: 'normal',
        children: [{ _type: 'span', _key: 'span7', text: 'If your itinerary covers both Dubai and Abu Dhabi, flying into DXB and taking a private city-to-city transfer to Abu Dhabi (or vice versa) is a popular option. The journey covers about 130 km and takes roughly 90 minutes by private transfer on the Abu Dhabi–Dubai highway.' }],
      },
    ],
  },
  {
    _type: 'blogPost',
    title: 'How to get from Prague airport to the city centre: all options compared',
    slug: { _type: 'slug', current: 'prague-airport-to-city-centre-transfer-guide' },
    category: 'Guides',
    publishDate: '2026-01-10',
    excerpt: 'Václav Havel Airport Prague is just 17 km from the Old Town — but that doesn\'t mean all transport options are equal. We compare taxis, buses, metro and private transfers honestly.',
    content: [
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', _key: 'span1', text: 'Prague\'s Václav Havel Airport (PRG) handles over 17 million passengers a year. It\'s close to the city, but the lack of a direct metro connection means navigating your way in can be trickier than you\'d expect — especially with luggage or a group.' }],
      },
      {
        _type: 'block',
        _key: 'h2-1',
        style: 'h2',
        children: [{ _type: 'span', _key: 'span2', text: 'Bus + Metro (AE Airport Express)' }],
      },
      {
        _type: 'block',
        _key: 'p1',
        style: 'normal',
        children: [{ _type: 'span', _key: 'span3', text: 'The cheapest option. The Airport Express bus runs every 10 minutes and connects to Dejvická metro station (Line A) in about 35 minutes. From there the metro takes you into the centre in another 10 minutes. Total cost: around €2. Downside: no luggage assistance, crowded during peak hours, and you still need to walk from the metro station to your hotel.' }],
      },
      {
        _type: 'block',
        _key: 'h2-2',
        style: 'h2',
        children: [{ _type: 'span', _key: 'span4', text: 'Taxi from Prague Airport' }],
      },
      {
        _type: 'block',
        _key: 'p2',
        style: 'normal',
        children: [{ _type: 'span', _key: 'span5', text: 'Prague taxis have a mixed reputation — always use the official AAA or Liftago apps, or pre-book. Street taxis outside the terminal can overcharge. A legitimate taxi to the Old Town should cost €15–20 and takes 25–35 minutes depending on traffic.' }],
      },
      {
        _type: 'block',
        _key: 'h2-3',
        style: 'h2',
        children: [{ _type: 'span', _key: 'span6', text: 'Private Transfer: the stress-free option' }],
      },
      {
        _type: 'block',
        _key: 'p3',
        style: 'normal',
        children: [{ _type: 'span', _key: 'span7', text: 'For the best balance of comfort and price — especially for 2 or more travellers — a pre-booked private transfer wins. Your driver meets you at arrivals with a name sign, monitors your flight for delays, and charges a fixed price agreed upfront. No meters, no surprises. For Prague city centre from PRG, this typically costs €25–35 for a standard sedan.' }],
      },
    ],
  },
]

async function run() {
  console.log('📝 Creating 3 blog posts...')
  for (const post of posts) {
    try {
      const result = await client.create(post)
      console.log(`✅ Created: "${post.title}" (${result._id})`)
    } catch (err) {
      console.error(`❌ Failed: "${post.title}"`, err.message)
    }
  }
  console.log('Done!')
}

run()
