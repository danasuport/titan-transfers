'use client'

import { useLocale } from 'next-intl'
import { russoOne } from '@/lib/fonts'

interface Props {
  currentPage: number
  totalPages: number
  basePath: string
}

export function BlogPagination({ currentPage, totalPages, basePath }: Props) {
  const locale = useLocale()
  const es = locale === 'es'

  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  function href(page: number) {
    return page === 1 ? basePath : `${basePath}?page=${page}`
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '3rem' }}>
      {/* Prev */}
      {currentPage > 1 && (
        <a href={href(currentPage - 1)} style={{ textDecoration: 'none' }}>
          <div style={{ background: '#242426', color: '#ffffff', padding: '0.5rem 1.1rem', transform: 'skewX(-8deg)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
            <span style={{ transform: 'skewX(8deg)', display: 'inline-block' }}>← {es ? 'Anterior' : 'Previous'}</span>
          </div>
        </a>
      )}

      {pages.map(p => (
        <a key={p} href={href(p)} style={{ textDecoration: 'none' }}>
          <div className={p === currentPage ? russoOne.className : ''} style={{
            background: p === currentPage ? '#8BAA1D' : '#f1f5e8',
            color: p === currentPage ? '#ffffff' : '#242426',
            padding: '0.5rem 0.9rem',
            transform: 'skewX(-8deg)',
            fontSize: '0.82rem',
            fontWeight: p === currentPage ? 700 : 500,
            minWidth: '36px',
            textAlign: 'center',
          }}>
            <span style={{ transform: 'skewX(8deg)', display: 'inline-block' }}>{p}</span>
          </div>
        </a>
      ))}

      {/* Next */}
      {currentPage < totalPages && (
        <a href={href(currentPage + 1)} style={{ textDecoration: 'none' }}>
          <div style={{ background: '#242426', color: '#ffffff', padding: '0.5rem 1.1rem', transform: 'skewX(-8deg)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
            <span style={{ transform: 'skewX(8deg)', display: 'inline-block' }}>{es ? 'Siguiente' : 'Next'} →</span>
          </div>
        </a>
      )}
    </div>
  )
}
