import { russoOne } from '@/lib/fonts'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

// ISR: rebuild this page in the background every hour. Reads (e.g. Sanity)
// stay cached so navigation feels instant; new content shows up within 1h
// or immediately via /api/revalidate.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'
  return {
    title: es ? 'Aviso legal | Titan Transfers' : 'Legal Notice | Titan Transfers',
    description: es ? 'Aviso legal de Titan Transfers — Uep Tech And Solutions Fzco.' : 'Legal Notice for Titan Transfers — Uep Tech And Solutions Fzco.',
    robots: { index: true, follow: true },
  }
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'

  return (
    <div style={{ background: '#F8FAF0', minHeight: '100vh' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 6vw' }}>
        <Breadcrumbs items={[{ label: es ? 'Aviso legal' : 'Legal Notice' }]} variant="light" />
        <h1 className={russoOne.className} style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#242426', margin: '1rem 0 2.5rem' }}>
          {es ? 'Aviso legal' : 'Legal Notice'}
        </h1>
        <div className="prose prose-lg prose-headings:font-semibold prose-headings:text-[#242426] prose-p:text-[#475569] prose-p:leading-relaxed">
          {es ? (
            <>
              <p>En cumplimiento de la normativa vigente, se informa que el sitio web <strong>https://titantransfers.com</strong> es propiedad de:</p>
              <ul>
                <li><strong>Razón social:</strong> Uep Tech And Solutions Fzco</li>
                <li><strong>Domicilio:</strong> Building A2, IFZA Business Park, Dubai Silicon Oasis</li>
                <li><strong>País:</strong> Emiratos Árabes Unidos</li>
                <li><strong>NIF/CIF:</strong> PREMISES47843001</li>
                <li><strong>Email de contacto:</strong> info@titantransfers.com</li>
              </ul>
              <p>Al navegar por este sitio web, el usuario acepta plenamente y sin reservas todas las condiciones establecidas en este Aviso Legal.</p>
              <h2>Objeto</h2>
              <p>El sitio web <strong>https://titantransfers.com</strong> tiene por objeto ofrecer servicios de traslados privados al aeropuerto y transporte a diversos destinos.</p>
              <h2>Propiedad intelectual</h2>
              <p>Todos los contenidos de este sitio web (textos, imágenes, logotipos, marcas, estructura, diseño, etc.) son propiedad exclusiva de Uep Tech And Solutions Fzco o, en su caso, de terceros debidamente autorizados, y están protegidos por la normativa de propiedad intelectual e industrial aplicable.</p>
              <h2>Responsabilidad</h2>
              <p>El titular no se hace responsable del uso indebido de los contenidos del sitio web, recayendo dicha responsabilidad exclusivamente en el usuario.</p>
              <h2>Enlaces</h2>
              <p>Este sitio web puede contener enlaces a sitios de terceros. El titular no asume responsabilidad alguna por los contenidos o el funcionamiento de dichos sitios externos.</p>
            </>
          ) : (
            <>
              <p>In compliance with current regulations, it is hereby stated that the website <strong>https://titantransfers.com</strong> is owned by:</p>
              <ul>
                <li><strong>Company name:</strong> Uep Tech And Solutions Fzco</li>
                <li><strong>Address:</strong> Building A2, IFZA Business Park, Dubai Silicon Oasis</li>
                <li><strong>Country:</strong> United Arab Emirates</li>
                <li><strong>Tax Identification Number:</strong> PREMISES47843001</li>
                <li><strong>Contact email:</strong> info@titantransfers.com</li>
              </ul>
              <p>By browsing this website, you become a user and fully accept, without reservation, all the conditions set forth in this Legal Notice.</p>
              <h2>Purpose</h2>
              <p>The website <strong>https://titantransfers.com</strong> aims to provide private airport transfer and transportation services to various destinations.</p>
              <h2>Intellectual Property</h2>
              <p>All content on this website (texts, images, logos, trademarks, structure, design, etc.) is the exclusive property of Uep Tech And Solutions Fzco or, where applicable, of duly authorized third parties, and is protected by applicable intellectual and industrial property regulations.</p>
              <h2>Liability</h2>
              <p>The owner is not responsible for any misuse of the website content, and such responsibility lies solely with the user.</p>
              <h2>Links</h2>
              <p>This website may contain links to third-party sites. The owner assumes no responsibility for the content or operation of these external sites.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
