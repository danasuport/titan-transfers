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
      en: 'Privacy Policy | Titan Transfers',
      es: 'Política de privacidad | Titan Transfers',
      ar: 'سياسة الخصوصية | تايتن ترانسفرز',
      it: 'Informativa sulla privacy | Titan Transfers',
    }),
    description: pick(locale, {
      en: 'Privacy Policy of Titan Transfers. How we handle and protect your personal data.',
      es: 'Política de privacidad de Titan Transfers. Cómo tratamos y protegemos tus datos personales.',
      ar: 'سياسة الخصوصية لتايتن ترانسفرز. كيف نتعامل مع بياناتك الشخصية ونحميها.',
      it: 'Informativa sulla privacy di Titan Transfers. Come trattiamo e proteggiamo i tuoi dati personali.',
    }),
    robots: { index: true, follow: true },
  }
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const heading = pick(locale, {
    en: 'Privacy Policy',
    es: 'Política de privacidad',
    ar: 'سياسة الخصوصية',
    it: 'Informativa sulla privacy',
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
      <p>We use first-party and third-party cookies. See our <a href="/cookies/" style={{ color: '#6B8313' }}>cookie policy</a> for more information.</p>
      <h2>Titan Transfers Driver App</h2>
      <p>For drivers using our mobile app, we process the following data:</p>
      <p><strong>Location</strong> — We collect precise GPS location, including in the background while you are ON DUTY or completing an active trip. This is necessary to assign bookings, provide navigation, update trip progress, and share the driver&rsquo;s live location with dispatch and passengers during the service. Background location tracking stops when you switch OFF DUTY.</p>
      <p><strong>Other data</strong> — We also process account information (such as name, email, and phone number), uploaded driver and vehicle documents, trip and chat information, earnings data, and technical information (such as push notification tokens and app analytics).</p>
      <p><strong>Purpose</strong> — This data is processed to operate the driver platform, manage dispatch services, ensure trip safety and reliability, comply with legal obligations, and improve app performance and user experience.</p>
      <h2>International Transfers</h2>
      <p>As a company based in the United Arab Emirates, your data may be processed outside the European Economic Area, with appropriate GDPR safeguards always applied.</p>
    </>
  )
}

function BodyES() {
  return (
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
      <p>Utilizamos cookies propias y de terceros. Consulte nuestra <a href="/es/cookies/" style={{ color: '#6B8313' }}>política de cookies</a> para más información.</p>
      <h2>Aplicación Titan Transfers Driver</h2>
      <p>Para los conductores que utilizan nuestra aplicación móvil, también procesamos los siguientes datos:</p>
      <p><strong>Ubicación</strong> — Recopilamos la ubicación GPS precisa, incluso en segundo plano mientras el conductor está EN SERVICIO o realizando un trayecto activo. Esto es necesario para asignar servicios, proporcionar navegación, actualizar el estado del viaje y compartir la ubicación en tiempo real con el equipo de gestión y el pasajero durante el servicio. El seguimiento de ubicación en segundo plano se detiene al desactivar el modo FUERA DE SERVICIO.</p>
      <p><strong>Otros datos</strong> — También procesamos información de la cuenta (como nombre, correo electrónico y teléfono), documentación del conductor y del vehículo, información relacionada con viajes y chats, datos de ganancias e información técnica (como tokens de notificaciones push y analítica de la aplicación).</p>
      <p><strong>Finalidad</strong> — Estos datos se procesan para gestionar la plataforma de conductores, coordinar los servicios de transporte, garantizar la seguridad y el correcto funcionamiento de los trayectos, cumplir con obligaciones legales y mejorar el rendimiento y la experiencia de uso de la aplicación.</p>
      <h2>Transferencias internacionales</h2>
      <p>Al ser una empresa con sede en los Emiratos Árabes Unidos, sus datos pueden ser tratados fuera del Espacio Económico Europeo, aplicándose siempre las garantías adecuadas conforme al RGPD.</p>
    </>
  )
}

function BodyAR() {
  return (
    <>
      <p>امتثالاً للائحة (الاتحاد الأوروبي) 2016/679 (GDPR) ولوائح حماية البيانات السارية، نخبرك بمعالجة بياناتك الشخصية.</p>
      <h2>المتحكم بالبيانات</h2>
      <ul>
        <li><strong>الشركة:</strong> Uep Tech And Solutions Fzco</li>
        <li><strong>العنوان:</strong> Building A2, IFZA Business Park, Dubai Silicon Oasis, الإمارات العربية المتحدة</li>
        <li><strong>البريد الإلكتروني:</strong> info@titantransfers.com</li>
      </ul>
      <h2>البيانات التي نجمعها</h2>
      <p>نجمع البيانات التي تقدّمها عند إجراء حجز أو التواصل معنا: الاسم، اللقب، البريد الإلكتروني، رقم الهاتف، تفاصيل الرحلة (نقطة الاستلام، الوجهة، التاريخ، الوقت)، وبيانات الدفع (تُعالج بأمان عبر بوابات دفع معتمدة).</p>
      <h2>الغرض من المعالجة</h2>
      <ul>
        <li>إدارة وتأكيد حجز نقلك.</li>
        <li>التواصل معك بشأن خدمتك.</li>
        <li>الامتثال للالتزامات القانونية والضريبية.</li>
        <li>إرسال اتصالات تجارية إذا قدّمت موافقة صريحة.</li>
      </ul>
      <h2>الأساس القانوني</h2>
      <p>تستند المعالجة إلى تنفيذ عقد خدمة النقل، والامتثال للالتزامات القانونية، وعند الاقتضاء، موافقة المستخدم.</p>
      <h2>الاحتفاظ بالبيانات</h2>
      <p>سيتم الاحتفاظ ببياناتك للفترة اللازمة لتقديم الخدمة والامتثال للالتزامات القانونية المطبقة (بحد أقصى ٥ سنوات لبيانات الفوترة).</p>
      <h2>حقوقك</h2>
      <p>يمكنك ممارسة حقوقك في الوصول، التصحيح، الحذف، الاعتراض، التقييد، ونقل البيانات بإرسال بريد إلكتروني إلى <strong>info@titantransfers.com</strong>.</p>
      <h2>الكوكيز</h2>
      <p>نستخدم كوكيز خاصة بنا وأخرى من أطراف ثالثة. راجع <a href="/ar/siyasat-cookies/" style={{ color: '#6B8313' }}>سياسة الكوكيز</a> لمزيد من المعلومات.</p>
      <h2>تطبيق Titan Transfers Driver</h2>
      <p>للسائقين الذين يستخدمون تطبيقنا للهاتف المحمول، نعالج البيانات التالية:</p>
      <p><strong>الموقع</strong> — نجمع بيانات الموقع الجغرافي الدقيق (GPS)، بما في ذلك في الخلفية أثناء وضع &ldquo;في الخدمة&rdquo; (ON DUTY) أو أثناء تنفيذ رحلة نشطة. هذا ضروري لتعيين الحجوزات، وتوفير التنقل، وتحديث تقدّم الرحلة، ومشاركة موقع السائق المباشر مع غرفة العمليات والركاب خلال الخدمة. تتوقف متابعة الموقع في الخلفية عند التحوّل إلى وضع &ldquo;خارج الخدمة&rdquo; (OFF DUTY).</p>
      <p><strong>بيانات أخرى</strong> — نعالج أيضاً معلومات الحساب (مثل الاسم والبريد الإلكتروني ورقم الهاتف)، ومستندات السائق والمركبة المرفوعة، ومعلومات الرحلات والمحادثات، وبيانات الأرباح، والمعلومات التقنية (مثل رموز الإشعارات الفورية وتحليلات التطبيق).</p>
      <p><strong>الغرض</strong> — تُعالَج هذه البيانات لتشغيل منصة السائقين، وإدارة خدمات التنسيق، وضمان سلامة الرحلات وموثوقيتها، والامتثال للالتزامات القانونية، وتحسين أداء التطبيق وتجربة المستخدم.</p>
      <h2>عمليات النقل الدولية</h2>
      <p>كوننا شركة مقرّها الإمارات العربية المتحدة، قد تُعالَج بياناتك خارج المنطقة الاقتصادية الأوروبية، مع تطبيق ضمانات GDPR المناسبة دائماً.</p>
    </>
  )
}
