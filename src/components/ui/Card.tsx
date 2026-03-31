import type { ReactNode } from 'react'
import { Link } from '@/lib/i18n/navigation'
import Image from 'next/image'

interface CardProps {
  href?: string
  title: string
  subtitle?: string
  image?: string
  badge?: string
  children?: ReactNode
  className?: string
}

export function Card({ href, title, subtitle, image, badge, children, className = '' }: CardProps) {
  const content = (
    <div className={`group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md ${className}`}>
      {image && (
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {badge && (
            <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-brand-600">
          {title}
        </h3>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        {children}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
