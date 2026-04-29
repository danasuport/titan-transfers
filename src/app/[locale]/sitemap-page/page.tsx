import { sanityClient } from '@/lib/sanity/client'
import {
  sitemapAirportsQuery,
  sitemapRoutesQuery,
  sitemapCitiesQuery,
  sitemapCountriesQuery,
  sitemapRegionsQuery,
  sitemapBlogPostsQuery,
} from '@/lib/sanity/queries'
import { Link } from '@/lib/i18n/navigation'
import { russoOne } from '@/lib/fonts'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Mapa del sitio | Titan Transfers' : 'Sitemap | Titan Transfers',
    robots: { index: true, follow: true },
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', color: '#242426', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #8BAA1D' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.35rem 1.5rem' } as const

export default async function SitemapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'

  const [airports, routes, cities, countries, regions, blogPosts] = await Promise.all([
    sanityClient.fetch(sitemapAirportsQuery).catch(() => []),
    sanityClient.fetch(sitemapRoutesQuery).catch(() => []),
    sanityClient.fetch(sitemapCitiesQuery).catch(() => []),
    sanityClient.fetch(sitemapCountriesQuery).catch(() => []),
    sanityClient.fetch(sitemapRegionsQuery).catch(() => []),
    sanityClient.fetch(sitemapBlogPostsQuery).catch(() => []),
  ])

  // Group routes by airport
  const routesByAirport: Record<string, { title: string; slug: string; esSlug: string }[]> = {}
  for (const route of routes) {
    if (!route.origin?.slug?.current) continue
    const key = route.origin.slug.current
    if (!routesByAirport[key]) routesByAirport[key] = []
    routesByAirport[key].push({
      title: (es && route.translations?.es?.title) || route.title,
      slug: route.slug.current,
      esSlug: route.translations?.es?.slug?.current || route.slug.current,
    })
  }

  const airportPrefix = es ? '/traslados-aeropuerto-privados-taxi' : '/airport-transfers-private-taxi'
  const privatePrefix = es ? '/traslados-privados-taxi' : '/private-transfers'
  const countryPrefix = es ? '/traslados-privados-pais' : '/private-transfers-country'
  const regionPrefix = es ? '/traslados-privados-region' : '/private-transfers-region'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `.sm-link { color: #475569 !important; text-decoration: none; font-size: 0.88rem; line-height: 1.6; } .sm-link:hover { color: #8BAA1D !important; }` }} />
      <div style={{ background: '#F8FAF0', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 6vw' }}>

          <h1 className={russoOne.className} style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: '#242426', marginBottom: '0.5rem' }}>
            {es ? 'Mapa del sitio' : 'Sitemap'}
          </h1>
          <p style={{ color: '#64748b', marginBottom: '3rem', fontSize: '0.95rem' }}>
            {es ? 'Todas las páginas de Titan Transfers.' : 'All pages on Titan Transfers.'}
          </p>

          <Section title={es ? 'Páginas principales' : 'Main pages'}>
            <div style={grid}>
              {[
                { href: '/', label: es ? 'Inicio' : 'Home' },
                { href: '/airports/', label: es ? 'Aeropuertos' : 'Airports' },
                { href: '/cities/', label: es ? 'Ciudades' : 'Cities' },
                { href: '/countries/', label: es ? 'Países' : 'Countries' },
                { href: '/regions/', label: es ? 'Regiones' : 'Regions' },
                { href: '/services/', label: es ? 'Servicios' : 'Services' },
                { href: '/blog/', label: 'Blog' },
                { href: '/contact/', label: es ? 'Contacto' : 'Contact' },
                { href: '/about/', label: es ? 'Sobre nosotros' : 'About' },
                { href: '/faq/', label: es ? 'Preguntas frecuentes' : 'FAQ' },
                { href: '/booking/', label: es ? 'Reservar' : 'Book' },
              ].map(item => (
                <Link key={item.href} href={item.href as any} className="sm-link">→ {item.label}</Link>
              ))}
            </div>
          </Section>

          <Section title={es ? 'Aeropuertos' : 'Airports'}>
            <div style={grid}>
              {airports.map((a: any) => {
                const slug = es ? (a.translations?.es?.slug?.current || a.slug.current) : a.slug.current
                const title = (es && a.translations?.es?.title) || a.title
                return (
                  <Link key={a._id} href={`${airportPrefix}/${slug}/` as any} className="sm-link">→ {title}</Link>
                )
              })}
            </div>
          </Section>

          <Section title={es ? 'Rutas desde aeropuertos' : 'Routes from airports'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {Object.entries(routesByAirport).sort(([a], [b]) => a.localeCompare(b)).map(([airportSlug, airportRoutes]) => {
                const airport = airports.find((a: any) => a.slug.current === airportSlug)
                const airportTitle = (es && airport?.translations?.es?.title) || airport?.title || airportSlug
                const airportUrl = `${airportPrefix}/${es ? (airport?.translations?.es?.slug?.current || airportSlug) : airportSlug}/`
                return (
                  <div key={airportSlug}>
                    <Link href={airportUrl as any} className="sm-link" style={{ fontWeight: 700, color: '#6B8313', fontSize: '0.9rem' }}>
                      {airportTitle}
                    </Link>
                    <div style={{ ...grid, marginTop: '0.5rem' }}>
                      {airportRoutes.map(r => (
                        <Link key={r.slug} href={`${airportPrefix}/${airportSlug}/${es ? r.esSlug : r.slug}/` as any} className="sm-link">
                          → {r.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title={es ? 'Ciudades' : 'Cities'}>
            <div style={grid}>
              {cities.map((c: any) => {
                const slug = es ? (c.translations?.es?.slug?.current || c.slug.current) : c.slug.current
                const title = (es && c.translations?.es?.title) || c.title
                return <Link key={c._id} href={`${privatePrefix}/${slug}/` as any} className="sm-link">→ {title}</Link>
              })}
            </div>
          </Section>

          <Section title={es ? 'Países' : 'Countries'}>
            <div style={grid}>
              {countries.map((c: any) => {
                const slug = es ? (c.translations?.es?.slug?.current || c.slug.current) : c.slug.current
                const title = (es && c.translations?.es?.title) || c.title
                return <Link key={c._id} href={`${countryPrefix}/${slug}/` as any} className="sm-link">→ {title}</Link>
              })}
            </div>
          </Section>

          <Section title={es ? 'Regiones' : 'Regions'}>
            <div style={grid}>
              {regions.map((r: any) => {
                const slug = es ? (r.translations?.es?.slug?.current || r.slug.current) : r.slug.current
                const title = (es && r.translations?.es?.title) || r.title
                return <Link key={r._id} href={`${regionPrefix}/${slug}/` as any} className="sm-link">→ {title}</Link>
              })}
            </div>
          </Section>

          {blogPosts.length > 0 && (
            <Section title="Blog">
              <div style={grid}>
                {blogPosts.map((p: any) => (
                  <Link key={p._id} href={`/blog/${p.slug.current}/` as any} className="sm-link">→ {p.title}</Link>
                ))}
              </div>
            </Section>
          )}

        </div>
      </div>
    </>
  )
}
