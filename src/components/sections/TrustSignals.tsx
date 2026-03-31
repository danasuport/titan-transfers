'use client'

import { useTranslations } from 'next-intl'

function IconStar({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
}
function IconGlobe({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
}
function IconPhone({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
}
function IconCurrency({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
}
function IconUser({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
}
function IconCheck({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}

const signals = [
  { key: 'rating', Icon: IconStar },
  { key: 'destinations', Icon: IconGlobe },
  { key: 'support', Icon: IconPhone },
  { key: 'fixedPrice', Icon: IconCurrency },
  { key: 'meetGreet', Icon: IconUser },
  { key: 'freeCancel', Icon: IconCheck },
] as const

export function TrustSignals({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('trust')

  if (compact) {
    return (
      <div className="border-t border-dark-border bg-dark px-6 py-3">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
          {signals.slice(0, 4).map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <s.Icon className="h-3.5 w-3.5 text-brand-400" />
              <span className="font-medium">{t(s.key)}</span>
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="bg-dark-light py-16">
      <div style={{ paddingLeft: '6vw', paddingRight: '6vw' }}>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {signals.map((s) => (
            <div key={s.key} className="group text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/20 transition-transform duration-300 group-hover:scale-110">
                <s.Icon className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white">{t(s.key)}</h3>
              <p className="mt-1 text-xs text-gray-500">{t(`${s.key}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
