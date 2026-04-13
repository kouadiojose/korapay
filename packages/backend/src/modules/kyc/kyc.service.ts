import db from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import type { UploadDocumentInput } from './kyc.schema';

async function getMerchantByUserId(userId: string) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }
  return merchant;
}

export async function uploadDocument(userId: string, input: UploadDocumentInput) {
  const merchant = await getMerchantByUserId(userId);

  const [document] = await db('kyc_documents')
    .insert({
      merchant_id: merchant.id,
      document_type: input.document_type,
      file_url: input.file_url,
      file_name: input.file_name || null,
      file_size: input.file_size || null,
      status: 'pending',
    })
    .returning('*');

  return document;
}

export async function listDocuments(userId: string) {
  const merchant = await getMerchantByUserId(userId);

  const documents = await db('kyc_documents')
    .where('merchant_id', merchant.id)
    .orderBy('created_at', 'desc');

  return documents;
}

export async function submitForReview(userId: string) {
  const merchant = await getMerchantByUserId(userId);

  // Check if there are any documents uploaded
  const documentCount = await db('kyc_documents')
    .where('merchant_id', merchant.id)
    .count('id as count')
    .first();

  if (!documentCount || Number(documentCount.count) === 0) {
    throw new NotFoundError('No documents uploaded. Please upload documents before submitting for review.');
  }

  const [updated] = await db('merchants')
    .where('id', merchant.id)
    .update({
      kyc_status: 'submitted',
      updated_at: new Date(),
    })
    .returning('*');

  return {
    kyc_status: updated.kyc_status,
    message: 'KYC documents submitted for review',
  };
}

export async function getStatus(userId: string) {
  const merchant = await getMerchantByUserId(userId);

  const documents = await db('kyc_documents')
    .where('merchant_id', merchant.id)
    .orderBy('created_at', 'desc');

  return {
    kyc_status: merchant.kyc_status,
    documents,
  };
}
