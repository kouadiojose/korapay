export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Map<string, CurrencyInfo> = new Map([
  ['XOF', { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc', decimals: 0 }],
  ['XAF', { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc', decimals: 0 }],
  ['NGN', { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', decimals: 2 }],
  ['GHS', { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', decimals: 2 }],
  ['KES', { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', decimals: 2 }],
  ['USD', { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 }],
  ['EUR', { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 }],
  ['GNF', { code: 'GNF', symbol: 'FG', name: 'Guinean Franc', decimals: 0 }],
]);

export function formatAmount(amount: number, currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.get(currencyCode.toUpperCase());
  if (!currency) {
    throw new Error(`Unsupported currency: ${currencyCode}`);
  }

  const formatted = amount.toFixed(currency.decimals);
  return `${currency.symbol} ${formatted}`;
}

export function parseCurrency(code: string): CurrencyInfo {
  const currency = SUPPORTED_CURRENCIES.get(code.toUpperCase());
  if (!currency) {
    throw new Error(`Unsupported currency: ${code}`);
  }
  return currency;
}
