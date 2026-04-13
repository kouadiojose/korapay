import { Request, Response, NextFunction } from 'express';
import db from '../config/database';
import { AuthenticationError } from '../utils/errors';
import { verifyApiKey } from '../utils/crypto';

export interface ApiKeyRequest extends Request {
  merchant: {
    id: string;
    businessName: string;
    environment: string;
  };
}

export async function authenticateApiKey(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid API key');
  }

  const apiKey = authHeader.slice(7);

  if (!apiKey || (!apiKey.startsWith('sk_test_') && !apiKey.startsWith('sk_live_'))) {
    throw new AuthenticationError('Invalid API key format');
  }

  try {
    const keyRecords = await db('api_keys')
      .select('api_keys.*', 'merchants.id as merchant_id', 'merchants.business_name', 'merchants.environment')
      .join('merchants', 'merchants.id', 'api_keys.merchant_id')
      .where('api_keys.is_active', true)
      .whereNull('api_keys.revoked_at');

    let matchedMerchant: { merchant_id: string; business_name: string; environment: string } | null = null;

    for (const record of keyRecords) {
      const isValid = await verifyApiKey(apiKey, record.secret_key_hash);
      if (isValid) {
        matchedMerchant = record;
        break;
      }
    }

    if (!matchedMerchant) {
      throw new AuthenticationError('Invalid API key');
    }

    // Determine environment from key prefix
    const environment = apiKey.startsWith('sk_live_') ? 'production' : 'test';

    req.merchant = {
      id: matchedMerchant.merchant_id,
      businessName: matchedMerchant.business_name,
      environment,
    };

    // Update last used timestamp
    await db('api_keys')
      .where('merchant_id', matchedMerchant.merchant_id)
      .where('is_active', true)
      .update({ last_used_at: new Date() });

    next();
  } catch (err) {
    if (err instanceof AuthenticationError) {
      throw err;
    }
    throw new AuthenticationError('API key authentication failed');
  }
}
