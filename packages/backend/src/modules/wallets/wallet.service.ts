import db from '../../config/database';
import { NotFoundError, InsufficientFundsError } from '../../utils/errors';
import { generateReference } from '../../utils/reference';
import { paginate } from '../../utils/pagination';
import { Knex } from 'knex';

async function getMerchantByUserId(userId: string) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }
  return merchant;
}

export async function getWallets(userId: string, currency?: string) {
  const merchant = await getMerchantByUserId(userId);

  const query = db('wallets').where('merchant_id', merchant.id);
  if (currency) {
    query.where('currency', currency.toUpperCase());
  }

  const wallets = await query.orderBy('currency', 'asc');
  return wallets;
}

export async function getWallet(userId: string, currency: string) {
  const merchant = await getMerchantByUserId(userId);

  const wallet = await db('wallets')
    .where('merchant_id', merchant.id)
    .where('currency', currency.toUpperCase())
    .first();

  if (!wallet) {
    throw new NotFoundError(`Wallet for currency ${currency.toUpperCase()} not found`);
  }

  return wallet;
}

export async function getWalletTransactions(
  userId: string,
  currency: string,
  page: number = 1,
  perPage: number = 20,
  type?: string,
) {
  const merchant = await getMerchantByUserId(userId);

  const wallet = await db('wallets')
    .where('merchant_id', merchant.id)
    .where('currency', currency.toUpperCase())
    .first();

  if (!wallet) {
    throw new NotFoundError(`Wallet for currency ${currency.toUpperCase()} not found`);
  }

  const query = db('wallet_transactions')
    .select('wallet_transactions.*')
    .where('wallet_transactions.wallet_id', wallet.id)
    .orderBy('wallet_transactions.created_at', 'desc');

  if (type) {
    query.where('wallet_transactions.type', type);
  }

  return paginate(query, page, perPage);
}

export async function creditWallet(
  merchantId: string,
  currency: string,
  amount: number,
  description: string,
  transactionId?: string,
  trx?: Knex.Transaction,
) {
  const executor = trx || db;

  const wallet = await executor('wallets')
    .where('merchant_id', merchantId)
    .where('currency', currency.toUpperCase())
    .first();

  if (!wallet) {
    throw new NotFoundError(`Wallet for currency ${currency.toUpperCase()} not found`);
  }

  const balanceBefore = Number(wallet.balance);
  const balanceAfter = balanceBefore + amount;

  await executor('wallets')
    .where('id', wallet.id)
    .update({
      balance: balanceAfter,
      available_balance: Number(wallet.available_balance) + amount,
      updated_at: new Date(),
    });

  const [walletTransaction] = await executor('wallet_transactions')
    .insert({
      wallet_id: wallet.id,
      type: 'credit',
      amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      reference: generateReference('WLT'),
      description,
      transaction_id: transactionId || null,
    })
    .returning('*');

  return walletTransaction;
}

export async function debitWallet(
  merchantId: string,
  currency: string,
  amount: number,
  description: string,
  transactionId?: string,
  trx?: Knex.Transaction,
) {
  const executor = trx || db;

  const wallet = await executor('wallets')
    .where('merchant_id', merchantId)
    .where('currency', currency.toUpperCase())
    .first();

  if (!wallet) {
    throw new NotFoundError(`Wallet for currency ${currency.toUpperCase()} not found`);
  }

  const availableBalance = Number(wallet.available_balance);
  if (availableBalance < amount) {
    throw new InsufficientFundsError(
      `Insufficient funds. Available: ${availableBalance}, Required: ${amount}`,
    );
  }

  const balanceBefore = Number(wallet.balance);
  const balanceAfter = balanceBefore - amount;

  await executor('wallets')
    .where('id', wallet.id)
    .update({
      balance: balanceAfter,
      available_balance: availableBalance - amount,
      updated_at: new Date(),
    });

  const [walletTransaction] = await executor('wallet_transactions')
    .insert({
      wallet_id: wallet.id,
      type: 'debit',
      amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      reference: generateReference('WLT'),
      description,
      transaction_id: transactionId || null,
    })
    .returning('*');

  return walletTransaction;
}
