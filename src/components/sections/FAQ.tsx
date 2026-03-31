'use client'

import { useState } from 'react'
import Image from 'next/image'
import { russoOne } from '@/lib/fonts'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { generateFAQSchema } from '@/lib/seo/schemaOrg'

interface FAQItem {
  question: string
  answer: string
}

interface FAQImage {
  url: string
  alt: string
}

function FAQRow({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        transform: 'skewX(-8deg)',
        background: isOpen ? '#F8FAF0' : '#ffffff',
        border: `1.5px solid ${isOpen || hovered ? '#8BAA1D' : '#e5e7eb'}`,
        borderLeft: `3px solid ${isOpen || hovered ? '#8BAA1D' : '#e5e7eb'}`,
        transition: 'border-color 0.15s, background 0.15s',
        marginBottom: '0.5rem',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1rem', width: '100%', textAlign: 'left',
          padding: '1.1rem 1.25rem', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
          transform: 'skewX(8deg)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: isOpen ? 600 : 500, color: isOpen ? '#8BAA1D' : '#242426', transition: 'color 0.15s', lineHeight: 1.5 }}>
          {item.question}
        </h3>
        <div style={{
          flexShrink: 0, width: '28px', height: '28px',
          background: isOpen ? '#8BAA1D' : '#242426',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: 'skewX(-8deg)', transition: 'background 0.15s',
        }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#ffffff"
            style={{ transform: `skewX(8deg) rotate(${isOpen ? 180 : 0}deg)`, transition: 'transform 0.25s' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows 0.25s ease' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #e5e7eb', transform: 'skewX(8deg)' }}>
            <p style={{ margin: '1rem 0 0', fontSize: '0.9rem', color: '#475569', lineHeight: 1.75 }}>
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FAQ({ items, title, images }: { items: FAQItem[]; title?: string; images?: FAQImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [imgKey, setImgKey] = useState(0)

  if (!items || items.length === 0) return null

  const hasImages = images && images.length > 0
  const activeImg = hasImages
    ? images![openIndex !== null ? openIndex % images!.length : 0]
    : null

  function handleToggle(i: number) {
    const next = openIndex === i ? null : i
    setOpenIndex(next)
    setImgKey(k => k + 1)
  }

  return (
    <section>
      <SchemaOrg data={generateFAQSchema(items)} />
      {title && (
        <h2 className={russoOne.className} style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#242426', marginBottom: '1.5rem' }}>
          {title}
        </h2>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: hasImages ? '1fr 380px' : '1fr', gap: '2.5rem', alignItems: 'start' }}>

        {/* FAQ list */}
        <div style={{ maxWidth: hasImages ? 'none' : '860px' }}>
          {items.map((item, i) => (
            <FAQRow
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => handleToggle(i)}
            />
          ))}
        </div>

        {/* Sticky image panel */}
        {hasImages && activeImg && (
          <div style={{ position: 'sticky', top: '100px' }}>
            <div
              key={imgKey}
              style={{
                position: 'relative',
                aspectRatio: '4/3',
                overflow: 'hidden',
                clipPath: 'polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%)',
                animation: 'faqImgFade 0.35s ease-out',
              }}
            >
              <Image
                src={activeImg.url}
                alt={activeImg.alt}
                fill
                style={{ objectFit: 'cover' }}
                sizes="380px"
              />
              {/* Green bottom bar */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: '#8BAA1D', zIndex: 1 }} />
            </div>
            {/* Alt text visible as caption for SEO context */}
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.6rem', paddingLeft: '6%', lineHeight: 1.4 }}>
              {activeImg.alt}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes faqImgFade {
          from { opacity: 0; transform: scale(1.03); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  )
}
