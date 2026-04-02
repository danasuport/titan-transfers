import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-sanity-secret')
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { _type, slug } = body

    const pathMap: Record<string, string> = {
      airport: `/airport-transfers-private-taxi/${slug?.current}/`,
      route: '/', // Routes need origin slug, revalidate broader
      city: `/private-transfers/city/${slug?.current}/`,
      country: `/private-transfers/country/${slug?.current}/`,
      region: `/private-transfers/region/${slug?.current}/`,
      servicePage: `/services/${slug?.current}/`,
      blogPost: `/blog/${slug?.current}/`,
      page: `/${slug?.current}/`,
    }

    const path = pathMap[_type]
    if (path) {
      revalidatePath(path)
      // Also revalidate Spanish version
      revalidatePath(`/es${path}`)
    }

    // Always revalidate listing pages and sitemap
    revalidatePath('/airports/')
    revalidatePath('/cities/')
    revalidatePath('/countries/')
    revalidatePath('/regions/')
    revalidatePath('/blog/')
    revalidatePath('/sitemap.xml')

    return NextResponse.json({ revalidated: true, path })
  } catch (error) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
