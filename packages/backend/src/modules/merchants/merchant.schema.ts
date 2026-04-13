import { z } from 'zod';

export const updateProfileSchema = z.object({
  business_name: z.string().min(1).max(255).trim().optional(),
  business_email: z.string().email().toLowerCase().trim().optional(),
  business_phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  website: z.string().url().max(500).optional(),
  logo_url: z.string().url().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const generateApiKeySchema = z.object({
  label: z.string().max(100).trim().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type GenerateApiKeyInput = z.infer<typeof generateApiKeySchema>;
