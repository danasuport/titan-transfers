'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { russoOne } from '@/lib/fonts'
import { pick } from '@/lib/i18n/pick'
import { OVERALL_RATING, REVIEWS_FLOOR, formatRating, formatCount } from '@/lib/reviews'
import type { Locale } from '@/lib/i18n/config'

const starPaths = [
  'M51.7538 67.3504L54.7436 68.9755L53.7109 70.0167L50.7212 68.3916L51.7538 67.3504Z',
  'M61.4278 62.2359L60.2312 63.4424L59.5195 59.5168L60.7196 58.3068L61.4278 62.2359Z',
  'M63.4338 73.3231C63.5105 73.7312 63.357 74.0231 63.2175 74.192C63.0081 74.4417 62.7011 74.593 62.3907 74.593C62.2197 74.593 62.0488 74.5472 61.8848 74.4593L56.2751 71.4096L57.3077 70.3719L61.9371 72.887L60.8382 66.8087L62.0383 65.6021L63.4338 73.3231Z',
  'M77.2732 30.3881L58.8741 48.0954L60.1126 54.9405L58.9125 56.1505L57.6357 49.0944L57.367 47.5994L58.4555 46.5512L75.8079 29.8534L52.0329 26.6243L50.5433 26.4203L49.8909 25.0555L39.4983 3.25375L29.1092 25.0555L28.4568 26.4203L26.9636 26.6243L3.19213 29.8534L20.5446 46.5512L21.633 47.5994L21.3609 49.0944L17.0594 72.887L38.1761 61.4093L39.4983 60.6882L40.824 61.4093L49.1862 65.9575L48.1571 66.9951L39.4983 62.2887L17.1118 74.4593C16.9478 74.5473 16.7769 74.593 16.6059 74.593C16.2989 74.593 15.9884 74.4418 15.7826 74.192C15.6396 74.0232 15.4895 73.7312 15.5628 73.3232L20.1224 48.0954L1.72691 30.3881C1.29083 29.966 1.38851 29.4735 1.44782 29.28C1.51061 29.0901 1.71993 28.6328 2.31649 28.5519L27.5253 25.1293L38.5424 2.01558C38.8041 1.46684 39.2994 1.40704 39.4983 1.40704C39.6971 1.40704 40.196 1.46684 40.4577 2.01558L51.4748 25.1293L76.6801 28.5519C77.2767 28.6328 77.486 29.0901 77.5488 29.28C77.6116 29.4735 77.7092 29.966 77.2732 30.3881Z',
  'M51.7536 67.3504L49.6918 69.4292L52.6815 71.0543L54.7433 68.9755L51.7536 67.3504ZM61.9194 57.0967L59.5193 59.5168L60.2309 63.4424L61.4275 62.2359L62.6311 61.0223L61.9194 57.0967ZM64.808 73.0699L63.2381 64.3886L62.038 65.6021L60.838 66.8087L61.9369 72.887L57.3075 70.3719L56.2748 71.4096L55.2492 72.4473L61.2252 75.6975C61.6055 75.905 62.0032 76 62.3904 76C63.8312 76 65.1011 74.6844 64.808 73.0699ZM76.8647 27.1554L52.4059 23.8349L41.7133 1.40702C41.2667 0.467833 40.3841 0 39.498 0C38.6119 0 37.7293 0.467833 37.2827 1.40702L26.5936 23.8349L2.13131 27.1554C0.0904576 27.4333 -0.72937 29.9695 0.763763 31.4046L18.6151 48.5878L14.188 73.0699C13.8985 74.6844 15.1683 76 16.6056 76C16.9929 76 17.3906 75.905 17.7743 75.6975L39.498 63.8856L47.1276 68.0328L48.1568 66.9951L49.1859 65.9574L40.8237 61.4092L39.498 60.6881L38.1758 61.4092L17.0592 72.887L21.3606 49.0943L21.6327 47.5994L20.5443 46.5511L3.19185 29.8534L26.9634 26.6243L28.4565 26.4203L29.1089 25.0555L39.498 3.25373L49.8906 25.0555L50.543 26.4203L52.0327 26.6243L75.8077 29.8534L58.4552 46.5511L57.3668 47.5994L57.6354 49.0943L58.9122 56.1505L61.3124 53.7304L60.3809 48.5878L78.2357 31.4046C79.7254 29.9695 78.9091 27.4333 76.8647 27.1554Z',
]

function Stars({ count = 5, size = 18 }: { count?: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const full = i < Math.floor(count)
        const partial = !full && i < count
        const pct = partial ? Math.round((count - Math.floor(count)) * 100) : 0
        const id = `sp-${size}-${i}`
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 79 76" fill="none">
            {partial && (
              <defs>
                <linearGradient id={id} x1="0" y1="0" x2="79" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset={`${pct}%`} stopColor="#8BAA1D" />
                  <stop offset={`${pct}%`} stopColor="#d1d5db" />
                </linearGradient>
              </defs>
            )}
            {starPaths.map((d, j) => (
              <path key={j} d={d} fill={full ? '#8BAA1D' : partial ? `url(#${id})` : '#d1d5db'} />
            ))}
          </svg>
        )
      })}
    </div>
  )
}

function TrustpilotLogo() {
  return (
    <svg height="20" viewBox="0 0 116 22" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 0l2.7 8.3H22l-7 5.1 2.7 8.3-7-5.1-7 5.1 2.7-8.3-7-5.1h8.3L11 0z" fill="#00B67A"/>
      <text x="26" y="16" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="700" fill="#191919">Trustpilot</text>
    </svg>
  )
}

function GoogleLogo() {
  return (
    <svg height="20" viewBox="0 0 72 20" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="15" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="700">
        <tspan fill="#4285F4">G</tspan><tspan fill="#EA4335">o</tspan><tspan fill="#FBBC05">o</tspan><tspan fill="#4285F4">g</tspan><tspan fill="#34A853">l</tspan><tspan fill="#EA4335">e</tspan>
      </text>
    </svg>
  )
}

function TrustedShopsLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <img src="/logo-trusted-shops.png" alt="Trusted Shops" width={20} height={20} style={{ objectFit: 'contain' }} />
      <span style={{ fontFamily: 'Arial,sans-serif', fontSize: '13px', fontWeight: 700, color: '#333' }}>Trusted Shops</span>
    </div>
  )
}

// Reseñas reales, copiadas tal cual de los perfiles públicos el 13/09/2026
// (Trustpilot: ie.trustpilot.com/review/titantransfers.com · Trusted Shops:
// API pública de reseñas, que las publica sin nombre). Van en su idioma
// original y sin retocar: traducirlas o "mejorarlas" dejaría de hacerlas
// auténticas. Del nombre solo se muestra la inicial del apellido.
// Antes aquí había 36 testimonios inventados, con versiones en árabe y alemán
// de las mismas personas; mostrar reseñas ficticias con el logo de una
// plataforma es práctica desleal (RDL 24/2021).
const testimonials = [
  { platform: 'trustpilot' as const, name: 'Patricia', country: 'DE', rating: 5, text: 'Absolutely recommendable! Everything went smoothly, both the communication and the ride. I was warmly welcomed at the airport and escorted to the driver.' },
  { platform: 'trustpilot' as const, name: 'Carl S.', country: 'GB', rating: 5, text: 'Booked a return transfer from Barcelona airport to hotel METT Absolutely brilliant, text and photo of where to meet at airport and text a few hours before to confirm return airport trip. Couldn\'t fault them at all. Great service.' },
  { platform: 'trustpilot' as const, name: 'Adrie', country: 'NL', rating: 5, text: 'Excellent taxi service! Very easy to book and they really think along with you when it comes to the best pick-up time. Communication via WhatsApp is quick and convenient, and you receive clear information beforehand. The price is also communicated clearly in advance, so there are no surprises.' },
  { platform: 'trustedshops' as const, name: null, country: null, rating: 5, text: 'Titan provide a reliable & reassuring service when travelling in a foreign country. They telephoned us on each occasion to make sure transport had arrived & we were on our way.' },
  { platform: 'trustpilot' as const, name: 'Hae Uk H.', country: 'AU', rating: 5, text: 'Very good transport service with good communication and uncomplicated transfer from the airport to our apartment. It was so good to organise it before arrival for a smooth transition after a long flight.' },
  { platform: 'trustpilot' as const, name: 'Gill M.', country: 'GB', rating: 5, text: 'The whole experience with Titan Transfers was great. From greeting us as we came through arrivals, taking us to our car, the transfer to the hotel and then being flexible when we wanted to change our return trip pick up time - fantastic service all round! Thank you' },
  { platform: 'trustpilot' as const, name: 'Ioannis B.', country: 'GR', rating: 5, text: 'VERY GOOD SERVICE, ON TIME AND THE DRIVER VERY POLITE!!' },
  { platform: 'trustpilot' as const, name: 'Helen', country: 'GB', rating: 5, text: 'Great service, waiting at the airport clearly signed on arrival and pick up nice and early on return, friendly driver, clean and spacious vehicle. Would definitely recommend' },
  { platform: 'trustedshops' as const, name: null, country: null, rating: 5, text: 'Communication was excellent , the driver was running a little late due to traffic but kept me well informed and didn’t cause me any issues . Would highly recommend and will be using titan again' },
  { platform: 'trustpilot' as const, name: 'Sam R.', country: 'GB', rating: 5, text: 'Our experience was great, met at the airport with a smile, smooth journey. Great contact from booking to picking us up, on return was a great service to on time. Really friendly driver. 5star in all.' },
  { platform: 'trustpilot' as const, name: 'Katie E.', country: 'GB', rating: 5, text: 'The transfer was super easy, the driver was really friendly and I would highly recommend.' },
  { platform: 'trustpilot' as const, name: 'Jan S.', country: 'GB', rating: 5, text: 'No Problems with pick up from airport to hotel and today from hotel to cruise terminal. Thanks to everyone concerned' },
]

const PER_PAGE = 4
const PAGES = Math.ceil(testimonials.length / PER_PAGE)
const AUTO_MS = 5000

function PlatformLogo({ platform }: { platform: 'trustpilot' | 'google' | 'trustedshops' }) {
  if (platform === 'trustpilot') return <TrustpilotLogo />
  if (platform === 'google') return <GoogleLogo />
  return <TrustedShopsLogo />
}

export function Testimonials() {
  const locale = useLocale()
  const [page, setPage] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(p => (p + 1) % PAGES)
      setAnimKey(k => k + 1)
    }, AUTO_MS)
    return () => clearTimeout(t)
  }, [page])

  const list = testimonials
  const countryName = (code: string) => {
    try { return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code } catch { return code }
  }
  const visible = list.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <section style={{ background: '#ffffff', padding: '4.5rem 0' }}>
      <div className="site-container">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className={russoOne.className} style={{ fontSize: '2.75rem', color: '#242426', marginBottom: '1.25rem' }}>
            {pick(locale, {
              en: 'What our customers say',
              es: 'Lo que dicen nuestros clientes',
              ar: 'ماذا يقول عملاؤنا',
              it: 'Cosa dicono i nostri clienti',
              de: 'Was unsere Kunden sagen',
              fr: 'Ce que disent nos clients',
            })}
          </h2>

          {/* Rating + logos row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#6B8313', lineHeight: 1 }}>{formatRating(OVERALL_RATING, locale as Locale)}</span>
              <span style={{ fontSize: '1rem', color: '#6b7280' }}>/5</span>
              <Stars count={5} />
              <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.25rem' }}>
                {(() => { const n = formatCount(REVIEWS_FLOOR, locale as Locale); return pick(locale, { en: `${n}+ verified reviews`, es: `+${n} reseñas verificadas`, ar: `+${n} تقييم موثّق`, it: `+${n} recensioni verificate`, de: `Über ${n} verifizierte Bewertungen`, fr: `Plus de ${n} avis vérifiés` }) })()}
              </span>
            </div>
            <div style={{ width: '1px', height: '28px', background: '#e5e7eb' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <TrustpilotLogo />
              <div style={{ width: '1px', height: '18px', background: '#e5e7eb' }} />
              <GoogleLogo />
              <div style={{ width: '1px', height: '18px', background: '#e5e7eb' }} />
              <TrustedShopsLogo />
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="resp-testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.75rem', minHeight: '260px' }}>
          {visible.map((item, i) => (
            <div
              key={`${page}-${i}`}
              style={{
                background: '#F8FAF0',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <Stars count={item.rating} />
                <PlatformLogo platform={item.platform} />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <div className={russoOne.className} style={{ fontSize: '0.95rem', color: '#242426' }}>
                  {item.name ?? pick(locale, { en: 'Verified customer', es: 'Cliente verificado', ar: 'عميل موثّق', it: 'Cliente verificato', de: 'Verifizierter Kunde', fr: 'Client vérifié' })}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.country ? countryName(item.country) : 'Trusted Shops'}</div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.65 }}>
                &ldquo;{item.text}&rdquo;
              </p>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '1.25rem', alignItems: 'flex-end' }}>
          <style>{`@keyframes fillDotTest { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>
          {Array.from({ length: PAGES }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setPage(i); setAnimKey(k => k + 1) }}
              aria-label={`Página ${i + 1}`}
              style={{
                position: 'relative',
                width: '28px',
                height: i === page ? '36px' : '28px',
                padding: 0, border: 'none', cursor: 'pointer',
                background: i < page ? '#8BAA1D' : '#242426',
                transform: 'skewX(-12deg)',
                transition: 'height 0.3s',
                overflow: 'hidden',
              }}
            >
              {i === page && (
                <span
                  key={animKey}
                  style={{
                    position: 'absolute', inset: 0,
                    background: '#8BAA1D',
                    transformOrigin: 'left center',
                    animation: `fillDotTest ${AUTO_MS}ms linear forwards`,
                  }}
                />
              )}
            </button>
          ))}
        </div>

      </div>
    </section>
  )
}
