import { BasePaymentProvider, PaymentProviderError } from './base.provider';
import { OrangeMoneyProvider } from './orange-money/orange-money.provider';
import { MtnMomoProvider } from './mtn-momo/mtn-momo.provider';
import { WaveProvider } from './wave/wave.provider';
import { MoovMoneyProvider } from './moov-money/moov-money.provider';
import { CardProvider } from './card/card.provider';

/**
 * Canonical payment-method identifiers accepted by the platform.
 * These map to the `payment_method` field on transaction requests.
 */
export type PaymentMethod =
  | 'orange_money'
  | 'mtn_momo'
  | 'wave'
  | 'moov_money'
  | 'card';

/**
 * Singleton cache so each provider is instantiated at most once.
 */
const providerCache = new Map<PaymentMethod, BasePaymentProvider>();

/**
 * Map of payment method codes to their provider constructors.
 */
const providerConstructors: Record<PaymentMethod, new () => BasePaymentProvider> = {
  orange_money: OrangeMoneyProvider,
  mtn_momo: MtnMomoProvider,
  wave: WaveProvider,
  moov_money: MoovMoneyProvider,
  card: CardProvider,
};

/**
 * Aliases allow callers to use friendly / alternate names and still
 * resolve to the correct canonical provider.  All keys are lower-cased
 * during lookup so matching is case-insensitive.
 */
const methodAliases: Record<string, PaymentMethod> = {
  // Orange Money
  orange_money: 'orange_money',
  orangemoney: 'orange_money',
  'orange-money': 'orange_money',
  orange: 'orange_money',
  om: 'orange_money',

  // MTN MoMo
  mtn_momo: 'mtn_momo',
  mtnmomo: 'mtn_momo',
  'mtn-momo': 'mtn_momo',
  mtn: 'mtn_momo',
  momo: 'mtn_momo',
  'mobile_money_mtn': 'mtn_momo',

  // Wave
  wave: 'wave',

  // Moov Money
  moov_money: 'moov_money',
  moovmoney: 'moov_money',
  'moov-money': 'moov_money',
  moov: 'moov_money',
  'mobile_money_moov': 'moov_money',

  // Card
  card: 'card',
  cards: 'card',
  visa: 'card',
  mastercard: 'card',
  'credit_card': 'card',
  'debit_card': 'card',
};

/**
 * Return the provider instance for a given payment method string.
 *
 * @param method - A payment method identifier (e.g. "orange_money", "mtn", "card").
 *                 Lookup is case-insensitive and supports common aliases.
 * @throws {PaymentProviderError} if the method is not recognised.
 */
export function getProvider(method: string): BasePaymentProvider {
  const canonical = methodAliases[method.toLowerCase().trim()];

  if (!canonical) {
    throw new PaymentProviderError(
      'ProviderFactory',
      `Unknown payment method "${method}". Supported methods: ${Object.keys(providerConstructors).join(', ')}`,
    );
  }

  let provider = providerCache.get(canonical);
  if (!provider) {
    const Ctor = providerConstructors[canonical];
    provider = new Ctor();
    providerCache.set(canonical, provider);
  }

  return provider;
}

/**
 * List all registered canonical payment methods.
 */
export function listProviders(): PaymentMethod[] {
  return Object.keys(providerConstructors) as PaymentMethod[];
}

/**
 * Return the provider for a given method if it exists, or undefined.
 * Useful when you want to check availability without throwing.
 */
export function getProviderOrNull(method: string): BasePaymentProvider | undefined {
  try {
    return getProvider(method);
  } catch {
    return undefined;
  }
}

/**
 * Determine whether a given currency is supported by at least one provider.
 */
export function isCurrencySupported(currency: string): boolean {
  return listProviders().some((m) => {
    const p = getProvider(m);
    return p.supportedCurrencies.includes(currency.toUpperCase());
  });
}

/**
 * Return all providers that support a specific currency.
 */
export function getProvidersForCurrency(currency: string): BasePaymentProvider[] {
  const upper = currency.toUpperCase();
  return listProviders()
    .map((m) => getProvider(m))
    .filter((p) => p.supportedCurrencies.includes(upper));
}
