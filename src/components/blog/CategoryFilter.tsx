'use client'

import { useTranslations } from 'next-intl'

const categories = ['all', 'event', 'guide', 'news', 'tips'] as const

export function CategoryFilter({
  active,
  onChange,
}: {
  active: string
  onChange: (category: string) => void
}) {
  const t = useTranslations('blog.categories')

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat === 'all' ? '' : cat)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            (cat === 'all' && !active) || cat === active
              ? 'bg-brand-600 text-white'
              : 'bg-glass-bg text-body hover:bg-glass-bg-hover'
          }`}
        >
          {cat === 'all' ? 'All' : t(cat)}
        </button>
      ))}
    </div>
  )
}
