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

export class WaveProvider extends BasePaymentProvider {
  readonly name = 'Wave';
  readonly code = 'wave';
  readonly supportedCurrencies = ['XOF'];
  readonly supportedCountries = ['SN', 'CI', 'ML', 'BF'];

  private readonly client: AxiosInstance;
  private readonly cfg = config.providers.wave;

  constructor() {
    super();
    this.client = axios.create({
      baseURL: this.cfg.baseUrl,
      timeout: 30_000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cfg.apiKey}`,
      },
    });
  }

  // ── Initialize Payment (Create checkout session) ────────────────────────

  async initializePayment(params: InitPaymentParams): Promise<InitPaymentResult> {
    this.validateCurrency(params.currency);
    this.log('info', 'Initializing Wave checkout session', {
      reference: params.reference,
      amount: params.amount,
      currency: params.currency,
    });

    if (this.isTestMode()) {
      return this.simulateInitPayment(params);
    }

    try {
      const response = await this.client.post('/v1/checkout/sessions', {
        amount: String(params.amount),
        currency: params.currency,
        client_reference: params.reference,
        error_url: params.returnUrl ?? params.callbackUrl,
        success_url: params.returnUrl ?? params.callbackUrl,
        webhook_url: params.callbackUrl,
        customer_phone: params.customerPhone,
        customer_email: params.customerEmail,
        customer_name: params.customerName,
        metadata: params.metadata,
      });

      const data = response.data;

      if (!data.id || !data.checkout_url) {
        this.log('error', 'Wave checkout session creation failed', { responseData: data });
        return {
          success: false,
          message: data.message ?? 'Failed to create Wave checkout session',
          rawResponse: data,
        };
      }

      return {
        success: true,
        providerReference: data.id,
        paymentUrl: data.checkout_url,
        message: 'Checkout session created successfully',
        rawResponse: data,
      };
    } catch (error: any) {
      this.log('error', 'Wave initializePayment error', { error: error.message });
      throw new PaymentProviderError(this.name, error.message, error.response?.data);
    }
  }

  // ── Verify Payment ──────────────────────────────────────────────────────

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    this.log('info', 'Verifying Wave payment', { reference });

    if (this.isTestMode()) {
      return this.simulateVerifyPayment(reference);
    }

    try {
      const response = await this.client.get(`/v1/checkout/sessions/${reference}`);
      const data = response.data;
      const status = this.mapStatus(data.payment_status ?? data.status);

      return {
        success: status === 'success',
        status,
        providerReference: data.id ?? reference,
        amount: data.amount ? Number(data.amount) : undefined,
        currency: data.currency,
        message: `Payment status: ${status}`,
        rawResponse: data,
      };
    } catch (error: any) {
      this.log('error', 'Wave verifyPayment error', { error: error.message });
      throw new PaymentProviderError(this.name, error.message, error.response?.data);
    }
  }

  // ── Initiate Transfer (Payout) ──────────────────────────────────────────

  async initiateTransfer(params: TransferParams): Promise<TransferResult> {
    this.validateCurrency(params.currency);
    this.log('info', 'Initiating Wave payout', {
      reference: params.reference,
      amount: params.amount,
    });

    if (this.isTestMode()) {
      return this.simulateTransfer(params);
    }

    try {
      const response = await this.client.post('/v1/payouts', {
        amount: String(params.amount),
        currency: params.currency,
        client_reference: params.reference,
        recipient_phone: params.recipientPhone,
        recipient_name: params.recipientName,
        narration: params.narration,
      });

      const data = response.data;

      if (!data.id) {
        return {
          success: false,
          status: 'failed',
          message: data.message ?? 'Payout initiation failed',
          rawResponse: data,
        };
      }

      return {
        success: true,
        providerReference: data.id,
        status: this.mapTransferStatus(data.status),
        message: 'Payout initiated successfully',
        rawResponse: data,
      };
    } catch (error: any) {
      this.log('error', 'Wave transfer error', { error: error.message });
      throw new PaymentProviderError(this.name, error.message, error.response?.data);
    }
  }

  // ── Handle Callback (Webhook) ───────────────────────────────────────────

  async handleCallback(payload: any, headers: Record<string, string>): Promise<CallbackResult> {
    this.log('info', 'Handling Wave webhook', { type: payload?.type });

    // Verify webhook signature
    const signature = headers['wave-signature'] ?? headers['Wave-Signature'];
    if (this.cfg.webhookSecret && signature) {
      const expectedSig = crypto
        .createHmac('sha256', this.cfg.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'))) {
        this.log('warn', 'Invalid Wave webhook signature');
        return {
          isValid: false,
          reference: payload?.data?.client_reference ?? '',
          status: 'failed',
          rawData: payload,
        };
      }
    }

    const eventData = payload?.data ?? payload;
    const status = this.mapCallbackStatus(eventData?.payment_status ?? eventData?.status);

    return {
      isValid: true,
      reference: eventData?.client_reference ?? '',
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
      case 'completed':
        return 'success';
      case 'failed':
      case 'cancelled':
        return 'failed';
      case 'expired':
        return 'expired';
      default:
        return 'pending';
    }
  }

  private mapTransferStatus(raw?: string): 'pending' | 'success' | 'failed' {
    switch (raw?.toLowerCase()) {
      case 'succeeded':
      case 'completed':
        return 'success';
      case 'failed':
      case 'cancelled':
        return 'failed';
      default:
        return 'pending';
    }
  }

  private mapCallbackStatus(raw?: string): 'success' | 'failed' | 'pending' {
    switch (raw?.toLowerCase()) {
      case 'succeeded':
      case 'completed':
        return 'success';
      case 'failed':
      case 'cancelled':
      case 'expired':
        return 'failed';
      default:
        return 'pending';
    }
  }

  // ── Test-mode simulators ────────────────────────────────────────────────

  private simulateInitPayment(params: InitPaymentParams): InitPaymentResult {
    const outcome = this.testOutcomeForPhone(params.customerPhone);
    const sessionId = `wave_cs_test_${Date.now()}`;

    if (outcome === 'failed') {
      return {
        success: false,
        message: 'Simulated Wave checkout failure',
        rawResponse: { test: true, status: 'failed' },
      };
    }

    return {
      success: true,
      providerReference: sessionId,
      paymentUrl: `https://sandbox.wave.com/checkout/${sessionId}`,
      message: 'Simulated Wave checkout session created',
      rawResponse: { test: true, id: sessionId, status: 'pending' },
    };
  }

  private simulateVerifyPayment(reference: string): VerifyPaymentResult {
    return {
      success: true,
      status: 'success',
      providerReference: reference,
      amount: 2500,
      currency: 'XOF',
      message: 'Simulated verification — payment succeeded',
      rawResponse: { test: true, status: 'succeeded' },
    };
  }

  private simulateTransfer(params: TransferParams): TransferResult {
    const outcome = this.testOutcomeForPhone(params.recipientPhone);
    const payoutId = `wave_po_test_${Date.now()}`;

    if (outcome === 'failed') {
      return {
        success: false,
        status: 'failed',
        message: 'Simulated Wave payout failure',
        rawResponse: { test: true, status: 'failed' },
      };
    }

    return {
      success: true,
      providerReference: payoutId,
      status: outcome === 'pending' ? 'pending' : 'success',
      message: 'Simulated Wave payout initiated',
      rawResponse: { test: true, id: payoutId, status: 'succeeded' },
    };
  }
}
