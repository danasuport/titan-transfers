'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import Image from 'next/image'
import { formatDate } from '@/lib/utils/formatters'
import { getBlogUrl, getTranslatedTitle } from '@/lib/utils/slugHelpers'
import { russoOne } from '@/lib/fonts'
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

  if (featured) {
    return (
      <Link href={getBlogUrl(post, locale) as any} style={{ textDecoration: 'none' }}>
        <article
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '360px', border: '1.5px solid', borderColor: hovered ? '#8BAA1D' : '#e5e7eb', transition: 'border-color 0.15s', background: '#ffffff', transform: 'skewX(-4deg)', overflow: 'hidden' }}
        >
          {/* Image */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            {post.featuredImage?.asset?.url ? (
              <Image src={post.featuredImage.asset.url} alt={title} fill style={{ objectFit: 'cover' }} sizes="50vw" />
            ) : (
              <div style={{ position: 'absolute', inset: 0, background: '#242426' }} />
            )}
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem 3rem 3rem 4rem', transform: 'skewX(4deg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {post.category && (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7C9919', background: '#f0f4e3', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.08em', transform: 'skewX(-6deg)', display: 'inline-block' }}>
                  {post.category}
                </span>
              )}
              {post.publishDate && (
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{formatDate(post.publishDate, locale)}</span>
              )}
            </div>

            <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', color: hovered ? '#8BAA1D' : '#242426', lineHeight: 1.2, marginBottom: '1rem', transition: 'color 0.15s' }}>
              {title}
            </h2>

            {excerpt && (
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.75, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {excerpt}
              </p>
            )}

            <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '0.5rem', background: hovered ? '#8BAA1D' : '#242426', color: '#ffffff', padding: '0.6rem 1.5rem', transform: 'skewX(-8deg)', transition: 'background 0.15s', fontSize: '0.8rem', fontWeight: 700 }}>
              <span style={{ transform: 'skewX(8deg)', display: 'inline-block' }}>
                {locale === 'es' ? 'Leer más →' : 'Read more →'}
              </span>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={getBlogUrl(post, locale) as any} style={{ textDecoration: 'none' }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1.5px solid', borderColor: hovered ? '#8BAA1D' : '#e5e7eb', background: '#ffffff', transition: 'border-color 0.15s', overflow: 'hidden' }}
      >
        {/* Image with diagonal bottom mask */}
        {post.featuredImage?.asset?.url && (
          <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', flexShrink: 0, clipPath: 'polygon(0% 0%, 100% 0%, 100% 88%, 92% 100%, 0% 100%)' }}>
            <Image
              src={post.featuredImage.asset.url}
              alt={title}
              fill
              loading="lazy"
              quality={75}
              style={{ objectFit: 'cover', transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.4s ease' }}
              sizes="33vw"
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: '#8BAA1D', zIndex: 1 }} />
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '1.25rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            {post.category && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#7C9919', background: '#f0f4e3', padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {post.category}
              </span>
            )}
            {post.publishDate && (
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{formatDate(post.publishDate, locale)}</span>
            )}
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: hovered ? '#8BAA1D' : '#242426', lineHeight: 1.4, marginBottom: '0.6rem', transition: 'color 0.15s', flex: 1 }}>
            {title}
          </h3>

          {excerpt && (
            <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>
              {excerpt}
            </p>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: hovered ? '#8BAA1D' : '#242426', color: '#ffffff', padding: '0.4rem 1rem', transform: 'skewX(-8deg)', transition: 'background 0.15s', fontSize: '0.75rem', fontWeight: 700 }}>
              <span style={{ transform: 'skewX(8deg)', display: 'inline-block' }}>
                {locale === 'es' ? 'Leer más →' : 'Read more →'}
              </span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
