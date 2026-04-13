import db from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { generateApiKeyPair, hashApiKey } from '../../utils/crypto';
import type { UpdateProfileInput } from './merchant.schema';

export async function getProfile(userId: string) {
  const merchant = await db('merchants')
    .select(
      'merchants.*',
      'users.email',
      'users.first_name',
      'users.last_name',
      'users.phone',
      'users.role',
      'users.email_verified',
    )
    .join('users', 'users.id', 'merchants.user_id')
    .where('merchants.user_id', userId)
    .first();

  if (!merchant) {
    throw new NotFoundError('Merchant profile not found');
  }

  return merchant;
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant profile not found');
  }

  const [updated] = await db('merchants')
    .where('id', merchant.id)
    .update({
      ...data,
      updated_at: new Date(),
    })
    .returning('*');

  return updated;
}

export async function getApiKeys(userId: string) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const keys = await db('api_keys')
    .select('id', 'public_key', 'environment', 'label', 'is_active', 'last_used_at', 'created_at', 'revoked_at')
    .where('merchant_id', merchant.id)
    .orderBy('created_at', 'desc');

  return keys;
}

export async function generateApiKey(userId: string, label?: string) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const { publicKey, secretKey } = generateApiKeyPair();
  const secret_key_hash = await hashApiKey(secretKey);

  const environment = secretKey.startsWith('sk_live_') ? 'live' : 'test';

  const [apiKey] = await db('api_keys')
    .insert({
      merchant_id: merchant.id,
      public_key: publicKey,
      secret_key_hash,
      environment,
      label: label || null,
    })
    .returning('*');

  return {
    id: apiKey.id,
    public_key: publicKey,
    secret_key: secretKey, // Only returned once at creation
    environment: apiKey.environment,
    label: apiKey.label,
    created_at: apiKey.created_at,
  };
}

export async function revokeApiKey(userId: string, keyId: string) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const key = await db('api_keys')
    .where('id', keyId)
    .where('merchant_id', merchant.id)
    .first();

  if (!key) {
    throw new NotFoundError('API key not found');
  }

  await db('api_keys')
    .where('id', keyId)
    .update({
      is_active: false,
      revoked_at: new Date(),
    });

  return { message: 'API key revoked successfully' };
}
