import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { generateBreadcrumbSchema } from '@/lib/seo/schemaOrg'

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs({ items, variant = 'dark' }: { items: BreadcrumbItem[]; variant?: 'dark' | 'light' }) {
  const t = useTranslations('breadcrumb')

  const allItems = [{ label: t('home'), href: '/' }, ...items]
  const schemaItems = allItems
    .filter((item) => item.href)
    .map((item) => ({ name: item.label, url: item.href! }))

  const linkColor = variant === 'light' ? '#8BAA1D' : '#8BAA1D'
  const separatorColor = variant === 'light' ? '#94a3b8' : '#6b7280'
  const currentColor = variant === 'light' ? '#242426' : '#ffffff'
  const baseColor = variant === 'light' ? '#64748b' : '#9ca3af'

  return (
    <>
      <SchemaOrg data={generateBreadcrumbSchema(schemaItems)} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: baseColor, listStyle: 'none', margin: 0, padding: 0 }}>
          {allItems.map((item, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {i > 0 && (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={separatorColor}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              )}
              {item.href && i < allItems.length - 1 ? (
                <Link href={item.href} style={{ color: linkColor, textDecoration: 'none', fontWeight: 500 }}>
                  {item.label}
                </Link>
              ) : (
                <span style={{ fontWeight: 600, color: currentColor }}>{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
