import { russoOne } from '@/lib/fonts'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'
  return {
    title: es ? 'Términos y condiciones | Titan Transfers' : 'Terms and Conditions | Titan Transfers',
    description: es ? 'Términos y condiciones del servicio de traslados privados de Titan Transfers.' : 'Terms and conditions for Titan Transfers private transfer services.',
    robots: { index: true, follow: true },
  }
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'

  return (
    <div style={{ background: '#F8FAF0', minHeight: '100vh' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 6vw' }}>
        <Breadcrumbs items={[{ label: es ? 'Términos y condiciones' : 'Terms and Conditions' }]} variant="light" />
        <h1 className={russoOne.className} style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#242426', margin: '1rem 0 2.5rem' }}>
          {es ? 'Términos y condiciones' : 'Terms and Conditions'}
        </h1>
        <div className="prose prose-lg prose-headings:font-semibold prose-headings:text-[#242426] prose-p:text-[#475569] prose-p:leading-relaxed">
          {es ? (
            <>
              <p>Los presentes términos y condiciones regulan la contratación de servicios de traslado privado a través del sitio web <strong>https://titantransfers.com</strong>, operado por Uep Tech And Solutions Fzco.</p>
              <h2>1. Reservas</h2>
              <p>La reserva se formaliza en el momento en que el cliente recibe la confirmación por correo electrónico. El precio mostrado en el momento de la reserva es el precio final e incluye todos los impuestos aplicables.</p>
              <h2>2. Precio fijo</h2>
              <p>Todos nuestros traslados se ofrecen a precio fijo cerrado antes del viaje. No hay cargos adicionales por tráfico, demoras habituales o cambios de ruta dentro del trayecto contratado.</p>
              <h2>3. Cancelación y modificaciones</h2>
              <ul>
                <li><strong>Cancelación gratuita</strong> hasta 24 horas antes de la hora de recogida.</li>
                <li>Las cancelaciones realizadas con menos de 24 horas de antelación podrán ser facturadas en su totalidad.</li>
                <li>Las modificaciones de fecha, hora o destino están sujetas a disponibilidad y pueden conllevar un ajuste de precio.</li>
              </ul>
              <h2>4. Puntualidad y espera</h2>
              <p>Para traslados desde aeropuertos, el conductor esperará 60 minutos desde la hora de aterrizaje real del vuelo. Para otros puntos de recogida, el tiempo de espera estándar es de 15 minutos.</p>
              <h2>5. Equipaje</h2>
              <p>Cada reserva incluye el equipaje estándar indicado en el proceso de reserva. El exceso de equipaje debe comunicarse con antelación y puede suponer un coste adicional.</p>
              <h2>6. Responsabilidad</h2>
              <p>Titan Transfers no se responsabiliza de pérdidas causadas por circunstancias ajenas a su control (condiciones meteorológicas extremas, cierres de carretera, huelgas, etc.). En caso de fuerza mayor, se ofrecerá una solución alternativa o el reembolso íntegro.</p>
              <h2>7. Reclamaciones</h2>
              <p>Cualquier reclamación debe comunicarse en un plazo máximo de 7 días desde la realización del servicio enviando un correo a <strong>info@titantransfers.com</strong>.</p>
              <h2>8. Ley aplicable</h2>
              <p>Estos términos se rigen por las leyes de los Emiratos Árabes Unidos. Cualquier controversia será sometida a los tribunales competentes de Dubai.</p>
            </>
          ) : (
            <>
              <p>These terms and conditions govern the booking of private transfer services through <strong>https://titantransfers.com</strong>, operated by Uep Tech And Solutions Fzco.</p>
              <h2>1. Bookings</h2>
              <p>A booking is confirmed once the customer receives a confirmation email. The price shown at the time of booking is the final price and includes all applicable taxes.</p>
              <h2>2. Fixed price</h2>
              <p>All our transfers are offered at a fixed price agreed before travel. There are no additional charges for traffic, standard delays or route changes within the booked journey.</p>
              <h2>3. Cancellations and modifications</h2>
              <ul>
                <li><strong>Free cancellation</strong> up to 24 hours before the scheduled pickup time.</li>
                <li>Cancellations made less than 24 hours before pickup may be charged in full.</li>
                <li>Modifications to date, time or destination are subject to availability and may result in a price adjustment.</li>
              </ul>
              <h2>4. Punctuality and waiting time</h2>
              <p>For airport pickups, the driver will wait 60 minutes from the actual flight landing time. For other pickup points, the standard waiting time is 15 minutes.</p>
              <h2>5. Luggage</h2>
              <p>Each booking includes the standard luggage indicated during the booking process. Excess luggage must be communicated in advance and may incur an additional cost.</p>
              <h2>6. Liability</h2>
              <p>Titan Transfers is not liable for losses caused by circumstances beyond its control (extreme weather, road closures, strikes, etc.). In cases of force majeure, an alternative solution or full refund will be offered.</p>
              <h2>7. Claims</h2>
              <p>Any claim must be submitted within 7 days of the service being carried out by emailing <strong>info@titantransfers.com</strong>.</p>
              <h2>8. Governing law</h2>
              <p>These terms are governed by the laws of the United Arab Emirates. Any disputes shall be submitted to the competent courts of Dubai.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
