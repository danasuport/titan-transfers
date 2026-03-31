'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { SkewButton } from '@/components/ui/SkewButton'

export function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/airports/' as const, label: t('airports'), hasDropdown: true },
    { href: '/cities/' as const, label: t('cities'), hasDropdown: true },
    { href: '/countries/' as const, label: t('countries'), hasDropdown: true },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div style={{ paddingLeft: '6vw', paddingRight: '6vw', paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="flex h-20 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/Logo-titan-transfers-texto-negro.png"
              alt="Titan Transfers"
              width={220}
              height={50}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-base font-medium text-gray-700 transition-colors hover:text-brand-600"
              >
                {item.label}
                {item.hasDropdown && (
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <SkewButton href={`/${locale}/contact/`} variant="primary" className="hidden sm:inline-block" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>{t('contact')}</SkewButton>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-gray-600 lg:hidden"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="border-t border-gray-100 py-4 lg:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact/"
              className="mt-2 block px-3 py-2 text-sm font-semibold text-brand-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('contact')}
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
