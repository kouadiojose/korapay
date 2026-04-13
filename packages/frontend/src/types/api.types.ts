export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserResponse;
  merchant: MerchantResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface MerchantResponse {
  id: string;
  business_name: string;
  business_email: string;
  business_type: string;
  country: string;
  kyc_status: 'pending' | 'under_review' | 'approved' | 'rejected';
  is_live: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionResponse {
  id: string;
  reference: string;
  merchant_id: string;
  type: 'collection' | 'payout';
  amount: number;
  currency: string;
  fee: number;
  net_amount: number;
  payment_method: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'reversed' | 'expired';
  provider: string;
  provider_reference?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WalletResponse {
  id: string;
  merchant_id: string;
  currency: string;
  balance: number;
  available_balance: number;
  pending_balance: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransactionResponse {
  id: string;
  wallet_id: string;
  type: 'credit' | 'debit';
  amount: number;
  balance_after: number;
  reference: string;
  description: string;
  created_at: string;
}

export interface SettlementResponse {
  id: string;
  merchant_id: string;
  amount: number;
  currency: string;
  fee: number;
  net_amount: number;
  status: 'pending' | 'processing' | 'settled' | 'failed';
  settlement_date: string;
  bank_name?: string;
  account_number?: string;
  created_at: string;
}

export interface CheckoutSessionResponse {
  reference: string;
  merchant_name: string;
  merchant_logo?: string;
  amount: number;
  currency: string;
  description?: string;
  customer_email?: string;
  payment_methods: string[];
  status: 'pending' | 'completed' | 'expired';
  expires_at: string;
}
