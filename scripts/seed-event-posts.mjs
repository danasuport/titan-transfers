/**
 * Seed 8 event-focused blog posts (Barcelona, Dubai, Rome, Milan) to Sanity.
 * English base only — translations are filled afterwards by the
 * translate-to-{spanish,italian,arabic} scripts.
 *
 * Reuses each city's existing featuredImage, sets relatedCities/relatedAirports
 * so the post template renders the transfer cards + inline booking form, and
 * links to /booking/ and the city transfer page from inside the copy.
 *
 * Usage: node scripts/seed-event-posts.mjs [--dry-run]
 */

import { client } from './lib/sanity-client.mjs'
import { randomUUID } from 'crypto'

const DRY = process.argv.includes('--dry-run')
const key = () => randomUUID().slice(0, 12)

// ── Lightweight markup → Portable Text ───────────────────────────────────────
// Supports [text](href) links and **bold**. Everything else is plain text.
function span(text, marks = []) { return { _type: 'span', _key: key(), text, marks } }

function blk(style, markup) {
  const markDefs = []
  const children = []
  // tokenize on [text](href) and **bold**
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g
  let last = 0, m
  while ((m = re.exec(markup))) {
    if (m.index > last) children.push(span(markup.slice(last, m.index)))
    if (m[1]) { // link
      const dk = key()
      markDefs.push({ _key: dk, _type: 'link', href: m[2] })
      children.push(span(m[1], [dk]))
    } else { // bold
      children.push(span(m[3], ['strong']))
    }
    last = re.lastIndex
  }
  if (last < markup.length) children.push(span(markup.slice(last)))
  if (children.length === 0) children.push(span(''))
  return { _type: 'block', _key: key(), style, markDefs, children }
}
const p = (t) => blk('normal', t)
const h2 = (t) => blk('h2', t)
const h3 = (t) => blk('h3', t)

// ── Image refs to reuse (each city's featuredImage) ──────────────────────────
const IMG = {
  barcelona: 'image-e68355ab0d3571057dacbffdb2c85372a6ee3668-558x750-jpg',
  dubai: 'image-0c647a2eb623d6704625f76748a9b904b545b7cb-1879x1300-jpg',
  rome: 'image-85d3620de92a44205bb81b513c56b7a3bae9d15a-1880x1253-jpg',
  milan: 'image-e9f3cedb796ed4e56767f2f2ce1bef0340dde875-1880x1250-jpg',
}
const featured = (ref) => ({ _type: 'image', asset: { _type: 'reference', _ref: ref } })
const cityRef = (id) => ({ _type: 'reference', _key: key(), _ref: id })
const airRef = (id) => ({ _type: 'reference', _key: key(), _ref: id })

const CITY = { barcelona: 'city-barcelona', dubai: 'city-dubai', rome: 'city-rome', milan: 'city-milan' }
const AIR = {
  bcn: 'airport-barcelona-el-prat',
  dxb: 'r3xPnhMhowrbQmj0UPqDy1',
  fco: 'cG1HQSRGK9XcHwfsOI7Cij', cia: 'r3xPnhMhowrbQmj0UPqef7',
  mxp: 'r3xPnhMhowrbQmj0UPqWmP', lin: '6dX3OoAmUZYeV4aM68aJZs', bgy: '20TjrRpumv5w9p44yrkLXA',
}

// ── The 8 posts ──────────────────────────────────────────────────────────────
const posts = [
  // 1 — Barcelona · Mobile World Congress
  {
    title: 'Mobile World Congress Barcelona: your transfer plan for MWC week',
    slug: 'mobile-world-congress-barcelona-transfers',
    image: IMG.barcelona, city: CITY.barcelona, airports: [AIR.bcn],
    excerpt: 'MWC turns Barcelona into the busiest tech city on the planet for four days every spring. Here is how to move between the airport, your hotel and Fira Gran Via without losing half a morning to taxi queues.',
    seoTitle: 'Mobile World Congress Barcelona Transfers | Airport & Fira Gran Via | Titan Transfers',
    seoDescription: 'Private transfers for Mobile World Congress in Barcelona. From El Prat airport, the port or your hotel straight to Fira Gran Via. Fixed price, driver waiting, no taxi queues.',
    content: [
      p("Every February the tech world packs its bags and heads to Barcelona. Mobile World Congress fills Fira Gran Via with around 100,000 people, and for those four days a taxi that normally takes fifteen minutes can take the best part of an hour. If your week is built around back-to-back meetings, the transfer is not a detail — it is the difference between making the 9am keynote and watching it later on YouTube."),
      h2("When MWC happens and where you actually need to be"),
      p("MWC runs over four days at the end of February or the start of March at Fira Barcelona Gran Via, in L'Hospitalet de Llobregat. It sits right between the airport and the city centre, which is convenient on paper and chaos in practice once 100,000 badges are trying to reach the same eight halls. Most attendees stay in the centre — around Plaça Catalunya, Eixample or along Diagonal — and commute out to the venue each morning."),
      h2("From Barcelona airport to Fira Gran Via"),
      p("Barcelona El Prat (BCN) is barely 10 km from Gran Via. On a quiet day that is a ten-minute drive. During MWC week it is not a quiet day. The metro L9 Sud connects the airport with the Fira stops, but you will be sharing it with thousands of others and a roll-aboard plus a laptop bag is no fun in a packed carriage."),
      p("A private transfer skips all of that. Your driver tracks the flight, waits in arrivals with your name, and takes you door to door — to the venue if you are going straight in, or to your hotel to drop the luggage first. You can [book your Barcelona transfer here](/booking/) or read more about our [private transfers in Barcelona](/private-transfers/barcelona/)."),
      h2("Arriving by cruise or by train"),
      p("Plenty of people combine MWC with a few days on the coast and arrive at the Port of Barcelona, or come in by high-speed train to Barcelona Sants. Both are easy pick-up points for us. From Sants the venue is about fifteen minutes; from the cruise terminals, a little more depending on traffic along the Ronda Litoral."),
      h2("Why a private transfer makes sense for a work trip"),
      p("If the company is paying and your calendar is full, the maths is simple. A fixed price agreed up front means no surge pricing when everyone leaves the halls at 6pm. One clean receipt makes expenses painless. And a driver who knows which Gran Via entrance is closest to your hall saves you the walk around a building the size of a small airport."),
      p("Travelling as a team or with demo kit? We have estate cars and vans for the people who turn up with three Pelican cases of hardware. Tell us the group size when you book and we will send the right vehicle."),
      h3("A few practical tips for MWC week"),
      p("Book your airport pick-up before you fly — drivers get reserved early during congress week. Give yourself a buffer the morning of a keynote; even a private car cannot teleport through Gran Via traffic at 8:45am. And if you have an evening event out at the W or up in the hills, arrange the return in advance so you are not standing on a kerb refreshing an app."),
      p("Sort the transfers once and the rest of the week is just meetings, coffee and the occasional decent paella. [Get a price for your MWC transfer](/booking/) and we will take care of the driving."),
    ],
  },
  // 2 — Barcelona · Primavera Sound
  {
    title: 'Primavera Sound transfers: getting to Parc del Fòrum and back',
    slug: 'primavera-sound-barcelona-transfers',
    image: IMG.barcelona, city: CITY.barcelona, airports: [AIR.bcn],
    excerpt: 'Great line-up, late nights, and a festival site on the far side of the city. Here is how to reach Primavera Sound from the airport — and, more importantly, how to get back at 4am.',
    seoTitle: 'Primavera Sound Barcelona Transfers | Airport to Parc del Fòrum | Titan Transfers',
    seoDescription: 'Private transfers for Primavera Sound. From Barcelona airport, port or your hotel to Parc del Fòrum, plus late-night returns when the metro has stopped. Fixed price.',
    content: [
      p("Primavera Sound is one of those festivals people fly in for. Every late May and early June, Parc del Fòrum fills up with a crowd that is genuinely international — you will hear as much English, French and Portuguese in the queue as Catalan. The music is the easy part. The logistics, especially the journey home when the headliner finishes at three in the morning, are where most people come unstuck."),
      h2("Where the festival is — and why that matters"),
      p("Parc del Fòrum sits at the northeastern edge of Barcelona, where the city meets the sea past Diagonal Mar. It is a fair way from the tourist centre. During the day the metro L4 gets you there fine, but Primavera runs late, and once trains stop you are looking at long taxi lines with a few thousand other tired people who all want the same thing at the same time."),
      h2("From Barcelona airport to your hotel"),
      p("Most festivalgoers land at El Prat (BCN) and head into the city first to drop bags and change. A private transfer means you step off the flight, find your driver, and go straight to the door of wherever you are staying — no working out ticket machines after a budget flight. You can [book a Barcelona airport transfer here](/booking/) or see our [Barcelona private transfer options](/private-transfers/barcelona/)."),
      h2("The 4am problem, solved"),
      p("This is the bit worth planning. When the last set finishes, public transport is winding down and surge-priced taxis are swarmed. If you book a pick-up from the Fòrum area in advance, your driver is there at the agreed time and you are in bed within the half hour. Pre-booked, fixed price, no haggling at dawn — your future self will thank you."),
      h2("Coming by cruise or train"),
      p("If you are arriving by sea at the Port of Barcelona or by train into Sants, both work perfectly as pick-up points. The Fòrum is roughly twenty to thirty minutes from either, depending on the night and the traffic along the coast road."),
      h2("Groups make it cheaper and saner"),
      p("Primavera is a group trip for a lot of people, and that is good news for the wallet. Split between four or six friends, a private van out to the Fòrum and back often costs less per head than separate late-night taxis — and you all leave together instead of regrouping in a car park. Tell us how many you are and we will send a vehicle that fits everyone plus the inevitable festival bags."),
      p("Lock in the airport pick-up and the late-night return when you book your tickets, and the only thing left to argue about is who gets to pick the afters playlist. [Get a transfer price for Primavera Sound](/booking/) and enjoy the festival."),
    ],
  },
  // 3 — Dubai · Dubai Shopping Festival
  {
    title: 'Dubai Shopping Festival transfers: airport, malls and Global Village',
    slug: 'dubai-shopping-festival-transfers',
    image: IMG.dubai, city: CITY.dubai, airports: [AIR.dxb],
    excerpt: 'Six weeks of sales, fireworks and Global Village. Here is how to get around Dubai during DSF without juggling shopping bags in a rideshare queue outside the mall.',
    seoTitle: 'Dubai Shopping Festival Transfers | DXB Airport, Malls & Global Village | Titan Transfers',
    seoDescription: 'Private transfers during the Dubai Shopping Festival. Airport pick-up at DXB, runs to The Dubai Mall, Mall of the Emirates and Global Village. Fixed price, spacious vehicles.',
    content: [
      p("The Dubai Shopping Festival has been pulling visitors to the city since the mid-nineties, and it has grown into something closer to a six-week season than a single event. From mid-December into late January the malls run their biggest sales of the year, Global Village is in full swing, and there are fireworks somewhere most weekends. It is a brilliant time to visit. It is also a time when you will be moving around a sprawling city with a lot more bags than you arrived with."),
      h2("What DSF actually involves"),
      p("DSF is spread right across Dubai rather than tucked into one venue. The big draws are The Dubai Mall and Mall of the Emirates for the headline sales, Global Village for the markets, food and shows, and a rotating set of pop-ups, concerts and firework nights. The distances between them are real — Dubai is built for cars, not for walking from one to the next."),
      h2("From Dubai airport to your hotel"),
      p("Most visitors come through Dubai International (DXB), and after a long flight the last thing you want is to negotiate a taxi rank with the kids and the cases. A private transfer means a driver waiting at arrivals and a quiet, air-conditioned ride straight to the hotel. You can [book your Dubai airport transfer here](/booking/) or look at our [private transfers in Dubai](/private-transfers/dubai/)."),
      h2("Getting to Global Village and the malls"),
      p("Global Village sits out towards Dubailand, a good twenty-five to thirty-five minutes from most central hotels, and it gets seriously busy in the evenings — the car parks fill and the rideshare wait afterwards can be long. Booking a driver to drop you and collect you at an agreed time takes that whole headache away. For the malls it is the same story: a fixed-price car with space in the boot beats standing outside with six bags hoping a taxi shows up."),
      h2("Why families and shoppers book a car"),
      p("DSF is a family festival, and families travel heavy. A roomy private vehicle with proper boot space — and child seats if you ask when booking — makes the difference between a smooth day and a stressful one. Agreeing the fare up front also means no surprises when prices climb on a busy firework night."),
      p("If you are hopping between several malls in a day, a few hours with a car and driver on hand is the easy way to do it. Tell us the plan and we will sort the timings. [Get a price for your DSF transfers](/booking/) and spend your energy on the sales, not the logistics."),
    ],
  },
  // 4 — Dubai · Dubai World Cup
  {
    title: 'Dubai World Cup transfers: arriving at Meydan in style',
    slug: 'dubai-world-cup-meydan-transfers',
    image: IMG.dubai, city: CITY.dubai, airports: [AIR.dxb],
    excerpt: 'The richest day in horse racing draws a dressed-up crowd to Meydan every March. Here is how to arrive relaxed, on time and without your shoes touching a dusty car park.',
    seoTitle: 'Dubai World Cup Transfers | DXB Airport to Meydan Racecourse | Titan Transfers',
    seoDescription: 'Private chauffeur transfers for the Dubai World Cup at Meydan Racecourse. Airport pick-up at DXB, hotel-to-Meydan runs and evening returns. Fixed price, suited drivers.',
    content: [
      p("The Dubai World Cup is not a low-key afternoon at the races. Held at Meydan Racecourse on the last Saturday of March, it carries one of the biggest purses in world sport and the dress code to match. People plan their outfits for weeks. Turning up with dust on your shoes after a long walk from an overflow car park is not the look anyone is going for — which is exactly why the arrival is worth getting right."),
      h2("The event, and what arrival day looks like"),
      p("Meydan is a striking grandstand on the edge of the city, maybe fifteen to twenty minutes from Downtown on a clear run. Race day is an all-afternoon-into-evening affair that builds to the main event after dark and finishes with a concert and fireworks. Tens of thousands arrive in a fairly tight window, the approach roads back up, and parking sprawls. A car that drops you near the entrance changes the whole experience."),
      h2("From Dubai airport to your hotel"),
      p("If you are flying in for the weekend, a private transfer from Dubai International (DXB) gets you to the hotel without the post-flight taxi shuffle. Book it before you travel and your driver is waiting when you land. You can [arrange your Dubai airport transfer here](/booking/) or browse our [Dubai private transfers](/private-transfers/dubai/)."),
      h2("Hotel to Meydan and back again"),
      p("This is where a chauffeur earns its keep. Your driver takes you to the grandstand drop-off, then collects you at an agreed time when the night ends — no standing in a long rideshare queue in formalwear while everyone leaves at once. If you are part of a group or a corporate box, we can run several cars or a larger vehicle so everyone arrives together."),
      h2("Dress code on, stress off"),
      p("Half the appeal of the World Cup is the occasion, and the occasion starts the moment you step out of the car. A clean, comfortable, fixed-price ride with a smartly dressed driver fits the day far better than a scramble for a cab. Agree the fare and the timings in advance and you can give your full attention to the horses, the hats and the after-party."),
      p("Tell us your hotel, your group size and what time you would like collecting, and we will handle the rest. [Get a price for your Dubai World Cup transfer](/booking/) and arrive the way the day deserves."),
    ],
  },
  // 5 — Rome · Easter / Holy Week at the Vatican
  {
    title: 'Easter in Rome: transfers for Holy Week at the Vatican',
    slug: 'rome-easter-holy-week-vatican-transfers',
    image: IMG.rome, city: CITY.rome, airports: [AIR.fco, AIR.cia],
    excerpt: 'Holy Week brings huge crowds and serious road closures to central Rome. Here is how to reach St Peter\'s, the Colosseum and your hotel from the airports, the cruise port or Termini.',
    seoTitle: 'Rome Easter Transfers | Holy Week & Vatican | Fiumicino & Civitavecchia | Titan Transfers',
    seoDescription: 'Private transfers for Easter and Holy Week in Rome. From Fiumicino, Ciampino, Civitavecchia cruise port or Termini to the Vatican. We know the road closures. Fixed price.',
    content: [
      p("Holy Week is one of the most moving times to be in Rome, and one of the most demanding to get around. Pilgrims and visitors pour in from all over the world for the Via Crucis at the Colosseum on Good Friday and the Easter Sunday Mass and Urbi et Orbi blessing in St Peter's Square. The atmosphere is extraordinary. The traffic management around the Vatican and the centre is, let us say, a test of patience."),
      h2("What happens during Holy Week"),
      p("The week building up to Easter packs the historic centre. St Peter's Square fills well before the Sunday Mass, the streets around the Vatican close to traffic, and the Good Friday procession shuts roads around the Colosseum in the evening. A driver who knows which approaches are open on which day, and where you can actually be dropped, is worth a great deal when half the map is cordoned off."),
      h2("From Rome's airports to the city"),
      p("Most visitors land at Fiumicino (FCO); some come through Ciampino (CIA) on the budget routes. Both are a solid forty minutes to an hour from the centre depending on traffic, and during Holy Week traffic is heavier than usual. A private transfer means your driver follows the flight, meets you inside, and takes you as close to your hotel as the closures allow. You can [book your Rome airport transfer here](/booking/) or see our [private transfers in Rome](/private-transfers/rome/)."),
      h2("Arriving by cruise at Civitavecchia"),
      p("Rome's cruise port, Civitavecchia, is about eighty kilometres up the coast — far enough that getting to the Vatican and back in a port day needs proper planning. We run private transfers between Civitavecchia and central Rome, and a driver who has done the Easter run before knows how to time it so you actually see St Peter's rather than the inside of a traffic jam."),
      h2("Coming in by train"),
      p("If you are arriving by high-speed train into Roma Termini, we can collect you there too. From Termini to the Vatican is short on a normal day; during Holy Week the last stretch is the slow part, and being dropped at the right corner saves a long walk with luggage."),
      h2("Why book ahead for Easter"),
      p("Easter is one of the busiest weekends of the Roman year, and good drivers get reserved early. Booking in advance locks in a fixed price before demand peaks, and means someone is genuinely waiting for you rather than hoping a taxi appears outside a packed terminal. Travelling as a family or a parish group? Tell us the numbers and we will send a vehicle to match."),
      p("Get the transfers in place and you can give the week the attention it deserves. [Get a price for your Rome Easter transfer](/booking/) and leave the road closures to your driver."),
    ],
  },
  // 6 — Rome · Rome Marathon
  {
    title: 'Rome Marathon transfers: getting to the start line without the stress',
    slug: 'rome-marathon-transfers',
    image: IMG.rome, city: CITY.rome, airports: [AIR.fco, AIR.cia],
    excerpt: 'A spring marathon that starts and finishes at the Colosseum, with road closures to match. Here is how runners and supporters reach the start line, the hotel and the airports.',
    seoTitle: 'Rome Marathon Transfers | Airport & Colosseum Start Line | Titan Transfers',
    seoDescription: 'Private transfers for the Rome Marathon. From Fiumicino, Ciampino or Termini to your hotel and the Colosseum start line, with road closures factored in. Fixed price.',
    content: [
      p("Running a marathon through the centre of Rome is a bucket-list day — you pass the Colosseum, the Forum, St Peter's and the Trevi Fountain on the same route. But the morning of a big city marathon has its own small stresses, and the last thing you want before 42 kilometres is a fight to reach the start line because half the roads are shut."),
      h2("Start, finish and the road closures"),
      p("Run Rome The Marathon takes place in spring, usually March, and both the start and finish are on Via dei Fori Imperiali, right beside the Colosseum. That is wonderful for the photos and tricky for the logistics: the closures around the start go up early and wide, so the trick is being dropped at a point you can actually walk in from, with time to spare and your legs still fresh."),
      h2("From the airports to your hotel"),
      p("Get the boring part sorted first. A private transfer from Fiumicino (FCO) or Ciampino (CIA) takes you straight to the hotel so you can rest, hydrate and lay your kit out the night before instead of wrestling with trains. Book it ahead and your driver is waiting when you land. You can [arrange your Rome airport transfer here](/booking/) or read about our [Rome private transfers](/private-transfers/rome/)."),
      h2("Race morning, and the reunion after"),
      p("On marathon morning an early, pre-agreed pick-up gets you near the start with a comfortable margin — far less stressful than guessing which metro exit is still open. For supporters, a driver who knows the route can help you hop to a couple of viewing spots and then be at the finish for the reunion. After the race, when your legs have stopped working, a car waiting to take you back to the hotel is a small piece of heaven."),
      h2("Travelling as a group"),
      p("Running clubs and friends-and-family groups travel to Rome together, and a private van keeps everyone on the same schedule — out to the start as a team, back to celebrate as a team. Tell us how many runners and supporters when you book and we will send the right vehicle."),
      p("Sort the driving and you can keep your focus where it belongs: on the start line, the city and the medal. [Get a price for your Rome Marathon transfer](/booking/) and have a great race."),
    ],
  },
  // 7 — Milan · Milan Fashion Week
  {
    title: 'Milan Fashion Week transfers: a chauffeur for show season',
    slug: 'milan-fashion-week-transfers',
    image: IMG.milan, city: CITY.milan, airports: [AIR.mxp, AIR.lin, AIR.bgy],
    excerpt: 'Tight schedules, venues scattered across the city, and a different airport depending on your flight. Here is how a private driver keeps Fashion Week running on time.',
    seoTitle: 'Milan Fashion Week Transfers | Malpensa, Linate & Bergamo Chauffeur | Titan Transfers',
    seoDescription: 'Private chauffeur transfers for Milan Fashion Week. From Malpensa, Linate or Bergamo to the shows across the city, with a driver on call between venues. Fixed price.',
    content: [
      p("Milan Fashion Week runs on a clock that does not forgive lateness. Shows start on time whether you are there or not, the venues are scattered from the Quadrilatero della Moda to old factories on the edge of town, and the gaps between them are tight. For buyers, press and anyone working the week, the car is not a luxury — it is the only way to make a 10am, an 11:30 and a 1pm on opposite sides of the city."),
      h2("When it happens and how the city moves"),
      p("There are several Milan fashion weeks across the year — the big womenswear editions land in late February and September, with menswear and resort dates in between. During show season the centre is busy, parking near the venues is wishful thinking, and the schedule lives or dies on how quickly you can get from one address to the next. A driver who knows the one-way systems around the centre is gold."),
      h2("Three airports, one plan"),
      p("Milan has three. Malpensa (MXP) is the big international hub but a good forty-five minutes to an hour out. Linate (LIN) is small and wonderfully close to the centre. Bergamo (BGY) handles a lot of the low-cost flights and sits further east. Whichever you fly into, a private transfer means a driver tracking the flight and taking you straight in. You can [book your Milan airport transfer here](/booking/) or see our [private transfers in Milan](/private-transfers/milan/)."),
      h2("A driver on call between shows"),
      p("The real value during Fashion Week is having a car and driver at your disposal, not just a single ride. Step out of one show, the car is there, and you are at the next venue while everyone else is still trying to order a taxi. Tell us your schedule for the day and we will keep to it — discreet, on time, and out of the way when you do not need it."),
      h2("Arriving by train"),
      p("Plenty of the fashion crowd comes in by high-speed train to Milano Centrale or Porta Garibaldi from Paris, Florence or Rome. Both are easy pick-up points, and from either you can be at your hotel or the first show in minutes rather than dragging a garment bag through the metro."),
      p("Send us your itinerary and we will build the day around it. [Get a price for your Milan Fashion Week transfers](/booking/) and let the schedule be someone else's problem."),
    ],
  },
  // 8 — Milan · Salone del Mobile
  {
    title: 'Salone del Mobile transfers: Rho Fiera, the city and the airports',
    slug: 'salone-del-mobile-milan-transfers',
    image: IMG.milan, city: CITY.milan, airports: [AIR.mxp, AIR.lin, AIR.bgy],
    excerpt: 'The world\'s biggest design fair takes over Rho Fiera every April, with the Fuorisalone spread across the city. Here is how to handle the transfers, the fairground and the late dinners.',
    seoTitle: 'Salone del Mobile Transfers | Rho Fiera & Milan Design Week | Titan Transfers',
    seoDescription: 'Private transfers for Salone del Mobile and Milan Design Week. From Malpensa, Linate or Bergamo to Rho Fiera and the Fuorisalone districts. Fixed price, vans for teams.',
    content: [
      p("For one week every April, Milan becomes the centre of the design world. Salone del Mobile fills the vast halls at Rho Fiera, and the Fuorisalone spills out across Brera, Tortona, Isola and half a dozen other districts with installations and parties. It is exhilarating and exhausting in equal measure, and the one thing that quietly decides whether your week runs smoothly is how you handle the moving around."),
      h2("Rho Fiera is further than you think"),
      p("The fairground is not in the centre. Rho Fiera sits out to the northwest, and while there is a metro line, during Salone it carries an enormous crowd morning and evening. If you are bringing samples, a portfolio or a team, or you simply do not want to start and end each day in a crush, a private car to the fair and back is the calm option. A driver drops you at the right entrance for your halls — the site is genuinely huge."),
      h2("From Milan's airports to your base"),
      p("Design Week pulls a global crowd through all three Milan airports. Malpensa (MXP) takes the long-haul and most international traffic, Linate (LIN) is the quick one near the centre, and Bergamo (BGY) covers a lot of the budget flights. Book a private transfer and a driver meets you at whichever you land at and takes you straight to your hotel or apartment. You can [arrange your Milan airport transfer here](/booking/) or browse our [Milan private transfers](/private-transfers/milan/)."),
      h2("The Fuorisalone shuffle"),
      p("The fair is only half of it. The Fuorisalone events are scattered across districts that are a fair walk or a tram ride apart, and they run into the evening with dinners and openings. Having a car on hand for part of the day lets you cover Tortona, Brera and Isola without losing an hour between each — and gets you home after a late event without the end-of-night taxi scramble."),
      h2("Built for teams and trade visitors"),
      p("Salone is a working week for a lot of people, and they rarely travel alone. We have vans and estates for studios and trade teams who arrive with kit, and we can run several cars on the same schedule. Agree a fixed price up front and the whole thing goes on one clean invoice — your accounts team will be glad."),
      p("Tell us your dates, your group and where you are staying, and we will map the transfers around the fair and the Fuorisalone. [Get a price for your Salone del Mobile transfer](/booking/) and keep your week about the design.")
    ],
  },
]

// ── Create ───────────────────────────────────────────────────────────────────
async function run() {
  console.log(`Seeding ${posts.length} event posts${DRY ? ' (DRY RUN)' : ''}\n`)
  for (const post of posts) {
    const doc = {
      _id: `blogPost-${post.slug}`,
      _type: 'blogPost',
      title: post.title,
      slug: { _type: 'slug', current: post.slug },
      category: 'Events',
      publishDate: '2026-06-21',
      excerpt: post.excerpt,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      featuredImage: featured(post.image),
      content: post.content,
      relatedCities: [cityRef(post.city)],
      relatedAirports: post.airports.map(airRef),
    }
    if (DRY) { console.log(`• ${post.title}\n  slug: ${post.slug} · blocks: ${post.content.length} · airports: ${post.airports.length}`); continue }
    await client.createOrReplace(doc)
    console.log(`✓ ${post.title}`)
  }
  console.log('\nDone.')
}
run().catch(e => { console.error(e); process.exit(1) })
