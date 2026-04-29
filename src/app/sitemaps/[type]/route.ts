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

function xml(urls: { loc: string; lastmod?: string; changefreq?: string; priority?: string; alternates?: { en: string; es: string } }[]) {
  const urlset = urls.map(u => `
  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ''}
    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}
    ${u.priority ? `<priority>${u.priority}</priority>` : ''}
    ${u.alternates ? `
    <xhtml:link rel="alternate" hreflang="en" href="${u.alternates.en}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${u.alternates.es}"/>
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
      { path: '/', espath: '/es/', freq: 'daily', priority: '1.0' },
      { path: '/airport-transfers-private-taxi/', espath: '/es/traslados-aeropuerto-privados-taxi/', freq: 'weekly', priority: '0.9' },
      { path: '/private-transfers/', espath: '/es/traslados-privados-taxi/', freq: 'weekly', priority: '0.9' },
      { path: '/regions/', espath: '/es/regiones/', freq: 'weekly', priority: '0.8' },
      { path: '/services/', espath: '/es/servicios/', freq: 'weekly', priority: '0.8' },
      { path: '/blog/', espath: '/es/blog/', freq: 'daily', priority: '0.8' },
      { path: '/booking/', espath: '/es/reserva/', freq: 'monthly', priority: '0.9' },
      { path: '/contact/', espath: '/es/contacto/', freq: 'monthly', priority: '0.6' },
      { path: '/about/', espath: '/es/sobre-nosotros/', freq: 'monthly', priority: '0.6' },
      { path: '/faq/', espath: '/es/preguntas-frecuentes/', freq: 'monthly', priority: '0.7' },
      { path: '/web-sitemap/', espath: '/es/mapa-del-sitio/', freq: 'monthly', priority: '0.5' },
      { path: '/privacy-policy/', espath: '/es/politica-de-privacidad/', freq: 'yearly', priority: '0.3' },
      { path: '/terms-and-conditions/', espath: '/es/terminos-y-condiciones/', freq: 'yearly', priority: '0.3' },
      { path: '/cookie-policy/', espath: '/es/politica-de-cookies/', freq: 'yearly', priority: '0.3' },
      { path: '/legal-notice/', espath: '/es/aviso-legal/', freq: 'yearly', priority: '0.3' },
    ]
    body = xml(staticPages.map(p => ({
      loc: `${SITE_URL}${p.path}`,
      changefreq: p.freq,
      priority: p.priority,
      alternates: { en: `${SITE_URL}${p.path}`, es: `${SITE_URL}${p.espath}` },
    })))
  }

  else if (type === 'airports.xml') {
    const airports = await sanityClient.fetch(sitemapAirportsQuery).catch(() => [])
    body = xml(airports.map((a: any) => {
      const esSlug = a.translations?.es?.slug?.current || a.slug.current
      return {
        loc: `${SITE_URL}/airport-transfers-private-taxi/${a.slug.current}/`,
        lastmod: a._updatedAt,
        changefreq: 'weekly',
        priority: '0.9',
        alternates: {
          en: `${SITE_URL}/airport-transfers-private-taxi/${a.slug.current}/`,
          es: `${SITE_URL}/es/traslados-aeropuerto-privados-taxi/${esSlug}/`,
        },
      }
    }))
  }

  else if (type === 'routes.xml') {
    const routes = await sanityClient.fetch(sitemapRoutesQuery).catch(() => [])
    body = xml(routes.filter((r: any) => r.origin?.slug?.current).map((r: any) => {
      const esSlug = r.translations?.es?.slug?.current || r.slug.current
      const airportSlug = r.origin.slug.current
      return {
        loc: `${SITE_URL}/airport-transfers-private-taxi/${airportSlug}/${r.slug.current}/`,
        lastmod: r._updatedAt,
        changefreq: 'weekly',
        priority: '0.8',
        alternates: {
          en: `${SITE_URL}/airport-transfers-private-taxi/${airportSlug}/${r.slug.current}/`,
          es: `${SITE_URL}/es/traslados-aeropuerto-privados-taxi/${airportSlug}/${esSlug}/`,
        },
      }
    }))
  }

  else if (type === 'cities.xml') {
    const cities = await sanityClient.fetch(sitemapCitiesQuery).catch(() => [])
    body = xml(cities.map((c: any) => {
      const esSlug = c.translations?.es?.slug?.current || c.slug.current
      return {
        loc: `${SITE_URL}/private-transfers/${c.slug.current}/`,
        lastmod: c._updatedAt,
        changefreq: 'weekly',
        priority: '0.8',
        alternates: {
          en: `${SITE_URL}/private-transfers/${c.slug.current}/`,
          es: `${SITE_URL}/es/traslados-privados-taxi/${esSlug}/`,
        },
      }
    }))
  }

  else if (type === 'countries.xml') {
    const countries = await sanityClient.fetch(sitemapCountriesQuery).catch(() => [])
    body = xml(countries.map((c: any) => {
      const esSlug = c.translations?.es?.slug?.current || c.slug.current
      return {
        loc: `${SITE_URL}/private-transfers-country/${c.slug.current}/`,
        lastmod: c._updatedAt,
        changefreq: 'monthly',
        priority: '0.7',
        alternates: {
          en: `${SITE_URL}/private-transfers-country/${c.slug.current}/`,
          es: `${SITE_URL}/es/traslados-privados-pais/${esSlug}/`,
        },
      }
    }))
  }

  else if (type === 'regions.xml') {
    const regions = await sanityClient.fetch(sitemapRegionsQuery).catch(() => [])
    body = xml(regions.map((r: any) => {
      const esSlug = r.translations?.es?.slug?.current || r.slug.current
      return {
        loc: `${SITE_URL}/private-transfers-region/${r.slug.current}/`,
        lastmod: r._updatedAt,
        changefreq: 'monthly',
        priority: '0.7',
        alternates: {
          en: `${SITE_URL}/private-transfers-region/${r.slug.current}/`,
          es: `${SITE_URL}/es/traslados-privados-region/${esSlug}/`,
        },
      }
    }))
  }

  else if (type === 'services.xml') {
    const services = await sanityClient.fetch(sitemapServicesQuery).catch(() => [])
    body = xml(services.map((s: any) => {
      const esSlug = s.translations?.es?.slug?.current || s.slug.current
      return {
        loc: `${SITE_URL}/services/${s.slug.current}/`,
        lastmod: s._updatedAt,
        changefreq: 'monthly',
        priority: '0.8',
        alternates: {
          en: `${SITE_URL}/services/${s.slug.current}/`,
          es: `${SITE_URL}/es/servicios/${esSlug}/`,
        },
      }
    }))
  }

  else if (type === 'blog.xml') {
    const posts = await sanityClient.fetch(sitemapBlogPostsQuery).catch(() => [])
    body = xml(posts.map((p: any) => {
      const esSlug = p.translations?.es?.slug?.current || p.slug.current
      return {
        loc: `${SITE_URL}/blog/${p.slug.current}/`,
        lastmod: p._updatedAt,
        changefreq: 'monthly',
        priority: '0.6',
        alternates: {
          en: `${SITE_URL}/blog/${p.slug.current}/`,
          es: `${SITE_URL}/es/blog/${esSlug}/`,
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
