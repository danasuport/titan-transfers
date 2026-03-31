import { Link } from '@/lib/i18n/navigation'

interface LinkItem {
  href: string
  label: string
  subtitle?: string
}

export function InternalLinks({ links, title }: { links: LinkItem[]; title?: string }) {
  if (!links || links.length === 0) return null

  return (
    <section>
      {title && <h2 className="mb-4 text-2xl font-bold text-heading">{title}</h2>}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center justify-between rounded-lg bg-dark-card px-4 py-3 text-sm ring-1 ring-glass-ring transition-all hover:ring-brand-500/30"
          >
            <div>
              <span className="font-medium text-heading transition-colors group-hover:text-brand-500">
                {link.label}
              </span>
              {link.subtitle && <span className="ml-2 text-xs text-muted">{link.subtitle}</span>}
            </div>
            <svg className="h-4 w-4 text-muted group-hover:text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </section>
  )
}
