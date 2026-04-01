'use client'

import { useState, useRef, useCallback } from 'react'
import React from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { SkewButton } from '@/components/ui/SkewButton'
import { GlobalSearch } from '@/components/ui/GlobalSearch'
import { MegaMenu } from './MegaMenu'

type MenuType = 'airports' | 'cities' | 'countries' | null

export function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<MenuType>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMenuScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    setIsScrolled(el.scrollTop > 20)
  }, [])

  const navItems: { key: MenuType; href: string; label: string }[] = [
    { key: 'airports', href: '/airports/', label: t('airports') },
    { key: 'cities', href: '/cities/', label: t('cities') },
    { key: 'countries', href: '/countries/', label: t('countries') },
  ]

  function openMenu(key: MenuType) {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
    if (key !== activeMenu) setIsScrolled(false)
    setActiveMenu(key)
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 300)
  }

  return (
    <header className="sticky top-0 z-50 bg-white" style={{ boxShadow: activeMenu ? 'none' : '0 1px 0 #e5e7eb' }}>
      <div style={{ paddingLeft: '6vw', paddingRight: '6vw', paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="flex h-20 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0" onClick={() => setActiveMenu(null)}>
            <Image src="/Logo-titan-transfers-texto-negro.png" alt="Titan Transfers" width={220} height={50} priority className="w-36 sm:w-48 lg:w-56" style={{ height: 'auto' }} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.key}
                onMouseEnter={() => openMenu(item.key)}
                onMouseLeave={scheduleClose}
                onClick={() => setActiveMenu(activeMenu === item.key ? null : item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '0.5rem 0.75rem', background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem',
                  fontWeight: 500, color: activeMenu === item.key ? '#8BAA1D' : '#374151',
                  transition: 'color 0.15s',
                }}
              >
                {item.label}
                <svg
                  style={{ transition: 'transform 0.2s', transform: activeMenu === item.key ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ))}
          </nav>

          {/* Global search — desktop only */}
          <div className="hidden lg:flex flex-1 mx-6" style={{ maxWidth: '420px' }}>
            <GlobalSearch />
          </div>
          {/* spacer mobile */}
          <div className="flex-1 lg:hidden" />

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="hidden lg:block">
              <SkewButton href={`/${locale}/contact/`} variant="primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>{t('contact')}</SkewButton>
            </div>
            <Link href="/login/"
              className="hidden sm:flex"
              style={{ alignItems: 'center', gap: '0.4rem', color: '#ffffff', textDecoration: 'none', background: '#242426', border: '2px solid #242426', transform: 'skewX(-12deg)', padding: '0.4rem 0.9rem', transition: 'background 0.2s, border-color 0.2s', fontSize: '0.875rem', fontWeight: 700 }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = '#8BAA1D'; e.currentTarget.style.borderColor = '#8BAA1D' }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = '#242426'; e.currentTarget.style.borderColor = '#242426' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'skewX(12deg)', flexShrink: 0 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span style={{ transform: 'skewX(12deg)', display: 'inline-block' }}>{locale === 'es' ? 'Acceder' : 'Login'}</span>
            </Link>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg p-2 text-gray-600 lg:hidden" aria-label="Toggle menu">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search row — hidden on lg+ */}
        <div className="lg:hidden pb-3" style={{ display: 'flex' }}>
          <GlobalSearch />
        </div>
      </div>

      {/* Mega Menu Panel */}
      {activeMenu && (
        <div
          onMouseEnter={() => openMenu(activeMenu)}
          onMouseLeave={scheduleClose}
          style={{
            position: 'absolute', left: 0, right: 0, top: '100%',
            background: '#ffffff',
            borderTop: '3px solid #8BAA1D',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            zIndex: 200,
            animation: 'megaFadeIn 0.15s ease-out',
          }}
        >
          <style>{`@keyframes megaFadeIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }`}</style>
          <div style={{ position: 'relative' }}>
            <div
              onScroll={handleMenuScroll}
              style={{ paddingLeft: '6vw', paddingRight: '6vw', maxHeight: '70vh', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#8BAA1D #f1f5e8' }}
            >
              <MegaMenu type={activeMenu} onClose={() => setActiveMenu(null)} />
            </div>
            {/* Scroll hint — fade + bouncing arrow */}
            {!isScrolled && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'none', zIndex: 10 }}>
                <div style={{ height: '60px', background: 'linear-gradient(to top, rgba(255,255,255,0.98) 0%, transparent 100%)' }} />
                <div style={{ background: '#ffffff', display: 'flex', justifyContent: 'center', paddingBottom: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', animation: 'scrollBounce 1.2s ease-in-out infinite' }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#8BAA1D">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#8BAA1D" style={{ opacity: 0.4 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            <style>{`
              @keyframes scrollBounce {
                0%, 100% { transform: translateY(0); opacity: 1; }
                50% { transform: translateY(4px); opacity: 0.7; }
              }
            `}</style>
          </div>
          {/* Close on click outside overlay */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: -1 }}
            onClick={() => setActiveMenu(null)}
          />
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="border-t border-gray-100 py-4 lg:hidden" style={{ paddingLeft: '6vw', paddingRight: '6vw' }}>
          {navItems.map((item) => (
            <Link key={item.key} href={item.href as any} className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/contact/" className="mt-2 block py-2 text-sm font-semibold" style={{ color: '#8BAA1D' }} onClick={() => setMobileMenuOpen(false)}>
            {t('contact')}
          </Link>
        </nav>
      )}
    </header>
  )
}
