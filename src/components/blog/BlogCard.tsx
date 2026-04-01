'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import Image from 'next/image'
import { formatDate } from '@/lib/utils/formatters'
import { getBlogUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import type { Locale } from '@/lib/i18n/config'

interface BlogCardProps {
  post: {
    _id: string
    title: string
    slug: { current: string }
    category?: string
    excerpt?: string
    publishDate?: string
    featuredImage?: { asset: { url: string } }
    translations?: Record<string, { title?: string; slug?: { current: string }; excerpt?: string }>
  }
  featured?: boolean
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const locale = useLocale() as Locale
  const [hovered, setHovered] = useState(false)
  const title = getTranslatedTitle(post, locale)
  const excerpt = (locale !== 'en' && post.translations?.[locale]?.excerpt) || post.excerpt

  return (
    <Link href={getBlogUrl(post, locale) as any} style={{ textDecoration: 'none' }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#ffffff',
          border: '1.5px solid', borderColor: hovered ? '#8BAA1D' : '#e5e7eb',
          overflow: 'hidden',
          transition: 'border-color 0.15s',
          height: '100%', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Image */}
        {post.featuredImage?.asset?.url && (
          <div style={{ position: 'relative', aspectRatio: featured ? '16/7' : '16/10', overflow: 'hidden', flexShrink: 0 }}>
            <Image
              src={post.featuredImage.asset.url}
              alt={title}
              fill
              loading="lazy"
              quality={75}
              style={{ objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s ease' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Green bottom bar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: '#8BAA1D', zIndex: 1 }} />
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '1.25rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {post.category && (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8BAA1D', background: '#f0f4e3', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {post.category}
              </span>
            )}
            {post.publishDate && (
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{formatDate(post.publishDate, locale)}</span>
            )}
          </div>

          <h3 style={{ fontSize: featured ? '1.25rem' : '1rem', fontWeight: 700, color: hovered ? '#8BAA1D' : '#242426', lineHeight: 1.4, marginBottom: '0.6rem', transition: 'color 0.15s' }}>
            {title}
          </h3>

          {excerpt && (
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
              {excerpt}
            </p>
          )}

          {/* Read more */}
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: '#8BAA1D' }}>
            {locale === 'es' ? 'Leer más' : 'Read more'}
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  )
}
