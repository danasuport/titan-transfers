import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Accept the secret from the header OR the ?secret= query param. The deploy
  // docs tell you to configure the Sanity webhook as .../api/revalidate?secret=…,
  // but this only read the header — so a webhook set up per the docs got a 401
  // and revalidated nothing, silently, leaving everything on the hourly ISR.
  const secret =
    request.headers.get('x-sanity-secret') ||
    new URL(request.url).searchParams.get('secret')
  if (!process.env.SANITY_REVALIDATE_SECRET || secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { _type } = body

    // Canonical app-router route patterns (the folder names under src/app/[locale]).
    // Revalidating these with the 'page' type refreshes EVERY locale at once —
    // including localized pathnames (e.g. the Arabic blog is served at
    // /ar/mudawana/<slug>/ but next-intl rewrites it to this same internal route)
    // and translated slugs (es/ar/it use their own slug, not the English one).
    // The previous literal-path approach only matched the English URL, so non-EN
    // pages stayed stale until the hourly ISR kicked in.
    const detailRoute: Record<string, string> = {
      airport: '/[locale]/airport/[slug]',
      route: '/[locale]/airport/[slug]/[routeSlug]',
      city: '/[locale]/city/[slug]',
      country: '/[locale]/country/[slug]',
      region: '/[locale]/region/[slug]',
      servicePage: '/[locale]/services/[slug]',
      blogPost: '/[locale]/blog/[slug]',
    }

    // Which sub-sitemap actually lists this type's URLs. The index at /sitemap.xml
    // is static and never changes; the URLs live in /sitemaps/<file>. Revalidating
    // only the index (the old behaviour) meant a new route never reached the
    // sitemap until the sub-sitemap's own hourly ISR expired.
    const sitemapFile: Record<string, string> = {
      airport: 'airports.xml',
      route: 'routes.xml',
      city: 'cities.xml',
      country: 'countries.xml',
      region: 'regions.xml',
      servicePage: 'services.xml',
      blogPost: 'blog.xml',
    }

    const route = detailRoute[_type]
    if (route) {
      revalidatePath(route, 'page')
    }

    const file = sitemapFile[_type]
    if (file) {
      revalidatePath(`/sitemaps/${file}`)
    }

    // Always revalidate listing pages (all locales) and the sitemap index (its
    // lastmod is stamped at render, so refreshing it signals "something changed").
    revalidatePath('/[locale]/airports', 'page')
    revalidatePath('/[locale]/cities', 'page')
    revalidatePath('/[locale]/countries', 'page')
    revalidatePath('/[locale]/regions', 'page')
    revalidatePath('/[locale]/blog', 'page')
    revalidatePath('/sitemap.xml')

    return NextResponse.json({ revalidated: true, type: _type ?? null, route: route ?? null, sitemap: file ?? null })
  } catch (error) {
    // A webhook that 500s silently is how this kind of bug hides — log it.
    console.error('[revalidate] failed:', error)
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
