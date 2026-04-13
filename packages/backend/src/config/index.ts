import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // App
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_URL: z.string().url().default('http://localhost:3001'),

  // Database
  DATABASE_URL: z.string().default('postgresql://korapay:password@localhost:5432/korapay_dev'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_ACCESS_SECRET: z.string().default('dev-access-secret-change-in-production'),
  JWT_REFRESH_SECRET: z.string().default('dev-refresh-secret-change-in-production'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Encryption
  ENCRYPTION_KEY: z.string().default('dev-encryption-key-change-in-production-32ch'),

  // Orange Money
  ORANGE_MONEY_BASE_URL: z.string().default(''),
  ORANGE_MONEY_API_KEY: z.string().default(''),
  ORANGE_MONEY_MERCHANT_ID: z.string().default(''),
  ORANGE_MONEY_SECRET: z.string().default(''),

  // MTN MoMo
  MTN_MOMO_BASE_URL: z.string().default(''),
  MTN_MOMO_API_KEY: z.string().default(''),
  MTN_MOMO_API_USER: z.string().default(''),
  MTN_MOMO_SUBSCRIPTION_KEY: z.string().default(''),
  MTN_MOMO_ENVIRONMENT: z.string().default('sandbox'),

  // Wave
  WAVE_BASE_URL: z.string().default(''),
  WAVE_API_KEY: z.string().default(''),
  WAVE_SECRET: z.string().default(''),
  WAVE_WEBHOOK_SECRET: z.string().default(''),

  // Moov Money
  MOOV_MONEY_BASE_URL: z.string().default(''),
  MOOV_MONEY_API_KEY: z.string().default(''),
  MOOV_MONEY_MERCHANT_ID: z.string().default(''),
  MOOV_MONEY_SECRET: z.string().default(''),

  // Card (Stripe-like or custom card processor)
  CARD_PROCESSOR_BASE_URL: z.string().default(''),
  CARD_PROCESSOR_PUBLIC_KEY: z.string().default(''),
  CARD_PROCESSOR_SECRET_KEY: z.string().default(''),
  CARD_PROCESSOR_WEBHOOK_SECRET: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export const config = {
  app: {
    port: env.PORT,
    env: env.NODE_ENV,
    url: env.APP_URL,
    frontendUrl: env.FRONTEND_URL,
    isProduction: env.NODE_ENV === 'production',
    isDevelopment: env.NODE_ENV === 'development',
    isTest: env.NODE_ENV === 'test',
  },
  db: {
    url: env.DATABASE_URL,
  },
  redis: {
    url: env.REDIS_URL,
  },
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiry: env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },
  encryption: {
    key: env.ENCRYPTION_KEY,
  },
  providers: {
    orangeMoney: {
      baseUrl: env.ORANGE_MONEY_BASE_URL,
      apiKey: env.ORANGE_MONEY_API_KEY,
      merchantId: env.ORANGE_MONEY_MERCHANT_ID,
      secret: env.ORANGE_MONEY_SECRET,
    },
    mtnMomo: {
      baseUrl: env.MTN_MOMO_BASE_URL,
      apiKey: env.MTN_MOMO_API_KEY,
      apiUser: env.MTN_MOMO_API_USER,
      subscriptionKey: env.MTN_MOMO_SUBSCRIPTION_KEY,
      environment: env.MTN_MOMO_ENVIRONMENT,
    },
    wave: {
      baseUrl: env.WAVE_BASE_URL,
      apiKey: env.WAVE_API_KEY,
      secret: env.WAVE_SECRET,
      webhookSecret: env.WAVE_WEBHOOK_SECRET,
    },
    moovMoney: {
      baseUrl: env.MOOV_MONEY_BASE_URL,
      apiKey: env.MOOV_MONEY_API_KEY,
      merchantId: env.MOOV_MONEY_MERCHANT_ID,
      secret: env.MOOV_MONEY_SECRET,
    },
    card: {
      baseUrl: env.CARD_PROCESSOR_BASE_URL,
      publicKey: env.CARD_PROCESSOR_PUBLIC_KEY,
      secretKey: env.CARD_PROCESSOR_SECRET_KEY,
      webhookSecret: env.CARD_PROCESSOR_WEBHOOK_SECRET,
    },
  },
} as const;

export type Config = typeof config;

export default config;
