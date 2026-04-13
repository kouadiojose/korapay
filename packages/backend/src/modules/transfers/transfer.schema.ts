import { z } from 'zod';

export const initiateTransferSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(3).max(3).toUpperCase(),
  payment_method: z.enum(['orange_money', 'mtn_momo', 'wave', 'moov_money', 'bank_card']),
  recipient: z.object({
    phone: z.string().max(20).optional(),
    account: z.string().max(100).optional(),
    name: z.string().min(1).max(255).trim(),
  }),
  narration: z.string().max(500).trim().optional(),
  reference: z.string().max(100).trim().optional(),
});

export const listTransfersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'processing', 'success', 'failed']).optional(),
});

export type InitiateTransferInput = z.infer<typeof initiateTransferSchema>;
export type ListTransfersQuery = z.infer<typeof listTransfersQuerySchema>;
