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

export class OrangeMoneyProvider extends BasePaymentProvider {
  readonly name = 'Orange Money';
  readonly code = 'orange_money';
  readonly supportedCurrencies = ['XOF', 'XAF'];
  readonly supportedCountries = ['CI', 'SN', 'ML', 'BF', 'CM', 'GN', 'MG'];

  private readonly client: AxiosInstance;
  private readonly cfg = config.providers.orangeMoney;

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

  // ── Initialize Payment ──────────────────────────────────────────────────

  async initializePayment(params: InitPaymentParams): Promise<InitPaymentResult> {
    this.validateCurrency(params.currency);
    this.log('info', 'Initializing Orange Money payment', {
      reference: params.reference,
      amount: params.amount,
      currency: params.currency,
    });

    if (this.isTestMode()) {
      return this.simulateInitPayment(params);
    }

    try {
      const response = await this.client.post('/webpayment', {
        merchant_key: this.cfg.apiKey,
        currency: params.currency,
        order_id: params.reference,
        amount: params.amount,
        return_url: params.returnUrl ?? params.callbackUrl,
        cancel_url: params.returnUrl ?? params.callbackUrl,
        notif_url: params.callbackUrl,
        lang: 'fr',
        reference: params.reference,
        customer: {
          phone: params.customerPhone,
          email: params.customerEmail,
          name: params.customerName,
        },
        metadata: params.metadata,
      });

      const data = response.data;

      if (data.status !== 'INITIATED' && data.status !== 'SUCCESS') {
        this.log('error', 'Orange Money initializePayment failed', { responseData: data });
        return {
          success: false,
          message: data.message ?? 'Failed to initialize Orange Money payment',
          rawResponse: data,
        };
      }

      return {
        success: true,
        providerReference: data.pay_token ?? data.txnid,
        paymentUrl: data.payment_url,
        message: 'Payment initialized successfully',
        rawResponse: data,
      };
    } catch (error: any) {
      this.log('error', 'Orange Money initializePayment error', { error: error.message });
      throw new PaymentProviderError(this.name, error.message, error.response?.data);
    }
  }

  // ── Verify Payment ──────────────────────────────────────────────────────

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    this.log('info', 'Verifying Orange Money payment', { reference });

    if (this.isTestMode()) {
      return this.simulateVerifyPayment(reference);
    }

    try {
      const response = await this.client.get(`/webpayment/${reference}/status`, {
        params: { order_id: reference },
      });

      const data = response.data;
      const status = this.mapStatus(data.status);

      return {
        success: status === 'success',
        status,
        providerReference: data.txnid ?? data.pay_token,
        amount: data.amount ? Number(data.amount) : undefined,
        currency: data.currency,
        message: data.message ?? `Payment status: ${status}`,
        rawResponse: data,
      };
    } catch (error: any) {
      this.log('error', 'Orange Money verifyPayment error', { error: error.message });
      throw new PaymentProviderError(this.name, error.message, error.response?.data);
    }
  }

  // ── Initiate Transfer (Merchant Payment) ────────────────────────────────

  async initiateTransfer(params: TransferParams): Promise<TransferResult> {
    this.validateCurrency(params.currency);
    this.log('info', 'Initiating Orange Money transfer', {
      reference: params.reference,
      amount: params.amount,
    });

    if (this.isTestMode()) {
      return this.simulateTransfer(params);
    }

    try {
      const response = await this.client.post('/merchant/payment', {
        merchant_key: this.cfg.apiKey,
        currency: params.currency,
        order_id: params.reference,
        amount: params.amount,
        recipient: {
          phone: params.recipientPhone,
          account: params.recipientAccount,
          name: params.recipientName,
        },
        narration: params.narration,
      });

      const data = response.data;

      if (data.status !== 'SUCCESS' && data.status !== 'INITIATED') {
        return {
          success: false,
          status: 'failed',
          message: data.message ?? 'Transfer failed',
          rawResponse: data,
        };
      }

      return {
        success: true,
        providerReference: data.txnid,
        status: data.status === 'SUCCESS' ? 'success' : 'pending',
        message: 'Transfer initiated successfully',
        rawResponse: data,
      };
    } catch (error: any) {
      this.log('error', 'Orange Money transfer error', { error: error.message });
      throw new PaymentProviderError(this.name, error.message, error.response?.data);
    }
  }

  // ── Handle Callback ─────────────────────────────────────────────────────

  async handleCallback(payload: any, headers: Record<string, string>): Promise<CallbackResult> {
    this.log('info', 'Handling Orange Money callback', { reference: payload?.order_id });

    // Signature verification
    const signature = headers['x-orange-signature'] ?? headers['X-Orange-Signature'];
    if (signature && this.cfg.secret) {
      const expectedSig = crypto
        .createHmac('sha256', this.cfg.secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'))) {
        this.log('warn', 'Invalid Orange Money callback signature');
        return {
          isValid: false,
          reference: payload?.order_id ?? '',
          status: 'failed',
          rawData: payload,
        };
      }
    }

    const status = this.mapCallbackStatus(payload?.status);

    return {
      isValid: true,
      reference: payload?.order_id ?? '',
      status,
      providerReference: payload?.txnid ?? payload?.pay_token,
      amount: payload?.amount ? Number(payload.amount) : undefined,
      rawData: payload,
    };
  }

  // ── Status mapping helpers ──────────────────────────────────────────────

  private mapStatus(raw?: string): 'pending' | 'success' | 'failed' | 'expired' {
    switch (raw?.toUpperCase()) {
      case 'SUCCESS':
      case 'SUCCESSFUL':
        return 'success';
      case 'FAILED':
      case 'FAILURE':
      case 'CANCELLED':
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
        return 'success';
      case 'FAILED':
      case 'FAILURE':
      case 'CANCELLED':
      case 'EXPIRED':
        return 'failed';
      default:
        return 'pending';
    }
  }

  // ── Test-mode simulators ────────────────────────────────────────────────

  private simulateInitPayment(params: InitPaymentParams): InitPaymentResult {
    const outcome = this.testOutcomeForPhone(params.customerPhone);
    const providerRef = `OM_TEST_${Date.now()}`;

    if (outcome === 'failed') {
      return {
        success: false,
        message: 'Simulated Orange Money payment failure',
        rawResponse: { test: true, status: 'FAILED' },
      };
    }

    return {
      success: true,
      providerReference: providerRef,
      paymentUrl: `https://sandbox.orangemoney.com/pay/${providerRef}`,
      message: 'Simulated Orange Money payment initialized',
      rawResponse: { test: true, status: 'INITIATED', pay_token: providerRef },
    };
  }

  private simulateVerifyPayment(reference: string): VerifyPaymentResult {
    return {
      success: true,
      status: 'success',
      providerReference: `OM_TEST_${reference}`,
      amount: 1000,
      currency: 'XOF',
      message: 'Simulated verification — payment successful',
      rawResponse: { test: true, status: 'SUCCESS' },
    };
  }

  private simulateTransfer(params: TransferParams): TransferResult {
    const outcome = this.testOutcomeForPhone(params.recipientPhone);

    if (outcome === 'failed') {
      return {
        success: false,
        status: 'failed',
        message: 'Simulated transfer failure',
        rawResponse: { test: true, status: 'FAILED' },
      };
    }

    return {
      success: true,
      providerReference: `OM_TR_TEST_${Date.now()}`,
      status: outcome === 'pending' ? 'pending' : 'success',
      message: 'Simulated transfer successful',
      rawResponse: { test: true, status: 'SUCCESS' },
    };
  }
}
