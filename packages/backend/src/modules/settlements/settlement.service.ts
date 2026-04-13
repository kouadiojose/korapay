import db from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { paginate } from '../../utils/pagination';

export async function listSettlements(
  userId: string,
  page: number = 1,
  perPage: number = 20,
  status?: string,
) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const query = db('settlements')
    .select('*')
    .where('merchant_id', merchant.id)
    .orderBy('created_at', 'desc');

  if (status) {
    query.where('status', status);
  }

  return paginate(query, page, perPage);
}

export async function getSettlement(userId: string, reference: string) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const settlement = await db('settlements')
    .where('reference', reference)
    .where('merchant_id', merchant.id)
    .first();

  if (!settlement) {
    throw new NotFoundError('Settlement not found');
  }

  // Get associated transactions for this settlement period
  const transactions = await db('transactions')
    .where('merchant_id', merchant.id)
    .where('status', 'success')
    .where('currency', settlement.currency)
    .whereBetween('completed_at', [
      settlement.settlement_date + 'T00:00:00.000Z',
      settlement.settlement_date + 'T23:59:59.999Z',
    ])
    .orderBy('completed_at', 'desc');

  return {
    ...settlement,
    transactions,
  };
}
