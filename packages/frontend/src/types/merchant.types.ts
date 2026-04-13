export interface Merchant {
  id: string;
  business_name: string;
  business_email: string;
  business_type: 'individual' | 'sole_proprietor' | 'partnership' | 'corporation';
  country: string;
  kyc_status: KycStatus;
  is_live: boolean;
  created_at: string;
  updated_at: string;
}

export type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface ApiKey {
  id: string;
  label: string;
  environment: 'test' | 'live';
  public_key: string;
  secret_key_hint: string;
  status: 'active' | 'revoked';
  last_used_at?: string;
  created_at: string;
}

export interface ApiKeyCreateResponse {
  id: string;
  label: string;
  environment: 'test' | 'live';
  public_key: string;
  secret_key: string;
  created_at: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  secret_hash: string;
  last_triggered_at?: string;
  failure_count: number;
  created_at: string;
}

export interface WebhookEvent {
  value: string;
  label: string;
  description: string;
}

export interface KycDocument {
  id: string;
  type: KycDocumentType;
  file_name: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  rejection_reason?: string;
  uploaded_at: string;
  reviewed_at?: string;
}

export type KycDocumentType =
  | 'national_id'
  | 'passport'
  | 'business_registration'
  | 'tax_certificate'
  | 'proof_of_address'
  | 'bank_statement';

export interface TeamMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  status: 'active' | 'pending' | 'deactivated';
  last_login_at?: string;
  created_at: string;
}

export const WEBHOOK_EVENTS: WebhookEvent[] = [
  { value: 'charge.success', label: 'Charge Success', description: 'When a payment is successfully completed' },
  { value: 'charge.failed', label: 'Charge Failed', description: 'When a payment attempt fails' },
  { value: 'payout.success', label: 'Payout Success', description: 'When a payout is successfully processed' },
  { value: 'payout.failed', label: 'Payout Failed', description: 'When a payout fails' },
  { value: 'settlement.completed', label: 'Settlement Completed', description: 'When a settlement is completed' },
  { value: 'refund.processed', label: 'Refund Processed', description: 'When a refund is processed' },
];

export const KYC_DOCUMENT_TYPES: { value: KycDocumentType; label: string }[] = [
  { value: 'national_id', label: 'National ID Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'business_registration', label: 'Business Registration Certificate' },
  { value: 'tax_certificate', label: 'Tax Certificate' },
  { value: 'proof_of_address', label: 'Proof of Address' },
  { value: 'bank_statement', label: 'Bank Statement' },
];
