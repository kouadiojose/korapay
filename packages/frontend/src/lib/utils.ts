import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'XOF'): string {
  const currencyMap: Record<string, { locale: string; symbol: string }> = {
    XOF: { locale: 'fr-FR', symbol: 'FCFA' },
    XAF: { locale: 'fr-FR', symbol: 'FCFA' },
    NGN: { locale: 'en-NG', symbol: '₦' },
    GHS: { locale: 'en-GH', symbol: 'GH₵' },
    USD: { locale: 'en-US', symbol: '$' },
    EUR: { locale: 'fr-FR', symbol: '€' },
  };

  const config = currencyMap[currency] || currencyMap.XOF;
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} ${config.symbol}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    success: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    settled: 'bg-green-100 text-green-800',
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    under_review: 'bg-blue-100 text-blue-800',
    submitted: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800',
    reversed: 'bg-purple-100 text-purple-800',
    expired: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    orange_money: 'Orange Money',
    mtn_momo: 'MTN MoMo',
    wave: 'Wave',
    moov_money: 'Moov Money',
    bank_card: 'Carte Bancaire',
    bank_transfer: 'Virement Bancaire',
  };
  return labels[method] || method;
}
