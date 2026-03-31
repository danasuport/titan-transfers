/**
 * Migrate airports from WordPress sitemap to Sanity CMS
 * Usage: node scripts/migrate-airports.mjs
 *
 * - Scrapes EN + ES pages from titantransfers.com
 * - Downloads hero images from WP uploads
 * - Creates airport documents in Sanity with bilingual content
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'

const SANITY_PROJECT_ID = '6iu2za90'
const SANITY_DATASET = 'production'
const SANITY_TOKEN = process.env.SANITY_API_TOKEN || readTokenFromEnv()

function readTokenFromEnv() {
  try {
    const env = readFileSync('.env.local', 'utf-8')
    const match = env.match(/SANITY_API_TOKEN=(.+)/)
    return match ? match[1].trim() : ''
  } catch { return '' }
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

// ── Airport metadata database ──────────────────────────────────────────────
// Maps WP slug → { title, iata, city, country, lat, lng }
const AIRPORTS = {
  'abu-dhabi': { title: 'Abu Dhabi International Airport', iata: 'AUH', city: 'Abu Dhabi', country: 'United Arab Emirates', esTitle: 'Aeropuerto Internacional de Abu Dabi', esSlug: 'abu-dabi-traslados-al-aeropuerto' },
  'alicante': { title: 'Alicante-Elche Airport', iata: 'ALC', city: 'Alicante', country: 'Spain', esTitle: 'Aeropuerto de Alicante-Elche', esSlug: 'alicante-traslados-al-aeropuerto' },
  'amsterdam': { title: 'Amsterdam Schiphol Airport', iata: 'AMS', city: 'Amsterdam', country: 'Netherlands', esTitle: 'Aeropuerto de Ámsterdam Schiphol', esSlug: 'amsterdam-traslados-al-aeropuerto' },
  'antalya': { title: 'Antalya Airport', iata: 'AYT', city: 'Antalya', country: 'Turkey', esTitle: 'Aeropuerto de Antalya', esSlug: 'antalya-traslados-al-aeropuerto' },
  'athens': { title: 'Athens International Airport', iata: 'ATH', city: 'Athens', country: 'Greece', esTitle: 'Aeropuerto Internacional de Atenas', esSlug: 'atenas-traslados-al-aeropuerto' },
  'atlanta': { title: 'Hartsfield-Jackson Atlanta International Airport', iata: 'ATL', city: 'Atlanta', country: 'United States', esTitle: 'Aeropuerto Internacional de Atlanta', esSlug: 'atlanta-traslados-al-aeropuerto' },
  'austin': { title: 'Austin-Bergstrom International Airport', iata: 'AUS', city: 'Austin', country: 'United States', esTitle: 'Aeropuerto Internacional de Austin', esSlug: 'austin-traslados-al-aeropuerto' },
  'baltimore': { title: 'Baltimore/Washington International Airport', iata: 'BWI', city: 'Baltimore', country: 'United States', esTitle: 'Aeropuerto Internacional de Baltimore', esSlug: 'baltimore-traslados-al-aeropuerto' },
  'beijing': { title: 'Beijing Capital International Airport', iata: 'PEK', city: 'Beijing', country: 'China', esTitle: 'Aeropuerto Internacional de Pekín', esSlug: 'pekin-traslados-al-aeropuerto' },
  'beijing-daxing': { title: 'Beijing Daxing International Airport', iata: 'PKX', city: 'Beijing', country: 'China', esTitle: 'Aeropuerto Internacional de Pekín-Daxing', esSlug: 'pekin-daxing-traslados-al-aeropuerto' },
  'berlin': { title: 'Berlin Brandenburg Airport', iata: 'BER', city: 'Berlin', country: 'Germany', esTitle: 'Aeropuerto de Berlín-Brandeburgo', esSlug: 'berlin-traslados-al-aeropuerto' },
  'bogota': { title: 'El Dorado International Airport', iata: 'BOG', city: 'Bogotá', country: 'Colombia', esTitle: 'Aeropuerto Internacional El Dorado', esSlug: 'bogota-traslados-al-aeropuerto' },
  'boston': { title: 'Boston Logan International Airport', iata: 'BOS', city: 'Boston', country: 'United States', esTitle: 'Aeropuerto Internacional de Boston', esSlug: 'boston-traslados-al-aeropuerto' },
  'brussels': { title: 'Brussels Airport', iata: 'BRU', city: 'Brussels', country: 'Belgium', esTitle: 'Aeropuerto de Bruselas', esSlug: 'bruselas-traslados-al-aeropuerto' },
  'budapest': { title: 'Budapest Ferenc Liszt International Airport', iata: 'BUD', city: 'Budapest', country: 'Hungary', esTitle: 'Aeropuerto Internacional de Budapest', esSlug: 'budapest-traslados-al-aeropuerto' },
  'buffalo': { title: 'Buffalo Niagara International Airport', iata: 'BUF', city: 'Buffalo', country: 'United States', esTitle: 'Aeropuerto Internacional de Buffalo', esSlug: 'buffalo-traslados-al-aeropuerto' },
  'cairo': { title: 'Cairo International Airport', iata: 'CAI', city: 'Cairo', country: 'Egypt', esTitle: 'Aeropuerto Internacional de El Cairo', esSlug: 'el-cairo-traslados-al-aeropuerto' },
  'cancun': { title: 'Cancún International Airport', iata: 'CUN', city: 'Cancún', country: 'Mexico', esTitle: 'Aeropuerto Internacional de Cancún', esSlug: 'cancun-traslados-al-aeropuerto' },
  'cartagena': { title: 'Rafael Núñez International Airport', iata: 'CTG', city: 'Cartagena', country: 'Colombia', esTitle: 'Aeropuerto Internacional de Cartagena', esSlug: 'cartagena-traslados-al-aeropuerto' },
  'catania': { title: 'Catania-Fontanarossa Airport', iata: 'CTA', city: 'Catania', country: 'Italy', esTitle: 'Aeropuerto de Catania', esSlug: 'catania-traslados-al-aeropuerto' },
  'changsha': { title: 'Changsha Huanghua International Airport', iata: 'CSX', city: 'Changsha', country: 'China', esTitle: 'Aeropuerto Internacional de Changsha', esSlug: 'changsha-traslados-al-aeropuerto' },
  'charleroi': { title: 'Brussels South Charleroi Airport', iata: 'CRL', city: 'Charleroi', country: 'Belgium', esTitle: 'Aeropuerto de Charleroi', esSlug: 'charleroi-traslados-al-aeropuerto' },
  'charleston': { title: 'Charleston International Airport', iata: 'CHS', city: 'Charleston', country: 'United States', esTitle: 'Aeropuerto Internacional de Charleston', esSlug: 'charleston-traslados-al-aeropuerto' },
  'charlotte': { title: 'Charlotte Douglas International Airport', iata: 'CLT', city: 'Charlotte', country: 'United States', esTitle: 'Aeropuerto Internacional de Charlotte', esSlug: 'charlotte-traslados-al-aeropuerto' },
  'chicago-midway': { title: 'Chicago Midway International Airport', iata: 'MDW', city: 'Chicago', country: 'United States', esTitle: 'Aeropuerto Midway de Chicago', esSlug: 'chicago-midway-traslados-al-aeropuerto' },
  'chicago-ohare': { title: "Chicago O'Hare International Airport", iata: 'ORD', city: 'Chicago', country: 'United States', esTitle: "Aeropuerto O'Hare de Chicago", esSlug: 'chicago-ohare-traslados-al-aeropuerto' },
  'cologne': { title: 'Cologne Bonn Airport', iata: 'CGN', city: 'Cologne', country: 'Germany', esTitle: 'Aeropuerto de Colonia-Bonn', esSlug: 'colonia-traslados-al-aeropuerto' },
  'cozumel': { title: 'Cozumel International Airport', iata: 'CZM', city: 'Cozumel', country: 'Mexico', esTitle: 'Aeropuerto Internacional de Cozumel', esSlug: 'cozumel-traslados-al-aeropuerto' },
  'dallas-fort-worth': { title: 'Dallas/Fort Worth International Airport', iata: 'DFW', city: 'Dallas', country: 'United States', esTitle: 'Aeropuerto Internacional de Dallas', esSlug: 'dallas-traslados-al-aeropuerto' },
  'denver': { title: 'Denver International Airport', iata: 'DEN', city: 'Denver', country: 'United States', esTitle: 'Aeropuerto Internacional de Denver', esSlug: 'denver-traslados-al-aeropuerto' },
  'detroit': { title: 'Detroit Metropolitan Airport', iata: 'DTW', city: 'Detroit', country: 'United States', esTitle: 'Aeropuerto Metropolitano de Detroit', esSlug: 'detroit-traslados-al-aeropuerto' },
  'dubai': { title: 'Dubai International Airport', iata: 'DXB', city: 'Dubai', country: 'United Arab Emirates', esTitle: 'Aeropuerto Internacional de Dubái', esSlug: 'dubai-traslados-al-aeropuerto' },
  'dubai-world-central': { title: 'Dubai World Central Airport', iata: 'DWC', city: 'Dubai', country: 'United Arab Emirates', esTitle: 'Aeropuerto Al Maktoum de Dubái', esSlug: 'dubai-world-central-traslados-al-aeropuerto' },
  'dublin': { title: 'Dublin Airport', iata: 'DUB', city: 'Dublin', country: 'Ireland', esTitle: 'Aeropuerto de Dublín', esSlug: 'dublin-traslados-al-aeropuerto' },
  'dusseldorf': { title: 'Düsseldorf Airport', iata: 'DUS', city: 'Düsseldorf', country: 'Germany', esTitle: 'Aeropuerto de Düsseldorf', esSlug: 'dusseldorf-traslados-al-aeropuerto' },
  'edinburgh': { title: 'Edinburgh Airport', iata: 'EDI', city: 'Edinburgh', country: 'United Kingdom', esTitle: 'Aeropuerto de Edimburgo', esSlug: 'edimburgo-traslados-al-aeropuerto' },
  'faro': { title: 'Faro Airport', iata: 'FAO', city: 'Faro', country: 'Portugal', esTitle: 'Aeropuerto de Faro', esSlug: 'faro-traslados-al-aeropuerto' },
  'florence': { title: 'Florence Airport', iata: 'FLR', city: 'Florence', country: 'Italy', esTitle: 'Aeropuerto de Florencia', esSlug: 'florencia-traslados-al-aeropuerto' },
  'fort-lauderdale': { title: 'Fort Lauderdale-Hollywood International Airport', iata: 'FLL', city: 'Fort Lauderdale', country: 'United States', esTitle: 'Aeropuerto Internacional de Fort Lauderdale', esSlug: 'fort-lauderdale-traslados-al-aeropuerto' },
  'frankfurt': { title: 'Frankfurt Airport', iata: 'FRA', city: 'Frankfurt', country: 'Germany', esTitle: 'Aeropuerto de Fráncfort', esSlug: 'francfort-traslados-al-aeropuerto' },
  'girona': { title: 'Girona-Costa Brava Airport', iata: 'GRO', city: 'Girona', country: 'Spain', esTitle: 'Aeropuerto de Girona-Costa Brava', esSlug: 'girona-traslados-al-aeropuerto' },
  'guangzhou': { title: 'Guangzhou Baiyun International Airport', iata: 'CAN', city: 'Guangzhou', country: 'China', esTitle: 'Aeropuerto Internacional de Cantón', esSlug: 'guangzhou-traslados-al-aeropuerto' },
  'hong-kong': { title: 'Hong Kong International Airport', iata: 'HKG', city: 'Hong Kong', country: 'China', esTitle: 'Aeropuerto Internacional de Hong Kong', esSlug: 'hong-kong-traslados-al-aeropuerto' },
  'honolulu': { title: 'Daniel K. Inouye International Airport', iata: 'HNL', city: 'Honolulu', country: 'United States', esTitle: 'Aeropuerto Internacional de Honolulu', esSlug: 'honolulu-traslados-al-aeropuerto' },
  'houston': { title: 'George Bush Intercontinental Airport', iata: 'IAH', city: 'Houston', country: 'United States', esTitle: 'Aeropuerto Intercontinental de Houston', esSlug: 'houston-traslados-al-aeropuerto' },
  'houston-hobby': { title: 'William P. Hobby Airport', iata: 'HOU', city: 'Houston', country: 'United States', esTitle: 'Aeropuerto Hobby de Houston', esSlug: 'houston-hobby-traslados-al-aeropuerto' },
  'hurghada': { title: 'Hurghada International Airport', iata: 'HRG', city: 'Hurghada', country: 'Egypt', esTitle: 'Aeropuerto Internacional de Hurghada', esSlug: 'hurghada-traslados-al-aeropuerto' },
  'istanbul': { title: 'Istanbul Airport', iata: 'IST', city: 'Istanbul', country: 'Turkey', esTitle: 'Aeropuerto de Estambul', esSlug: 'estambul-traslados-al-aeropuerto' },
  'istanbul-sabiha-gokcen': { title: 'Istanbul Sabiha Gökçen Airport', iata: 'SAW', city: 'Istanbul', country: 'Turkey', esTitle: 'Aeropuerto Sabiha Gökçen de Estambul', esSlug: 'estambul-sabiha-gokcen-traslados-al-aeropuerto' },
  'kansas-city': { title: 'Kansas City International Airport', iata: 'MCI', city: 'Kansas City', country: 'United States', esTitle: 'Aeropuerto Internacional de Kansas City', esSlug: 'kansas-city-traslados-al-aeropuerto' },
  'kos': { title: 'Kos Island International Airport', iata: 'KGS', city: 'Kos', country: 'Greece', esTitle: 'Aeropuerto Internacional de Kos', esSlug: 'kos-traslados-al-aeropuerto' },
  'lanzarote': { title: 'Lanzarote Airport', iata: 'ACE', city: 'Lanzarote', country: 'Spain', esTitle: 'Aeropuerto de Lanzarote', esSlug: 'lanzarote-traslados-al-aeropuerto' },
  'las-vegas': { title: 'Harry Reid International Airport', iata: 'LAS', city: 'Las Vegas', country: 'United States', esTitle: 'Aeropuerto Internacional de Las Vegas', esSlug: 'las-vegas-traslados-al-aeropuerto' },
  'lisbon': { title: 'Lisbon Humberto Delgado Airport', iata: 'LIS', city: 'Lisbon', country: 'Portugal', esTitle: 'Aeropuerto de Lisboa', esSlug: 'lisboa-traslados-al-aeropuerto' },
  'london-city': { title: 'London City Airport', iata: 'LCY', city: 'London', country: 'United Kingdom', esTitle: 'Aeropuerto de London City', esSlug: 'london-city-traslados-al-aeropuerto' },
  'london-gatwick': { title: 'London Gatwick Airport', iata: 'LGW', city: 'London', country: 'United Kingdom', esTitle: 'Aeropuerto de Londres Gatwick', esSlug: 'londres-gatwick-traslados-al-aeropuerto' },
  'london-heathrow': { title: 'London Heathrow Airport', iata: 'LHR', city: 'London', country: 'United Kingdom', esTitle: 'Aeropuerto de Londres Heathrow', esSlug: 'londres-heathrow-traslados-al-aeropuerto' },
  'london-luton': { title: 'London Luton Airport', iata: 'LTN', city: 'London', country: 'United Kingdom', esTitle: 'Aeropuerto de Londres Luton', esSlug: 'londres-luton-traslados-al-aeropuerto' },
  'london-stansted': { title: 'London Stansted Airport', iata: 'STN', city: 'London', country: 'United Kingdom', esTitle: 'Aeropuerto de Londres Stansted', esSlug: 'londres-stansted-traslados-al-aeropuerto' },
  'los-angeles-lax': { title: 'Los Angeles International Airport', iata: 'LAX', city: 'Los Angeles', country: 'United States', esTitle: 'Aeropuerto Internacional de Los Ángeles', esSlug: 'los-angeles-traslados-al-aeropuerto' },
  'madrid': { title: 'Adolfo Suárez Madrid-Barajas Airport', iata: 'MAD', city: 'Madrid', country: 'Spain', esTitle: 'Aeropuerto Adolfo Suárez Madrid-Barajas', esSlug: 'madrid-traslados-al-aeropuerto' },
  'malaga': { title: 'Málaga-Costa del Sol Airport', iata: 'AGP', city: 'Málaga', country: 'Spain', esTitle: 'Aeropuerto de Málaga-Costa del Sol', esSlug: 'malaga-traslados-al-aeropuerto' },
  'manchester': { title: 'Manchester Airport', iata: 'MAN', city: 'Manchester', country: 'United Kingdom', esTitle: 'Aeropuerto de Mánchester', esSlug: 'manchester-traslados-al-aeropuerto' },
  'marrakesh': { title: 'Marrakech Menara Airport', iata: 'RAK', city: 'Marrakech', country: 'Morocco', esTitle: 'Aeropuerto de Marrakech', esSlug: 'marrakech-traslados-al-aeropuerto' },
  'marsa-alam': { title: 'Marsa Alam International Airport', iata: 'RMF', city: 'Marsa Alam', country: 'Egypt', esTitle: 'Aeropuerto Internacional de Marsa Alam', esSlug: 'marsa-alam-traslados-al-aeropuerto' },
  'miami': { title: 'Miami International Airport', iata: 'MIA', city: 'Miami', country: 'United States', esTitle: 'Aeropuerto Internacional de Miami', esSlug: 'miami-traslados-al-aeropuerto' },
  'milan-bergamo': { title: 'Milan Bergamo Airport', iata: 'BGY', city: 'Milan', country: 'Italy', esTitle: 'Aeropuerto de Milán Bérgamo', esSlug: 'milan-bergamo-traslados-al-aeropuerto' },
  'milan-linate': { title: 'Milan Linate Airport', iata: 'LIN', city: 'Milan', country: 'Italy', esTitle: 'Aeropuerto de Milán Linate', esSlug: 'milan-linate-traslados-al-aeropuerto' },
  'milan-malpensa': { title: 'Milan Malpensa Airport', iata: 'MXP', city: 'Milan', country: 'Italy', esTitle: 'Aeropuerto de Milán Malpensa', esSlug: 'milan-malpensa-traslados-al-aeropuerto' },
  'minneapolis': { title: 'Minneapolis-Saint Paul International Airport', iata: 'MSP', city: 'Minneapolis', country: 'United States', esTitle: 'Aeropuerto Internacional de Mineápolis', esSlug: 'minneapolis-traslados-al-aeropuerto' },
  'montego-bay': { title: 'Sangster International Airport', iata: 'MBJ', city: 'Montego Bay', country: 'Jamaica', esTitle: 'Aeropuerto Internacional de Montego Bay', esSlug: 'montego-bay-traslados-al-aeropuerto' },
  'montreal': { title: 'Montréal-Pierre Elliott Trudeau International Airport', iata: 'YUL', city: 'Montreal', country: 'Canada', esTitle: 'Aeropuerto Internacional de Montreal', esSlug: 'montreal-traslados-al-aeropuerto' },
  'munich': { title: 'Munich Airport', iata: 'MUC', city: 'Munich', country: 'Germany', esTitle: 'Aeropuerto de Múnich', esSlug: 'munich-traslados-al-aeropuerto' },
  'nanjing': { title: 'Nanjing Lukou International Airport', iata: 'NKG', city: 'Nanjing', country: 'China', esTitle: 'Aeropuerto Internacional de Nankín', esSlug: 'nanjing-traslados-al-aeropuerto' },
  'new-orleans': { title: 'Louis Armstrong New Orleans International Airport', iata: 'MSY', city: 'New Orleans', country: 'United States', esTitle: 'Aeropuerto Internacional de Nueva Orleans', esSlug: 'nueva-orleans-traslados-al-aeropuerto' },
  'new-york-jfk': { title: 'John F. Kennedy International Airport', iata: 'JFK', city: 'New York', country: 'United States', esTitle: 'Aeropuerto Internacional JFK de Nueva York', esSlug: 'nueva-york-jfk-traslados-al-aeropuerto' },
  'new-york-la-guardia': { title: 'LaGuardia Airport', iata: 'LGA', city: 'New York', country: 'United States', esTitle: 'Aeropuerto LaGuardia de Nueva York', esSlug: 'nueva-york-laguardia-traslados-al-aeropuerto' },
  'newark': { title: 'Newark Liberty International Airport', iata: 'EWR', city: 'Newark', country: 'United States', esTitle: 'Aeropuerto Internacional de Newark', esSlug: 'newark-traslados-al-aeropuerto' },
  'orlando': { title: 'Orlando International Airport', iata: 'MCO', city: 'Orlando', country: 'United States', esTitle: 'Aeropuerto Internacional de Orlando', esSlug: 'orlando-traslados-al-aeropuerto' },
  'ottawa': { title: 'Ottawa Macdonald-Cartier International Airport', iata: 'YOW', city: 'Ottawa', country: 'Canada', esTitle: 'Aeropuerto Internacional de Ottawa', esSlug: 'ottawa-traslados-al-aeropuerto' },
  'palermo': { title: 'Palermo Falcone-Borsellino Airport', iata: 'PMO', city: 'Palermo', country: 'Italy', esTitle: 'Aeropuerto de Palermo', esSlug: 'palermo-traslados-al-aeropuerto' },
  'palma-de-mallorca': { title: 'Palma de Mallorca Airport', iata: 'PMI', city: 'Palma de Mallorca', country: 'Spain', esTitle: 'Aeropuerto de Palma de Mallorca', esSlug: 'palma-de-mallorca-traslados-al-aeropuerto' },
  'panama-albrook': { title: 'Albrook Marcos A. Gelabert International Airport', iata: 'PAC', city: 'Panama City', country: 'Panama', esTitle: 'Aeropuerto de Albrook', esSlug: 'panama-albrook-traslados-al-aeropuerto' },
  'panama-city': { title: 'Tocumen International Airport', iata: 'PTY', city: 'Panama City', country: 'Panama', esTitle: 'Aeropuerto Internacional de Tocumen', esSlug: 'panama-city-traslados-al-aeropuerto' },
  'panama-pacifico': { title: 'Panama Pacífico International Airport', iata: 'BLB', city: 'Panama City', country: 'Panama', esTitle: 'Aeropuerto Internacional de Panamá Pacífico', esSlug: 'panama-pacifico-traslados-al-aeropuerto' },
  'paris-beauvais': { title: 'Paris Beauvais-Tillé Airport', iata: 'BVA', city: 'Paris', country: 'France', esTitle: 'Aeropuerto de París Beauvais', esSlug: 'paris-beauvais-traslados-al-aeropuerto' },
  'paris-charles-de-gaulle': { title: 'Paris Charles de Gaulle Airport', iata: 'CDG', city: 'Paris', country: 'France', esTitle: 'Aeropuerto Charles de Gaulle de París', esSlug: 'paris-charles-de-gaulle-traslados-al-aeropuerto' },
  'paris-orly': { title: 'Paris Orly Airport', iata: 'ORY', city: 'Paris', country: 'France', esTitle: 'Aeropuerto de París Orly', esSlug: 'paris-orly-traslados-al-aeropuerto' },
  'philadelphia': { title: 'Philadelphia International Airport', iata: 'PHL', city: 'Philadelphia', country: 'United States', esTitle: 'Aeropuerto Internacional de Filadelfia', esSlug: 'filadelfia-traslados-al-aeropuerto' },
  'phoenix': { title: 'Phoenix Sky Harbor International Airport', iata: 'PHX', city: 'Phoenix', country: 'United States', esTitle: 'Aeropuerto Internacional de Phoenix', esSlug: 'phoenix-traslados-al-aeropuerto' },
  'phuket': { title: 'Phuket International Airport', iata: 'HKT', city: 'Phuket', country: 'Thailand', esTitle: 'Aeropuerto Internacional de Phuket', esSlug: 'phuket-traslados-al-aeropuerto' },
  'pittsburgh': { title: 'Pittsburgh International Airport', iata: 'PIT', city: 'Pittsburgh', country: 'United States', esTitle: 'Aeropuerto Internacional de Pittsburgh', esSlug: 'pittsburgh-traslados-al-aeropuerto' },
  'porto': { title: 'Porto Airport', iata: 'OPO', city: 'Porto', country: 'Portugal', esTitle: 'Aeropuerto de Oporto', esSlug: 'oporto-traslados-al-aeropuerto' },
  'prague-airport-prg': { title: 'Václav Havel Airport Prague', iata: 'PRG', city: 'Prague', country: 'Czech Republic', esTitle: 'Aeropuerto de Praga', esSlug: 'praga-traslados-al-aeropuerto' },
  'pristina': { title: 'Pristina International Airport', iata: 'PRN', city: 'Pristina', country: 'Kosovo', esTitle: 'Aeropuerto Internacional de Pristina', esSlug: 'pristina-traslados-al-aeropuerto' },
  'punta-cana': { title: 'Punta Cana International Airport', iata: 'PUJ', city: 'Punta Cana', country: 'Dominican Republic', esTitle: 'Aeropuerto Internacional de Punta Cana', esSlug: 'punta-cana-traslados-al-aeropuerto' },
  'raleigh': { title: 'Raleigh-Durham International Airport', iata: 'RDU', city: 'Raleigh', country: 'United States', esTitle: 'Aeropuerto Internacional de Raleigh', esSlug: 'raleigh-traslados-al-aeropuerto' },
  'ras-al-khaimah': { title: 'Ras Al Khaimah International Airport', iata: 'RKT', city: 'Ras Al Khaimah', country: 'United Arab Emirates', esTitle: 'Aeropuerto Internacional de Ras Al Khaimah', esSlug: 'ras-al-khaimah-traslados-al-aeropuerto' },
  'reus': { title: 'Reus Airport', iata: 'REU', city: 'Reus', country: 'Spain', esTitle: 'Aeropuerto de Reus', esSlug: 'reus-traslados-al-aeropuerto' },
  'richmond': { title: 'Richmond International Airport', iata: 'RIC', city: 'Richmond', country: 'United States', esTitle: 'Aeropuerto Internacional de Richmond', esSlug: 'richmond-traslados-al-aeropuerto' },
  'rome-ciampino': { title: 'Rome Ciampino Airport', iata: 'CIA', city: 'Rome', country: 'Italy', esTitle: 'Aeropuerto de Roma Ciampino', esSlug: 'roma-ciampino-traslados-al-aeropuerto' },
  'rome-fiumicino': { title: 'Rome Fiumicino Airport', iata: 'FCO', city: 'Rome', country: 'Italy', esTitle: 'Aeropuerto de Roma Fiumicino', esSlug: 'roma-fiumicino-traslados-al-aeropuerto' },
  'salt-lake-city': { title: 'Salt Lake City International Airport', iata: 'SLC', city: 'Salt Lake City', country: 'United States', esTitle: 'Aeropuerto Internacional de Salt Lake City', esSlug: 'salt-lake-city-traslados-al-aeropuerto' },
  'san-antonio': { title: 'San Antonio International Airport', iata: 'SAT', city: 'San Antonio', country: 'United States', esTitle: 'Aeropuerto Internacional de San Antonio', esSlug: 'san-antonio-traslados-al-aeropuerto' },
  'san-diego': { title: 'San Diego International Airport', iata: 'SAN', city: 'San Diego', country: 'United States', esTitle: 'Aeropuerto Internacional de San Diego', esSlug: 'san-diego-traslados-al-aeropuerto' },
  'san-francisco': { title: 'San Francisco International Airport', iata: 'SFO', city: 'San Francisco', country: 'United States', esTitle: 'Aeropuerto Internacional de San Francisco', esSlug: 'san-francisco-traslados-al-aeropuerto' },
  'san-juan': { title: 'Luis Muñoz Marín International Airport', iata: 'SJU', city: 'San Juan', country: 'Puerto Rico', esTitle: 'Aeropuerto Internacional de San Juan', esSlug: 'san-juan-traslados-al-aeropuerto' },
  'santiago-de-compostela': { title: 'Santiago de Compostela Airport', iata: 'SCQ', city: 'Santiago de Compostela', country: 'Spain', esTitle: 'Aeropuerto de Santiago de Compostela', esSlug: 'santiago-de-compostela-traslados-al-aeropuerto' },
  'santo-domingo': { title: 'Las Américas International Airport', iata: 'SDQ', city: 'Santo Domingo', country: 'Dominican Republic', esTitle: 'Aeropuerto Internacional de Santo Domingo', esSlug: 'santo-domingo-traslados-al-aeropuerto' },
  'sarajevo': { title: 'Sarajevo International Airport', iata: 'SJJ', city: 'Sarajevo', country: 'Bosnia and Herzegovina', esTitle: 'Aeropuerto Internacional de Sarajevo', esSlug: 'sarajevo-traslados-al-aeropuerto' },
  'seattle': { title: 'Seattle-Tacoma International Airport', iata: 'SEA', city: 'Seattle', country: 'United States', esTitle: 'Aeropuerto Internacional de Seattle', esSlug: 'seattle-traslados-al-aeropuerto' },
  'shanghai': { title: 'Shanghai Hongqiao International Airport', iata: 'SHA', city: 'Shanghai', country: 'China', esTitle: 'Aeropuerto Internacional de Shanghái Hongqiao', esSlug: 'shanghai-traslados-al-aeropuerto' },
  'shanghai-pudong': { title: 'Shanghai Pudong International Airport', iata: 'PVG', city: 'Shanghai', country: 'China', esTitle: 'Aeropuerto Internacional de Shanghái Pudong', esSlug: 'shanghai-pudong-traslados-al-aeropuerto' },
  'sharjah': { title: 'Sharjah International Airport', iata: 'SHJ', city: 'Sharjah', country: 'United Arab Emirates', esTitle: 'Aeropuerto Internacional de Sharjah', esSlug: 'sharjah-traslados-al-aeropuerto' },
  'shenzhen': { title: "Shenzhen Bao'an International Airport", iata: 'SZX', city: 'Shenzhen', country: 'China', esTitle: 'Aeropuerto Internacional de Shenzhen', esSlug: 'shenzhen-traslados-al-aeropuerto' },
  'skopje': { title: 'Skopje International Airport', iata: 'SKP', city: 'Skopje', country: 'North Macedonia', esTitle: 'Aeropuerto Internacional de Skopje', esSlug: 'skopje-traslados-al-aeropuerto' },
  'tampa': { title: 'Tampa International Airport', iata: 'TPA', city: 'Tampa', country: 'United States', esTitle: 'Aeropuerto Internacional de Tampa', esSlug: 'tampa-traslados-al-aeropuerto' },
  'tangier': { title: 'Tangier Ibn Battouta Airport', iata: 'TNG', city: 'Tangier', country: 'Morocco', esTitle: 'Aeropuerto de Tánger', esSlug: 'tanger-traslados-al-aeropuerto' },
  'tirana': { title: 'Tirana International Airport', iata: 'TIA', city: 'Tirana', country: 'Albania', esTitle: 'Aeropuerto Internacional de Tirana', esSlug: 'tirana-traslados-al-aeropuerto' },
  'tulum': { title: 'Tulum International Airport', iata: 'TQO', city: 'Tulum', country: 'Mexico', esTitle: 'Aeropuerto Internacional de Tulum', esSlug: 'tulum-traslados-al-aeropuerto' },
  'vancouver': { title: 'Vancouver International Airport', iata: 'YVR', city: 'Vancouver', country: 'Canada', esTitle: 'Aeropuerto Internacional de Vancouver', esSlug: 'vancouver-traslados-al-aeropuerto' },
  'washington-dulles': { title: 'Washington Dulles International Airport', iata: 'IAD', city: 'Washington D.C.', country: 'United States', esTitle: 'Aeropuerto Internacional de Washington Dulles', esSlug: 'washington-dulles-traslados-al-aeropuerto' },
  'washington-ronald-reagan': { title: 'Ronald Reagan Washington National Airport', iata: 'DCA', city: 'Washington D.C.', country: 'United States', esTitle: 'Aeropuerto Nacional Ronald Reagan de Washington', esSlug: 'washington-reagan-traslados-al-aeropuerto' },
}

// ── Image helpers ──────────────────────────────────────────────────────────

async function tryDownloadImage(slug) {
  // Try multiple known WP image URL patterns
  const patterns = [
    `https://titantransfers.com/wp-content/uploads/2025/06/${slug}-airport-transfers.jpg`,
    `https://titantransfers.com/wp-content/uploads/2025/11/${slug}.jpg`,
    `https://titantransfers.com/wp-content/uploads/2025/06/${slug}.jpg`,
  ]

  for (const url of patterns) {
    try {
      const res = await fetch(url)
      if (res.ok && res.headers.get('content-type')?.includes('image')) {
        const buffer = Buffer.from(await res.arrayBuffer())
        if (buffer.length > 5000) { // Ensure it's a real image, not a 404 page
          return { buffer, filename: `${slug}-airport.jpg` }
        }
      }
    } catch {
      // Try next pattern
    }
  }
  return null
}

async function uploadImageToSanity(buffer, filename, altText) {
  try {
    const asset = await client.assets.upload('image', buffer, {
      filename,
      contentType: 'image/jpeg',
    })
    return {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: altText,
      title: altText,
    }
  } catch (err) {
    console.error(`  ⚠️  Failed to upload ${filename}:`, err.message)
    return null
  }
}

// ── Slug helpers ───────────────────────────────────────────────────────────

function makeEnSlug(slug) {
  return `${slug}-airport-transfers`
}

function makeEsSlug(data) {
  return data.esSlug || `${data.city.toLowerCase().replace(/\s+/g, '-')}-traslados-al-aeropuerto`
}

// ── Main migration ────────────────────────────────────────────────────────

async function migrate() {
  console.log('🚀 Starting airport migration...\n')

  // Get existing airports to skip them
  const existing = await client.fetch(`*[_type=="airport"]{iataCode, "slug": slug.current}`)
  const existingSlugs = new Set(existing.map(a => a.slug))
  const existingIata = new Set(existing.map(a => a.iataCode))

  console.log(`📋 Found ${existing.length} existing airports in Sanity`)
  console.log(`📋 Found ${Object.keys(AIRPORTS).length} airports to migrate\n`)

  // Filter out duplicates and already-skipped entries
  const slugsToProcess = Object.keys(AIRPORTS).filter(slug => {
    const data = AIRPORTS[slug]
    const enSlug = makeEnSlug(slug)
    if (existingSlugs.has(enSlug) || existingIata.has(data.iata)) {
      console.log(`⏭️  Skipping ${data.title} (${data.iata}) — already exists`)
      return false
    }
    return true
  })

  // Remove problematic entries
  const cleanSlugs = slugsToProcess.filter(s => s !== 'traslados-al-aeropuerto-de-phuket' && s !== 'skopje')

  console.log(`\n🔄 Processing ${cleanSlugs.length} new airports...\n`)

  let created = 0
  let withImages = 0
  let errors = 0

  // Process in batches of 5 for rate limiting
  for (let i = 0; i < cleanSlugs.length; i += 5) {
    const batch = cleanSlugs.slice(i, i + 5)

    await Promise.all(batch.map(async (slug) => {
      const data = AIRPORTS[slug]
      if (!data) return

      try {
        process.stdout.write(`  ✈️  ${data.title} (${data.iata})...`)

        // Try to download hero image
        const imageData = await tryDownloadImage(slug)
        let featuredImage = null

        if (imageData) {
          featuredImage = await uploadImageToSanity(
            imageData.buffer,
            imageData.filename,
            `${data.title} - Airport Transfers`
          )
          if (featuredImage) withImages++
        }

        // Create the Sanity document
        const doc = {
          _type: 'airport',
          title: data.title,
          slug: { _type: 'slug', current: makeEnSlug(slug) },
          iataCode: data.iata,
          seoTitle: `${data.title} Transfers | Private Taxi & Chauffeur Service`,
          seoDescription: `Book private transfers from ${data.title} (${data.iata}). Fixed prices, meet & greet, free cancellation. Professional chauffeur service in ${data.city}.`,
          translations: {
            es: {
              title: data.esTitle,
              slug: { _type: 'slug', current: makeEsSlug(data) },
              seoTitle: `Traslados ${data.esTitle} | Taxi Privado y Chófer`,
              seoDescription: `Reserva traslados privados desde ${data.esTitle} (${data.iata}). Precios fijos, recogida personalizada, cancelación gratuita. Servicio profesional de chófer en ${data.city}.`,
            },
          },
        }

        if (featuredImage) {
          doc.featuredImage = featuredImage
        }

        await client.create(doc)
        created++
        console.log(featuredImage ? ' ✅ + 🖼️' : ' ✅ (no image)')
      } catch (err) {
        errors++
        console.log(` ❌ ${err.message}`)
      }
    }))

    // Small delay between batches
    if (i + 5 < cleanSlugs.length) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Created: ${created} airports`)
  console.log(`🖼️  With images: ${withImages}`)
  console.log(`❌ Errors: ${errors}`)
  console.log(`📊 Total in Sanity: ${existing.length + created}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

migrate().catch(console.error)
