import { ETOBookingIframe } from '@/components/ui/ETOBookingIframe'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'
  return {
    title: es ? 'Reservar traslado privado | Titan Transfers' : 'Book a private transfer | Titan Transfers',
    description: es
      ? 'Reserva tu traslado privado al instante. Precio fijo, conductor profesional, servicio puerta a puerta 24/7.'
      : 'Book your private transfer instantly. Fixed price, professional driver, door-to-door service 24/7.',
    robots: { index: true, follow: true },
  }
}

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { locale } = await params
  const sp = await searchParams
  const es = locale === 'es'

  return (
    <div style={{ minHeight: '80vh', background: '#F8FAF0' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 6vw' }}>
        <Breadcrumbs items={[{ label: es ? 'Reservar' : 'Book' }]} variant="light" />
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#242426', fontWeight: 700, margin: '1rem 0 1.5rem' }}>
          {es ? 'Reserva tu traslado privado' : 'Book your private transfer'}
        </h1>
        <ETOBookingIframe searchParams={sp} />
      </div>
    </div>
  )
}
