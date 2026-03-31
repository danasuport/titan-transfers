'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

function IconCalendar({ className = 'h-7 w-7' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
}
function IconUserCheck({ className = 'h-7 w-7' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75l2.25 2.25 4.5-4.5" /></svg>
}
function IconSparkles({ className = 'h-7 w-7' }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
}

export function HowItWorks() {
  const t = useTranslations('howItWorks')

  const steps = [
    { num: '01', icon: IconCalendar, title: t('step1Title'), desc: t('step1Desc') },
    { num: '02', icon: IconUserCheck, title: t('step2Title'), desc: t('step2Desc') },
    { num: '03', icon: IconSparkles, title: t('step3Title'), desc: t('step3Desc') },
  ]

  return (
    <section className="relative overflow-hidden bg-dark py-28">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-20 max-w-3xl text-center"
        >
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-400 ring-1 ring-brand-500/20">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            {t('subtitle')}
          </div>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-heading sm:text-4xl lg:text-5xl">
            {t('title')}
          </h2>
          <p className="text-lg text-body">{t('subtitle')}</p>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3 md:gap-0">
          {/* Connector line */}
          <div className="absolute left-[16.66%] right-[16.66%] top-[72px] hidden h-px md:block">
            <div className="h-full w-full bg-gradient-to-r from-brand-500/40 via-brand-500/20 to-brand-500/40" />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center md:px-8"
            >
              <div className="relative mb-10">
                <div className="absolute inset-0 scale-75 rounded-3xl bg-brand-500/10 blur-xl" />
                <div className="relative flex h-[144px] w-[144px] items-center justify-center rounded-3xl bg-glass-bg ring-1 ring-glass-ring transition-all duration-500 hover:ring-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/10">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-extrabold tracking-[0.3em] text-brand-500">{step.num}</span>
                    <step.icon className="h-12 w-12 text-heading" />
                  </div>
                </div>
                {i < 2 && (
                  <div className="absolute -right-4 top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full bg-brand-500 shadow-lg shadow-brand-500/50 md:block" />
                )}
              </div>

              <h3 className="mb-3 text-xl font-bold text-heading">{step.title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-body">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
