/**
 * Utilidades de formateo rioplatense para tesorería.
 */

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') {
    return '$ 0,00'
  }
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount)
  if (isNaN(numeric)) {
    return '$ 0,00'
  }
  return currencyFormatter.format(numeric)
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  // Si viene en formato YYYY-MM-DD
  const parts = dateString.split('T')[0].split('-')
  if (parts.length === 3) {
    const [year, month, day] = parts
    return `${day}/${month}/${year}`
  }
  return dateString
}

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Tucuman',
  }).format(date)
}
