import db from '../../config/database';
import { config } from '../../config';
import { NotFoundError, AppError } from '../../utils/errors';
import { generateReference } from '../../utils/reference';
import { paginate } from '../../utils/pagination';
import { getProvider } from '../../providers/provider.factory';
import { TransactionStatus, TransactionType } from '../../types/common.types';
import { creditWallet } from '../wallets/wallet.service';
import type { InitializePaymentInput } from './payment.schema';

const FEE_RATE = 0.015; // 1.5% fee

export async function initializePayment(merchantId: string, environment: string, input: InitializePaymentInput) {
  const reference = input.reference || generateReference('TXN');

  // Check for duplicate reference
  const existing = await db('transactions').where('reference', reference).first();
  if (existing) {
    throw new AppError('A transaction with this reference already exists', 409, 'DUPLICATE_REFERENCE');
  }

  const fee = Math.round(input.amount * FEE_RATE * 100) / 100;
  const netAmount = input.amount - fee;

  // Create transaction record
  const [transaction] = await db('transactions')
    .insert({
      merchant_id: merchantId,
      reference,
      type: TransactionType.COLLECTION,
      status: TransactionStatus.PENDING,
      payment_method: input.payment_method,
      amount: input.amount,
      currency: input.currency,
      fee,
      net_amount: netAmount,
      environment: environment === 'production' ? 'live' : 'test',
      customer_name: input.customer.name,
      customer_email: input.customer.email,
      customer_phone: input.customer.phone || null,
      narration: input.narration || null,
      metadata: JSON.stringify(input.metadata || {}),
    })
    .returning('*');

  // Call payment provider
  try {
    const provider = getProvider(input.payment_method);
    const providerResult = await provider.initializePayment({
      reference,
      amount: input.amount,
      currency: input.currency,
      customerPhone: input.customer.phone,
      customerEmail: input.customer.email,
      customerName: input.customer.name,
      callbackUrl: input.callback_url,
      returnUrl: input.return_url,
      metadata: input.metadata,
    });

    // Update transaction with provider response
    await db('transactions')
      .where('id', transaction.id)
      .update({
        status: providerResult.success ? TransactionStatus.PROCESSING : TransactionStatus.FAILED,
        provider_reference: providerResult.providerReference || null,
        payment_link: providerResult.paymentUrl || null,
        provider_response: JSON.stringify(providerResult.rawResponse || {}),
        updated_at: new Date(),
      });

    return {
      reference,
      status: providerResult.success ? TransactionStatus.PROCESSING : TransactionStatus.FAILED,
      payment_url: providerResult.paymentUrl || null,
      ussd_code: providerResult.ussdCode || null,
      amount: input.amount,
      currency: input.currency,
      fee,
      message: providerResult.message,
    };
  } catch (err) {
    await db('transactions')
      .where('id', transaction.id)
      .update({
        status: TransactionStatus.FAILED,
        provider_response: JSON.stringify({ error: (err as Error).message }),
        updated_at: new Date(),
      });

    throw err;
  }
}

export async function getPaymentStatus(merchantId: string, reference: string) {
  const transaction = await db('transactions')
    .where('reference', reference)
    .where('merchant_id', merchantId)
    .first();

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  // If still pending/processing, verify with provider
  if (
    transaction.status === TransactionStatus.PENDING ||
    transaction.status === TransactionStatus.PROCESSING
  ) {
    try {
      const provider = getProvider(transaction.payment_method);
      const result = await provider.verifyPayment(reference);

      if (result.status !== transaction.status) {
        await db('transactions')
          .where('id', transaction.id)
          .update({
            status: result.status,
            provider_response: JSON.stringify(result.rawResponse || {}),
            completed_at: result.status === 'success' || result.status === 'failed' ? new Date() : null,
            updated_at: new Date(),
          });

        transaction.status = result.status;

        // Credit wallet on success
        if (result.status === 'success') {
          await creditWallet(
            transaction.merchant_id,
            transaction.currency,
            Number(transaction.net_amount),
            `Payment collection: ${reference}`,
            transaction.id,
          );
        }
      }
    } catch {
      // If provider verification fails, return current state
    }
  }

  return {
    reference: transaction.reference,
    status: transaction.status,
    amount: transaction.amount,
    currency: transaction.currency,
    fee: transaction.fee,
    payment_method: transaction.payment_method,
    customer_name: transaction.customer_name,
    customer_email: transaction.customer_email,
    created_at: transaction.created_at,
    completed_at: transaction.completed_at,
  };
}

export async function handleProviderCallback(providerName: string, payload: any, headers: Record<string, string>) {
  const provider = getProvider(providerName);
  const result = await provider.handleCallback(payload, headers);

  if (!result.isValid) {
    throw new AppError('Invalid callback signature', 400, 'INVALID_CALLBACK');
  }

  const transaction = await db('transactions')
    .where('reference', result.reference)
    .first();

  if (!transaction) {
    throw new NotFoundError('Transaction not found for callback');
  }

  // Only update if status is still pending/processing
  if (
    transaction.status === TransactionStatus.PENDING ||
    transaction.status === TransactionStatus.PROCESSING
  ) {
    const newStatus = result.status === 'success'
      ? TransactionStatus.SUCCESS
      : result.status === 'failed'
        ? TransactionStatus.FAILED
        : TransactionStatus.PROCESSING;

    await db('transactions')
      .where('id', transaction.id)
      .update({
        status: newStatus,
        provider_reference: result.providerReference || transaction.provider_reference,
        provider_response: JSON.stringify(result.rawData || {}),
        completed_at: newStatus === TransactionStatus.SUCCESS || newStatus === TransactionStatus.FAILED ? new Date() : null,
        updated_at: new Date(),
      });

    // Credit wallet on success
    if (newStatus === TransactionStatus.SUCCESS) {
      await creditWallet(
        transaction.merchant_id,
        transaction.currency,
        Number(transaction.net_amount),
        `Payment collection: ${transaction.reference}`,
        transaction.id,
      );
    }

    // Trigger webhook delivery
    try {
      const { deliverWebhookForTransaction } = await import('../webhooks/webhook.service');
      await deliverWebhookForTransaction(
        transaction.merchant_id,
        newStatus === TransactionStatus.SUCCESS ? 'charge.success' : 'charge.failed',
        transaction.id,
      );
    } catch {
      // Webhook delivery failure should not fail the callback processing
    }
  }

  return { received: true };
}

export async function listTransactions(
  userId: string,
  filters: {
    page?: number;
    per_page?: number;
    status?: string;
    type?: string;
    payment_method?: string;
    from?: string;
    to?: string;
  },
) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const query = db('transactions')
    .select('*')
    .where('merchant_id', merchant.id)
    .orderBy('created_at', 'desc');

  if (filters.status) {
    query.where('status', filters.status);
  }
  if (filters.type) {
    query.where('type', filters.type);
  }
  if (filters.payment_method) {
    query.where('payment_method', filters.payment_method);
  }
  if (filters.from) {
    query.where('created_at', '>=', filters.from);
  }
  if (filters.to) {
    query.where('created_at', '<=', filters.to);
  }

  return paginate(query, filters.page, filters.per_page);
}

export async function getTransaction(userId: string, reference: string) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const transaction = await db('transactions')
    .where('reference', reference)
    .where('merchant_id', merchant.id)
    .first();

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  return transaction;
}

export async function getTransactionStats(userId: string) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const [stats] = await db('transactions')
    .where('merchant_id', merchant.id)
    .select(
      db.raw('COUNT(*)::int as total_count'),
      db.raw('COALESCE(SUM(amount), 0)::numeric as total_volume'),
      db.raw('COUNT(CASE WHEN status = ? THEN 1 END)::int as successful_count', [TransactionStatus.SUCCESS]),
      db.raw('COALESCE(SUM(CASE WHEN status = ? THEN amount END), 0)::numeric as successful_volume', [TransactionStatus.SUCCESS]),
      db.raw('COUNT(CASE WHEN status = ? THEN 1 END)::int as failed_count', [TransactionStatus.FAILED]),
      db.raw('COUNT(CASE WHEN status = ? THEN 1 END)::int as pending_count', [TransactionStatus.PENDING]),
      db.raw('COALESCE(SUM(fee), 0)::numeric as total_fees'),
    );

  const successRate = stats.total_count > 0
    ? Math.round((stats.successful_count / stats.total_count) * 10000) / 100
    : 0;

  return {
    total_count: stats.total_count,
    total_volume: Number(stats.total_volume),
    successful_count: stats.successful_count,
    successful_volume: Number(stats.successful_volume),
    failed_count: stats.failed_count,
    pending_count: stats.pending_count,
    total_fees: Number(stats.total_fees),
    success_rate: successRate,
  };
}
