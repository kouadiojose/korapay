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

export class MoovMoneyProvider extends BasePaymentProvider {
  readonly name = 'Moov Money';
  readonly code = 'moov_money';
  readonly supportedCurrencies = ['XOF', 'XAF'];
  readonly supportedCountries = ['CI', 'BJ', 'TG', 'NE', 'CM'];

  private readonly client: AxiosInstance;
  private readonly cfg = config.providers.moovMoney;

  constructor() {
    super();
    this.client = axios.create({
      baseURL: this.cfg.baseUrl,
      timeout: 30_000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cfg.apiKey}`,
        'X-Merchant-Id': this.cfg.merchantId,
      },
    });
  }

  // ── Initialize Payment (Push USSD) ──────────────────────────────────────

  async initializePayment(params: InitPaymentParams): Promise<InitPaymentResult> {
    this.validateCurrency(params.currency);
    this.log('info', 'Initializing Moov Money USSD payment', {
      reference: params.reference,
      amount: params.amount,
      currency: params.currency,
    });

    if (this.isTestMode()) {
      return this.simulateInitPayment(params);
    }

    try {
      const response = await this.client.post('/api/v1/payment/push', {
        merchant_id: this.cfg.merchantId,
        subscriber_msisdn: params.customerPhone,
        amount: params.amount,
        currency: params.currency,
        reference: params.reference,
        callback_url: params.callbackUrl,
        description: params.metadata?.description ?? 'Payment',
        customer: {
          email: params.customerEmail,
          name: params.customerName,
        },
      });

      const data = response.data;

      if (data.status !== 'INITIATED' && data.status !== 'PENDING') {
        this.log('error', 'Moov Money push payment failed', { responseData: data });
        return {
          success: false,
          message: data.message ?? 'Failed to initiate USSD payment',
          rawResponse: data,
        };
      }

      return {
        success: true,
        providerReference: data.transaction_id ?? data.txn_id,
        ussdCode: data.ussd_code,
        message: data.message ?? 'USSD payment request sent to subscriber',
        rawResponse: data,
      };
    } catch (error: any) {
      this.log('error', 'Moov Money initializePayment error', { error: error.message });
      throw new PaymentProviderError(this.name, error.message, error.response?.data);
    }
  }

  // ── Verify Payment ──────────────────────────────────────────────────────

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    this.log('info', 'Verifying Moov Money payment', { reference });

    if (this.isTestMode()) {
      return this.simulateVerifyPayment(reference);
    }

    try {
      const response = await this.client.get(`/api/v1/payment/status/${reference}`);
      const data = response.data;
      const status = this.mapStatus(data.status);

      return {
        success: status === 'success',
        status,
        providerReference: data.transaction_id ?? reference,
        amount: data.amount ? Number(data.amount) : undefined,
        currency: data.currency,
        message: data.message ?? `Payment status: ${status}`,
        rawResponse: data,
      };
    } catch (error: any) {
      this.log('error', 'Moov Money verifyPayment error', { error: error.message });
      throw new PaymentProviderError(this.name, error.message, error.response?.data);
    }
  }

  // ── Initiate Transfer ───────────────────────────────────────────────────

  async initiateTransfer(params: TransferParams): Promise<TransferResult> {
    this.validateCurrency(params.currency);
    this.log('info', 'Initiating Moov Money transfer', {
      reference: params.reference,
      amount: params.amount,
    });

    if (this.isTestMode()) {
      return this.simulateTransfer(params);
    }

    try {
      const response = await this.client.post('/api/v1/transfer', {
        merchant_id: this.cfg.merchantId,
        subscriber_msisdn: params.recipientPhone,
        amount: params.amount,
        currency: params.currency,
        reference: params.reference,
        narration: params.narration,
        recipient: {
          account: params.recipientAccount,
          name: params.recipientName,
        },
      });

      const data = response.data;

      if (data.status !== 'SUCCESS' && data.status !== 'PENDING') {
        return {
          success: false,
          status: 'failed',
          message: data.message ?? 'Transfer failed',
          rawResponse: data,
        };
      }

      return {
        success: true,
        providerReference: data.transaction_id ?? data.txn_id,
        status: data.status === 'SUCCESS' ? 'success' : 'pending',
        message: 'Transfer initiated successfully',
        rawResponse: data,
      };
    } catch (error: any) {
      this.log('error', 'Moov Money transfer error', { error: error.message });
      throw new PaymentProviderError(this.name, error.message, error.response?.data);
    }
  }

  // ── Handle Callback ─────────────────────────────────────────────────────

  async handleCallback(payload: any, headers: Record<string, string>): Promise<CallbackResult> {
    this.log('info', 'Handling Moov Money callback', { reference: payload?.reference });

    // Verify signature when secret is configured
    const signature = headers['x-moov-signature'] ?? headers['X-Moov-Signature'];
    if (this.cfg.secret && signature) {
      const expectedSig = crypto
        .createHmac('sha256', this.cfg.secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'))) {
        this.log('warn', 'Invalid Moov Money callback signature');
        return {
          isValid: false,
          reference: payload?.reference ?? '',
          status: 'failed',
          rawData: payload,
        };
      }
    }

    if (!payload || !payload.reference) {
      return {
        isValid: false,
        reference: '',
        status: 'failed',
        rawData: payload,
      };
    }

    const status = this.mapCallbackStatus(payload.status);

    return {
      isValid: true,
      reference: payload.reference,
      status,
      providerReference: payload.transaction_id ?? payload.txn_id,
      amount: payload.amount ? Number(payload.amount) : undefined,
      rawData: payload,
    };
  }

  // ── Status mapping ──────────────────────────────────────────────────────

  private mapStatus(raw?: string): 'pending' | 'success' | 'failed' | 'expired' {
    switch (raw?.toUpperCase()) {
      case 'SUCCESS':
      case 'SUCCESSFUL':
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
      case 'FAILURE':
      case 'REJECTED':
        return 'failed';
      case 'EXPIRED':
        return 'expired';
      default:
        return 'pending';
    }
  }

  private mapCallbackStatus(raw?: string): 'success' | 'failed' | 'pending' {
    switch (raw?.toUpperCase()) {
      case 'SUCCESS':
      case 'SUCCESSFUL':
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
      case 'FAILURE':
      case 'REJECTED':
      case 'EXPIRED':
        return 'failed';
      default:
        return 'pending';
    }
  }

  // ── Test-mode simulators ────────────────────────────────────────────────

  private simulateInitPayment(params: InitPaymentParams): InitPaymentResult {
    const outcome = this.testOutcomeForPhone(params.customerPhone);
    const txnId = `MOOV_TEST_${Date.now()}`;

    if (outcome === 'failed') {
      return {
        success: false,
        message: 'Simulated Moov Money USSD push failure',
        rawResponse: { test: true, status: 'FAILED' },
      };
    }

    return {
      success: true,
      providerReference: txnId,
      ussdCode: '*133*1*1#',
      message: 'Simulated USSD payment request sent',
      rawResponse: { test: true, transaction_id: txnId, status: 'PENDING', ussd_code: '*133*1*1#' },
    };
  }

  private simulateVerifyPayment(reference: string): VerifyPaymentResult {
    return {
      success: true,
      status: 'success',
      providerReference: `MOOV_TEST_${reference}`,
      amount: 3000,
      currency: 'XOF',
      message: 'Simulated verification — payment successful',
      rawResponse: { test: true, status: 'SUCCESS' },
    };
  }

  private simulateTransfer(params: TransferParams): TransferResult {
    const outcome = this.testOutcomeForPhone(params.recipientPhone);
    const txnId = `MOOV_TR_TEST_${Date.now()}`;

    if (outcome === 'failed') {
      return {
        success: false,
        status: 'failed',
        message: 'Simulated Moov Money transfer failure',
        rawResponse: { test: true, status: 'FAILED' },
      };
    }

    return {
      success: true,
      providerReference: txnId,
      status: outcome === 'pending' ? 'pending' : 'success',
      message: 'Simulated Moov Money transfer initiated',
      rawResponse: { test: true, transaction_id: txnId, status: 'SUCCESS' },
    };
  }
}
