import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { getServiceUrl } from '@/lib/utils/slugHelpers'
import type { Locale } from '@/lib/i18n/config'

const servicesSlugs = [
  { en: 'airport-transfers', es: 'traslados-aeropuerto', key: 'airportTransfers' },
  { en: 'port-transfers', es: 'traslados-puerto', key: 'portTransfers' },
  { en: 'train-station-transfers', es: 'traslados-estacion-tren', key: 'trainStationTransfers' },
  { en: 'city-to-city', es: 'ciudad-a-ciudad', key: 'cityToCity' },
]

export function Footer() {
  const t = useTranslations('footer')
  const nav = useTranslations('nav')
  const locale = useLocale() as Locale

  return (
    <footer className="bg-dark text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-titan-transfers-texto-blanco.png"
                alt="Titan Transfers"
                width={160}
                height={36}
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed">{t('description')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/airports/" className="transition-colors hover:text-brand-500">{nav('airports')}</Link></li>
              <li><Link href="/cities/" className="transition-colors hover:text-brand-500">{nav('cities')}</Link></li>
              <li><Link href="/countries/" className="transition-colors hover:text-brand-500">{nav('countries')}</Link></li>
              <li><Link href="/regions/" className="transition-colors hover:text-brand-500">{nav('regions')}</Link></li>
              <li><Link href="/blog/" className="transition-colors hover:text-brand-500">{nav('blog')}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t('services')}
            </h3>
            <ul className="space-y-2 text-sm">
              {servicesSlugs.map(s => (
                <li key={s.key}><Link href={getServiceUrl(locale === 'es' ? s.es : s.en, locale) as any} className="transition-colors hover:text-brand-500">{nav(s.key)}</Link></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t('support')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact/" className="transition-colors hover:text-brand-500">{nav('contact')}</Link></li>
              <li><Link href="/faq/" className="transition-colors hover:text-brand-500">{nav('faq')}</Link></li>
              <li><Link href="/about/" className="transition-colors hover:text-brand-500">{nav('about')}</Link></li>
              <li><Link href="/login/" className="transition-colors hover:text-brand-500">{nav('login')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-dark-border pt-8 sm:flex-row">
          <p className="text-xs">&copy; {new Date().getFullYear()} {t('copyright')}</p>
          <div className="mt-4 flex gap-6 text-xs sm:mt-0">
            <Link href="/privacy/" className="transition-colors hover:text-brand-500">{t('privacy')}</Link>
            <Link href="/terms/" className="transition-colors hover:text-brand-500">{t('terms')}</Link>
            <Link href="/cookies/" className="transition-colors hover:text-brand-500">{t('cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
