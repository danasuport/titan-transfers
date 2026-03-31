'use client'

import { useState } from 'react'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { generateFAQSchema } from '@/lib/seo/schemaOrg'

interface FAQItem {
  question: string
  answer: string
}

export function FAQ({ items, title }: { items: FAQItem[]; title?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!items || items.length === 0) return null

  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SchemaOrg data={generateFAQSchema(items)} />
        {title && <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">{title}</h2>}
        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl transition-all duration-300 ${
                  isOpen
                    ? 'ring-1 ring-brand-500/30 bg-brand-500/5 shadow-md shadow-brand-500/5'
                    : 'ring-1 ring-glass-ring bg-glass-bg shadow-sm hover:ring-dark-border-hover hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <h3 className={`font-semibold transition-colors ${isOpen ? 'text-brand-400' : 'text-heading'}`}>
                    {item.question}
                  </h3>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    isOpen
                      ? 'bg-brand-500 text-white rotate-180 shadow-md shadow-brand-500/25'
                      : 'bg-glass-bg text-muted'
                  }`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6">
                      <div className="h-px bg-gradient-to-r from-brand-500/30 via-brand-500/10 to-transparent mb-4" />
                      <p className="leading-relaxed text-body">{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
