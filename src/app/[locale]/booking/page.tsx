import { BookingPageShell } from '@/components/booking/BookingPageShell'
import { TaxiBookingIframe } from '@/components/booking/TaxiBookingIframe'
import { pick } from '@/lib/i18n/pick'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: pick(locale, {
      en: 'Book a private transfer | Titan Transfers',
      es: 'Reservar traslado privado | Titan Transfers',
      ar: 'احجز نقلاً خاصاً | تايتن ترانسفرز',
    }),
    description: pick(locale, {
      en: 'Book your private transfer instantly. Fixed price, professional driver, door-to-door service 24/7.',
      es: 'Reserva tu traslado privado al instante. Precio fijo, conductor profesional, servicio puerta a puerta 24/7.',
      ar: 'احجز نقلك الخاص فوراً. سعر ثابت، سائق محترف، خدمة من الباب إلى الباب على مدار الساعة.',
    }),
    robots: { index: true, follow: true },
  }
}

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <BookingPageShell
      breadcrumbLabel={pick(locale, { en: 'Book', es: 'Reservar', ar: 'احجز' })}
      heading={pick(locale, {
        en: 'Book your private transfer',
        es: 'Reserva tu traslado privado',
        ar: 'احجز نقلك الخاص',
      })}
    >
      <TaxiBookingIframe />
    </BookingPageShell>
  )
}
