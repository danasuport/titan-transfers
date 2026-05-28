export function formatDistance(km: number): string {
  return `${km} km`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

export function formatPrice(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function formatDate(date: string, locale = 'en'): string {
  const tag = locale === 'es' ? 'es-ES' : locale === 'ar' ? 'ar-AE' : 'en-GB'
  return new Date(date).toLocaleDateString(tag, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
