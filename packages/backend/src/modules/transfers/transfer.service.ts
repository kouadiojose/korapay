import db from '../../config/database';
import { NotFoundError, AppError } from '../../utils/errors';
import { generateReference } from '../../utils/reference';
import { paginate } from '../../utils/pagination';
import { getProvider } from '../../providers/provider.factory';
import { TransactionStatus, TransactionType } from '../../types/common.types';
import { debitWallet } from '../wallets/wallet.service';
import type { InitiateTransferInput } from './transfer.schema';

const TRANSFER_FEE_RATE = 0.01; // 1% fee

export async function initiateTransfer(userId: string, input: InitiateTransferInput) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const reference = input.reference || generateReference('TRF');

  // Check for duplicate reference
  const existing = await db('transactions').where('reference', reference).first();
  if (existing) {
    throw new AppError('A transaction with this reference already exists', 409, 'DUPLICATE_REFERENCE');
  }

  const fee = Math.round(input.amount * TRANSFER_FEE_RATE * 100) / 100;
  const totalDebit = input.amount + fee;

  const result = await db.transaction(async (trx) => {
    // Debit wallet first (validates sufficient balance)
    await debitWallet(
      merchant.id,
      input.currency,
      totalDebit,
      `Transfer: ${reference}`,
      undefined,
      trx,
    );

    // Create transaction record
    const [transaction] = await trx('transactions')
      .insert({
        merchant_id: merchant.id,
        reference,
        type: TransactionType.TRANSFER,
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
        }),
        metadata: JSON.stringify({}),
      })
      .returning('*');

    return transaction;
  });

  // Call provider asynchronously (don't block the response)
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

    // If transfer failed, refund the wallet
    if (!providerResult.success) {
      const { creditWallet } = await import('../wallets/wallet.service');
      await creditWallet(
        merchant.id,
        input.currency,
        totalDebit,
        `Transfer refund: ${reference}`,
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
    const { creditWallet } = await import('../wallets/wallet.service');
    await creditWallet(
      merchant.id,
      input.currency,
      totalDebit,
      `Transfer refund (error): ${reference}`,
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

export async function listTransfers(userId: string, page: number = 1, perPage: number = 20, status?: string) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const query = db('transactions')
    .select('*')
    .where('merchant_id', merchant.id)
    .where('type', TransactionType.TRANSFER)
    .orderBy('created_at', 'desc');

  if (status) {
    query.where('status', status);
  }

  return paginate(query, page, perPage);
}

export async function getTransfer(userId: string, reference: string) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const transaction = await db('transactions')
    .where('reference', reference)
    .where('merchant_id', merchant.id)
    .where('type', TransactionType.TRANSFER)
    .first();

  if (!transaction) {
    throw new NotFoundError('Transfer not found');
  }

  return transaction;
}
