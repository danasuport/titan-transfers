'use client'

import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { russoOne } from '@/lib/fonts'

const vehicles = [
  { key: 'economy',       pax: 3, bags: 3, img: '/vehicles/economy.jpg',         icon: '/vehicles/icon-economy.png' },
  { key: 'standard',      pax: 3, bags: 3, img: '/vehicles/standard.jpg',        icon: '/vehicles/icon-standard.png' },
  { key: 'firstClass',    pax: 3, bags: 2, img: '/vehicles/first-class.jpg',     icon: '/vehicles/icon-first-class.png' },
  { key: 'suv',           pax: 6, bags: 6, img: '/vehicles/suv.jpg',             icon: '/vehicles/icon-suv.png' },
  { key: 'vanStandard',   pax: 7, bags: 7, img: '/vehicles/van-standard.jpg',    icon: '/vehicles/icon-van-standard.png' },
  { key: 'vanFirstClass', pax: 6, bags: 6, img: '/vehicles/van-first-class.jpg', icon: '/vehicles/icon-van-first-class.png' },
] as const

function IconPerson() {
  return <svg width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
}
function IconBag() {
  return <svg width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
}

export function FleetCompact() {
  const t = useTranslations('fleet')
  const es = useLocale() === 'es'

  return (
    <div style={{ margin: '2.5rem 0', border: '1.5px solid #e5e7eb', background: '#F8FAF0', transform: 'skewX(-4deg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', transform: 'skewX(4deg)' }}>
        <h3 className={russoOne.className} style={{ fontSize: '1rem', color: '#242426', margin: 0 }}>
          {t('title')}
        </h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[
            { num: '50+',  label: es ? 'países' : 'countries' },
            { num: '200+', label: es ? 'aeropuertos' : 'airports' },
            { num: '500+', label: es ? 'ciudades' : 'cities' },
          ].map(({ num, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#242426', transform: 'skewX(-8deg)', padding: '0.25rem 0.75rem' }}>
              <span style={{ transform: 'skewX(8deg)', fontSize: '0.75rem', fontWeight: 700, color: '#8BAA1D' }}>{num}</span>
              <span style={{ transform: 'skewX(8deg)', fontSize: '0.72rem', color: '#ffffff' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle grid */}
      <div className="resp-3col-sm" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#e5e7eb' }}>
        {vehicles.map((v) => (
          <div key={v.key} style={{ background: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}>
            {/* Thumbnail */}
            <div style={{ position: 'relative', width: '72px', height: '48px', flexShrink: 0, overflow: 'hidden' }}>
              <Image src={v.img} alt={t(v.key as any)} fill style={{ objectFit: 'cover' }} sizes="72px" />
            </div>

            {/* Info */}
            <div style={{ minWidth: 0, transform: 'skewX(4deg)', flexShrink: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#242426', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t(v.key as any)}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#64748b' }}>
                  <IconPerson />{v.pax}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#64748b' }}>
                  <IconBag />{v.bags}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transform: 'skewX(4deg)' }}>
        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{t('subtitle')}</span>
        <a href="/#booking" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#8BAA1D', color: '#ffffff', padding: '0.4rem 1.25rem', transform: 'skewX(-8deg)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700 }}>
          <span style={{ transform: 'skewX(8deg)', display: 'inline-block' }}>Book →</span>
        </a>
      </div>
    </div>
  )
}
