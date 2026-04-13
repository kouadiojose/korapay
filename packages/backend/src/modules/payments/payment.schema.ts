import { z } from 'zod';

export const initializePaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(3).max(3).toUpperCase(),
  payment_method: z.enum(['orange_money', 'mtn_momo', 'wave', 'moov_money', 'bank_card']),
  customer: z.object({
    name: z.string().min(1).max(255).trim(),
    email: z.string().email().toLowerCase().trim(),
    phone: z.string().max(20).optional(),
  }),
  reference: z.string().max(100).trim().optional(),
  callback_url: z.string().url().max(500),
  return_url: z.string().url().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
  narration: z.string().max(500).trim().optional(),
});

export const listTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'processing', 'success', 'failed', 'reversed', 'expired', 'cancelled']).optional(),
  type: z.enum(['collection', 'transfer', 'payout']).optional(),
  payment_method: z.enum(['orange_money', 'mtn_momo', 'wave', 'moov_money', 'bank_card']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type InitializePaymentInput = z.infer<typeof initializePaymentSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
