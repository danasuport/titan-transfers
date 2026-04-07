import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  trailingSlash: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    // Old URL structure → new keyword-rich URLs (wildcard)
    const urlUpgradeRedirects = [
      { source: '/airport/:slug/:routeSlug/', destination: '/airport-transfers-private-taxi/:slug/:routeSlug/', permanent: true },
      { source: '/airport/:slug/', destination: '/airport-transfers-private-taxi/:slug/', permanent: true },
      { source: '/airport-transfers/:slug/:routeSlug/', destination: '/airport-transfers-private-taxi/:slug/:routeSlug/', permanent: true },
      { source: '/airport-transfers/:slug/', destination: '/airport-transfers-private-taxi/:slug/', permanent: true },
      { source: '/es/aeropuerto/:slug/:routeSlug/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/:routeSlug/', permanent: true },
      { source: '/es/aeropuerto/:slug/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/', permanent: true },
      { source: '/es/traslado-aeropuerto/:slug/:routeSlug/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/:routeSlug/', permanent: true },
      { source: '/es/traslado-aeropuerto/:slug/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/', permanent: true },
      // Specific slug cleanup redirects
      { source: '/airport-transfers-private-taxi/barcelona-el-prat/', destination: '/airport-transfers-private-taxi/barcelona/', permanent: true },
      { source: '/airport-transfers-private-taxi/dallas-fort-worth/', destination: '/airport-transfers-private-taxi/dallas/', permanent: true },
      { source: '/airport-transfers-private-taxi/girona-costa-brava/', destination: '/airport-transfers-private-taxi/girona/', permanent: true },
      { source: '/airport-transfers-private-taxi/los-angeles-lax/', destination: '/airport-transfers-private-taxi/los-angeles/', permanent: true },
      { source: '/airport-transfers-private-taxi/marrakesh/', destination: '/airport-transfers-private-taxi/marrakech/', permanent: true },
      { source: '/airport-transfers-private-taxi/prague-airport-prg/', destination: '/airport-transfers-private-taxi/prague/', permanent: true },
      { source: '/es/traslados-aeropuerto-privados-taxi/abu-dabi/', destination: '/es/traslados-aeropuerto-privados-taxi/abu-dhabi/', permanent: true },
      { source: '/es/traslados-aeropuerto-privados-taxi/traslados-aeropuerto-barcelona-transfer-privado-taxi/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/', permanent: true },
      { source: '/es/traslados-aeropuerto-privados-taxi/aeropuerto-girona-costa-brava/', destination: '/es/traslados-aeropuerto-privados-taxi/girona/', permanent: true },
      { source: '/es/traslados-aeropuerto-privados-taxi/traslados-aeropuerto-ciudad-de-mexico/', destination: '/es/traslados-aeropuerto-privados-taxi/ciudad-de-mexico/', permanent: true },
      { source: '/es/traslados-aeropuerto-privados-taxi/aeropuerto-reus/', destination: '/es/traslados-aeropuerto-privados-taxi/reus/', permanent: true },
      { source: '/es/traslados-aeropuerto-privados-taxi/tanger/', destination: '/es/traslados-aeropuerto-privados-taxi/tangier/', permanent: true },
      { source: '/city/:slug/', destination: '/private-transfers/:slug/', permanent: true },
      { source: '/es/ciudad/:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },
      { source: '/country/:slug/', destination: '/private-transfers-country/:slug/', permanent: true },
      { source: '/es/pais/:slug/', destination: '/es/traslados-privados-pais/:slug/', permanent: true },
      { source: '/region/:slug/', destination: '/private-transfers-region/:slug/', permanent: true },
      { source: '/es/region/:slug/', destination: '/es/traslados-privados-region/:slug/', permanent: true },
      // Remove type segment from private-transfers URLs
      { source: '/private-transfers/city/:slug/', destination: '/private-transfers/:slug/', permanent: true },
      { source: '/private-transfers/country/:slug/', destination: '/private-transfers-country/:slug/', permanent: true },
      { source: '/private-transfers/region/:slug/', destination: '/private-transfers-region/:slug/', permanent: true },
      { source: '/es/traslados-privados-taxi/ciudad/:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },
      { source: '/es/traslados-privados-taxi/pais/:slug/', destination: '/es/traslados-privados-pais/:slug/', permanent: true },
      { source: '/es/traslados-privados-taxi/region/:slug/', destination: '/es/traslados-privados-region/:slug/', permanent: true },

      // ── Old WordPress/Yoast city URLs (/cities/private-transfers-[slug]/) ──
      // Specific overrides first (edge cases where prefix removal gives wrong slug)
      { source: '/cities/private-transfers-in-faro-the-algarve/', destination: '/private-transfers/faro/', permanent: true },
      { source: '/cities/private-transfers-in-cancun-and-the-riviera-maya/', destination: '/private-transfers/cancun/', permanent: true },
      { source: '/es/ciudades/traslados-privados-faro-y-algarve/', destination: '/es/traslados-privados-taxi/faro/', permanent: true },
      { source: '/es/ciudades/traslados-privados-cancun-and-the-riviera-maya/', destination: '/es/traslados-privados-taxi/cancun/', permanent: true },
      { source: '/es/ciudades/traslados-privados-atenas/', destination: '/es/traslados-privados-taxi/athens/', permanent: true },
      { source: '/es/ciudades/traslados-privados-lisboa/', destination: '/es/traslados-privados-taxi/lisbon/', permanent: true },
      { source: '/es/ciudades/traslados-privados-londres/', destination: '/es/traslados-privados-taxi/london/', permanent: true },
      { source: '/es/ciudades/traslados-privados-roma/', destination: '/es/traslados-privados-taxi/rome/', permanent: true },
      { source: '/es/ciudades/traslados-privados-paris/', destination: '/es/traslados-privados-taxi/paris/', permanent: true },
      { source: '/es/ciudades/traslados-privados-nueva-york/', destination: '/es/traslados-privados-taxi/new-york/', permanent: true },
      { source: '/es/ciudades/traslados-privados-las-vegas/', destination: '/es/traslados-privados-taxi/las-vegas/', permanent: true },
      // Wildcard fallback — strips "private-transfers-" prefix (works for most slugs)
      { source: '/cities/private-transfers-:slug/', destination: '/private-transfers/:slug/', permanent: true },
      { source: '/es/ciudades/traslados-privados-:slug/', destination: '/es/traslados-privados-taxi/:slug/', permanent: true },

      // ── Old WordPress/Yoast country URLs (/countries/private-transfers-[slug]/) ──
      { source: '/es/paises/traslados-privados-en-espana/', destination: '/es/traslados-privados-pais/spain/', permanent: true },
      { source: '/es/paises/traslados-privados-en-francia/', destination: '/es/traslados-privados-pais/france/', permanent: true },
      { source: '/es/paises/traslados-privados-en-paises-bajos/', destination: '/es/traslados-privados-pais/netherlands/', permanent: true },
      { source: '/es/paises/traslados-privados-italia/', destination: '/es/traslados-privados-pais/italy/', permanent: true },
      { source: '/es/paises/traslados-privados-estados-unidos/', destination: '/es/traslados-privados-pais/united-states/', permanent: true },
      { source: '/es/paises/traslados-privados-reino-unido/', destination: '/es/traslados-privados-pais/united-kingdom/', permanent: true },
      { source: '/es/paises/traslados-privados-turquia/', destination: '/es/traslados-privados-pais/turkey/', permanent: true },
      { source: '/es/paises/traslados-privados-portugal/', destination: '/es/traslados-privados-pais/portugal/', permanent: true },
      { source: '/es/paises/traslados-privados-mexico/', destination: '/es/traslados-privados-pais/mexico/', permanent: true },
      { source: '/es/paises/traslados-privados-emirates-arabes-unidos/', destination: '/es/traslados-privados-pais/united-arab-emirates/', permanent: true },
      { source: '/countries/private-transfers-:slug/', destination: '/private-transfers-country/:slug/', permanent: true },
      { source: '/es/paises/', destination: '/es/paises/', permanent: true },
      { source: '/countries/', destination: '/countries/', permanent: true },

      // ── Old WordPress listing pages ──
      { source: '/cities/', destination: '/private-transfers/', permanent: true },
      { source: '/es/ciudades/', destination: '/es/traslados-privados-taxi/', permanent: true },
      { source: '/airports/', destination: '/airport-transfers-private-taxi/', permanent: true },
      { source: '/es/aeropuertos/', destination: '/es/traslados-aeropuerto-privados-taxi/', permanent: true },
      { source: '/es/traslados-aeropuerto-america/', destination: '/es/traslados-aeropuerto-privados-taxi/', permanent: true },

      // ── Old WordPress airport detail pages (/airports/[slug]/) ──
      { source: '/airports/:slug/', destination: '/airport-transfers-private-taxi/:slug/', permanent: true },

      // ── Old WordPress category airport pages ──
      { source: '/es/aeropuertos/:slug/:routeSlug/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/:routeSlug/', permanent: true },
      { source: '/es/aeropuertos/:slug/', destination: '/es/traslados-aeropuerto-privados-taxi/:slug/', permanent: true },

      // ── Old route pages (/rutas/[slug]/) → airport listing (can't map without slug lookup) ──
      { source: '/rutas/:slug/', destination: '/airport-transfers-private-taxi/', permanent: true },
      { source: '/es/rutas/:slug/', destination: '/es/traslados-aeropuerto-privados-taxi/', permanent: true },
      { source: '/rutas/', destination: '/airport-transfers-private-taxi/', permanent: true },
      { source: '/es/rutas/', destination: '/es/traslados-aeropuerto-privados-taxi/', permanent: true },

      // ── Old landing pages ──
      { source: '/landing-aeropuertos-barcelona/', destination: '/airport-transfers-private-taxi/barcelona/', permanent: true },

      // ── /rutas/ old WordPress route redirects ──
      { source: '/rutas/transfers-from-barcelona-airport-to-badalona/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-badalona/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-castelldefels/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-castelldefels/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-lhospitalet-de-llobregat/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-lhospitalet-de-llobregat/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-montcada-i-reixac/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-montcada-i-reixac/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-ripollet/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-ripollet/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-sant-cugat-del-valles/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-sant-cugat-del-valles/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-vallmoll/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-vallmoll/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-lloret-de-mar/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-lloret-de-mar/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-tossa-de-mar/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-tossa-de-mar/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-platja-daro/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-platja-daro/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-altafulla/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-altafulla/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-tarragona/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-tarragona/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-la-pineda/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-la-pineda/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-castellar-del-valles/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-castellar-del-valles/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-salou/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-salou/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-cambrils/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-cambrils/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-escaladei/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-escaladei/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-girona/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-girona/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-banyoles/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-banyoles/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-cadaques/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-cadaques/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-andorra/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-andorra/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-castellon/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-castellon/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-santa-coloma-de-gramenet/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-santa-coloma-de-gramenet/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-tordera/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-tordera/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-malgrat-de-mar/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-malgrat-de-mar/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-santa-susanna/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-santa-susanna/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-pineda-de-mar/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-pineda-de-mar/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-calella/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-calella/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-manresa/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-manresa/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-calafell/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-calafell/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-cubelles/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-cubelles/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-vilanova-i-la-geltru/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-vilanova-i-la-geltru/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-mataro/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-mataro/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-granollers/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-granollers/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-cabrils/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-cabrils/', permanent: true },
      { source: '/rutas/transfers-from-barcelona-airport-to-palau-solita-i-plegamans/', destination: '/airport-transfers-private-taxi/barcelona/transfers-from-barcelona-airport-to-palau-solita-i-plegamans/', permanent: true },
      { source: '/rutas/transfer-dubai-international-airport-dxb-to-dubai/', destination: '/airport-transfers-private-taxi/dubai/transfer-dubai-international-airport-dxb-to-dubai/', permanent: true },
      { source: '/rutas/transfer-dubai-international-airport-dxb-to-abu-dhabi/', destination: '/airport-transfers-private-taxi/dubai/transfer-dubai-international-airport-dxb-to-abu-dhabi/', permanent: true },
      { source: '/rutas/transfer-zayed-international-airport-auh-to-abu-dhabi/', destination: '/airport-transfers-private-taxi/abu-dhabi/transfer-zayed-international-airport-auh-to-abu-dhabi/', permanent: true },
      { source: '/rutas/transfer-zayed-international-airport-auh-to-abu-dhabi-2/', destination: '/airport-transfers-private-taxi/abu-dhabi/transfer-zayed-international-airport-auh-to-abu-dhabi-2/', permanent: true },
      { source: '/rutas/transfer-zayed-international-airport-auh-to-ajman/', destination: '/airport-transfers-private-taxi/abu-dhabi/transfer-zayed-international-airport-auh-to-ajman/', permanent: true },
      { source: '/rutas/transfer-zayed-international-airport-auh-to-dubai/', destination: '/airport-transfers-private-taxi/abu-dhabi/transfer-zayed-international-airport-auh-to-dubai/', permanent: true },
      { source: '/rutas/transfer-zayed-international-airport-auh-to-fujairah/', destination: '/airport-transfers-private-taxi/abu-dhabi/transfer-zayed-international-airport-auh-to-fujairah/', permanent: true },
      { source: '/rutas/transfer-zayed-international-airport-auh-to-jebel-ali-and-motiongate/', destination: '/airport-transfers-private-taxi/abu-dhabi/transfer-zayed-international-airport-auh-to-jebel-ali-and-motiongate/', permanent: true },
      { source: '/rutas/transfer-zayed-international-airport-auh-to-palm-jumeirah/', destination: '/airport-transfers-private-taxi/abu-dhabi/transfer-zayed-international-airport-auh-to-palm-jumeirah/', permanent: true },
      { source: '/rutas/transfer-al-maktoum-international-airport-dwc-to-abu-dhabi/', destination: '/airport-transfers-private-taxi/dubai-world-central/transfer-al-maktoum-international-airport-dwc-to-abu-dhabi/', permanent: true },
      { source: '/rutas/transfer-al-maktoum-international-airport-dwc-to-ajman/', destination: '/airport-transfers-private-taxi/dubai-world-central/transfer-al-maktoum-international-airport-dwc-to-ajman/', permanent: true },
      { source: '/rutas/transfer-al-maktoum-international-airport-dwc-to-dubai/', destination: '/airport-transfers-private-taxi/dubai-world-central/transfer-al-maktoum-international-airport-dwc-to-dubai/', permanent: true },
      { source: '/rutas/transfer-al-maktoum-international-airport-dwc-to-fujairah/', destination: '/airport-transfers-private-taxi/dubai-world-central/transfer-al-maktoum-international-airport-dwc-to-fujairah/', permanent: true },
      { source: '/rutas/transfer-al-maktoum-international-airport-dwc-to-jebel-ali-and-motiongate/', destination: '/airport-transfers-private-taxi/dubai-world-central/transfer-al-maktoum-international-airport-dwc-to-jebel-ali-and-motiongate/', permanent: true },
      { source: '/rutas/transfer-al-maktoum-international-airport-dwc-to-palm-jumeirah/', destination: '/airport-transfers-private-taxi/dubai-world-central/transfer-al-maktoum-international-airport-dwc-to-palm-jumeirah/', permanent: true },
      { source: '/rutas/transfer-dubai-international-airport-dxb-to-ajman/', destination: '/airport-transfers-private-taxi/dubai/transfer-dubai-international-airport-dxb-to-ajman/', permanent: true },
      { source: '/rutas/transfer-dubai-international-airport-dxb-to-fujairah/', destination: '/airport-transfers-private-taxi/dubai/transfer-dubai-international-airport-dxb-to-fujairah/', permanent: true },
      { source: '/rutas/transfer-dubai-international-airport-dxb-to-jebel-ali-and-motiongate/', destination: '/airport-transfers-private-taxi/dubai/transfer-dubai-international-airport-dxb-to-jebel-ali-and-motiongate/', permanent: true },
      { source: '/rutas/transfer-dubai-international-airport-dxb-to-palm-jumeirah/', destination: '/airport-transfers-private-taxi/dubai/transfer-dubai-international-airport-dxb-to-palm-jumeirah/', permanent: true },
      { source: '/rutas/transfer-ras-al-khaimah-international-airport-rkt-to-abu-dhabi/', destination: '/airport-transfers-private-taxi/ras-al-khaimah/transfer-ras-al-khaimah-international-airport-rkt-to-abu-dhabi/', permanent: true },
      { source: '/rutas/transfer-ras-al-khaimah-international-airport-rkt-to-dubai/', destination: '/airport-transfers-private-taxi/ras-al-khaimah/transfer-ras-al-khaimah-international-airport-rkt-to-dubai/', permanent: true },
      { source: '/rutas/transfer-ras-al-khaimah-international-airport-rkt-to-jebel-ali-and-motiongate/', destination: '/airport-transfers-private-taxi/ras-al-khaimah/transfer-ras-al-khaimah-international-airport-rkt-to-jebel-ali-and-motiongate/', permanent: true },
      { source: '/rutas/transfer-ras-al-khaimah-international-airport-rkt-to-palm-jumeirah/', destination: '/airport-transfers-private-taxi/ras-al-khaimah/transfer-ras-al-khaimah-international-airport-rkt-to-palm-jumeirah/', permanent: true },
      { source: '/rutas/transfer-sharjah-international-airport-shj-to-abu-dhabi/', destination: '/airport-transfers-private-taxi/sharjah/transfer-sharjah-international-airport-shj-to-abu-dhabi/', permanent: true },
      { source: '/rutas/transfer-sharjah-international-airport-shj-to-ajman/', destination: '/airport-transfers-private-taxi/sharjah/transfer-sharjah-international-airport-shj-to-ajman/', permanent: true },
      { source: '/rutas/transfer-sharjah-international-airport-shj-to-dubai/', destination: '/airport-transfers-private-taxi/sharjah/transfer-sharjah-international-airport-shj-to-dubai/', permanent: true },
      { source: '/rutas/transfer-sharjah-international-airport-shj-to-fujairah/', destination: '/airport-transfers-private-taxi/sharjah/transfer-sharjah-international-airport-shj-to-fujairah/', permanent: true },
      { source: '/rutas/transfer-sharjah-international-airport-shj-to-jebel-ali-and-motiongate/', destination: '/airport-transfers-private-taxi/sharjah/transfer-sharjah-international-airport-shj-to-jebel-ali-and-motiongate/', permanent: true },
      { source: '/rutas/transfer-sharjah-international-airport-shj-to-palm-jumeirah/', destination: '/airport-transfers-private-taxi/sharjah/transfer-sharjah-international-airport-shj-to-palm-jumeirah/', permanent: true },
      { source: '/rutas/transfer-sharjah-international-airport-shj-to-sharjah/', destination: '/airport-transfers-private-taxi/sharjah/transfer-sharjah-international-airport-shj-to-sharjah/', permanent: true },
      { source: '/rutas/transfer-cancun-international-airport-cun-to-akumal/', destination: '/airport-transfers-private-taxi/cancun/transfer-cancun-international-airport-cun-to-akumal/', permanent: true },
      { source: '/rutas/transfer-cancun-international-airport-cun-to-cancun/', destination: '/airport-transfers-private-taxi/cancun/transfer-cancun-international-airport-cun-to-cancun/', permanent: true },
      { source: '/rutas/transfer-cancun-international-airport-cun-to-chiquila/', destination: '/airport-transfers-private-taxi/cancun/transfer-cancun-international-airport-cun-to-chiquila/', permanent: true },
      { source: '/rutas/transfer-cancun-international-airport-cun-to-costa-mujeres/', destination: '/airport-transfers-private-taxi/cancun/transfer-cancun-international-airport-cun-to-costa-mujeres/', permanent: true },
      { source: '/rutas/transfer-cancun-international-airport-cun-to-playa-del-carmen/', destination: '/airport-transfers-private-taxi/cancun/transfer-cancun-international-airport-cun-to-playa-del-carmen/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-sitges/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-sitges/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-barcelona/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-barcelona/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-castelldefels/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-castelldefels/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-montcada-i-reixac/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-montcada-i-reixac/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-ripollet/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-ripollet/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-sant-cugat-del-valles/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-sant-cugat-del-valles/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-santa-coloma-de-gramenet/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-santa-coloma-de-gramenet/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-vallmoll/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-vallmoll/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-lloret-de-mar/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-lloret-de-mar/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-tossa-de-mar/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-tossa-de-mar/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-platja-daro/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-platja-daro/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-altafulla/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-altafulla/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-la-pineda/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-la-pineda/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-castellar-del-valles/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-castellar-del-valles/', permanent: true },
      { source: '/es/rutas/transbordos-desde-el-aeropuerto-de-barcelona-a-salou/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/transbordos-desde-el-aeropuerto-de-barcelona-a-salou/', permanent: true },
      { source: '/es/rutas/transbordos-desde-el-aeropuerto-de-barcelona-a-cambrils/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/transbordos-desde-el-aeropuerto-de-barcelona-a-cambrils/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-escaladei/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-escaladei/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-girona/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-girona/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-banyoles/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-banyoles/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-cadaques/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-cadaques/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-andorra/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-andorra/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-castellon/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-castellon/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-tordera/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-tordera/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-malgrat-de-mar/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-malgrat-de-mar/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-santa-susanna/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-santa-susanna/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-pineda-de-mar/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-pineda-de-mar/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-calella/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-calella/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-manresa/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-manresa/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-calafell/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-calafell/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-cubelles/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-cubelles/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-vilanova-y-la-geltru/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-vilanova-y-la-geltru/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-tarragona/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-tarragona/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-badalona/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-badalona/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-lhospitalet-de-llobregat/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-lhospitalet-de-llobregat/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-granollers/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-granollers/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-mataro/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-mataro/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-cabrils/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-cabrils/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-de-barcelona-a-palau-solita-i-plegamans/', destination: '/es/traslados-aeropuerto-privados-taxi/barcelona/traslados-desde-el-aeropuerto-de-barcelona-a-palau-solita-i-plegamans/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-dubai/', destination: '/es/traslados-aeropuerto-privados-taxi/dubai/traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-dubai/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-zayed-auh-a-abu-dabi/', destination: '/es/traslados-aeropuerto-privados-taxi/abu-dhabi/traslados-desde-el-aeropuerto-internacional-zayed-auh-a-abu-dabi/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-zayed-auh-a-abu-dabi-2/', destination: '/es/traslados-aeropuerto-privados-taxi/abu-dhabi/traslados-desde-el-aeropuerto-internacional-zayed-auh-a-abu-dabi-2/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-zayed-auh-a-ajman/', destination: '/es/traslados-aeropuerto-privados-taxi/abu-dhabi/traslados-desde-el-aeropuerto-internacional-zayed-auh-a-ajman/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-zayed-auh-a-dubai/', destination: '/es/traslados-aeropuerto-privados-taxi/abu-dhabi/traslados-desde-el-aeropuerto-internacional-zayed-auh-a-dubai/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-zayed-auh-a-fujairah/', destination: '/es/traslados-aeropuerto-privados-taxi/abu-dhabi/traslados-desde-el-aeropuerto-internacional-zayed-auh-a-fujairah/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-zayed-auh-a-jebel-ali-y-motiongate/', destination: '/es/traslados-aeropuerto-privados-taxi/abu-dhabi/traslados-desde-el-aeropuerto-internacional-zayed-auh-a-jebel-ali-y-motiongate/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-zayed-auh-a-palm-jumeirah/', destination: '/es/traslados-aeropuerto-privados-taxi/abu-dhabi/traslados-desde-el-aeropuerto-internacional-zayed-auh-a-palm-jumeirah/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-abu-dabi/', destination: '/es/traslados-aeropuerto-privados-taxi/dubai-world-central/traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-abu-dabi/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-ajman/', destination: '/es/traslados-aeropuerto-privados-taxi/dubai-world-central/traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-ajman/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-dubai/', destination: '/es/traslados-aeropuerto-privados-taxi/dubai-world-central/traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-dubai/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-fujairah/', destination: '/es/traslados-aeropuerto-privados-taxi/dubai-world-central/traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-fujairah/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-jebel-ali-y-motiongate/', destination: '/es/traslados-aeropuerto-privados-taxi/dubai-world-central/traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-jebel-ali-y-motiongate/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-palm-jumeirah/', destination: '/es/traslados-aeropuerto-privados-taxi/dubai-world-central/traslados-desde-el-aeropuerto-internacional-al-maktoum-dwc-a-palm-jumeirah/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-ajman/', destination: '/es/traslados-aeropuerto-privados-taxi/dubai/traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-ajman/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-fuyaira/', destination: '/es/traslados-aeropuerto-privados-taxi/dubai/traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-fuyaira/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-jebel-ali-motiongate/', destination: '/es/traslados-aeropuerto-privados-taxi/dubai/traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-jebel-ali-motiongate/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-palm-jumeirah/', destination: '/es/traslados-aeropuerto-privados-taxi/dubai/traslados-desde-el-aeropuerto-internacional-de-dubai-dxb-a-palm-jumeirah/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-abu-dabi/', destination: '/es/traslados-aeropuerto-privados-taxi/ras-al-khaimah/traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-abu-dabi/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-dubai/', destination: '/es/traslados-aeropuerto-privados-taxi/ras-al-khaimah/traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-dubai/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-jebel-ali-y-motiongate/', destination: '/es/traslados-aeropuerto-privados-taxi/ras-al-khaimah/traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-jebel-ali-y-motiongate/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-palm-jumeirah/', destination: '/es/traslados-aeropuerto-privados-taxi/ras-al-khaimah/traslados-desde-el-aeropuerto-internacional-de-ras-al-khaimah-rkt-a-palm-jumeirah/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-abu-dabi/', destination: '/es/traslados-aeropuerto-privados-taxi/sharjah/traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-abu-dabi/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-ajman/', destination: '/es/traslados-aeropuerto-privados-taxi/sharjah/traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-ajman/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-dubai/', destination: '/es/traslados-aeropuerto-privados-taxi/sharjah/traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-dubai/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-fujairah/', destination: '/es/traslados-aeropuerto-privados-taxi/sharjah/traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-fujairah/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-jebel-ali-y-motiongate/', destination: '/es/traslados-aeropuerto-privados-taxi/sharjah/traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-jebel-ali-y-motiongate/', permanent: true },
      { source: '/es/rutas/traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-palm-jumeirah/', destination: '/es/traslados-aeropuerto-privados-taxi/sharjah/traslados-desde-el-aeropuerto-internacional-de-sharjah-shj-a-palm-jumeirah/', permanent: true },

      // ── Old auth/booking URLs from WordPress ──
      { source: '/es/booking/', destination: '/es/reserva/', permanent: true },
      { source: '/es/iniciar-sesion/', destination: '/es/acceso/', permanent: true },
      { source: '/contact-us/', destination: '/contact/', permanent: true },
      { source: '/es/contacta-con-nosotros/', destination: '/es/contacto/', permanent: true },
    ]

    // Per-airport slug redirects: old slug (with -airport-transfers suffix) → clean slug
    let airportSlugRedirects: { source: string; destination: string; permanent: boolean }[] = []
    try {
      const { createClient } = await import('@sanity/client')
      const sanity = createClient({ projectId: '6iu2za90', dataset: 'production', apiVersion: '2024-01-01', useCdn: false })
      const airports: { slug: string; esSlug: string | null }[] = await sanity.fetch(
        `*[_type == "airport"]{ "slug": slug.current, "esSlug": translations.es.slug.current }`
      )
      airportSlugRedirects = airports.flatMap(({ slug, esSlug }) => {
        const entries: { source: string; destination: string; permanent: boolean }[] = []
        if (slug) {
          // old slug had -airport-transfers or -airport suffix
          entries.push({ source: `/airport-transfers-private-taxi/${slug}-airport-transfers/`, destination: `/airport-transfers-private-taxi/${slug}/`, permanent: true })
          entries.push({ source: `/airport-transfers-private-taxi/${slug}-airport/`, destination: `/airport-transfers-private-taxi/${slug}/`, permanent: true })
        }
        if (esSlug) {
          entries.push({ source: `/es/traslados-aeropuerto-privados-taxi/${esSlug}-traslados-al-aeropuerto/`, destination: `/es/traslados-aeropuerto-privados-taxi/${esSlug}/`, permanent: true })
          entries.push({ source: `/es/traslados-aeropuerto-privados-taxi/${esSlug}-aeropuerto/`, destination: `/es/traslados-aeropuerto-privados-taxi/${esSlug}/`, permanent: true })
        }
        return entries
      })
    } catch {
      // Sanity unavailable at build time — skip dynamic redirects
    }

    return [...urlUpgradeRedirects, ...airportSlugRedirects]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)\\.(jpg|jpeg|png|webp|avif|svg|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
