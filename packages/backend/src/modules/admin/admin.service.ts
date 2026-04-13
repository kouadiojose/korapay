import db from '../../config/database';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { paginate } from '../../utils/pagination';
import { TransactionStatus } from '../../types/common.types';

export async function listMerchants(page: number = 1, perPage: number = 20, kycStatus?: string) {
  const query = db('merchants')
    .select(
      'merchants.*',
      'users.email',
      'users.first_name',
      'users.last_name',
      'users.is_active as user_is_active',
    )
    .join('users', 'users.id', 'merchants.user_id')
    .orderBy('merchants.created_at', 'desc');

  if (kycStatus) {
    query.where('merchants.kyc_status', kycStatus);
  }

  return paginate(query, page, perPage);
}

export async function getMerchant(merchantId: string) {
  const merchant = await db('merchants')
    .select(
      'merchants.*',
      'users.email',
      'users.first_name',
      'users.last_name',
      'users.phone',
      'users.is_active as user_is_active',
      'users.email_verified',
      'users.last_login_at',
    )
    .join('users', 'users.id', 'merchants.user_id')
    .where('merchants.id', merchantId)
    .first();

  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  // Get wallet balances
  const wallets = await db('wallets').where('merchant_id', merchantId);

  // Get transaction stats
  const [stats] = await db('transactions')
    .where('merchant_id', merchantId)
    .select(
      db.raw('COUNT(*)::int as total_transactions'),
      db.raw('COALESCE(SUM(CASE WHEN status = ? THEN amount END), 0)::numeric as total_volume', [TransactionStatus.SUCCESS]),
    );

  return {
    ...merchant,
    wallets,
    stats: {
      total_transactions: stats.total_transactions,
      total_volume: Number(stats.total_volume),
    },
  };
}

export async function updateMerchantStatus(merchantId: string, isActive: boolean) {
  const merchant = await db('merchants').where('id', merchantId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  await db('users')
    .where('id', merchant.user_id)
    .update({
      is_active: isActive,
      updated_at: new Date(),
    });

  return {
    merchant_id: merchantId,
    is_active: isActive,
    message: isActive ? 'Merchant activated' : 'Merchant deactivated',
  };
}

export async function getPlatformStats() {
  const [merchantStats] = await db('merchants')
    .select(
      db.raw('COUNT(*)::int as total_merchants'),
      db.raw('COUNT(CASE WHEN kyc_status = ? THEN 1 END)::int as approved_merchants', ['approved']),
      db.raw('COUNT(CASE WHEN is_live = true THEN 1 END)::int as live_merchants'),
    );

  const [transactionStats] = await db('transactions')
    .select(
      db.raw('COUNT(*)::int as total_transactions'),
      db.raw('COALESCE(SUM(amount), 0)::numeric as total_volume'),
      db.raw('COALESCE(SUM(fee), 0)::numeric as total_fees'),
      db.raw('COUNT(CASE WHEN status = ? THEN 1 END)::int as successful_transactions', [TransactionStatus.SUCCESS]),
      db.raw('COUNT(CASE WHEN status = ? THEN 1 END)::int as failed_transactions', [TransactionStatus.FAILED]),
      db.raw('COUNT(CASE WHEN status = ? THEN 1 END)::int as pending_transactions', [TransactionStatus.PENDING]),
    );

  const successRate = transactionStats.total_transactions > 0
    ? Math.round((transactionStats.successful_transactions / transactionStats.total_transactions) * 10000) / 100
    : 0;

  // Transactions from last 24 hours
  const [last24h] = await db('transactions')
    .where('created_at', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))
    .select(
      db.raw('COUNT(*)::int as count'),
      db.raw('COALESCE(SUM(amount), 0)::numeric as volume'),
    );

  return {
    merchants: {
      total: merchantStats.total_merchants,
      approved: merchantStats.approved_merchants,
      live: merchantStats.live_merchants,
    },
    transactions: {
      total: transactionStats.total_transactions,
      total_volume: Number(transactionStats.total_volume),
      total_fees: Number(transactionStats.total_fees),
      successful: transactionStats.successful_transactions,
      failed: transactionStats.failed_transactions,
      pending: transactionStats.pending_transactions,
      success_rate: successRate,
    },
    last_24h: {
      count: last24h.count,
      volume: Number(last24h.volume),
    },
  };
}

export async function listPendingKyc(page: number = 1, perPage: number = 20) {
  const query = db('merchants')
    .select(
      'merchants.id',
      'merchants.business_name',
      'merchants.business_type',
      'merchants.country',
      'merchants.kyc_status',
      'merchants.created_at',
      'users.email',
      'users.first_name',
      'users.last_name',
    )
    .join('users', 'users.id', 'merchants.user_id')
    .whereIn('merchants.kyc_status', ['submitted', 'under_review'])
    .orderBy('merchants.created_at', 'asc');

  return paginate(query, page, perPage);
}

export async function reviewKyc(
  adminUserId: string,
  documentId: string,
  decision: 'approved' | 'rejected',
  rejectionReason?: string,
) {
  const document = await db('kyc_documents').where('id', documentId).first();
  if (!document) {
    throw new NotFoundError('KYC document not found');
  }

  if (decision === 'rejected' && !rejectionReason) {
    throw new ValidationError('Rejection reason is required when rejecting a document');
  }

  await db('kyc_documents')
    .where('id', documentId)
    .update({
      status: decision,
      rejection_reason: decision === 'rejected' ? rejectionReason : null,
      reviewed_by: adminUserId,
      reviewed_at: new Date(),
    });

  // Check if all documents for this merchant are approved
  const merchantDocuments = await db('kyc_documents')
    .where('merchant_id', document.merchant_id);

  const allApproved = merchantDocuments.every((d) =>
    d.id === documentId ? decision === 'approved' : d.status === 'approved',
  );

  const anyRejected = merchantDocuments.some((d) =>
    d.id === documentId ? decision === 'rejected' : d.status === 'rejected',
  );

  // Update merchant KYC status
  let newKycStatus = 'under_review';
  if (allApproved && merchantDocuments.length > 0) {
    newKycStatus = 'approved';
  } else if (anyRejected) {
    newKycStatus = 'rejected';
  }

  await db('merchants')
    .where('id', document.merchant_id)
    .update({
      kyc_status: newKycStatus,
      is_live: newKycStatus === 'approved',
      updated_at: new Date(),
    });

  // Log the audit action
  await db('audit_logs').insert({
    actor_id: adminUserId,
    actor_type: 'user',
    action: `kyc_${decision}`,
    resource_type: 'kyc_document',
    resource_id: documentId,
    changes: JSON.stringify({
      decision,
      rejection_reason: rejectionReason || null,
      merchant_kyc_status: newKycStatus,
    }),
  });

  return {
    document_id: documentId,
    status: decision,
    merchant_kyc_status: newKycStatus,
  };
}

export async function listAuditLogs(
  page: number = 1,
  perPage: number = 20,
  filters?: { action?: string; resource_type?: string; actor_id?: string },
) {
  const query = db('audit_logs')
    .select(
      'audit_logs.*',
      'users.email as actor_email',
      'users.first_name as actor_first_name',
      'users.last_name as actor_last_name',
    )
    .leftJoin('users', 'users.id', 'audit_logs.actor_id')
    .orderBy('audit_logs.created_at', 'desc');

  if (filters?.action) {
    query.where('audit_logs.action', filters.action);
  }
  if (filters?.resource_type) {
    query.where('audit_logs.resource_type', filters.resource_type);
  }
  if (filters?.actor_id) {
    query.where('audit_logs.actor_id', filters.actor_id);
  }

  return paginate(query, page, perPage);
}
