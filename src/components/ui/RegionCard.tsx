'use client'

import { useState } from 'react'
import { Link } from '@/lib/i18n/navigation'

export function RegionCard({ href, title }: { href: string; title: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link href={href as any} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
          background: hovered ? '#8BAA1D' : '#ffffff',
          border: '1.5px solid', borderColor: hovered ? '#8BAA1D' : '#e5e7eb',
          padding: '0.75rem 1rem 0.75rem 1.25rem',
          transform: 'skewX(-8deg)',
          transition: 'background 0.15s, border-color 0.15s',
          cursor: 'pointer',
        }}
      >
        <span style={{ transform: 'skewX(8deg)', display: 'block', fontSize: '0.875rem', fontWeight: 600, color: hovered ? '#ffffff' : '#242426', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.15s' }}>
          {title}
        </span>
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke={hovered ? '#ffffff' : '#64748b'} style={{ transform: 'skewX(8deg)', flexShrink: 0, transition: 'stroke 0.15s' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  )
}
