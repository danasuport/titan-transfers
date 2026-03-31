import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { generateBreadcrumbSchema } from '@/lib/seo/schemaOrg'

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const t = useTranslations('breadcrumb')

  const allItems = [{ label: t('home'), href: '/' }, ...items]
  const schemaItems = allItems
    .filter((item) => item.href)
    .map((item) => ({ name: item.label, url: item.href! }))

  return (
    <>
      <SchemaOrg data={generateBreadcrumbSchema(schemaItems)} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-300">
          {allItems.map((item, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && (
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              )}
              {item.href && i < allItems.length - 1 ? (
                <Link href={item.href} className="text-brand-400 transition-colors hover:text-brand-300">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-white">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
