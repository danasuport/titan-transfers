import { getTranslations } from 'next-intl/server'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { TrustSignals } from '@/components/sections/TrustSignals'

// ISR: rebuild this page in the background every hour. Reads (e.g. Sanity)
// stay cached so navigation feels instant; new content shows up within 1h
// or immediately via /api/revalidate.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Sobre Nosotros | Titan Transfers' : 'About Us | Titan Transfers',
    description: 'Learn about Titan Transfers, your trusted partner for private transfers worldwide.',
  }
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  return (
    <>
      <div className="site-container px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: t('title') }]} />
        <h1 className="mb-4 text-3xl font-bold text-heading sm:text-4xl">{t('title')}</h1>
        <p className="mb-8 text-lg text-body">{t('subtitle')}</p>

        <div className="prose max-w-none prose-headings:text-heading prose-p:text-body prose-li:text-body prose-strong:text-heading">
          <p>Titan Transfers is a leading private transfer service operating in over 100 destinations worldwide. We specialize in airport transfers, port transfers, train station transfers, and city-to-city transport.</p>
          <p>Our mission is to provide a premium, reliable, and affordable transfer experience for every traveler. With fixed prices, professional drivers, and 24/7 support, we ensure your journey is comfortable and stress-free.</p>
          <h2>Our Values</h2>
          <ul>
            <li><strong>Reliability</strong> — We monitor all flights and adjust pickup times automatically</li>
            <li><strong>Transparency</strong> — Fixed prices with no hidden charges</li>
            <li><strong>Comfort</strong> — Modern, air-conditioned vehicles</li>
            <li><strong>Service</strong> — Professional, English-speaking drivers</li>
          </ul>
        </div>
      </div>
      <TrustSignals />
    </>
  )
}
