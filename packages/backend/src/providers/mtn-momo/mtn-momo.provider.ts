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

export class MtnMomoProvider extends BasePaymentProvider {
  readonly name = 'MTN Mobile Money';
  readonly code = 'mtn_momo';
  readonly supportedCurrencies = ['XOF', 'XAF', 'GHS', 'UGX'];
  readonly supportedCountries = ['CI', 'CM', 'GH', 'UG', 'BJ', 'CG'];

  private readonly collectionClient: AxiosInstance;
  private readonly disbursementClient: AxiosInstance;
  private readonly cfg = config.providers.mtnMomo;

  constructor() {
    super();

    const commonHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': this.cfg.subscriptionKey,
      'X-Target-Environment': this.cfg.environment,
    };

    this.collectionClient = axios.create({
      baseURL: `${this.cfg.baseUrl}/collection/v1_0`,
      timeout: 30_000,
      headers: commonHeaders,
    });

    this.disbursementClient = axios.create({
      baseURL: `${this.cfg.baseUrl}/disbursement/v1_0`,
      timeout: 30_000,
      headers: commonHeaders,
    });
  }

  // ── Access token ────────────────────────────────────────────────────────

  private async getAccessToken(product: 'collection' | 'disbursement'): Promise<string> {
    const tokenUrl = `${this.cfg.baseUrl}/${product}/token/`;
    const credentials = Buffer.from(`${this.cfg.apiUser}:${this.cfg.apiKey}`).toString('base64');

    const response = await axios.post(
      tokenUrl,
      {},
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Ocp-Apim-Subscription-Key': this.cfg.subscriptionKey,
        },
        timeout: 15_000,
      },
    );

    return response.data.access_token;
  }

  // ── Initialize Payment (Request to Pay) ─────────────────────────────────

  async initializePayment(params: InitPaymentParams): Promise<InitPaymentResult> {
    this.validateCurrency(params.currency);
    this.log('info', 'Initializing MTN MoMo Request to Pay', {
      reference: params.reference,
      amount: params.amount,
      currency: params.currency,
    });

    if (this.isTestMode()) {
      return this.simulateInitPayment(params);
    }

    try {
      const accessToken = await this.getAccessToken('collection');
      const externalId = params.reference;
      const xReferenceId = crypto.randomUUID();

      await this.collectionClient.post(
        '/requesttopay',
        {
          amount: String(params.amount),
          currency: params.currency,
          externalId,
          payer: {
            partyIdType: 'MSISDN',
            partyId: params.customerPhone?.replace('+', '') ?? '',
          },
          payerMessage: params.metadata?.message ?? 'Payment request',
          payeeNote: params.metadata?.note ?? params.reference,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Reference-Id': xReferenceId,
            'X-Callback-Url': params.callbackUrl,
          },
        },
      );

      // MTN returns 202 Accepted — no body. The X-Reference-Id is the provider ref.
      return {
        success: true,
        providerReference: xReferenceId,
        message: 'Request to Pay submitted successfully',
        rawResponse: { xReferenceId, externalId },
      };
    } catch (error: any) {
      this.log('error', 'MTN MoMo initializePayment error', { error: error.message });
      throw new PaymentProviderError(this.name, error.message, error.response?.data);
    }
  }

  // ── Verify Payment ──────────────────────────────────────────────────────

  async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    this.log('info', 'Verifying MTN MoMo payment', { reference });

    if (this.isTestMode()) {
      return this.simulateVerifyPayment(reference);
    }

    try {
      const accessToken = await this.getAccessToken('collection');

      const response = await this.collectionClient.get(`/requesttopay/${reference}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      const data = response.data;
      const status = this.mapStatus(data.status);

      return {
        success: status === 'success',
        status,
        providerReference: data.financialTransactionId ?? reference,
        amount: data.amount ? Number(data.amount) : undefined,
        currency: data.currency,
        message: data.reason?.message ?? `Payment status: ${status}`,
        rawResponse: data,
      };
    } catch (error: any) {
      this.log('error', 'MTN MoMo verifyPayment error', { error: error.message });
      throw new PaymentProviderError(this.name, error.message, error.response?.data);
    }
  }

  // ── Initiate Transfer (Disbursement) ────────────────────────────────────

  async initiateTransfer(params: TransferParams): Promise<TransferResult> {
    this.validateCurrency(params.currency);
    this.log('info', 'Initiating MTN MoMo disbursement', {
      reference: params.reference,
      amount: params.amount,
    });

    if (this.isTestMode()) {
      return this.simulateTransfer(params);
    }

    try {
      const accessToken = await this.getAccessToken('disbursement');
      const xReferenceId = crypto.randomUUID();

      await this.disbursementClient.post(
        '/transfer',
        {
          amount: String(params.amount),
          currency: params.currency,
          externalId: params.reference,
          payee: {
            partyIdType: 'MSISDN',
            partyId: params.recipientPhone?.replace('+', '') ?? '',
          },
          payerMessage: params.narration ?? 'Transfer',
          payeeNote: params.narration ?? params.reference,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Reference-Id': xReferenceId,
          },
        },
      );

      return {
        success: true,
        providerReference: xReferenceId,
        status: 'pending',
        message: 'Disbursement submitted successfully',
        rawResponse: { xReferenceId },
      };
    } catch (error: any) {
      this.log('error', 'MTN MoMo transfer error', { error: error.message });
      throw new PaymentProviderError(this.name, error.message, error.response?.data);
    }
  }

  // ── Handle Callback ─────────────────────────────────────────────────────

  async handleCallback(payload: any, _headers: Record<string, string>): Promise<CallbackResult> {
    this.log('info', 'Handling MTN MoMo callback', { externalId: payload?.externalId });

    /*
     * MTN MoMo callbacks carry the request-to-pay/transfer object directly.
     * There is no HMAC signature on the callback; validation relies on the
     * X-Reference-Id matching a previously submitted request.
     */
    if (!payload || !payload.externalId) {
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
      reference: payload.externalId,
      status,
      providerReference: payload.financialTransactionId ?? payload.referenceId,
      amount: payload.amount ? Number(payload.amount) : undefined,
      rawData: payload,
    };
  }

  // ── Status mapping ──────────────────────────────────────────────────────

  private mapStatus(raw?: string): 'pending' | 'success' | 'failed' | 'expired' {
    switch (raw?.toUpperCase()) {
      case 'SUCCESSFUL':
        return 'success';
      case 'FAILED':
        return 'failed';
      case 'EXPIRED':
        return 'expired';
      case 'PENDING':
      default:
        return 'pending';
    }
  }

  private mapCallbackStatus(raw?: string): 'success' | 'failed' | 'pending' {
    switch (raw?.toUpperCase()) {
      case 'SUCCESSFUL':
        return 'success';
      case 'FAILED':
      case 'EXPIRED':
      case 'REJECTED':
        return 'failed';
      default:
        return 'pending';
    }
  }

  // ── Test-mode simulators ────────────────────────────────────────────────

  private simulateInitPayment(params: InitPaymentParams): InitPaymentResult {
    const outcome = this.testOutcomeForPhone(params.customerPhone);
    const providerRef = crypto.randomUUID();

    if (outcome === 'failed') {
      return {
        success: false,
        message: 'Simulated MTN MoMo request-to-pay failure',
        rawResponse: { test: true, status: 'FAILED' },
      };
    }

    return {
      success: true,
      providerReference: providerRef,
      message: 'Simulated MTN MoMo request-to-pay submitted',
      rawResponse: { test: true, xReferenceId: providerRef, status: 'PENDING' },
    };
  }

  private simulateVerifyPayment(reference: string): VerifyPaymentResult {
    return {
      success: true,
      status: 'success',
      providerReference: reference,
      amount: 5000,
      currency: 'XOF',
      message: 'Simulated verification — payment successful',
      rawResponse: { test: true, status: 'SUCCESSFUL' },
    };
  }

  private simulateTransfer(params: TransferParams): TransferResult {
    const outcome = this.testOutcomeForPhone(params.recipientPhone);
    const providerRef = crypto.randomUUID();

    if (outcome === 'failed') {
      return {
        success: false,
        status: 'failed',
        message: 'Simulated disbursement failure',
        rawResponse: { test: true, status: 'FAILED' },
      };
    }

    return {
      success: true,
      providerReference: providerRef,
      status: outcome === 'pending' ? 'pending' : 'success',
      message: 'Simulated disbursement submitted',
      rawResponse: { test: true, xReferenceId: providerRef, status: 'SUCCESSFUL' },
    };
  }
}
