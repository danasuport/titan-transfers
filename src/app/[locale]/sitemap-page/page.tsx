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
import type { Locale } from '@/lib/i18n/config'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Mapa del sitio | Titan Transfers' : 'Sitemap | Titan Transfers',
    robots: { index: true, follow: true },
  }
}

const sectionStyle = { marginBottom: '3rem' }
const headingStyle = { fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', color: '#242426', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #8BAA1D' }
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.35rem 1.5rem' }
const linkStyle = { color: '#475569', textDecoration: 'none', fontSize: '0.88rem', lineHeight: 1.6 }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={sectionStyle}>
      <h2 style={headingStyle}>{title}</h2>
      {children}
    </div>
  )
}

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
  const routesByAirport: Record<string, { title: string; slug: string; airportSlug: string; esSlug: string }[]> = {}
  for (const route of routes) {
    if (!route.origin?.slug?.current) continue
    const airportSlug = route.origin.slug.current
    if (!routesByAirport[airportSlug]) routesByAirport[airportSlug] = []
    routesByAirport[airportSlug].push({
      title: (es && route.translations?.es?.title) || route.title,
      slug: route.slug.current,
      airportSlug,
      esSlug: route.translations?.es?.slug?.current || route.slug.current,
    })
  }

  const airportPrefix = es ? '/traslados-aeropuerto-privados-taxi' : '/airport-transfers-private-taxi'
  const privatePrefix = es ? '/traslados-privados-taxi' : '/private-transfers'

  return (
    <div style={{ background: '#F8FAF0', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 6vw' }}>

        <h1 className={russoOne.className} style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: '#242426', marginBottom: '0.5rem' }}>
          {es ? 'Mapa del sitio' : 'Sitemap'}
        </h1>
        <p style={{ color: '#64748b', marginBottom: '3rem', fontSize: '0.95rem' }}>
          {es ? 'Todas las páginas de Titan Transfers.' : 'All pages on Titan Transfers.'}
        </p>

        {/* Static pages */}
        <Section title={es ? 'Páginas principales' : 'Main pages'}>
          <div style={gridStyle}>
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
              <Link key={item.href} href={item.href as any} style={linkStyle}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#8BAA1D')}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#475569')}
              >→ {item.label}</Link>
            ))}
          </div>
        </Section>

        {/* Airports */}
        <Section title={es ? 'Aeropuertos' : 'Airports'}>
          <div style={gridStyle}>
            {airports.map((a: any) => {
              const slug = es ? (a.translations?.es?.slug?.current || a.slug.current) : a.slug.current
              const title = (es && a.translations?.es?.title) || a.title
              return (
                <Link key={a._id} href={`${airportPrefix}/${slug}/` as any} style={linkStyle}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#8BAA1D')}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#475569')}
                >→ {title}</Link>
              )
            })}
          </div>
        </Section>

        {/* Routes grouped by airport */}
        <Section title={es ? 'Rutas desde aeropuertos' : 'Routes from airports'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {Object.entries(routesByAirport).sort(([a], [b]) => a.localeCompare(b)).map(([airportSlug, airportRoutes]) => {
              const airport = airports.find((a: any) => a.slug.current === airportSlug)
              const airportTitle = (es && airport?.translations?.es?.title) || airport?.title || airportSlug
              const airportUrl = es
                ? `${airportPrefix}/${airport?.translations?.es?.slug?.current || airportSlug}/`
                : `${airportPrefix}/${airportSlug}/`
              return (
                <div key={airportSlug}>
                  <Link href={airportUrl as any} style={{ ...linkStyle, fontWeight: 700, color: '#8BAA1D', fontSize: '0.9rem' }}>{airportTitle}</Link>
                  <div style={{ ...gridStyle, marginTop: '0.5rem' }}>
                    {airportRoutes.map(r => {
                      const routeSlug = es ? r.esSlug : r.slug
                      return (
                        <Link key={r.slug} href={`${airportPrefix}/${airportSlug}/${routeSlug}/` as any} style={linkStyle}
                          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#8BAA1D')}
                          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#475569')}
                        >→ {r.title}</Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* Cities */}
        <Section title={es ? 'Ciudades' : 'Cities'}>
          <div style={gridStyle}>
            {cities.map((c: any) => {
              const slug = es ? (c.translations?.es?.slug?.current || c.slug.current) : c.slug.current
              const title = (es && c.translations?.es?.title) || c.title
              return (
                <Link key={c._id} href={`${privatePrefix}/${slug}/` as any} style={linkStyle}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#8BAA1D')}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#475569')}
                >→ {title}</Link>
              )
            })}
          </div>
        </Section>

        {/* Countries */}
        <Section title={es ? 'Países' : 'Countries'}>
          <div style={gridStyle}>
            {countries.map((c: any) => {
              const slug = es ? (c.translations?.es?.slug?.current || c.slug.current) : c.slug.current
              const title = (es && c.translations?.es?.title) || c.title
              return (
                <Link key={c._id} href={`${privatePrefix}/${slug}/` as any} style={linkStyle}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#8BAA1D')}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#475569')}
                >→ {title}</Link>
              )
            })}
          </div>
        </Section>

        {/* Regions */}
        <Section title={es ? 'Regiones' : 'Regions'}>
          <div style={gridStyle}>
            {regions.map((r: any) => {
              const slug = es ? (r.translations?.es?.slug?.current || r.slug.current) : r.slug.current
              const title = (es && r.translations?.es?.title) || r.title
              return (
                <Link key={r._id} href={`${privatePrefix}/${slug}/` as any} style={linkStyle}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#8BAA1D')}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#475569')}
                >→ {title}</Link>
              )
            })}
          </div>
        </Section>

        {/* Blog */}
        {blogPosts.length > 0 && (
          <Section title="Blog">
            <div style={gridStyle}>
              {blogPosts.map((p: any) => (
                <Link key={p._id} href={`/blog/${p.slug.current}/` as any} style={linkStyle}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#8BAA1D')}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#475569')}
                >→ {p.title}</Link>
              ))}
            </div>
          </Section>
        )}

      </div>
    </div>
  )
}
