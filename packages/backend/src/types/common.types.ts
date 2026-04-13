export enum PaymentMethod {
  ORANGE_MONEY = 'orange_money',
  MTN_MOMO = 'mtn_momo',
  WAVE = 'wave',
  MOOV_MONEY = 'moov_money',
  BANK_CARD = 'bank_card',
}

export enum TransactionType {
  COLLECTION = 'collection',
  TRANSFER = 'transfer',
  PAYOUT = 'payout',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REVERSED = 'reversed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum KycStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MERCHANT = 'merchant',
  SUPPORT = 'support',
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
}
