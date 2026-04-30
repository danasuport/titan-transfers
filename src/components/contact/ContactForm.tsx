'use client'

import { useState } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { useLocale } from 'next-intl'

interface Props {
  t: { name: string; email: string; message: string; send: string }
}

export function ContactForm({ t }: Props) {
  const router = useRouter()
  const locale = useLocale()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim(),
      locale,
    }
    if (!data.name || !data.email || !data.message) {
      setError(locale === 'es' ? 'Por favor rellena todos los campos.' : 'Please fill in all fields.')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('send_failed')
      router.push('/contact/sent/' as any)
    } catch {
      setError(locale === 'es'
        ? 'No se pudo enviar el mensaje. Inténtalo de nuevo o escríbenos a info@titantransfers.com.'
        : 'Could not send your message. Please try again or email info@titantransfers.com.')
      setSending(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1.5px solid #e5e7eb',
    background: '#F8FAF0',
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    color: '#242426',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '0.4rem',
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label style={labelStyle} htmlFor="contact-name">{t.name}</label>
        <input id="contact-name" name="name" type="text" required disabled={sending} style={inputStyle}
          onFocus={e => (e.currentTarget.style.borderColor = '#8BAA1D')}
          onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
        />
      </div>
      <div>
        <label style={labelStyle} htmlFor="contact-email">{t.email}</label>
        <input id="contact-email" name="email" type="email" required disabled={sending} style={inputStyle}
          onFocus={e => (e.currentTarget.style.borderColor = '#8BAA1D')}
          onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
        />
      </div>
      <div>
        <label style={labelStyle} htmlFor="contact-message">{t.message}</label>
        <textarea id="contact-message" name="message" required rows={5} disabled={sending} style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#8BAA1D')}
          onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
        />
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={sending}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: sending ? '#94a3b8' : '#242426',
            color: '#ffffff',
            border: 'none',
            padding: '0.85rem 2.5rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: sending ? 'not-allowed' : 'pointer',
            transform: 'skewX(-12deg)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (!sending) e.currentTarget.style.background = '#8BAA1D' }}
          onMouseLeave={e => { if (!sending) e.currentTarget.style.background = '#242426' }}
        >
          <span style={{ transform: 'skewX(12deg)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            {sending ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ animation: 'spin 1s linear infinite' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                {locale === 'es' ? 'Enviando…' : 'Sending…'}
              </>
            ) : (
              <>
                {t.send}
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </span>
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </form>
  )
}
