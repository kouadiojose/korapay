export interface Transaction {
  id: string;
  reference: string;
  type: 'collection' | 'payout';
  amount: number;
  currency: string;
  fee: number;
  net_amount: number;
  payment_method: string;
  status: TransactionStatus;
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

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'reversed'
  | 'expired'
  | 'cancelled';

export interface TransactionFilters {
  status?: TransactionStatus;
  payment_method?: string;
  type?: 'collection' | 'payout';
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface Wallet {
  id: string;
  currency: string;
  balance: number;
  available_balance: number;
  pending_balance: number;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: 'credit' | 'debit';
  amount: number;
  balance_after: number;
  reference: string;
  description: string;
  created_at: string;
}

export interface Settlement {
  id: string;
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

export interface Payout {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  fee: number;
  net_amount: number;
  payment_method: string;
  recipient_phone?: string;
  recipient_account?: string;
  recipient_name?: string;
  status: TransactionStatus;
  description?: string;
  created_at: string;
}

export interface DashboardStats {
  total_volume: number;
  total_transactions: number;
  success_rate: number;
  active_wallets: number;
  volume_trend: number;
  transaction_trend: number;
  success_trend: number;
  wallet_trend: number;
}

export interface ChartDataPoint {
  date: string;
  volume: number;
  count: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  label: string;
  count: number;
  volume: number;
  percentage: number;
}
