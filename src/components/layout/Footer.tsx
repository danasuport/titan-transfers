'use client'

import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { getServiceUrl } from '@/lib/utils/slugHelpers'
import { russoOne } from '@/lib/fonts'
import type { Locale } from '@/lib/i18n/config'

const servicesSlugs = [
  { en: 'airport-transfers', es: 'traslados-aeropuerto', key: 'airportTransfers' },
  { en: 'port-transfers', es: 'traslados-puerto', key: 'portTransfers' },
  { en: 'train-station-transfers', es: 'traslados-estacion-tren', key: 'trainStationTransfers' },
  { en: 'city-to-city', es: 'ciudad-a-ciudad', key: 'cityToCity' },
]

const linkStyle = { color: '#475569', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.2s' }
const headingStyle = { color: '#242426', fontSize: '1.1rem', letterSpacing: '0.01em', marginBottom: '1.25rem' }

export function Footer() {
  const t = useTranslations('footer')
  const nav = useTranslations('nav')
  const locale = useLocale() as Locale

  return (
    <footer style={{ background: '#F8FAF0', color: '#475569' }}>

      {/* Top bar with diagonal accent */}

      <div className="site-container" style={{ paddingTop: '8rem', paddingBottom: '7rem' }}>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.9fr', gap: '3rem', marginBottom: '3rem' }}>

          {/* Brand column */}
          <div>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
              <Image src="/Logo-titan-transfers-texto-negro.png" alt="Titan Transfers" width={220} height={50} />
            </Link>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#475569', maxWidth: '280px', marginBottom: '1.75rem' }}>
              {locale === 'es' ? 'Transfers privados en más de 100 destinos. Precio fijo, conductor profesional y soporte 24/7.' : 'Private transfers in 100+ destinations. Fixed prices, professional driver and 24/7 support.'}
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[
                { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                { label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
              ].map(({ label, path }) => (
                <a key={label} href="#" aria-label={label} style={{
                  width: '42px', height: '42px',
                  background: '#242426',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: 'skewX(-12deg)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#8BAA1D')}
                onMouseLeave={e => (e.currentTarget.style.background = '#242426')}
                >
                  <svg style={{ transform: 'skewX(12deg)' }} width="19" height="19" viewBox="0 0 24 24" fill="#ffffff">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <div className={russoOne.className} style={headingStyle}>{t('quickLinks')}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { href: '/airports/', label: nav('airports') },
                { href: '/cities/', label: nav('cities') },
                { href: '/countries/', label: nav('countries') },
                { href: '/regions/', label: nav('regions') },
                { href: '/blog/', label: nav('blog') },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href as any} style={linkStyle}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#8BAA1D')}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#475569')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <div className={russoOne.className} style={headingStyle}>{t('services')}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {servicesSlugs.map(s => (
                <li key={s.key}>
                  <Link href={getServiceUrl(locale === 'es' ? s.es : s.en, locale) as any} style={linkStyle}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#8BAA1D')}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#475569')}
                  >
                    {nav(s.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <div className={russoOne.className} style={headingStyle}>{t('support')}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { href: '/contact/', label: nav('contact') },
                { href: '/faq/', label: nav('faq') },
                { href: '/about/', label: nav('about') },
                { href: '/login/', label: nav('login') },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href as any} style={linkStyle}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#8BAA1D')}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#475569')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Reviews column */}
          <div>
            <div className={russoOne.className} style={headingStyle}>{locale === 'es' ? 'Opiniones' : 'Reviews'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

              {/* Trustpilot */}
              <a href="https://es.trustpilot.com/review/titantransfers.net" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: '#ffffff', borderRadius: '8px', padding: '0.6rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#00B67A"><path d="M12 0l3.09 9.26H24l-7.85 5.7 3.09 9.26L12 18.52l-7.24 5.7 3.09-9.26L0 9.26h8.91z"/></svg>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#242426' }}>Trustpilot</span>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#00B67A"><path d="M12 0l3.09 9.26H24l-7.85 5.7 3.09 9.26L12 18.52l-7.24 5.7 3.09-9.26L0 9.26h8.91z"/></svg>)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>4.9 / 5 · +500 {locale === 'es' ? 'opiniones' : 'reviews'}</div>
              </a>

              {/* Trusted Shops */}
              <a href="https://www.trustedshops.com/buyerrating/info_PLACEHOLDER.html" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: '#ffffff', borderRadius: '8px', padding: '0.6rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Image src="/logo-trusted-shops.png" alt="Trusted Shops" width={16} height={16} style={{ objectFit: 'contain' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#242426' }}>Trusted Shops</span>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#FFDC0F"><path d="M12 0l3.09 9.26H24l-7.85 5.7 3.09 9.26L12 18.52l-7.24 5.7 3.09-9.26L0 9.26h8.91z"/></svg>)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>4.9 / 5 · +1.800 {locale === 'es' ? 'opiniones' : 'reviews'}</div>
              </a>

              {/* Google */}
              <a href="https://g.page/r/PLACEHOLDER/review" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: '#ffffff', borderRadius: '8px', padding: '0.6rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Image src="/logo-google.svg" alt="Google" width={16} height={16} style={{ objectFit: 'contain' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#242426' }}>Google</span>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#FBBC05"><path d="M12 0l3.09 9.26H24l-7.85 5.7 3.09 9.26L12 18.52l-7.24 5.7 3.09-9.26L0 9.26h8.91z"/></svg>)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>4.8 / 5 · +100 {locale === 'es' ? 'opiniones' : 'reviews'}</div>
              </a>

            </div>
          </div>

        </div>


        <div style={{ paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            &copy; {new Date().getFullYear()} {t('copyright')} · <a href="https://kmadisseny.es" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={e => (e.currentTarget.style.color = '#8BAA1D')} onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>Diseño web Barcelona</a>
          </p>

          {/* Payment icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {[
              { src: '/payment-icons/visa.svg', alt: 'Visa', height: 32 },
              { src: '/payment-icons/mastercard.svg', alt: 'Mastercard', height: 32 },
              { src: '/payment-icons/american-express.svg', alt: 'American Express', height: 32 },
              { src: '/payment-icons/paypal.svg', alt: 'PayPal', height: 32 },
              { src: '/payment-icons/apay.svg', alt: 'Apple Pay', height: 20 },
              { src: '/payment-icons/gpay.svg', alt: 'Google Pay', height: 20 },
            ].map(({ src, alt, height }) => (
              <Image key={alt} src={src} alt={alt} width={height * 2} height={height} style={{ height, width: 'auto', opacity: 0.75 }} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[
              { href: '/privacy/', label: t('privacy') },
              { href: '/terms/', label: t('terms') },
              { href: '/cookies/', label: t('cookies') },
            ].map(item => (
              <Link key={item.href} href={item.href as any} style={{ ...linkStyle, fontSize: '0.8rem', color: '#94a3b8' }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#8BAA1D')}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#94a3b8')}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
