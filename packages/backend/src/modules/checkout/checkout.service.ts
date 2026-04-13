import db from '../../config/database';
import { NotFoundError, AppError } from '../../utils/errors';
import { getProvider } from '../../providers/provider.factory';
import { TransactionStatus } from '../../types/common.types';
import { creditWallet } from '../wallets/wallet.service';

export async function getCheckoutSession(reference: string) {
  const transaction = await db('transactions')
    .select(
      'transactions.reference',
      'transactions.amount',
      'transactions.currency',
      'transactions.payment_method',
      'transactions.status',
      'transactions.customer_name',
      'transactions.customer_email',
      'transactions.narration',
      'transactions.created_at',
      'merchants.business_name',
      'merchants.logo_url',
    )
    .join('merchants', 'merchants.id', 'transactions.merchant_id')
    .where('transactions.reference', reference)
    .first();

  if (!transaction) {
    throw new NotFoundError('Checkout session not found');
  }

  if (transaction.status === TransactionStatus.SUCCESS) {
    throw new AppError('This payment has already been completed', 400, 'PAYMENT_COMPLETED');
  }

  if (transaction.status === TransactionStatus.EXPIRED) {
    throw new AppError('This payment session has expired', 400, 'PAYMENT_EXPIRED');
  }

  return transaction;
}

export async function processPayment(reference: string, paymentData: { phone?: string; card_token?: string }) {
  const transaction = await db('transactions')
    .where('reference', reference)
    .first();

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  if (transaction.status !== TransactionStatus.PENDING && transaction.status !== TransactionStatus.PROCESSING) {
    throw new AppError('This transaction cannot be processed in its current state', 400, 'INVALID_STATE');
  }

  // Update to processing
  await db('transactions')
    .where('id', transaction.id)
    .update({
      status: TransactionStatus.PROCESSING,
      customer_phone: paymentData.phone || transaction.customer_phone,
      updated_at: new Date(),
    });

  // Call provider
  try {
    const provider = getProvider(transaction.payment_method);
    const result = await provider.initializePayment({
      reference: transaction.reference,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      customerPhone: paymentData.phone || transaction.customer_phone,
      customerEmail: transaction.customer_email,
      customerName: transaction.customer_name,
      callbackUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/callbacks/${transaction.payment_method}`,
    });

    const newStatus = result.success ? TransactionStatus.PROCESSING : TransactionStatus.FAILED;

    await db('transactions')
      .where('id', transaction.id)
      .update({
        status: newStatus,
        provider_reference: result.providerReference || null,
        payment_link: result.paymentUrl || null,
        provider_response: JSON.stringify(result.rawResponse || {}),
        completed_at: newStatus === TransactionStatus.FAILED ? new Date() : null,
        updated_at: new Date(),
      });

    return {
      reference: transaction.reference,
      status: newStatus,
      payment_url: result.paymentUrl || null,
      ussd_code: result.ussdCode || null,
      message: result.message,
    };
  } catch (err) {
    await db('transactions')
      .where('id', transaction.id)
      .update({
        status: TransactionStatus.FAILED,
        provider_response: JSON.stringify({ error: (err as Error).message }),
        completed_at: new Date(),
        updated_at: new Date(),
      });

    throw err;
  }
}

export async function getPaymentStatus(reference: string) {
  const transaction = await db('transactions')
    .select('reference', 'status', 'amount', 'currency', 'payment_method', 'completed_at', 'created_at')
    .where('reference', reference)
    .first();

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  // If still processing, check with provider
  if (transaction.status === TransactionStatus.PROCESSING) {
    try {
      const fullTransaction = await db('transactions').where('reference', reference).first();
      const provider = getProvider(fullTransaction.payment_method);
      const result = await provider.verifyPayment(reference);

      if (result.status !== fullTransaction.status) {
        const newStatus = result.status === 'success'
          ? TransactionStatus.SUCCESS
          : result.status === 'failed'
            ? TransactionStatus.FAILED
            : TransactionStatus.PROCESSING;

        await db('transactions')
          .where('id', fullTransaction.id)
          .update({
            status: newStatus,
            provider_response: JSON.stringify(result.rawResponse || {}),
            completed_at: newStatus === TransactionStatus.SUCCESS || newStatus === TransactionStatus.FAILED ? new Date() : null,
            updated_at: new Date(),
          });

        // Credit wallet on success
        if (newStatus === TransactionStatus.SUCCESS) {
          await creditWallet(
            fullTransaction.merchant_id,
            fullTransaction.currency,
            Number(fullTransaction.net_amount),
            `Payment collection: ${reference}`,
            fullTransaction.id,
          );
        }

        transaction.status = newStatus;
      }
    } catch {
      // If provider check fails, return current state
    }
  }

  return transaction;
}
