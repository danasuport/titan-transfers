export const revalidate = 3600

export async function GET(req: Request) {
  const origin = new URL(req.url).origin
  const now = new Date().toISOString().slice(0, 10)

  const sitemaps = [
    'pages', 'airports', 'routes', 'cities',
    'countries', 'regions', 'services', 'blog',
  ]

  const urls = sitemaps.map(name => `
  <sitemap>
    <loc>${origin}/sitemaps/${name}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join('')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</sitemapindex>`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
