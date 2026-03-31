'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

function IconStar({ className = 'h-4 w-4' }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
}

function IconQuote({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
    </svg>
  )
}

const testimonials = [
  { name: 'Sarah M.', location: 'London, UK', text: 'Excellent service from Barcelona Airport. Driver was waiting with a sign and the car was spotless. Will use again!', rating: 5 },
  { name: 'Marco R.', location: 'Rome, Italy', text: 'Used Titan for our family trip to Malaga. The minivan was perfect for us and the kids. Great price too.', rating: 5 },
  { name: 'Anna K.', location: 'Berlin, Germany', text: 'Very professional transfer from Palma Airport to our hotel. On time, friendly driver, fair price. Highly recommend.', rating: 5 },
  { name: 'James T.', location: 'New York, USA', text: 'Best airport transfer service we have used in Europe. The booking was easy and the driver was punctual.', rating: 5 },
]

export function Testimonials() {
  const t = useTranslations('home')

  return (
    <section className="relative overflow-hidden py-28">
      {/* Brand gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-[#2a3a08]" />

      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      {/* Animated orbs */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-white blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute -bottom-20 -right-20 h-[350px] w-[350px] rounded-full bg-brand-300 blur-[100px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-white/30" />
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t('testimonials')}
          </h2>
          {/* Overall rating */}
          <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-6 py-3 backdrop-blur-sm ring-1 ring-white/10">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <IconStar key={i} className="h-5 w-5 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-bold text-white">4.8/5</span>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-sm text-white/60">2,500+ reviews</span>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-2xl border border-white/[0.12] bg-white/[0.07] p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.12] hover:shadow-2xl hover:shadow-black/20"
            >
              {/* Quote icon */}
              <div className="absolute right-4 top-4 text-white/10">
                <IconQuote className="h-12 w-12" />
              </div>

              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <IconStar key={j} className="h-4 w-4 text-yellow-400" />
                ))}
              </div>

              {/* Text */}
              <p className="mb-6 text-sm leading-relaxed text-white/80">
                &ldquo;{item.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400/30 to-brand-600/30 text-sm font-bold text-white ring-1 ring-white/10">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-white/50">{item.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
