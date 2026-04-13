import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { config } from '../config';

function generateRandomKey(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

export function generateApiKeyPair(): { publicKey: string; secretKey: string } {
  const env = config.app.isProduction ? 'live' : 'test';
  const publicKey = `pk_${env}_${generateRandomKey(32)}`;
  const secretKey = `sk_${env}_${generateRandomKey(32)}`;
  return { publicKey, secretKey };
}

export async function hashApiKey(key: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(key, salt);
}

export async function verifyApiKey(key: string, hash: string): Promise<boolean> {
  return bcrypt.compare(key, hash);
}

export function generateWebhookSecret(): string {
  return `whsec_${generateRandomKey(32)}`;
}

export function signWebhookPayload(payload: string | object, secret: string): string {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
}

export function verifyWebhookSignature(
  payload: string | object,
  signature: string,
  secret: string
): boolean {
  const expected = signWebhookPayload(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}
