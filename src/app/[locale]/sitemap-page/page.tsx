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
import { pick } from '@/lib/i18n/pick'
import { getAirportUrl, getRouteUrl, getCityUrl, getCountryUrl, getRegionUrl, getBlogUrl, getTranslatedTitle, getLocalizedPath } from '@/lib/utils/slugHelpers'
import type { Locale } from '@/lib/i18n/config'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: pick(locale, {
      en: 'Sitemap | Titan Transfers',
      es: 'Mapa del sitio | Titan Transfers',
      ar: 'خريطة الموقع | تايتن ترانسفرز',
      it: 'Mappa del sito | Titan Transfers',
      de: 'Sitemap | Titan Transfers',
    }),
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
  const loc = locale as Locale

  const [airports, routes, cities, countries, regions, blogPosts] = await Promise.all([
    sanityClient.fetch(sitemapAirportsQuery).catch(() => []),
    sanityClient.fetch(sitemapRoutesQuery).catch(() => []),
    sanityClient.fetch(sitemapCitiesQuery).catch(() => []),
    sanityClient.fetch(sitemapCountriesQuery).catch(() => []),
    sanityClient.fetch(sitemapRegionsQuery).catch(() => []),
    sanityClient.fetch(sitemapBlogPostsQuery).catch(() => []),
  ])

  // Group routes by airport
  const routesByAirport: Record<string, any[]> = {}
  for (const route of routes) {
    if (!route.origin?.slug?.current) continue
    const key = route.origin.slug.current
    if (!routesByAirport[key]) routesByAirport[key] = []
    routesByAirport[key].push(route)
  }

  const labels = {
    title: pick(locale, { en: 'Sitemap', es: 'Mapa del sitio', ar: 'خريطة الموقع', it: 'Mappa del sito', de: 'Sitemap' }),
    subtitle: pick(locale, {
      en: 'All pages on Titan Transfers.',
      es: 'Todas las páginas de Titan Transfers.',
      ar: 'جميع صفحات تايتن ترانسفرز.',
      it: 'Tutte le pagine di Titan Transfers.',
      de: 'Alle Seiten bei Titan Transfers.',
    }),
    sectMain: pick(locale, { en: 'Main pages', es: 'Páginas principales', ar: 'الصفحات الرئيسية', it: 'Pagine principali', de: 'Hauptseiten' }),
    sectAirports: pick(locale, { en: 'Airports', es: 'Aeropuertos', ar: 'المطارات', it: 'Aeroporti', de: 'Flughäfen' }),
    sectRoutes: pick(locale, { en: 'Routes from airports', es: 'Rutas desde aeropuertos', ar: 'مسارات من المطارات', it: 'Percorsi dagli aeroporti', de: 'Routen von Flughäfen' }),
    sectCities: pick(locale, { en: 'Cities', es: 'Ciudades', ar: 'المدن', it: 'Città', de: 'Städte' }),
    sectCountries: pick(locale, { en: 'Countries', es: 'Países', ar: 'الدول', it: 'Paesi', de: 'Länder' }),
    sectRegions: pick(locale, { en: 'Regions', es: 'Regiones', ar: 'المناطق', it: 'Regioni', de: 'Regionen' }),
    sectBlog: pick(locale, { en: 'Blog', es: 'Blog', ar: 'المدونة', it: 'Blog', de: 'Blog' }),
    home: pick(locale, { en: 'Home', es: 'Inicio', ar: 'الرئيسية', it: 'Home', de: 'Startseite' }),
    citiesNav: pick(locale, { en: 'Cities', es: 'Ciudades', ar: 'المدن', it: 'Città', de: 'Städte' }),
    countriesNav: pick(locale, { en: 'Countries', es: 'Países', ar: 'الدول', it: 'Paesi', de: 'Länder' }),
    regionsNav: pick(locale, { en: 'Regions', es: 'Regiones', ar: 'المناطق', it: 'Regioni', de: 'Regionen' }),
    servicesNav: pick(locale, { en: 'Services', es: 'Servicios', ar: 'الخدمات', it: 'Servizi', de: 'Dienstleistungen' }),
    contactNav: pick(locale, { en: 'Contact', es: 'Contacto', ar: 'تواصل معنا', it: 'Contatto', de: 'Kontakt' }),
    aboutNav: pick(locale, { en: 'About', es: 'Sobre nosotros', ar: 'من نحن', it: 'Chi siamo', de: 'Über uns' }),
    faqNav: pick(locale, { en: 'FAQ', es: 'Preguntas frecuentes', ar: 'الأسئلة الشائعة', it: 'Domande frequenti', de: 'FAQ' }),
    bookNav: pick(locale, { en: 'Book', es: 'Reservar', ar: 'احجز', it: 'Prenota', de: 'Buchen' }),
    blogNav: pick(locale, { en: 'Blog', es: 'Blog', ar: 'المدونة', it: 'Blog', de: 'Blog' }),
  }

  const blogSeg = getLocalizedPath('blog', loc)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `.sm-link { color: #475569 !important; text-decoration: none; font-size: 0.88rem; line-height: 1.6; } .sm-link:hover { color: #8BAA1D !important; }` }} />
      <div style={{ background: '#F8FAF0', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 6vw' }}>

          <h1 className={russoOne.className} style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: '#242426', marginBottom: '0.5rem' }}>
            {labels.title}
          </h1>
          <p style={{ color: '#64748b', marginBottom: '3rem', fontSize: '0.95rem' }}>
            {labels.subtitle}
          </p>

          <Section title={labels.sectMain}>
            <div style={grid}>
              {[
                { href: '/', label: labels.home },
                { href: '/airports/', label: labels.sectAirports },
                { href: '/cities/', label: labels.citiesNav },
                { href: '/countries/', label: labels.countriesNav },
                { href: '/regions/', label: labels.regionsNav },
                { href: '/services/', label: labels.servicesNav },
                { href: '/blog/', label: labels.blogNav },
                { href: '/contact/', label: labels.contactNav },
                { href: '/about/', label: labels.aboutNav },
                { href: '/faq/', label: labels.faqNav },
                { href: '/booking/', label: labels.bookNav },
              ].map(item => (
                <Link key={item.href} href={item.href as any} className="sm-link">→ {item.label}</Link>
              ))}
            </div>
          </Section>

          <Section title={labels.sectAirports}>
            <div style={grid}>
              {airports.map((a: any) => (
                <Link key={a._id} href={getAirportUrl(a, loc) as any} className="sm-link">→ {getTranslatedTitle(a, loc)}</Link>
              ))}
            </div>
          </Section>

          <Section title={labels.sectRoutes}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {Object.entries(routesByAirport).sort(([a], [b]) => a.localeCompare(b)).map(([airportSlug, airportRoutes]) => {
                const airport = airports.find((a: any) => a.slug.current === airportSlug)
                const airportTitle = airport ? getTranslatedTitle(airport, loc) : airportSlug
                return (
                  <div key={airportSlug}>
                    {airport && (
                      <Link href={getAirportUrl(airport, loc) as any} className="sm-link" style={{ fontWeight: 700, color: '#6B8313', fontSize: '0.9rem' }}>
                        {airportTitle}
                      </Link>
                    )}
                    <div style={{ ...grid, marginTop: '0.5rem' }}>
                      {airportRoutes.map(r => (
                        airport && (
                          <Link key={r.slug.current} href={getRouteUrl(airport, r, loc) as any} className="sm-link">
                            → {getTranslatedTitle(r, loc)}
                          </Link>
                        )
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title={labels.sectCities}>
            <div style={grid}>
              {cities.map((c: any) => (
                <Link key={c._id} href={getCityUrl(c, loc) as any} className="sm-link">→ {getTranslatedTitle(c, loc)}</Link>
              ))}
            </div>
          </Section>

          <Section title={labels.sectCountries}>
            <div style={grid}>
              {countries.map((c: any) => (
                <Link key={c._id} href={getCountryUrl(c, loc) as any} className="sm-link">→ {getTranslatedTitle(c, loc)}</Link>
              ))}
            </div>
          </Section>

          <Section title={labels.sectRegions}>
            <div style={grid}>
              {regions.map((r: any) => (
                <Link key={r._id} href={getRegionUrl(r, loc) as any} className="sm-link">→ {getTranslatedTitle(r, loc)}</Link>
              ))}
            </div>
          </Section>

          {blogPosts.length > 0 && (
            <Section title={labels.sectBlog}>
              <div style={grid}>
                {blogPosts.map((p: any) => (
                  <Link key={p._id} href={`/${blogSeg}/${p.slug.current}/` as any} className="sm-link">→ {p.title}</Link>
                ))}
              </div>
            </Section>
          )}

        </div>
      </div>
    </>
  )
}
