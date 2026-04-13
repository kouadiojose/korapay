import db from '../../config/database';
import { NotFoundError, AppError } from '../../utils/errors';
import { generateReference } from '../../utils/reference';
import { paginate } from '../../utils/pagination';
import { getProvider } from '../../providers/provider.factory';
import { TransactionStatus, TransactionType } from '../../types/common.types';
import { debitWallet, creditWallet } from '../wallets/wallet.service';
import type { InitiatePayoutInput, BulkPayoutInput } from './payout.schema';

const PAYOUT_FEE_RATE = 0.01; // 1% fee

export async function initiatePayout(userId: string, input: InitiatePayoutInput) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const reference = input.reference || generateReference('PYT');

  // Check for duplicate reference
  const existing = await db('transactions').where('reference', reference).first();
  if (existing) {
    throw new AppError('A transaction with this reference already exists', 409, 'DUPLICATE_REFERENCE');
  }

  const fee = Math.round(input.amount * PAYOUT_FEE_RATE * 100) / 100;
  const totalDebit = input.amount + fee;

  const result = await db.transaction(async (trx) => {
    // Debit wallet (validates sufficient balance)
    await debitWallet(
      merchant.id,
      input.currency,
      totalDebit,
      `Payout: ${reference}`,
      undefined,
      trx,
    );

    // Create transaction record
    const [transaction] = await trx('transactions')
      .insert({
        merchant_id: merchant.id,
        reference,
        type: TransactionType.PAYOUT,
        status: TransactionStatus.PROCESSING,
        payment_method: input.payment_method,
        amount: input.amount,
        currency: input.currency,
        fee,
        net_amount: input.amount,
        environment: merchant.is_live ? 'live' : 'test',
        customer_name: input.recipient.name,
        customer_phone: input.recipient.phone || null,
        narration: input.narration || null,
        destination: JSON.stringify({
          phone: input.recipient.phone,
          account: input.recipient.account,
          name: input.recipient.name,
          bank_code: input.recipient.bank_code,
        }),
        metadata: JSON.stringify({}),
      })
      .returning('*');

    return transaction;
  });

  // Call provider
  try {
    const provider = getProvider(input.payment_method);
    const providerResult = await provider.initiateTransfer({
      reference,
      amount: input.amount,
      currency: input.currency,
      recipientPhone: input.recipient.phone,
      recipientAccount: input.recipient.account,
      recipientName: input.recipient.name,
      narration: input.narration,
    });

    await db('transactions')
      .where('id', result.id)
      .update({
        status: providerResult.success ? TransactionStatus.SUCCESS : TransactionStatus.FAILED,
        provider_reference: providerResult.providerReference || null,
        provider_response: JSON.stringify(providerResult.rawResponse || {}),
        completed_at: new Date(),
        updated_at: new Date(),
      });

    // Refund on failure
    if (!providerResult.success) {
      await creditWallet(
        merchant.id,
        input.currency,
        totalDebit,
        `Payout refund: ${reference}`,
        result.id,
      );
    }

    return {
      reference,
      status: providerResult.success ? TransactionStatus.SUCCESS : TransactionStatus.FAILED,
      amount: input.amount,
      currency: input.currency,
      fee,
      recipient: input.recipient,
      message: providerResult.message,
    };
  } catch (err) {
    // Refund on provider error
    await creditWallet(
      merchant.id,
      input.currency,
      totalDebit,
      `Payout refund (error): ${reference}`,
      result.id,
    );

    await db('transactions')
      .where('id', result.id)
      .update({
        status: TransactionStatus.FAILED,
        provider_response: JSON.stringify({ error: (err as Error).message }),
        completed_at: new Date(),
        updated_at: new Date(),
      });

    throw err;
  }
}

export async function bulkPayout(userId: string, input: BulkPayoutInput) {
  const results: Array<{ reference: string; status: string; amount: number; recipient_name: string; error?: string }> = [];

  for (const payout of input.payouts) {
    try {
      const result = await initiatePayout(userId, {
        amount: payout.amount,
        currency: input.currency,
        payment_method: input.payment_method,
        recipient: payout.recipient,
        narration: payout.narration,
        reference: payout.reference,
      });
      results.push({
        reference: result.reference,
        status: result.status,
        amount: payout.amount,
        recipient_name: payout.recipient.name,
      });
    } catch (err) {
      results.push({
        reference: payout.reference || 'N/A',
        status: TransactionStatus.FAILED,
        amount: payout.amount,
        recipient_name: payout.recipient.name,
        error: (err as Error).message,
      });
    }
  }

  const successful = results.filter((r) => r.status === TransactionStatus.SUCCESS).length;
  const failed = results.filter((r) => r.status === TransactionStatus.FAILED).length;

  return {
    total: input.payouts.length,
    successful,
    failed,
    results,
  };
}

export async function listPayouts(userId: string, page: number = 1, perPage: number = 20, status?: string) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const query = db('transactions')
    .select('*')
    .where('merchant_id', merchant.id)
    .where('type', TransactionType.PAYOUT)
    .orderBy('created_at', 'desc');

  if (status) {
    query.where('status', status);
  }

  return paginate(query, page, perPage);
}

export async function getPayoutByReference(userId: string, reference: string) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const transaction = await db('transactions')
    .where('reference', reference)
    .where('merchant_id', merchant.id)
    .where('type', TransactionType.PAYOUT)
    .first();

  if (!transaction) {
    throw new NotFoundError('Payout not found');
  }

  return transaction;
}
