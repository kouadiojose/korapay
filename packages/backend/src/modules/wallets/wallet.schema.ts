import { z } from 'zod';

export const listWalletsQuerySchema = z.object({
  currency: z.string().max(3).toUpperCase().optional(),
});

export const walletTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['credit', 'debit', 'hold', 'release']).optional(),
});

export type ListWalletsQuery = z.infer<typeof listWalletsQuerySchema>;
export type WalletTransactionsQuery = z.infer<typeof walletTransactionsQuerySchema>;
