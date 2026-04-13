import { z } from 'zod';

export const createWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL').max(500),
  events: z.array(
    z.enum([
      'charge.success',
      'charge.failed',
      'transfer.success',
      'transfer.failed',
      'payout.success',
      'payout.failed',
    ]),
  ).min(1, 'At least one event is required'),
});

export const updateWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL').max(500).optional(),
  events: z.array(
    z.enum([
      'charge.success',
      'charge.failed',
      'transfer.success',
      'transfer.failed',
      'payout.success',
      'payout.failed',
    ]),
  ).min(1).optional(),
  is_active: z.boolean().optional(),
});

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
