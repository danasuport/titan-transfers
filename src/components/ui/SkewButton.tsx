'use client'

import { useState } from 'react'

type Variant = 'primary' | 'outline' | 'outline-white'

interface SkewButtonProps {
  href?: string
  onClick?: () => void
  variant?: Variant
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  ariaLabel?: string
}

function getStyle(variant: Variant, hovered: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '0.75rem 1.75rem',
    fontWeight: 700,
    fontSize: '0.9rem',
    textDecoration: 'none',
    transform: 'skewX(-12deg)',
    cursor: 'pointer',
    border: 'none',
    transition: 'background 0.2s, color 0.2s, border-color 0.2s',
    fontFamily: 'inherit',
  }
  if (variant === 'primary') return { ...base, background: hovered ? '#242426' : '#8BAA1D', color: '#ffffff' }
  if (variant === 'outline') return { ...base, background: hovered ? '#242426' : 'transparent', color: hovered ? '#ffffff' : '#242426', border: '2px solid #242426' }
  return { ...base, background: hovered ? '#ffffff' : 'transparent', color: hovered ? '#242426' : '#ffffff', border: '2px solid #ffffff' }
}

export function SkewButton({ href, onClick, variant = 'primary', children, style, className, ariaLabel }: SkewButtonProps) {
  const [hovered, setHovered] = useState(false)
  const s = { ...getStyle(variant, hovered), ...style }
  const inner = <span style={{ display: 'inline-block', transform: 'skewX(12deg)' }}>{children}</span>

  if (href) {
    return (
      <a
        href={href}
        className={className}
        style={s}
        aria-label={ariaLabel}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {inner}
      </a>
    )
  }
  return (
    <button
      className={className}
      style={s}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {inner}
    </button>
  )
}
