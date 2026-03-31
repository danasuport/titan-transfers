'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

function IconGlobe({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
}
function IconPlane({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
}
function IconClock({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function IconStar({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
}

function AnimatedCounter({ target, suffix = '', duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const step = target / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [isInView, target, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

const stats = [
  { key: 'airports', target: 120, suffix: '+', icon: IconPlane },
  { key: 'countries', target: 30, suffix: '+', icon: IconGlobe },
  { key: 'support', value: '24/7', icon: IconClock },
  { key: 'rating', target: 4.8, suffix: '', icon: IconStar, decimal: true },
] as const

export function TrustNumbers({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('trust')

  if (compact) {
    return (
      <div className="border-y border-dark-border bg-dark/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-4">
          {stats.map((s) => (
            <div key={s.key} className="flex items-center gap-2.5">
              <s.icon className="h-4 w-4 text-brand-400" />
              <span className="text-lg font-extrabold text-heading">{'value' in s ? s.value : `${s.target}${s.suffix}`}</span>
              <span className="text-xs text-muted">{t(s.key)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="relative overflow-hidden bg-dark py-20">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute left-1/2 top-0 h-[1px] w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20 transition-all duration-500 group-hover:bg-brand-500/20 group-hover:shadow-lg group-hover:shadow-brand-500/10 group-hover:ring-brand-500/40">
                <s.icon className="h-7 w-7" />
              </div>
              <div className="text-4xl font-extrabold tracking-tight text-heading sm:text-5xl">
                {'value' in s ? (
                  s.value
                ) : 'decimal' in s ? (
                  <AnimatedCounter target={48} suffix="" duration={2} />
                ) : (
                  <AnimatedCounter target={s.target} suffix={s.suffix} duration={2} />
                )}
                {'decimal' in s && <span className="text-brand-400">.</span>}
                {'decimal' in s && <span className="text-3xl sm:text-4xl">8</span>}
              </div>
              <div className="mt-2 text-sm font-medium text-muted">{t(s.key)}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 h-[1px] w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
    </section>
  )
}
