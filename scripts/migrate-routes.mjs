/**
 * Phase 6: Migrate Routes to Sanity
 * Creates all routes from WP sitemap with bilingual SEO content
 */

import { client } from './lib/sanity-client.mjs'
import { generateRouteEN, generateRouteES, seoTitle, seoDesc } from './lib/content-templates.mjs'

// ── Route definitions extracted from WP rutas-sitemap.xml ────────────────
// Format: { slug, esSlug, origin (airport _id), destination name, destSlug, distance (km), duration (min) }

const ROUTES = [
  // ═══════════════════════════════════════════════════════════════════════
  // BARCELONA EL PRAT (BCN) ROUTES
  // ═══════════════════════════════════════════════════════════════════════
  { slug: 'transfers-from-barcelona-airport-to-barcelona', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-barcelona', originId: 'barcelona-el-prat-airport', dest: 'Barcelona', destSlug: 'barcelona', distance: 18, duration: 25, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-sitges', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-sitges', originId: 'barcelona-el-prat-airport', dest: 'Sitges', destSlug: 'sitges', distance: 30, duration: 30, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-badalona', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-badalona', originId: 'barcelona-el-prat-airport', dest: 'Badalona', destSlug: 'badalona', distance: 25, duration: 30, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-castelldefels', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-castelldefels', originId: 'barcelona-el-prat-airport', dest: 'Castelldefels', destSlug: 'castelldefels', distance: 12, duration: 15, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-lhospitalet-de-llobregat', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-lhospitalet-de-llobregat', originId: 'barcelona-el-prat-airport', dest: "L'Hospitalet de Llobregat", destSlug: 'lhospitalet-de-llobregat', distance: 10, duration: 15, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-montcada-i-reixac', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-montcada-i-reixac', originId: 'barcelona-el-prat-airport', dest: 'Montcada i Reixac', destSlug: 'montcada-i-reixac', distance: 28, duration: 30, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-ripollet', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-ripollet', originId: 'barcelona-el-prat-airport', dest: 'Ripollet', destSlug: 'ripollet', distance: 30, duration: 35, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-sant-cugat-del-valles', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-sant-cugat-del-valles', originId: 'barcelona-el-prat-airport', dest: 'Sant Cugat del Vallès', destSlug: 'sant-cugat-del-valles', distance: 27, duration: 30, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-santa-coloma-de-gramenet', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-santa-coloma-de-gramenet', originId: 'barcelona-el-prat-airport', dest: 'Santa Coloma de Gramenet', destSlug: 'santa-coloma-de-gramenet', distance: 24, duration: 30, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-vallmoll', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-vallmoll', originId: 'barcelona-el-prat-airport', dest: 'Vallmoll', destSlug: 'vallmoll', distance: 85, duration: 60, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-lloret-de-mar', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-lloret-de-mar', originId: 'barcelona-el-prat-airport', dest: 'Lloret de Mar', destSlug: 'lloret-de-mar', distance: 95, duration: 75, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-tossa-de-mar', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-tossa-de-mar', originId: 'barcelona-el-prat-airport', dest: 'Tossa de Mar', destSlug: 'tossa-de-mar', distance: 105, duration: 80, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-platja-daro', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-platja-daro', originId: 'barcelona-el-prat-airport', dest: "Platja d'Aro", destSlug: 'platja-daro', distance: 115, duration: 85, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-altafulla', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-altafulla', originId: 'barcelona-el-prat-airport', dest: 'Altafulla', destSlug: 'altafulla', distance: 80, duration: 55, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-tarragona', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-tarragona', originId: 'barcelona-el-prat-airport', dest: 'Tarragona', destSlug: 'tarragona', distance: 90, duration: 60, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-la-pineda', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-la-pineda', originId: 'barcelona-el-prat-airport', dest: 'La Pineda', destSlug: 'la-pineda', distance: 85, duration: 55, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-castellar-del-valles', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-castellar-del-valles', originId: 'barcelona-el-prat-airport', dest: 'Castellar del Vallès', destSlug: 'castellar-del-valles', distance: 40, duration: 40, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-salou', esSlug: 'transbordos-desde-el-aeropuerto-de-barcelona-a-salou', originId: 'barcelona-el-prat-airport', dest: 'Salou', destSlug: 'salou', distance: 100, duration: 65, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-cambrils', esSlug: 'transbordos-desde-el-aeropuerto-de-barcelona-a-cambrils', originId: 'barcelona-el-prat-airport', dest: 'Cambrils', destSlug: 'cambrils', distance: 105, duration: 70, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-escaladei', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-escaladei', originId: 'barcelona-el-prat-airport', dest: 'Escaladei', destSlug: 'escaladei', distance: 140, duration: 95, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-girona', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-girona', originId: 'barcelona-el-prat-airport', dest: 'Girona', destSlug: 'girona', distance: 105, duration: 75, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-banyoles', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-banyoles', originId: 'barcelona-el-prat-airport', dest: 'Banyoles', destSlug: 'banyoles', distance: 130, duration: 90, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-cadaques', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-cadaques', originId: 'barcelona-el-prat-airport', dest: 'Cadaqués', destSlug: 'cadaques', distance: 180, duration: 130, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-andorra', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-andorra', originId: 'barcelona-el-prat-airport', dest: 'Andorra', destSlug: 'andorra', distance: 200, duration: 160, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-castellon', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-castellon', originId: 'barcelona-el-prat-airport', dest: 'Castellón', destSlug: 'castellon', distance: 280, duration: 170, country: 'spain', region: 'valencian-community' },
  { slug: 'transfers-from-barcelona-airport-to-tordera', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-tordera', originId: 'barcelona-el-prat-airport', dest: 'Tordera', destSlug: 'tordera', distance: 75, duration: 60, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-malgrat-de-mar', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-malgrat-de-mar', originId: 'barcelona-el-prat-airport', dest: 'Malgrat de Mar', destSlug: 'malgrat-de-mar', distance: 80, duration: 65, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-santa-susanna', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-santa-susanna', originId: 'barcelona-el-prat-airport', dest: 'Santa Susanna', destSlug: 'santa-susanna', distance: 78, duration: 60, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-pineda-de-mar', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-pineda-de-mar', originId: 'barcelona-el-prat-airport', dest: 'Pineda de Mar', destSlug: 'pineda-de-mar', distance: 75, duration: 58, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-calella', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-calella', originId: 'barcelona-el-prat-airport', dest: 'Calella', destSlug: 'calella', distance: 70, duration: 55, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-manresa', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-manresa', originId: 'barcelona-el-prat-airport', dest: 'Manresa', destSlug: 'manresa', distance: 75, duration: 60, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-calafell', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-calafell', originId: 'barcelona-el-prat-airport', dest: 'Calafell', destSlug: 'calafell', distance: 55, duration: 40, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-cubelles', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-cubelles', originId: 'barcelona-el-prat-airport', dest: 'Cubelles', destSlug: 'cubelles', distance: 50, duration: 35, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-vilanova-i-la-geltru', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-vilanova-y-la-geltru', originId: 'barcelona-el-prat-airport', dest: 'Vilanova i la Geltrú', destSlug: 'vilanova-i-la-geltru', distance: 45, duration: 35, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-mataro', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-mataro', originId: 'barcelona-el-prat-airport', dest: 'Mataró', destSlug: 'mataro', distance: 50, duration: 40, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-granollers', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-granollers', originId: 'barcelona-el-prat-airport', dest: 'Granollers', destSlug: 'granollers', distance: 45, duration: 40, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-cabrils', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-cabrils', originId: 'barcelona-el-prat-airport', dest: 'Cabrils', destSlug: 'cabrils', distance: 40, duration: 35, country: 'spain', region: 'catalonia' },
  { slug: 'transfers-from-barcelona-airport-to-palau-solita-i-plegamans', esSlug: 'traslados-desde-el-aeropuerto-de-barcelona-a-palau-solita-i-plegamans', originId: 'barcelona-el-prat-airport', dest: 'Palau-solità i Plegamans', destSlug: 'palau-solita-i-plegamans', distance: 35, duration: 35, country: 'spain', region: 'catalonia' },

  // ═══════════════════════════════════════════════════════════════════════
  // DUBAI INTERNATIONAL (DXB) ROUTES
  // ═══════════════════════════════════════════════════════════════════════
  { slug: 'transfer-dubai-international-airport-dxb-to-dubai', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-dubai', originId: 'dubai-airport-transfers', dest: 'Dubai', destSlug: 'dubai', distance: 15, duration: 20, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-dubai-international-airport-dxb-to-abu-dhabi', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-abu-dabi', originId: 'dubai-airport-transfers', dest: 'Abu Dhabi', destSlug: 'abu-dhabi', distance: 140, duration: 90, country: 'united-arab-emirates', region: 'abu-dhabi-emirate' },
  { slug: 'transfer-dubai-international-airport-dxb-to-ajman', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-ajman', originId: 'dubai-airport-transfers', dest: 'Ajman', destSlug: 'ajman', distance: 40, duration: 35, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-dubai-international-airport-dxb-to-fujairah', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-fuyaira', originId: 'dubai-airport-transfers', dest: 'Fujairah', destSlug: 'fujairah', distance: 130, duration: 90, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-dubai-international-airport-dxb-to-jebel-ali-and-motiongate', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-jebel-ali-motiongate', originId: 'dubai-airport-transfers', dest: 'Jebel Ali & Motiongate', destSlug: 'jebel-ali', distance: 50, duration: 40, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-dubai-international-airport-dxb-to-palm-jumeirah', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-palm-jumeirah', originId: 'dubai-airport-transfers', dest: 'Palm Jumeirah', destSlug: 'palm-jumeirah', distance: 35, duration: 30, country: 'united-arab-emirates', region: 'dubai-emirate' },

  // ═══════════════════════════════════════════════════════════════════════
  // ZAYED INTERNATIONAL ABU DHABI (AUH) ROUTES
  // ═══════════════════════════════════════════════════════════════════════
  { slug: 'transfer-zayed-international-airport-auh-to-abu-dhabi', esSlug: 'traslados-desde-el-aeropuerto-internacional-zayed-auh-a-abu-dabi', originId: 'abu-dhabi-airport-transfers', dest: 'Abu Dhabi', destSlug: 'abu-dhabi', distance: 30, duration: 25, country: 'united-arab-emirates', region: 'abu-dhabi-emirate' },
  { slug: 'transfer-zayed-international-airport-auh-to-abu-dhabi-2', esSlug: 'traslados-desde-el-aeropuerto-internacional-zayed-auh-a-abu-dabi-2', originId: 'abu-dhabi-airport-transfers', dest: 'Abu Dhabi Downtown', destSlug: 'abu-dhabi', distance: 35, duration: 30, country: 'united-arab-emirates', region: 'abu-dhabi-emirate' },
  { slug: 'transfer-zayed-international-airport-auh-to-ajman', esSlug: 'traslados-desde-el-aeropuerto-internacional-zayed-auh-a-ajman', originId: 'abu-dhabi-airport-transfers', dest: 'Ajman', destSlug: 'ajman', distance: 180, duration: 120, country: 'united-arab-emirates', region: 'abu-dhabi-emirate' },
  { slug: 'transfer-zayed-international-airport-auh-to-dubai', esSlug: 'traslados-desde-el-aeropuerto-internacional-zayed-auh-a-dubai', originId: 'abu-dhabi-airport-transfers', dest: 'Dubai', destSlug: 'dubai', distance: 140, duration: 90, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-zayed-international-airport-auh-to-fujairah', esSlug: 'traslados-desde-el-aeropuerto-internacional-zayed-auh-a-fujairah', originId: 'abu-dhabi-airport-transfers', dest: 'Fujairah', destSlug: 'fujairah', distance: 250, duration: 160, country: 'united-arab-emirates', region: 'abu-dhabi-emirate' },
  { slug: 'transfer-zayed-international-airport-auh-to-jebel-ali-and-motiongate', esSlug: 'traslados-desde-el-aeropuerto-internacional-zayed-auh-a-jebel-ali-y-motiongate', originId: 'abu-dhabi-airport-transfers', dest: 'Jebel Ali & Motiongate', destSlug: 'jebel-ali', distance: 100, duration: 70, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-zayed-international-airport-auh-to-palm-jumeirah', esSlug: 'traslados-desde-el-aeropuerto-internacional-zayed-auh-a-palm-jumeirah', originId: 'abu-dhabi-airport-transfers', dest: 'Palm Jumeirah', destSlug: 'palm-jumeirah', distance: 120, duration: 80, country: 'united-arab-emirates', region: 'dubai-emirate' },

  // ═══════════════════════════════════════════════════════════════════════
  // AL MAKTOUM / DUBAI WORLD CENTRAL (DWC) ROUTES
  // ═══════════════════════════════════════════════════════════════════════
  { slug: 'transfer-al-maktoum-international-airport-dwc-to-abu-dhabi', esSlug: 'traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-abu-dabi', originId: 'dubai-world-central-airport-transfers', dest: 'Abu Dhabi', destSlug: 'abu-dhabi', distance: 110, duration: 75, country: 'united-arab-emirates', region: 'abu-dhabi-emirate' },
  { slug: 'transfer-al-maktoum-international-airport-dwc-to-ajman', esSlug: 'traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-ajman', originId: 'dubai-world-central-airport-transfers', dest: 'Ajman', destSlug: 'ajman', distance: 85, duration: 65, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-al-maktoum-international-airport-dwc-to-dubai', esSlug: 'traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-dubai', originId: 'dubai-world-central-airport-transfers', dest: 'Dubai', destSlug: 'dubai', distance: 55, duration: 40, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-al-maktoum-international-airport-dwc-to-fujairah', esSlug: 'traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-fujairah', originId: 'dubai-world-central-airport-transfers', dest: 'Fujairah', destSlug: 'fujairah', distance: 170, duration: 120, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-al-maktoum-international-airport-dwc-to-jebel-ali-and-motiongate', esSlug: 'traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-jebel-ali-y-motiongate', originId: 'dubai-world-central-airport-transfers', dest: 'Jebel Ali & Motiongate', destSlug: 'jebel-ali', distance: 15, duration: 15, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-al-maktoum-international-airport-dwc-to-palm-jumeirah', esSlug: 'traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-palm-jumeirah', originId: 'dubai-world-central-airport-transfers', dest: 'Palm Jumeirah', destSlug: 'palm-jumeirah', distance: 45, duration: 35, country: 'united-arab-emirates', region: 'dubai-emirate' },

  // ═══════════════════════════════════════════════════════════════════════
  // RAS AL KHAIMAH (RKT) ROUTES
  // ═══════════════════════════════════════════════════════════════════════
  { slug: 'transfer-ras-al-khaimah-international-airport-rkt-to-abu-dhabi', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-abu-dabi', originId: 'ras-al-khaimah-airport-transfers', dest: 'Abu Dhabi', destSlug: 'abu-dhabi', distance: 220, duration: 150, country: 'united-arab-emirates', region: 'abu-dhabi-emirate' },
  { slug: 'transfer-ras-al-khaimah-international-airport-rkt-to-dubai', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-dubai', originId: 'ras-al-khaimah-airport-transfers', dest: 'Dubai', destSlug: 'dubai', distance: 100, duration: 70, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-ras-al-khaimah-international-airport-rkt-to-jebel-ali-and-motiongate', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-jebel-ali-y-motiongate', originId: 'ras-al-khaimah-airport-transfers', dest: 'Jebel Ali & Motiongate', destSlug: 'jebel-ali', distance: 130, duration: 90, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-ras-al-khaimah-international-airport-rkt-to-palm-jumeirah', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-palm-jumeirah', originId: 'ras-al-khaimah-airport-transfers', dest: 'Palm Jumeirah', destSlug: 'palm-jumeirah', distance: 110, duration: 80, country: 'united-arab-emirates', region: 'dubai-emirate' },

  // ═══════════════════════════════════════════════════════════════════════
  // SHARJAH INTERNATIONAL (SHJ) ROUTES
  // ═══════════════════════════════════════════════════════════════════════
  { slug: 'transfer-sharjah-international-airport-shj-to-abu-dhabi', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-abu-dabi', originId: 'sharjah-airport-transfers', dest: 'Abu Dhabi', destSlug: 'abu-dhabi', distance: 160, duration: 110, country: 'united-arab-emirates', region: 'abu-dhabi-emirate' },
  { slug: 'transfer-sharjah-international-airport-shj-to-ajman', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-ajman', originId: 'sharjah-airport-transfers', dest: 'Ajman', destSlug: 'ajman', distance: 15, duration: 15, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-sharjah-international-airport-shj-to-dubai', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-dubai', originId: 'sharjah-airport-transfers', dest: 'Dubai', destSlug: 'dubai', distance: 20, duration: 25, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-sharjah-international-airport-shj-to-fujairah', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-fujairah', originId: 'sharjah-airport-transfers', dest: 'Fujairah', destSlug: 'fujairah', distance: 120, duration: 80, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-sharjah-international-airport-shj-to-jebel-ali-and-motiongate', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-jebel-ali-y-motiongate', originId: 'sharjah-airport-transfers', dest: 'Jebel Ali & Motiongate', destSlug: 'jebel-ali', distance: 65, duration: 50, country: 'united-arab-emirates', region: 'dubai-emirate' },
  { slug: 'transfer-sharjah-international-airport-shj-to-palm-jumeirah', esSlug: 'traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-palm-jumeirah', originId: 'sharjah-airport-transfers', dest: 'Palm Jumeirah', destSlug: 'palm-jumeirah', distance: 40, duration: 35, country: 'united-arab-emirates', region: 'dubai-emirate' },
]

// ── Airport _id lookup (maps origin slug → Sanity airport _id) ──────────
const AIRPORT_IDS = {}

// ── Spanish names for airports ──────────────────────────────────────────
const AIRPORT_ES_NAMES = {
  'barcelona-el-prat-airport': 'Aeropuerto de Barcelona-El Prat',
  'dubai-airport-transfers': 'Aeropuerto Internacional de Dubái (DXB)',
  'abu-dhabi-airport-transfers': 'Aeropuerto Internacional Zayed (AUH)',
  'dubai-world-central-airport-transfers': 'Aeropuerto Internacional Al Maktoum (DWC)',
  'ras-al-khaimah-airport-transfers': 'Aeropuerto Internacional de Ras Al Khaimah (RKT)',
  'sharjah-airport-transfers': 'Aeropuerto Internacional de Sharjah (SHJ)',
}

// ── Spanish destination names ───────────────────────────────────────────
const DEST_ES_NAMES = {
  'barcelona': 'Barcelona',
  'sitges': 'Sitges',
  'badalona': 'Badalona',
  'castelldefels': 'Castelldefels',
  'lhospitalet-de-llobregat': "L'Hospitalet de Llobregat",
  'montcada-i-reixac': 'Montcada i Reixac',
  'ripollet': 'Ripollet',
  'sant-cugat-del-valles': 'Sant Cugat del Vallès',
  'santa-coloma-de-gramenet': 'Santa Coloma de Gramenet',
  'vallmoll': 'Vallmoll',
  'lloret-de-mar': 'Lloret de Mar',
  'tossa-de-mar': 'Tossa de Mar',
  'platja-daro': "Platja d'Aro",
  'altafulla': 'Altafulla',
  'tarragona': 'Tarragona',
  'la-pineda': 'La Pineda',
  'castellar-del-valles': 'Castellar del Vallès',
  'salou': 'Salou',
  'cambrils': 'Cambrils',
  'escaladei': 'Escaladei',
  'girona': 'Girona',
  'banyoles': 'Banyoles',
  'cadaques': 'Cadaqués',
  'andorra': 'Andorra',
  'castellon': 'Castellón',
  'tordera': 'Tordera',
  'malgrat-de-mar': 'Malgrat de Mar',
  'santa-susanna': 'Santa Susanna',
  'pineda-de-mar': 'Pineda de Mar',
  'calella': 'Calella',
  'manresa': 'Manresa',
  'calafell': 'Calafell',
  'cubelles': 'Cubelles',
  'vilanova-i-la-geltru': 'Vilanova i la Geltrú',
  'mataro': 'Mataró',
  'granollers': 'Granollers',
  'cabrils': 'Cabrils',
  'palau-solita-i-plegamans': 'Palau-solità i Plegamans',
  'dubai': 'Dubái',
  'abu-dhabi': 'Abu Dabi',
  'ajman': 'Ajmán',
  'fujairah': 'Fuyaira',
  'jebel-ali': 'Jebel Ali y Motiongate',
  'palm-jumeirah': 'Palm Jumeirah',
}

function formatDuration(min) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

function formatDurationES(min) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

async function migrate() {
  console.log('🛣️  Migrating routes...\n')

  // Build airport _id map from Sanity
  const airports = await client.fetch('*[_type=="airport"]{_id, "slug": slug.current, title}')
  for (const a of airports) {
    AIRPORT_IDS[a.slug] = a._id
  }

  // Check existing routes
  const existing = await client.fetch('*[_type=="route"]{"slug": slug.current}')
  const existingSlugs = new Set(existing.map(r => r.slug))

  let created = 0, skipped = 0, errors = 0

  for (let i = 0; i < ROUTES.length; i += 5) {
    const batch = ROUTES.slice(i, i + 5)
    await Promise.all(batch.map(async (r) => {
      if (existingSlugs.has(r.slug)) {
        console.log(`  ⏭️  ${r.slug} — exists`)
        skipped++
        return
      }

      const airportId = AIRPORT_IDS[r.originId]
      if (!airportId) {
        console.log(`  ⚠️  ${r.slug} — airport "${r.originId}" not found in Sanity`)
        errors++
        return
      }

      // Get airport title for content generation
      const airport = airports.find(a => a.slug === r.originId)
      const airportTitle = airport?.title || r.originId.replace(/-/g, ' ')
      const airportEsTitle = AIRPORT_ES_NAMES[r.originId] || airportTitle
      const destEsName = DEST_ES_NAMES[r.destSlug] || r.dest

      process.stdout.write(`  🛣️  ${r.slug}...`)

      const routeId = `route-${r.slug}`
      const enTitle = `Transfer from ${airportTitle} to ${r.dest}`
      const esTitle = `Transfer de ${airportEsTitle} a ${destEsName}`

      const contentDataEN = {
        origin: airportTitle,
        destination: r.dest,
        distance: r.distance,
        duration: formatDuration(r.duration),
        originCity: r.dest === 'Barcelona' ? '' : 'Barcelona',
      }

      const contentDataES = {
        origin: airportTitle,
        esOrigin: airportEsTitle,
        destination: r.dest,
        esDestination: destEsName,
        distance: r.distance,
        duration: formatDurationES(r.duration),
        originCity: r.dest === 'Barcelona' ? '' : 'Barcelona',
      }

      const doc = {
        _id: routeId,
        _type: 'route',
        title: enTitle,
        slug: { _type: 'slug', current: r.slug },
        origin: { _type: 'reference', _ref: airportId },
        originType: 'airport',
        destination: { _type: 'reference', _ref: `city-${r.destSlug}` },
        country: { _type: 'reference', _ref: `country-${r.country}` },
        ...(r.region && { region: { _type: 'reference', _ref: `region-${r.region}` } }),
        distance: r.distance,
        estimatedDuration: r.duration,
        description: generateRouteEN(contentDataEN),
        seoTitle: seoTitle('route', `${airportTitle} to ${r.dest}`, 'en'),
        seoDescription: seoDesc('route', `from ${airportTitle} to ${r.dest}`, 'en'),
        translations: {
          es: {
            title: esTitle,
            slug: { _type: 'slug', current: r.esSlug },
            description: generateRouteES(contentDataES),
            seoTitle: seoTitle('route', `${airportEsTitle} a ${destEsName}`, 'es'),
            seoDescription: seoDesc('route', `de ${airportEsTitle} a ${destEsName}`, 'es'),
          },
        },
      }

      try {
        await client.createOrReplace(doc)
        created++
        console.log(' ✅')
      } catch (err) {
        errors++
        console.log(` ❌ ${err.message}`)
      }
    }))
    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ Created: ${created} | ⏭️ Skipped: ${skipped} | ❌ Errors: ${errors}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

migrate().catch(console.error)
