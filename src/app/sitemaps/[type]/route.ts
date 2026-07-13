import { sanityClient } from '@/lib/sanity/client'
import {
  sitemapAirportsQuery,
  sitemapRoutesQuery,
  sitemapCitiesQuery,
  sitemapCountriesQuery,
  sitemapRegionsQuery,
  sitemapServicesQuery,
  sitemapBlogPostsQuery,
} from '@/lib/sanity/queries'

export const revalidate = 3600

function xml(urls: { loc: string; lastmod?: string; changefreq?: string; priority?: string; alternates?: { en: string; es: string; it?: string; ar?: string; de?: string } }[]) {
  const urlset = urls.map(u => `
  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ''}
    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}
    ${u.priority ? `<priority>${u.priority}</priority>` : ''}
    ${u.alternates ? `
    <xhtml:link rel="alternate" hreflang="en" href="${u.alternates.en}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${u.alternates.es}"/>${u.alternates.ar ? `
    <xhtml:link rel="alternate" hreflang="ar" href="${u.alternates.ar}"/>` : ''}${u.alternates.it ? `
    <xhtml:link rel="alternate" hreflang="it" href="${u.alternates.it}"/>` : ''}${u.alternates.de ? `
    <xhtml:link rel="alternate" hreflang="de" href="${u.alternates.de}"/>` : ''}
    <xhtml:link rel="alternate" hreflang="x-default" href="${u.alternates.en}"/>` : ''}
  </url>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlset}
</urlset>`
}

export async function GET(_req: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://titantransfers.com'

  let body = ''

  if (type === 'pages.xml') {
    const staticPages = [
      { path: '/', espath: '/es/', arpath: '/ar/', itpath: '/it/', depath: '/de/', freq: 'daily', priority: '1.0' },
      { path: '/airport-transfers-private-taxi/', espath: '/es/traslados-aeropuerto-privados-taxi/', arpath: '/ar/nakl-mataar/', itpath: '/it/trasferimenti-aeroporto-taxi-privato/', depath: '/de/flughafentransfer-privat-taxi/', freq: 'weekly', priority: '0.9' },
      { path: '/private-transfers/', espath: '/es/traslados-privados-taxi/', arpath: '/ar/nakl-khass/', itpath: '/it/trasferimenti-privati-taxi/', depath: '/de/private-transfers-taxi/', freq: 'weekly', priority: '0.9' },
      { path: '/regions/', espath: '/es/regiones/', arpath: '/ar/manatik/', itpath: '/it/regioni/', depath: '/de/regionen/', freq: 'weekly', priority: '0.8' },
      { path: '/services/', espath: '/es/servicios/', arpath: '/ar/khadamat/', itpath: '/it/servizi/', depath: '/de/dienstleistungen/', freq: 'weekly', priority: '0.8' },
      { path: '/blog/', espath: '/es/blog/', arpath: '/ar/mudawana/', itpath: '/it/blog/', depath: '/de/blog/', freq: 'daily', priority: '0.8' },
      { path: '/booking/', espath: '/es/reserva/', arpath: '/ar/hajz/', itpath: '/it/prenotazione/', depath: '/de/buchung/', freq: 'monthly', priority: '0.9' },
      { path: '/contact/', espath: '/es/contacto/', arpath: '/ar/tawasul/', itpath: '/it/contatto/', depath: '/de/kontakt/', freq: 'monthly', priority: '0.6' },
      { path: '/about/', espath: '/es/sobre-nosotros/', arpath: '/ar/man-nahnu/', itpath: '/it/chi-siamo/', depath: '/de/ueber-uns/', freq: 'monthly', priority: '0.6' },
      { path: '/faq/', espath: '/es/preguntas-frecuentes/', arpath: '/ar/asila-shaaia/', itpath: '/it/domande-frequenti/', depath: '/de/haeufige-fragen/', freq: 'monthly', priority: '0.7' },
      { path: '/web-sitemap/', espath: '/es/mapa-del-sitio/', arpath: '/ar/kharitat-mawqaa/', itpath: '/it/mappa-del-sito/', depath: '/de/webseiten-uebersicht/', freq: 'monthly', priority: '0.5' },
      { path: '/privacy-policy/', espath: '/es/politica-de-privacidad/', arpath: '/ar/siyasat-khususiya/', itpath: '/it/informativa-privacy/', depath: '/de/datenschutz/', freq: 'yearly', priority: '0.3' },
      { path: '/terms-and-conditions/', espath: '/es/terminos-y-condiciones/', arpath: '/ar/shurut-wa-ahkam/', itpath: '/it/termini-e-condizioni/', depath: '/de/agb/', freq: 'yearly', priority: '0.3' },
      { path: '/cookie-policy/', espath: '/es/politica-de-cookies/', arpath: '/ar/siyasat-cookies/', itpath: '/it/informativa-cookie/', depath: '/de/cookie-richtlinie/', freq: 'yearly', priority: '0.3' },
      { path: '/legal-notice/', espath: '/es/aviso-legal/', arpath: '/ar/ishaar-kanuni/', itpath: '/it/note-legali/', depath: '/de/impressum/', freq: 'yearly', priority: '0.3' },
    ]
    body = xml(staticPages.map(p => ({
      loc: `${SITE_URL}${p.path}`,
      changefreq: p.freq,
      priority: p.priority,
      alternates: { en: `${SITE_URL}${p.path}`, es: `${SITE_URL}${p.espath}`, ar: `${SITE_URL}${p.arpath}`, it: `${SITE_URL}${p.itpath}`, de: `${SITE_URL}${p.depath}` },
    })))
  }

  else if (type === 'airports.xml') {
    const airports = await sanityClient.fetch(sitemapAirportsQuery).catch(() => [])
    body = xml(airports.map((a: any) => {
      const esSlug = a.translations?.es?.slug?.current || a.slug.current
      const arSlug = a.translations?.ar?.slug?.current || a.slug.current
      const itSlug = a.translations?.it?.slug?.current || a.slug.current
      const deSlug = a.translations?.de?.slug?.current || a.slug.current
      return {
        loc: `${SITE_URL}/airport-transfers-private-taxi/${a.slug.current}/`,
        lastmod: a._updatedAt,
        changefreq: 'weekly',
        priority: '0.9',
        alternates: {
          en: `${SITE_URL}/airport-transfers-private-taxi/${a.slug.current}/`,
          es: `${SITE_URL}/es/traslados-aeropuerto-privados-taxi/${esSlug}/`,
          ar: `${SITE_URL}/ar/nakl-mataar/${arSlug}/`,
          it: `${SITE_URL}/it/trasferimenti-aeroporto-taxi-privato/${itSlug}/`,
          de: `${SITE_URL}/de/flughafentransfer-privat-taxi/${deSlug}/`,
        },
      }
    }))
  }

  else if (type === 'routes.xml') {
    const routes = await sanityClient.fetch(sitemapRoutesQuery).catch(() => [])
    body = xml(routes.filter((r: any) => r.origin?.slug?.current).map((r: any) => {
      const esSlug = r.translations?.es?.slug?.current || r.slug.current
      const arSlug = r.translations?.ar?.slug?.current || r.slug.current
      const itSlug = r.translations?.it?.slug?.current || r.slug.current
      const deSlug = r.translations?.de?.slug?.current || r.slug.current
      const airportSlug = r.origin.slug.current
      const arAirportSlug = r.origin.translations?.ar?.slug?.current || airportSlug
      const deAirportSlug = r.origin.translations?.de?.slug?.current || airportSlug
      return {
        loc: `${SITE_URL}/airport-transfers-private-taxi/${airportSlug}/${r.slug.current}/`,
        lastmod: r._updatedAt,
        changefreq: 'weekly',
        priority: '0.8',
        alternates: {
          en: `${SITE_URL}/airport-transfers-private-taxi/${airportSlug}/${r.slug.current}/`,
          es: `${SITE_URL}/es/traslados-aeropuerto-privados-taxi/${airportSlug}/${esSlug}/`,
          ar: `${SITE_URL}/ar/nakl-mataar/${arAirportSlug}/${arSlug}/`,
          it: `${SITE_URL}/it/trasferimenti-aeroporto-taxi-privato/${airportSlug}/${itSlug}/`,
          de: `${SITE_URL}/de/flughafentransfer-privat-taxi/${deAirportSlug}/${deSlug}/`,
        },
      }
    }))
  }

  else if (type === 'cities.xml') {
    const cities = await sanityClient.fetch(sitemapCitiesQuery).catch(() => [])
    body = xml(cities.map((c: any) => {
      const esSlug = c.translations?.es?.slug?.current || c.slug.current
      const arSlug = c.translations?.ar?.slug?.current || c.slug.current
      const itSlug = c.translations?.it?.slug?.current || c.slug.current
      const deSlug = c.translations?.de?.slug?.current || c.slug.current
      return {
        loc: `${SITE_URL}/private-transfers/${c.slug.current}/`,
        lastmod: c._updatedAt,
        changefreq: 'weekly',
        priority: '0.8',
        alternates: {
          en: `${SITE_URL}/private-transfers/${c.slug.current}/`,
          es: `${SITE_URL}/es/traslados-privados-taxi/${esSlug}/`,
          ar: `${SITE_URL}/ar/nakl-khass/${arSlug}/`,
          it: `${SITE_URL}/it/trasferimenti-privati-taxi/${itSlug}/`,
          de: `${SITE_URL}/de/private-transfers-taxi/${deSlug}/`,
        },
      }
    }))
  }

  else if (type === 'countries.xml') {
    const countries = await sanityClient.fetch(sitemapCountriesQuery).catch(() => [])
    body = xml(countries.map((c: any) => {
      const esSlug = c.translations?.es?.slug?.current || c.slug.current
      const arSlug = c.translations?.ar?.slug?.current || c.slug.current
      const itSlug = c.translations?.it?.slug?.current || c.slug.current
      const deSlug = c.translations?.de?.slug?.current || c.slug.current
      return {
        loc: `${SITE_URL}/private-transfers-country/${c.slug.current}/`,
        lastmod: c._updatedAt,
        changefreq: 'monthly',
        priority: '0.7',
        alternates: {
          en: `${SITE_URL}/private-transfers-country/${c.slug.current}/`,
          es: `${SITE_URL}/es/traslados-privados-pais/${esSlug}/`,
          ar: `${SITE_URL}/ar/nakl-khass-balad/${arSlug}/`,
          it: `${SITE_URL}/it/trasferimenti-privati-paese/${itSlug}/`,
          de: `${SITE_URL}/de/private-transfers-land/${deSlug}/`,
        },
      }
    }))
  }

  else if (type === 'regions.xml') {
    const regions = await sanityClient.fetch(sitemapRegionsQuery).catch(() => [])
    body = xml(regions.map((r: any) => {
      const esSlug = r.translations?.es?.slug?.current || r.slug.current
      const arSlug = r.translations?.ar?.slug?.current || r.slug.current
      const itSlug = r.translations?.it?.slug?.current || r.slug.current
      const deSlug = r.translations?.de?.slug?.current || r.slug.current
      return {
        loc: `${SITE_URL}/private-transfers-region/${r.slug.current}/`,
        lastmod: r._updatedAt,
        changefreq: 'monthly',
        priority: '0.7',
        alternates: {
          en: `${SITE_URL}/private-transfers-region/${r.slug.current}/`,
          es: `${SITE_URL}/es/traslados-privados-region/${esSlug}/`,
          ar: `${SITE_URL}/ar/nakl-khass-mintaqa/${arSlug}/`,
          it: `${SITE_URL}/it/trasferimenti-privati-regione/${itSlug}/`,
          de: `${SITE_URL}/de/private-transfers-region/${deSlug}/`,
        },
      }
    }))
  }

  else if (type === 'services.xml') {
    const services = await sanityClient.fetch(sitemapServicesQuery).catch(() => [])
    body = xml(services.map((s: any) => {
      const esSlug = s.translations?.es?.slug?.current || s.slug.current
      const arSlug = s.translations?.ar?.slug?.current || s.slug.current
      const itSlug = s.translations?.it?.slug?.current || s.slug.current
      const deSlug = s.translations?.de?.slug?.current || s.slug.current
      return {
        loc: `${SITE_URL}/services/${s.slug.current}/`,
        lastmod: s._updatedAt,
        changefreq: 'monthly',
        priority: '0.8',
        alternates: {
          en: `${SITE_URL}/services/${s.slug.current}/`,
          es: `${SITE_URL}/es/servicios/${esSlug}/`,
          ar: `${SITE_URL}/ar/khadamat/${arSlug}/`,
          it: `${SITE_URL}/it/servizi/${itSlug}/`,
          de: `${SITE_URL}/de/dienstleistungen/${deSlug}/`,
        },
      }
    }))
  }

  else if (type === 'blog.xml') {
    const posts = await sanityClient.fetch(sitemapBlogPostsQuery).catch(() => [])
    body = xml(posts.map((p: any) => {
      const esSlug = p.translations?.es?.slug?.current || p.slug.current
      const arSlug = p.translations?.ar?.slug?.current || p.slug.current
      const itSlug = p.translations?.it?.slug?.current || p.slug.current
      const deSlug = p.translations?.de?.slug?.current || p.slug.current
      return {
        loc: `${SITE_URL}/blog/${p.slug.current}/`,
        lastmod: p._updatedAt,
        changefreq: 'monthly',
        priority: '0.6',
        alternates: {
          en: `${SITE_URL}/blog/${p.slug.current}/`,
          es: `${SITE_URL}/es/blog/${esSlug}/`,
          ar: `${SITE_URL}/ar/mudawana/${arSlug}/`,
          it: `${SITE_URL}/it/blog/${itSlug}/`,
          de: `${SITE_URL}/de/blog/${deSlug}/`,
        },
      }
    }))
  }

  else {
    return new Response('Not found', { status: 404 })
  }

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
