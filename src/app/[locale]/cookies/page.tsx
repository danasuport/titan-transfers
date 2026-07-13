import { russoOne } from '@/lib/fonts'
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
      en: 'Cookie Policy | Titan Transfers',
      es: 'Política de cookies | Titan Transfers',
      ar: 'سياسة الكوكيز | تايتن ترانسفرز',
      it: 'Politica sui cookie | Titan Transfers',
      de: 'Cookie-Richtlinie | Titan Transfers',
    }),
    description: pick(locale, {
      en: 'Cookie Policy of Titan Transfers. What cookies we use and how to manage them.',
      es: 'Política de cookies de Titan Transfers. Qué cookies usamos y cómo gestionarlas.',
      ar: 'سياسة الكوكيز لتايتن ترانسفرز. الكوكيز التي نستخدمها وكيفية إدارتها.',
      it: 'Politica sui cookie di Titan Transfers. Quali cookie utilizziamo e come gestirli.',
      de: 'Cookie-Richtlinie von Titan Transfers. Welche Cookies wir verwenden und wie Sie sie verwalten können.',
    }),
    robots: { index: true, follow: true },
  }
}

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const heading = pick(locale, {
    en: 'Cookie Policy',
    es: 'Política de cookies',
    ar: 'سياسة الكوكيز',
    it: 'Politica sui cookie',
    de: 'Cookie-Richtlinie',
  })

  return (
    <div style={{ background: '#F8FAF0', minHeight: '100vh' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 6vw' }}>
        <Breadcrumbs items={[{ label: heading }]} variant="light" />
        <h1 className={russoOne.className} style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#242426', margin: '1rem 0 2.5rem' }}>
          {heading}
        </h1>
        <div className="prose prose-lg prose-headings:font-semibold prose-headings:text-[#242426] prose-p:text-[#475569] prose-p:leading-relaxed">
          {locale === 'es' && <BodyES />}
          {locale === 'ar' && <BodyAR />}
          {locale !== 'es' && locale !== 'ar' && <BodyEN />}
        </div>
      </div>
    </div>
  )
}

function BodyEN() {
  return (
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
        <li><strong>Firefox:</strong> Options → Privacy &amp; Security → Cookies</li>
        <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
        <li><strong>Edge:</strong> Settings → Privacy, search and services → Cookies</li>
      </ul>
      <h2>Further information</h2>
      <p>For any questions about our cookie policy, please contact us at <strong>info@titantransfers.com</strong>.</p>
    </>
  )
}

function BodyES() {
  return (
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
  )
}

function BodyAR() {
  return (
    <>
      <p>يستخدم هذا الموقع الكوكيز لتحسين تجربة المستخدم وتحليل حركة المرور. فيما يلي نشرح ما هي الكوكيز، وأي الأنواع نستخدم، وكيف يمكنك إدارتها.</p>
      <h2>ما هي الكوكيز؟</h2>
      <p>الكوكيز هي ملفات نصية صغيرة تُخزَّن على جهازك عند زيارتك لموقع ويب. تتيح للموقع تذكّر تفضيلاتك وتقديم تجربة أكثر تخصيصاً.</p>
      <h2>الكوكيز التي نستخدمها</h2>
      <table>
        <thead>
          <tr><th>النوع</th><th>الغرض</th><th>المدة</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>تقنية</strong></td><td>ضرورية لتشغيل الموقع (الجلسة، اللغة، تفضيلات الحجز)</td><td>الجلسة</td></tr>
          <tr><td><strong>تحليلية</strong></td><td>جوجل أناليتيكس — تحليل مجهول لحركة المرور لتحسين الموقع</td><td>سنتان</td></tr>
          <tr><td><strong>إعلانية</strong></td><td>جوجل آدز — تتبع تحويلات الحجز</td><td>٩٠ يوماً</td></tr>
          <tr><td><strong>أطراف ثالثة</strong></td><td>تراست بايلوت، خرائط جوجل — ميزات خارجية مدمجة</td><td>متغير</td></tr>
        </tbody>
      </table>
      <h2>كيفية إدارة الكوكيز</h2>
      <p>يمكنك تكوين متصفحك لرفض أو حذف الكوكيز في أي وقت. لاحظ أن تعطيل بعض الكوكيز قد يؤثر على وظائف الموقع. تعليمات للمتصفحات الرئيسية:</p>
      <ul>
        <li><strong>Chrome:</strong> الإعدادات ← الخصوصية والأمان ← الكوكيز</li>
        <li><strong>Firefox:</strong> الخيارات ← الخصوصية والأمان ← الكوكيز</li>
        <li><strong>Safari:</strong> التفضيلات ← الخصوصية ← إدارة بيانات المواقع</li>
        <li><strong>Edge:</strong> الإعدادات ← الخصوصية والبحث والخدمات ← الكوكيز</li>
      </ul>
      <h2>مزيد من المعلومات</h2>
      <p>لأي استفسار حول سياسة الكوكيز لدينا، يمكنك التواصل معنا على <strong>info@titantransfers.com</strong>.</p>
    </>
  )
}
