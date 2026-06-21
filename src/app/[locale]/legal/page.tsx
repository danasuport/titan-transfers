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
      en: 'Legal Notice | Titan Transfers',
      es: 'Aviso legal | Titan Transfers',
      ar: 'الإشعار القانوني | تايتن ترانسفرز',
      it: 'Avviso legale | Titan Transfers',
    }),
    description: pick(locale, {
      en: 'Legal Notice for Titan Transfers — Uep Tech And Solutions Fzco.',
      es: 'Aviso legal de Titan Transfers — Uep Tech And Solutions Fzco.',
      ar: 'الإشعار القانوني لتايتن ترانسفرز — Uep Tech And Solutions Fzco.',
      it: 'Avviso legale di Titan Transfers — Uep Tech And Solutions Fzco.',
    }),
    robots: { index: true, follow: true },
  }
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const heading = pick(locale, {
    en: 'Legal Notice',
    es: 'Aviso legal',
    ar: 'الإشعار القانوني',
    it: 'Avviso legale',
  })

  return (
    <div style={{ background: '#F8FAF0', minHeight: '100vh' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 6vw' }}>
        <Breadcrumbs items={[{ label: heading }]} variant="light" />
        <h1 className={russoOne.className} style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#242426', margin: '1rem 0 2.5rem' }}>
          {heading}
        </h1>
        <div className="prose prose-lg prose-headings:font-semibold prose-headings:text-[#242426] prose-p:text-[#475569] prose-p:leading-relaxed">
          {locale === 'es' && <LegalBodyES />}
          {locale === 'ar' && <LegalBodyAR />}
          {locale !== 'es' && locale !== 'ar' && <LegalBodyEN />}
        </div>
      </div>
    </div>
  )
}

function LegalBodyEN() {
  return (
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
  )
}

function LegalBodyES() {
  return (
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
  )
}

function LegalBodyAR() {
  return (
    <>
      <p>امتثالاً للأنظمة السارية، يُعلن بموجب هذا أن الموقع الإلكتروني <strong>https://titantransfers.com</strong> مملوك لـ:</p>
      <ul>
        <li><strong>اسم الشركة:</strong> Uep Tech And Solutions Fzco</li>
        <li><strong>العنوان:</strong> Building A2, IFZA Business Park, Dubai Silicon Oasis</li>
        <li><strong>الدولة:</strong> الإمارات العربية المتحدة</li>
        <li><strong>الرقم الضريبي:</strong> PREMISES47843001</li>
        <li><strong>البريد الإلكتروني للتواصل:</strong> info@titantransfers.com</li>
      </ul>
      <p>بتصفحك لهذا الموقع، تصبح مستخدماً وتقبل تماماً، وبدون أي تحفظ، جميع الشروط المنصوص عليها في هذا الإشعار القانوني.</p>
      <h2>الغرض</h2>
      <p>يهدف الموقع <strong>https://titantransfers.com</strong> إلى تقديم خدمات النقل الخاص من المطار والنقل إلى وجهات متعددة.</p>
      <h2>الملكية الفكرية</h2>
      <p>جميع محتويات هذا الموقع (النصوص، الصور، الشعارات، العلامات التجارية، الهيكل، التصميم، إلخ.) ملك حصري لـ Uep Tech And Solutions Fzco أو، عند الاقتضاء، لأطراف ثالثة مرخصة، ومحمية بموجب أنظمة الملكية الفكرية والصناعية المعمول بها.</p>
      <h2>المسؤولية</h2>
      <p>المالك غير مسؤول عن أي سوء استخدام لمحتوى الموقع، وتقع هذه المسؤولية على المستخدم وحده.</p>
      <h2>الروابط</h2>
      <p>قد يحتوي هذا الموقع على روابط لمواقع طرف ثالث. لا يتحمل المالك أي مسؤولية عن محتوى أو تشغيل هذه المواقع الخارجية.</p>
    </>
  )
}
