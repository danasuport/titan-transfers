import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-sanity-secret')
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
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

    const route = detailRoute[_type]
    if (route) {
      revalidatePath(route, 'page')
    }

    // Always revalidate listing pages (all locales) and the sitemap.
    revalidatePath('/[locale]/airports', 'page')
    revalidatePath('/[locale]/cities', 'page')
    revalidatePath('/[locale]/countries', 'page')
    revalidatePath('/[locale]/regions', 'page')
    revalidatePath('/[locale]/blog', 'page')
    revalidatePath('/sitemap.xml')

    return NextResponse.json({ revalidated: true, type: _type ?? null, route: route ?? null })
  } catch (error) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
