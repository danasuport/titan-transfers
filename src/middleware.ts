import createMiddleware from 'next-intl/middleware'
import { routing } from '@/lib/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // `admin` is excluded like `studio`: it's an internal, single-language tool
  // and must not be locale-prefixed or rewritten by the i18n middleware.
  matcher: ['/', '/(es)/:path*', '/((?!api|_next|_vercel|studio|admin|.*\\..*).*)'],
}
