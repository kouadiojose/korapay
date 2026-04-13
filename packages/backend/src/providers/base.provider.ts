import { AppError } from '../utils/errors';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface InitPaymentParams {
  reference: string;
  amount: number;
  currency: string;
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
  callbackUrl: string;
  returnUrl?: string;
  metadata?: Record<string, any>;
}

export interface InitPaymentResult {
  success: boolean;
  providerReference?: string;
  paymentUrl?: string;
  ussdCode?: string;
  message: string;
  rawResponse?: any;
}

export interface VerifyPaymentResult {
  success: boolean;
  status: 'pending' | 'success' | 'failed' | 'expired';
  providerReference?: string;
  amount?: number;
  currency?: string;
  message: string;
  rawResponse?: any;
}

export interface TransferParams {
  reference: string;
  amount: number;
  currency: string;
  recipientPhone?: string;
  recipientAccount?: string;
  recipientName?: string;
  narration?: string;
}

export interface TransferResult {
  success: boolean;
  providerReference?: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
  rawResponse?: any;
}

export interface CallbackResult {
  isValid: boolean;
  reference: string;
  status: 'success' | 'failed' | 'pending';
  providerReference?: string;
  amount?: number;
  rawData?: any;
}

// ─── Error class ─────────────────────────────────────────────────────────────

export class PaymentProviderError extends AppError {
  public readonly provider: string;
  public readonly rawError?: any;

  constructor(provider: string, message: string, rawError?: any) {
    super(`[${provider}] ${message}`, 502, 'PAYMENT_PROVIDER_ERROR');
    this.provider = provider;
    this.rawError = rawError;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Test phone numbers ──────────────────────────────────────────────────────

export const TEST_PHONES = {
  SUCCESS: '+2250700000001',
  FAILURE: '+2250700000002',
  PENDING: '+2250700000003',
  TIMEOUT: '+2250700000004',
} as const;

// ─── Abstract Base ───────────────────────────────────────────────────────────

export abstract class BasePaymentProvider {
  abstract readonly name: string;
  abstract readonly code: string;
  abstract readonly supportedCurrencies: string[];
  abstract readonly supportedCountries: string[];

  abstract initializePayment(params: InitPaymentParams): Promise<InitPaymentResult>;
  abstract verifyPayment(reference: string): Promise<VerifyPaymentResult>;
  abstract initiateTransfer(params: TransferParams): Promise<TransferResult>;
  abstract handleCallback(payload: any, headers: Record<string, string>): Promise<CallbackResult>;

  /**
   * Returns true when the application is NOT running in production,
   * meaning API calls should be simulated rather than sent to real endpoints.
   */
  protected isTestMode(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  /**
   * Validate that the requested currency is supported by this provider.
   */
  protected validateCurrency(currency: string): void {
    if (!this.supportedCurrencies.includes(currency)) {
      throw new PaymentProviderError(
        this.name,
        `Currency ${currency} is not supported. Supported: ${this.supportedCurrencies.join(', ')}`,
      );
    }
  }

  /**
   * Produce a short log prefix for structured console output.
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, provider: this.code, level, message, ...data };

    switch (level) {
      case 'error':
        console.error(JSON.stringify(entry));
        break;
      case 'warn':
        console.warn(JSON.stringify(entry));
        break;
      default:
        console.log(JSON.stringify(entry));
    }
  }

  /**
   * Determine the simulated test outcome from a phone number.
   * Returns 'success' for the success test number, 'failed' for the failure
   * number, and 'pending' for anything else.
   */
  protected testOutcomeForPhone(phone?: string): 'success' | 'failed' | 'pending' {
    if (phone === TEST_PHONES.FAILURE) return 'failed';
    if (phone === TEST_PHONES.PENDING) return 'pending';
    return 'success';
  }
}
