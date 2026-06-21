import { Link } from '@/lib/i18n/navigation'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { pick } from '@/lib/i18n/pick'

// ISR: rebuild this page in the background every hour. Reads (e.g. Sanity)
// stay cached so navigation feels instant; new content shows up within 1h
// or immediately via /api/revalidate.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: pick(locale, {
      en: 'Message sent | Titan Transfers',
      es: 'Mensaje enviado | Titan Transfers',
      ar: 'تم إرسال الرسالة | تايتن ترانسفرز',
      it: 'Messaggio inviato | Titan Transfers',
    }),
    robots: { index: false, follow: false },
  }
}

export default async function ContactSentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <div className="site-container px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[
        { label: pick(locale, { en: 'Contact', es: 'Contacto', ar: 'تواصل معنا', it: 'Contatto' }), href: '/contact/' },
        { label: pick(locale, { en: 'Message sent', es: 'Mensaje enviado', ar: 'تم إرسال الرسالة', it: 'Messaggio inviato' }) },
      ]} />

      <div style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem 1.5rem', background: '#F8FAF0', border: '1.5px solid #8BAA1D' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, background: '#8BAA1D', marginBottom: '1.25rem', transform: 'skewX(-8deg)' }}>
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#fff" style={{ transform: 'skewX(8deg)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#242426', fontWeight: 700, marginBottom: '0.75rem' }}>
          {pick(locale, { en: 'Message sent!', es: '¡Mensaje enviado!', ar: '!تم إرسال الرسالة', it: '!Messaggio inviato!' })}
        </h1>

        <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.6, marginBottom: '2rem' }}>
          {pick(locale, {
            en: "Thanks for reaching out to Titan Transfers. We'll get back to you as soon as possible, usually within 24 hours.",
            es: 'Gracias por contactar con Titan Transfers. Te responderemos lo antes posible, normalmente en menos de 24 horas.',
            ar: 'شكراً لتواصلك مع تايتن ترانسفرز. سنرد عليك في أقرب وقت ممكن، عادةً خلال ٢٤ ساعة.',
            it: 'Grazie per aver contattato Titan Transfers. Ti risponderemo il prima possibile, normalmente entro 24 ore.',
          })}
        </p>

        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#242426', color: '#ffffff', textDecoration: 'none',
          padding: '0.85rem 2.25rem', fontSize: '0.9rem', fontWeight: 700,
          transform: 'skewX(-12deg)',
        }}>
          <span style={{ transform: 'skewX(12deg)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            {pick(locale, { en: 'Back to home', es: 'Volver al inicio', ar: 'العودة إلى الرئيسية', it: 'Torna all\'inizio' })}
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  )
}
