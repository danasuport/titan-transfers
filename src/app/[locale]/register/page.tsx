import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { CustomerPortal } from '@/components/customer/CustomerPortal'
import { pick } from '@/lib/i18n/pick'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: pick(locale, {
      en: 'Create account | Titan Transfers',
      es: 'Crear cuenta | Titan Transfers',
      ar: 'إنشاء حساب | تايتن ترانسفرز',
    }),
    description: pick(locale, {
      en: 'Create your Titan Transfers account and manage your bookings easily.',
      es: 'Crea tu cuenta en Titan Transfers y gestiona tus reservas fácilmente.',
      ar: 'أنشئ حسابك في تايتن ترانسفرز وأدر حجوزاتك بسهولة.',
    }),
    robots: { index: false, follow: false },
  }
}

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const labels = {
    title: pick(locale, { en: 'Create account', es: 'Crear cuenta', ar: 'إنشاء حساب' }),
    subtitle: pick(locale, {
      en: 'Register to manage your bookings and access your transfer history.',
      es: 'Regístrate para gestionar tus reservas y acceder a tu historial de traslados.',
      ar: 'سجّل لإدارة حجوزاتك والاطلاع على تاريخ رحلاتك.',
    }),
  }

  return (
    <div className="site-container px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: labels.title }]} />
      <h1 className="mb-4 text-3xl font-bold text-heading sm:text-4xl">{labels.title}</h1>
      <p className="mb-8 text-lg text-body">{labels.subtitle}</p>
      <CustomerPortal />
    </div>
  )
}
