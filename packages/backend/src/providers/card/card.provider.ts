import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { config } from '../../config';
import {
  BasePaymentProvider,
  InitPaymentParams,
  InitPaymentResult,
  VerifyPaymentResult,
  TransferParams,
  TransferResult,
  CallbackResult,
  PaymentProviderError,
} from '../base.provider';

// Well-known test card numbers
const TEST_CARDS = {
  SUCCESS: '4111111111111111',
  FAILURE: '4000000000000002',
  THREE_DS: '4000000000003220',
} as const;

export class CardProvider extends BasePaymentProvider {
  readonly name = 'Card Processor';
  readonly code = 'card';
  readonly supportedCurrencies = ['XOF', 'XAF', 'USD', 'EUR', 'NGN', 'GHS'];
  readonly supportedCountries: string[] = []; // Cards are not country-restricted

  private readonly client: AxiosInstance;
  private readonly cfg = config.providers.card;

  constructor() {
    super();
    this.client = axios.create({
      baseURL: this.cfg.baseUrl,
      timeout: 30_000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cfg.secretKey}`,
      },
    });
  }

  // ── Initialize Payment (Create Payment Intent) ─────────────────────────

  async initializePayment(params: InitPaymentParams): Promise<InitPaymentResult> {
    this.validateCurrency(params.currency);
    this.log('info', 'Initializing card payment intent', {
      reference: params.reference,
      amount: params.amount,
      currency: params.currency,
    });

    if (this.isTestMode()) {
      return this.simulateInitPayment(params);
    }

    try {
      const response = await this.client.post('/v1/payment-intents', {
        amount: params.amount,
        currency: params.currency.toLowerCase(),
        reference: params.reference,
        return_url: params.returnUrl ?? params.callbackUrl,
        webhook_url: params.callbackUrl,
        customer: {
          email: params.customerEmail,
          name: params.customerName,
          phone: params.customerPhone,
        },
        metadata: params.metadata,
      });

      const data = response.data;

      if (!data.id) {
        this.log('error', 'Card payment intent creation failed', { responseData: data });
        return {
          success: false,
          message: data.message ?? 'Failed to create payment intent',
          rawResponse: data,
        };
      }

      const result: InitPaymentResult = {
        success: true,
        providerReference: data.id,
        message: 'Payment intent created',
        rawResponse: data,
      };

      // If 3DS is required the processor returns an authentication URL
      if (data.next_action?.type === 'redirect_to_url') {
        result.paymentUrl = data.next_action.redirect_url;
        result.message = '3D Secure authentication required';
      } else if (data.client_secret) {
        // Client-side confirmation flow — return the checkout URL
        result.paymentUrl = `${this.cfg.baseUrl}/checkout/${data.client_secret}`;
      }

      return result;
    } catch (error: any) {
      this.log('error', 'Card initializePayment error', { error: error.message });
      throw new PaymentProviderError(this.name, error.message, error.response?.data);
    }
  }

  // ── Verify Payment ──────────────────────────────────────────────────────

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    this.log('info', 'Verifying card payment', { reference });

    if (this.isTestMode()) {
      return this.simulateVerifyPayment(reference);
    }

    try {
      const response = await this.client.get(`/v1/payment-intents/${reference}`);
      const data = response.data;
      const status = this.mapStatus(data.status);

      return {
        success: status === 'success',
        status,
        providerReference: data.id ?? reference,
        amount: data.amount ? Number(data.amount) : undefined,
        currency: data.currency?.toUpperCase(),
        message: data.last_payment_error?.message ?? `Payment status: ${status}`,
        rawResponse: data,
      };
    } catch (error: any) {
      this.log('error', 'Card verifyPayment error', { error: error.message });
      throw new PaymentProviderError(this.name, error.message, error.response?.data);
    }
  }

  // ── Initiate Transfer ───────────────────────────────────────────────────

  async initiateTransfer(_params: TransferParams): Promise<TransferResult> {
    throw new PaymentProviderError(
      this.name,
      'Transfers are not supported via the card payment provider. Use a mobile money or bank transfer provider instead.',
    );
  }

  // ── Handle Callback (Webhook) ───────────────────────────────────────────

  async handleCallback(payload: any, headers: Record<string, string>): Promise<CallbackResult> {
    this.log('info', 'Handling card processor webhook', { type: payload?.type });

    // Verify webhook signature
    const signature = headers['x-webhook-signature'] ?? headers['X-Webhook-Signature'];
    if (this.cfg.webhookSecret && signature) {
      const expectedSig = crypto
        .createHmac('sha256', this.cfg.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      try {
        if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'))) {
          this.log('warn', 'Invalid card webhook signature');
          return {
            isValid: false,
            reference: payload?.data?.reference ?? '',
            status: 'failed',
            rawData: payload,
          };
        }
      } catch {
        // timingSafeEqual throws if buffer lengths differ — treat as invalid
        this.log('warn', 'Card webhook signature length mismatch');
        return {
          isValid: false,
          reference: payload?.data?.reference ?? '',
          status: 'failed',
          rawData: payload,
        };
      }
    }

    const eventData = payload?.data ?? payload;
    const status = this.mapCallbackStatus(eventData?.status);

    return {
      isValid: true,
      reference: eventData?.reference ?? eventData?.metadata?.reference ?? '',
      status,
      providerReference: eventData?.id,
      amount: eventData?.amount ? Number(eventData.amount) : undefined,
      rawData: payload,
    };
  }

  // ── Status mapping ──────────────────────────────────────────────────────

  private mapStatus(raw?: string): 'pending' | 'success' | 'failed' | 'expired' {
    switch (raw?.toLowerCase()) {
      case 'succeeded':
      case 'paid':
        return 'success';
      case 'failed':
      case 'canceled':
      case 'cancelled':
        return 'failed';
      case 'expired':
        return 'expired';
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
      case 'processing':
      default:
        return 'pending';
    }
  }

  private mapCallbackStatus(raw?: string): 'success' | 'failed' | 'pending' {
    switch (raw?.toLowerCase()) {
      case 'succeeded':
      case 'paid':
        return 'success';
      case 'failed':
      case 'canceled':
      case 'cancelled':
      case 'expired':
        return 'failed';
      default:
        return 'pending';
    }
  }

  // ── Test-mode simulators ────────────────────────────────────────────────

  private simulateInitPayment(params: InitPaymentParams): InitPaymentResult {
    const cardNumber = params.metadata?.card_number ?? '';
    const intentId = `pi_test_${Date.now()}`;
    const clientSecret = `${intentId}_secret_${crypto.randomBytes(8).toString('hex')}`;

    // Simulate failure for known decline card
    if (cardNumber === TEST_CARDS.FAILURE) {
      return {
        success: false,
        message: 'Simulated card decline — your card was declined',
        rawResponse: {
          test: true,
          id: intentId,
          status: 'failed',
          last_payment_error: { code: 'card_declined', message: 'Your card was declined.' },
        },
      };
    }

    // Simulate 3DS challenge for known 3DS card
    if (cardNumber === TEST_CARDS.THREE_DS) {
      return {
        success: true,
        providerReference: intentId,
        paymentUrl: `https://sandbox.cardprocessor.com/3ds/${intentId}`,
        message: 'Simulated 3D Secure authentication required',
        rawResponse: {
          test: true,
          id: intentId,
          status: 'requires_action',
          client_secret: clientSecret,
          next_action: {
            type: 'redirect_to_url',
            redirect_url: `https://sandbox.cardprocessor.com/3ds/${intentId}`,
          },
        },
      };
    }

    // Default: success
    return {
      success: true,
      providerReference: intentId,
      paymentUrl: `https://sandbox.cardprocessor.com/checkout/${clientSecret}`,
      message: 'Simulated payment intent created',
      rawResponse: {
        test: true,
        id: intentId,
        status: 'requires_confirmation',
        client_secret: clientSecret,
      },
    };
  }

  private simulateVerifyPayment(reference: string): VerifyPaymentResult {
    return {
      success: true,
      status: 'success',
      providerReference: reference,
      amount: 10000,
      currency: 'XOF',
      message: 'Simulated verification — payment succeeded',
      rawResponse: { test: true, id: reference, status: 'succeeded' },
    };
  }
}
