'use client'

import { useMemo, useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { BlogCard } from '@/components/blog/BlogCard'
import { russoOne } from '@/lib/fonts'
import type { Locale } from '@/lib/i18n/config'
import {
  BLOG_CATEGORIES,
  ALL_LABEL,
  EMPTY_CATEGORY_LABEL,
  normalizeCategory,
  type BlogCategoryKey,
} from '@/lib/blog/categories'

type Filter = BlogCategoryKey | 'all'

const PER_PAGE = 12

export function BlogListing({ posts }: { posts: any[] }) {
  const locale = useLocale() as Locale
  const [active, setActive] = useState<Filter>('all')
  const [page, setPage] = useState(1)

  // Read initial category from the URL (?category=beaches) so links are shareable
  // without forcing a server round-trip.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('category')
    const norm = param ? normalizeCategory(param) : null
    if (norm) setActive(norm)
  }, [])

  // Count per category — only categories with content show a count badge.
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const p of posts) {
      const k = normalizeCategory(p.category)
      if (k) c[k] = (c[k] || 0) + 1
    }
    return c
  }, [posts])

  const filtered = useMemo(
    () => (active === 'all' ? posts : posts.filter((p) => normalizeCategory(p.category) === active)),
    [posts, active],
  )

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const pagePosts = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function selectFilter(f: Filter) {
    setActive(f)
    setPage(1)
    // Sync URL without navigating (keeps the filter instant / AJAX-like).
    const url = new URL(window.location.href)
    if (f === 'all') url.searchParams.delete('category')
    else url.searchParams.set('category', f)
    url.searchParams.delete('page')
    window.history.replaceState({}, '', url)
    // Bring the grid back into view on mobile after switching.
    document.getElementById('blog-grid-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const chips: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: ALL_LABEL[locale], count: posts.length },
    ...BLOG_CATEGORIES.map((c) => ({ key: c.key as Filter, label: c.labels[locale], count: counts[c.key] || 0 })),
  ]

  return (
    <div>
      <div id="blog-grid-top" />

      {/* ─── Filter bar — wraps on desktop, horizontal-scrolls on mobile ─── */}
      <div className="blog-filter-bar" role="tablist" aria-label="Blog categories">
        {chips.map((chip) => {
          const isActive = active === chip.key
          return (
            <button
              key={chip.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => selectFilter(chip.key)}
              className={`blog-filter-chip ${isActive ? russoOne.className : ''}`}
              style={{
                background: isActive ? '#8BAA1D' : '#f1f5e8',
                color: isActive ? '#ffffff' : '#242426',
                border: 'none',
                padding: '0.55rem 1.15rem',
                transform: 'skewX(-8deg)',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <span style={{ transform: 'skewX(8deg)', display: 'inline-block' }}>
                {chip.label}
                {chip.count > 0 && (
                  <span style={{ opacity: isActive ? 0.85 : 0.45, marginInlineStart: '0.4rem', fontWeight: 600 }}>
                    {chip.count}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── Grid / empty state ─── */}
      {pagePosts.length > 0 ? (
        <div className="blog-grid">
          {pagePosts.map((post: any) => (
            <BlogCard key={post._id} post={post} featured />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            color: '#64748b',
            background: '#F8FAF0',
            border: '1.5px dashed #d6e0b8',
          }}
        >
          <div style={{ width: '40px', height: '8px', background: '#8BAA1D', transform: 'skewX(-8deg)', margin: '0 auto 1.25rem' }} />
          <p style={{ fontSize: '1rem', maxWidth: '420px', margin: '0 auto', lineHeight: 1.7 }}>
            {EMPTY_CATEGORY_LABEL[locale]}
          </p>
        </div>
      )}

      {/* ─── Client-side pagination ─── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '3rem', flexWrap: 'wrap' }}>
          {page > 1 && (
            <button type="button" onClick={() => setPage(page - 1)} style={pagerBtn(false)}>
              <span style={{ transform: 'skewX(8deg)', display: 'inline-block' }}>←</span>
            </button>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={p === page ? russoOne.className : ''}
              style={pagerBtn(p === page)}
            >
              <span style={{ transform: 'skewX(8deg)', display: 'inline-block' }}>{p}</span>
            </button>
          ))}
          {page < totalPages && (
            <button type="button" onClick={() => setPage(page + 1)} style={pagerBtn(false)}>
              <span style={{ transform: 'skewX(8deg)', display: 'inline-block' }}>→</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function pagerBtn(activeState: boolean): React.CSSProperties {
  return {
    background: activeState ? '#8BAA1D' : '#f1f5e8',
    color: activeState ? '#ffffff' : '#242426',
    border: 'none',
    padding: '0.5rem 0.9rem',
    transform: 'skewX(-8deg)',
    fontSize: '0.82rem',
    fontWeight: activeState ? 700 : 500,
    minWidth: '36px',
    textAlign: 'center',
    cursor: 'pointer',
  }
}
