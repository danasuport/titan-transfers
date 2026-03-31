import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'default' | 'amber' | 'green' | 'blue'
  children: ReactNode
}

const variants = {
  default: 'bg-glass-bg text-body',
  amber: 'bg-brand-100 text-brand-800',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
