'use client'

import { useState } from 'react'

interface Props {
  t: { name: string; email: string; message: string; send: string }
}

export function ContactForm({ t }: Props) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    await new Promise(r => setTimeout(r, 800))
    setSending(false)
    setSent(true)
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

  if (sent) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#F8FAF0', border: '1.5px solid #8BAA1D', padding: '1.5rem', transform: 'skewX(-4deg)' }}>
        <div style={{ transform: 'skewX(4deg)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#8BAA1D', padding: '6px', transform: 'skewX(-8deg)', flexShrink: 0 }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#fff" style={{ transform: 'skewX(8deg)', display: 'block' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#242426' }}>
            Message sent — we'll get back to you shortly.
          </span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label style={labelStyle}>{t.name}</label>
        <input type="text" required style={inputStyle}
          onFocus={e => (e.currentTarget.style.borderColor = '#8BAA1D')}
          onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
        />
      </div>
      <div>
        <label style={labelStyle}>{t.email}</label>
        <input type="email" required style={inputStyle}
          onFocus={e => (e.currentTarget.style.borderColor = '#8BAA1D')}
          onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
        />
      </div>
      <div>
        <label style={labelStyle}>{t.message}</label>
        <textarea required rows={5} style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#8BAA1D')}
          onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
        />
      </div>

      {/* Submit button — skewed / / style */}
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
                Sending...
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
