import crypto from 'crypto';

export function generateReference(prefix: string = 'TXN'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `KPY-${prefix}-${timestamp}-${random}`;
}
