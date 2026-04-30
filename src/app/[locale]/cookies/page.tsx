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
    title: es ? 'Política de cookies | Titan Transfers' : 'Cookie Policy | Titan Transfers',
    description: es ? 'Política de cookies de Titan Transfers. Qué cookies usamos y cómo gestionarlas.' : 'Cookie Policy of Titan Transfers. What cookies we use and how to manage them.',
    robots: { index: true, follow: true },
  }
}

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const es = locale === 'es'

  return (
    <div style={{ background: '#F8FAF0', minHeight: '100vh' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 6vw' }}>
        <Breadcrumbs items={[{ label: es ? 'Política de cookies' : 'Cookie Policy' }]} variant="light" />
        <h1 className={russoOne.className} style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#242426', margin: '1rem 0 2.5rem' }}>
          {es ? 'Política de cookies' : 'Cookie Policy'}
        </h1>
        <div className="prose prose-lg prose-headings:font-semibold prose-headings:text-[#242426] prose-p:text-[#475569] prose-p:leading-relaxed">
          {es ? (
            <>
              <p>Este sitio web utiliza cookies para mejorar la experiencia del usuario y analizar el tráfico. A continuación le explicamos qué son las cookies, qué tipos utilizamos y cómo puede gestionarlas.</p>
              <h2>¿Qué son las cookies?</h2>
              <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Permiten que el sitio recuerde sus preferencias y le ofrezca una experiencia más personalizada.</p>
              <h2>Cookies que utilizamos</h2>
              <table>
                <thead>
                  <tr><th>Tipo</th><th>Finalidad</th><th>Duración</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>Técnicas</strong></td><td>Necesarias para el funcionamiento del sitio (sesión, idioma, preferencias de reserva)</td><td>Sesión</td></tr>
                  <tr><td><strong>Analíticas</strong></td><td>Google Analytics — análisis de tráfico anónimo para mejorar el sitio</td><td>2 años</td></tr>
                  <tr><td><strong>Publicitarias</strong></td><td>Google Ads — seguimiento de conversiones de reserva</td><td>90 días</td></tr>
                  <tr><td><strong>Terceros</strong></td><td>Trustpilot, Google Maps — funcionalidades externas integradas</td><td>Variable</td></tr>
                </tbody>
              </table>
              <h2>Cómo gestionar las cookies</h2>
              <p>Puede configurar su navegador para rechazar o eliminar las cookies en cualquier momento. Tenga en cuenta que desactivar ciertas cookies puede afectar al funcionamiento del sitio. Instrucciones para los principales navegadores:</p>
              <ul>
                <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
                <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies</li>
                <li><strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos de sitios web</li>
                <li><strong>Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Cookies</li>
              </ul>
              <h2>Más información</h2>
              <p>Para cualquier consulta sobre nuestra política de cookies, puede contactarnos en <strong>info@titantransfers.com</strong>.</p>
            </>
          ) : (
            <>
              <p>This website uses cookies to improve the user experience and analyse traffic. Below we explain what cookies are, which types we use and how you can manage them.</p>
              <h2>What are cookies?</h2>
              <p>Cookies are small text files stored on your device when you visit a website. They allow the site to remember your preferences and offer a more personalised experience.</p>
              <h2>Cookies we use</h2>
              <table>
                <thead>
                  <tr><th>Type</th><th>Purpose</th><th>Duration</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>Technical</strong></td><td>Required for site operation (session, language, booking preferences)</td><td>Session</td></tr>
                  <tr><td><strong>Analytical</strong></td><td>Google Analytics — anonymous traffic analysis to improve the site</td><td>2 years</td></tr>
                  <tr><td><strong>Advertising</strong></td><td>Google Ads — booking conversion tracking</td><td>90 days</td></tr>
                  <tr><td><strong>Third-party</strong></td><td>Trustpilot, Google Maps — integrated external features</td><td>Variable</td></tr>
                </tbody>
              </table>
              <h2>How to manage cookies</h2>
              <p>You can configure your browser to reject or delete cookies at any time. Note that disabling certain cookies may affect site functionality. Instructions for major browsers:</p>
              <ul>
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Privacy, search and services → Cookies</li>
              </ul>
              <h2>Further information</h2>
              <p>For any questions about our cookie policy, please contact us at <strong>info@titantransfers.com</strong>.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
