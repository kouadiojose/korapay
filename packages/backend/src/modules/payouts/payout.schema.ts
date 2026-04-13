import { z } from 'zod';

const payoutRecipientSchema = z.object({
  phone: z.string().max(20).optional(),
  account: z.string().max(100).optional(),
  name: z.string().min(1).max(255).trim(),
  bank_code: z.string().max(20).optional(),
});

export const initiatePayoutSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(3).max(3).toUpperCase(),
  payment_method: z.enum(['orange_money', 'mtn_momo', 'wave', 'moov_money', 'bank_card']),
  recipient: payoutRecipientSchema,
  narration: z.string().max(500).trim().optional(),
  reference: z.string().max(100).trim().optional(),
});

export const bulkPayoutSchema = z.object({
  currency: z.string().min(3).max(3).toUpperCase(),
  payment_method: z.enum(['orange_money', 'mtn_momo', 'wave', 'moov_money', 'bank_card']),
  payouts: z.array(
    z.object({
      amount: z.number().positive('Amount must be positive'),
      recipient: payoutRecipientSchema,
      narration: z.string().max(500).trim().optional(),
      reference: z.string().max(100).trim().optional(),
    }),
  ).min(1, 'At least one payout is required').max(50, 'Maximum 50 payouts per batch'),
});

export const listPayoutsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'processing', 'success', 'failed']).optional(),
});

export type InitiatePayoutInput = z.infer<typeof initiatePayoutSchema>;
export type BulkPayoutInput = z.infer<typeof bulkPayoutSchema>;
export type ListPayoutsQuery = z.infer<typeof listPayoutsQuerySchema>;
