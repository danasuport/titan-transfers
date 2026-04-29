import { russoOne } from '@/lib/fonts'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'
  return {
    title: es ? 'Política de privacidad | Titan Transfers' : 'Privacy Policy | Titan Transfers',
    description: es ? 'Política de privacidad de Titan Transfers. Cómo tratamos y protegemos tus datos personales.' : 'Privacy Policy of Titan Transfers. How we handle and protect your personal data.',
    robots: { index: true, follow: true },
  }
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'

  return (
    <div style={{ background: '#F8FAF0', minHeight: '100vh' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 6vw' }}>
        <Breadcrumbs items={[{ label: es ? 'Política de privacidad' : 'Privacy Policy' }]} variant="light" />
        <h1 className={russoOne.className} style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#242426', margin: '1rem 0 2.5rem' }}>
          {es ? 'Política de privacidad' : 'Privacy Policy'}
        </h1>
        <div className="prose prose-lg prose-headings:font-semibold prose-headings:text-[#242426] prose-p:text-[#475569] prose-p:leading-relaxed">
          {es ? (
            <>
              <p>En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la normativa vigente en materia de protección de datos, le informamos sobre el tratamiento de sus datos personales.</p>
              <h2>Responsable del tratamiento</h2>
              <ul>
                <li><strong>Empresa:</strong> Uep Tech And Solutions Fzco</li>
                <li><strong>Dirección:</strong> Building A2, IFZA Business Park, Dubai Silicon Oasis, Emiratos Árabes Unidos</li>
                <li><strong>Email:</strong> info@titantransfers.com</li>
              </ul>
              <h2>Datos que recopilamos</h2>
              <p>Recopilamos los datos que usted nos facilita al realizar una reserva o ponerse en contacto con nosotros: nombre, apellidos, dirección de correo electrónico, número de teléfono, detalles del viaje (origen, destino, fecha, hora) y datos de pago (procesados de forma segura a través de pasarelas de pago certificadas).</p>
              <h2>Finalidad del tratamiento</h2>
              <ul>
                <li>Gestionar y confirmar su reserva de traslado.</li>
                <li>Comunicarnos con usted en relación con su servicio.</li>
                <li>Cumplir con obligaciones legales y fiscales.</li>
                <li>Enviarle comunicaciones comerciales si ha dado su consentimiento explícito.</li>
              </ul>
              <h2>Base jurídica</h2>
              <p>El tratamiento se basa en la ejecución del contrato de servicio de transporte, el cumplimiento de obligaciones legales y, en su caso, el consentimiento del usuario.</p>
              <h2>Conservación de datos</h2>
              <p>Sus datos se conservarán durante el tiempo necesario para prestar el servicio y cumplir con las obligaciones legales aplicables (máximo 5 años para datos de facturación).</p>
              <h2>Sus derechos</h2>
              <p>Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad enviando un correo a <strong>info@titantransfers.com</strong>.</p>
              <h2>Cookies</h2>
              <p>Utilizamos cookies propias y de terceros. Consulte nuestra <a href="/es/cookies/" style={{ color: '#7C9919' }}>política de cookies</a> para más información.</p>
              <h2>Transferencias internacionales</h2>
              <p>Al ser una empresa con sede en los Emiratos Árabes Unidos, sus datos pueden ser tratados fuera del Espacio Económico Europeo, aplicándose siempre las garantías adecuadas conforme al RGPD.</p>
            </>
          ) : (
            <>
              <p>In compliance with Regulation (EU) 2016/679 (GDPR) and applicable data protection regulations, we inform you about the processing of your personal data.</p>
              <h2>Data Controller</h2>
              <ul>
                <li><strong>Company:</strong> Uep Tech And Solutions Fzco</li>
                <li><strong>Address:</strong> Building A2, IFZA Business Park, Dubai Silicon Oasis, United Arab Emirates</li>
                <li><strong>Email:</strong> info@titantransfers.com</li>
              </ul>
              <h2>Data We Collect</h2>
              <p>We collect data you provide when making a booking or contacting us: name, surname, email address, phone number, travel details (pickup, destination, date, time) and payment data (processed securely through certified payment gateways).</p>
              <h2>Purpose of Processing</h2>
              <ul>
                <li>Managing and confirming your transfer booking.</li>
                <li>Communicating with you regarding your service.</li>
                <li>Complying with legal and tax obligations.</li>
                <li>Sending commercial communications if you have given explicit consent.</li>
              </ul>
              <h2>Legal Basis</h2>
              <p>Processing is based on the execution of the transport service contract, compliance with legal obligations, and where applicable, user consent.</p>
              <h2>Data Retention</h2>
              <p>Your data will be retained for as long as necessary to provide the service and comply with applicable legal obligations (maximum 5 years for billing data).</p>
              <h2>Your Rights</h2>
              <p>You may exercise your rights of access, rectification, erasure, objection, restriction and portability by emailing <strong>info@titantransfers.com</strong>.</p>
              <h2>Cookies</h2>
              <p>We use first-party and third-party cookies. See our <a href="/cookies/" style={{ color: '#7C9919' }}>cookie policy</a> for more information.</p>
              <h2>International Transfers</h2>
              <p>As a company based in the United Arab Emirates, your data may be processed outside the European Economic Area, with appropriate GDPR safeguards always applied.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
