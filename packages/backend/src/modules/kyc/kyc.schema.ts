import { z } from 'zod';

export const uploadDocumentSchema = z.object({
  document_type: z.enum([
    'national_id',
    'passport',
    'business_registration',
    'tax_certificate',
    'proof_of_address',
    'bank_statement',
  ]),
  file_url: z.string().url('Invalid file URL').max(500),
  file_name: z.string().max(255).trim().optional(),
  file_size: z.number().int().positive().optional(),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
