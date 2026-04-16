#!/usr/bin/env node
/**
 * Standalone database migration script for KoraPay
 *
 * Usage:
 *   DATABASE_URL=postgresql://user:pass@host:port/db node scripts/migrate-all.js
 *
 * Or with .env file:
 *   node scripts/migrate-all.js
 *
 * Options:
 *   --rollback    Drop all tables (DESTRUCTIVE)
 *   --seed        Insert default admin user after migration
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load .env if it exists
try {
  require('dotenv').config({ path: path.join(__dirname, '../packages/backend/.env') });
} catch (e) {
  // dotenv not available, continue with process.env
}

const DATABASE_URL = process.env.DATABASE_URL;
const ROLLBACK = process.argv.includes('--rollback');
const SEED = process.argv.includes('--seed');

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  console.error('');
  console.error('Usage:');
  console.error('  DATABASE_URL=postgresql://user:pass@host:port/db node scripts/migrate-all.js');
  process.exit(1);
}

const useSSL = !DATABASE_URL.includes('localhost') && !DATABASE_URL.includes('127.0.0.1');

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

// Tables in order of dependency (parent tables first)
const TABLES_ORDER = [
  'audit_logs',
  'wallet_transactions',
  'settlements',
  'kyc_documents',
  'webhook_deliveries',
  'webhooks',
  'api_keys',
  'transactions',
  'wallets',
  'merchants',
  'users',
];

const MIGRATIONS = [
  {
    name: '001_create_users',
    up: `
      CREATE EXTENSION IF NOT EXISTS pgcrypto;

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) NOT NULL DEFAULT 'merchant'
          CHECK (role IN ('merchant', 'admin', 'super_admin')),
        email_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        last_login_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `,
  },
  {
    name: '002_create_merchants',
    up: `
      CREATE TABLE IF NOT EXISTS merchants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(255) NOT NULL,
        business_email VARCHAR(255) NOT NULL,
        business_phone VARCHAR(20),
        business_type VARCHAR(50) NOT NULL
          CHECK (business_type IN ('individual', 'sole_proprietor', 'partnership', 'corporation', 'ngo')),
        country VARCHAR(3) NOT NULL,
        address TEXT,
        website VARCHAR(255),
        logo_url VARCHAR(500),
        kyc_status VARCHAR(20) DEFAULT 'pending'
          CHECK (kyc_status IN ('pending', 'submitted', 'under_review', 'approved', 'rejected')),
        is_live BOOLEAN DEFAULT FALSE,
        settlement_bank JSONB,
        webhook_secret VARCHAR(255),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_merchants_user ON merchants(user_id);
      CREATE INDEX IF NOT EXISTS idx_merchants_country ON merchants(country);
      CREATE INDEX IF NOT EXISTS idx_merchants_kyc ON merchants(kyc_status);
    `,
  },
  {
    name: '003_create_wallets',
    up: `
      CREATE TABLE IF NOT EXISTS wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        currency VARCHAR(3) NOT NULL,
        balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        available_balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        locked_balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT uq_wallets_merchant_currency UNIQUE (merchant_id, currency),
        CONSTRAINT wallets_balance_non_negative CHECK (balance >= 0),
        CONSTRAINT wallets_available_balance_non_negative CHECK (available_balance >= 0),
        CONSTRAINT wallets_locked_balance_non_negative CHECK (locked_balance >= 0),
        CONSTRAINT wallets_balance_invariant CHECK (balance = available_balance + locked_balance)
      );
      CREATE INDEX IF NOT EXISTS idx_wallets_merchant ON wallets(merchant_id);
    `,
  },
  {
    name: '004_create_transactions',
    up: `
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE RESTRICT,
        reference VARCHAR(100) UNIQUE NOT NULL,
        merchant_reference VARCHAR(255),
        type VARCHAR(20) NOT NULL
          CHECK (type IN ('collection', 'transfer', 'payout')),
        status VARCHAR(20) NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'processing', 'success', 'failed', 'reversed', 'expired', 'cancelled')),
        payment_method VARCHAR(30) NOT NULL
          CHECK (payment_method IN ('orange_money', 'mtn_momo', 'wave', 'moov_money', 'bank_card', 'bank_transfer')),
        amount DECIMAL(18,2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        fee DECIMAL(18,2) DEFAULT 0.00,
        net_amount DECIMAL(18,2),
        environment VARCHAR(10) NOT NULL DEFAULT 'test'
          CHECK (environment IN ('test', 'live')),
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        provider_reference VARCHAR(255),
        provider_response JSONB,
        payment_link VARCHAR(500),
        destination JSONB,
        narration VARCHAR(255),
        description TEXT,
        idempotency_key VARCHAR(255),
        metadata JSONB DEFAULT '{}',
        ip_address VARCHAR(45),
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_tx_merchant ON transactions(merchant_id);
      CREATE INDEX IF NOT EXISTS idx_tx_reference ON transactions(reference);
      CREATE INDEX IF NOT EXISTS idx_tx_merchant_ref ON transactions(merchant_reference);
      CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions(status);
      CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_tx_method ON transactions(payment_method);
      CREATE INDEX IF NOT EXISTS idx_tx_created ON transactions(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_tx_env ON transactions(environment);
      CREATE INDEX IF NOT EXISTS idx_tx_idempotency ON transactions(idempotency_key) WHERE idempotency_key IS NOT NULL;
    `,
  },
  {
    name: '005_create_api_keys',
    up: `
      CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        public_key VARCHAR(255) UNIQUE NOT NULL,
        secret_key_hash VARCHAR(255) NOT NULL,
        environment VARCHAR(10) NOT NULL DEFAULT 'test'
          CHECK (environment IN ('test', 'live')),
        label VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        last_used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        revoked_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_api_keys_merchant ON api_keys(merchant_id);
      CREATE INDEX IF NOT EXISTS idx_api_keys_public ON api_keys(public_key);
    `,
  },
  {
    name: '006_create_webhooks',
    up: `
      CREATE TABLE IF NOT EXISTS webhooks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        url VARCHAR(500) NOT NULL,
        events JSONB NOT NULL DEFAULT '[]',
        is_active BOOLEAN DEFAULT TRUE,
        secret VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_webhooks_merchant ON webhooks(merchant_id);
    `,
  },
  {
    name: '007_create_webhook_deliveries',
    up: `
      CREATE TABLE IF NOT EXISTS webhook_deliveries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
        transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
        event VARCHAR(50) NOT NULL,
        payload JSONB NOT NULL,
        response_status INTEGER,
        response_body TEXT,
        attempt_count INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 5,
        next_retry_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ,
        status VARCHAR(20) DEFAULT 'pending'
          CHECK (status IN ('pending', 'delivered', 'failed', 'exhausted')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_webhook_del_webhook ON webhook_deliveries(webhook_id);
      CREATE INDEX IF NOT EXISTS idx_webhook_del_status ON webhook_deliveries(status);
      CREATE INDEX IF NOT EXISTS idx_webhook_del_retry ON webhook_deliveries(next_retry_at) WHERE status = 'pending';
    `,
  },
  {
    name: '008_create_kyc_documents',
    up: `
      CREATE TABLE IF NOT EXISTS kyc_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL
          CHECK (document_type IN ('national_id', 'passport', 'business_registration',
                 'tax_certificate', 'proof_of_address', 'bank_statement',
                 'articles_of_incorporation', 'utility_bill')),
        file_url VARCHAR(500) NOT NULL,
        file_name VARCHAR(255),
        file_size INTEGER,
        status VARCHAR(20) DEFAULT 'pending'
          CHECK (status IN ('pending', 'approved', 'rejected')),
        rejection_reason TEXT,
        reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_kyc_merchant ON kyc_documents(merchant_id);
    `,
  },
  {
    name: '009_create_settlements',
    up: `
      CREATE TABLE IF NOT EXISTS settlements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE RESTRICT,
        reference VARCHAR(100) UNIQUE NOT NULL,
        currency VARCHAR(3) NOT NULL,
        total_amount DECIMAL(18,2) NOT NULL,
        total_fees DECIMAL(18,2) NOT NULL,
        net_amount DECIMAL(18,2) NOT NULL,
        transaction_count INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'pending'
          CHECK (status IN ('pending', 'processing', 'settled', 'failed')),
        settlement_date DATE NOT NULL,
        settled_at TIMESTAMPTZ,
        bank_reference VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_settle_merchant ON settlements(merchant_id);
      CREATE INDEX IF NOT EXISTS idx_settle_status ON settlements(status);
      CREATE INDEX IF NOT EXISTS idx_settle_date ON settlements(settlement_date);
    `,
  },
  {
    name: '010_create_wallet_transactions',
    up: `
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL
          CHECK (type IN ('credit', 'debit', 'hold', 'release')),
        amount DECIMAL(18,2) NOT NULL,
        balance_before DECIMAL(18,2) NOT NULL,
        balance_after DECIMAL(18,2) NOT NULL,
        reference VARCHAR(100) NOT NULL,
        description TEXT,
        transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON wallet_transactions(wallet_id);
      CREATE INDEX IF NOT EXISTS idx_wallet_tx_ref ON wallet_transactions(reference);
    `,
  },
  {
    name: '011_create_audit_logs',
    up: `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
        actor_type VARCHAR(20) NOT NULL
          CHECK (actor_type IN ('user', 'system', 'api')),
        action VARCHAR(50) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id VARCHAR(255),
        changes JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
      CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
      CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
    `,
  },
  {
    name: '012_create_migrations_tracker',
    up: `
      CREATE TABLE IF NOT EXISTS korapay_migrations (
        name VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },
];

async function rollback() {
  console.log('\n  WARNING: This will DROP ALL TABLES (destructive operation)');
  console.log('Press Ctrl+C within 5 seconds to cancel...\n');
  await new Promise((r) => setTimeout(r, 5000));

  for (const tableName of TABLES_ORDER) {
    try {
      await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
      console.log(`   Dropped: ${tableName}`);
    } catch (err) {
      console.error(`   Failed to drop ${tableName}:`, err.message);
    }
  }
  await client.query('DROP TABLE IF EXISTS korapay_migrations CASCADE');
  await client.query('DROP TABLE IF EXISTS knex_migrations CASCADE');
  await client.query('DROP TABLE IF EXISTS knex_migrations_lock CASCADE');
  console.log('\n   Rollback complete\n');
}

async function migrate() {
  console.log('\n   Starting KoraPay database migration...\n');

  // Ensure tracker table exists first
  await client.query(`
    CREATE TABLE IF NOT EXISTS korapay_migrations (
      name VARCHAR(255) PRIMARY KEY,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  let appliedCount = 0;
  let skippedCount = 0;

  for (const migration of MIGRATIONS) {
    const { rows } = await client.query(
      'SELECT name FROM korapay_migrations WHERE name = $1',
      [migration.name]
    );

    if (rows.length > 0) {
      console.log(`   Skipped (already applied): ${migration.name}`);
      skippedCount++;
      continue;
    }

    try {
      await client.query('BEGIN');
      await client.query(migration.up);
      await client.query(
        'INSERT INTO korapay_migrations (name) VALUES ($1)',
        [migration.name]
      );
      await client.query('COMMIT');
      console.log(`   Applied: ${migration.name}`);
      appliedCount++;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`   FAILED: ${migration.name}`);
      console.error(`     ${err.message}`);
      throw err;
    }
  }

  console.log(`\n   Migration complete: ${appliedCount} applied, ${skippedCount} skipped`);
}

async function seed() {
  console.log('\n   Seeding default admin user...');

  const adminEmail = 'admin@korapay.com';
  const { rows } = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);

  if (rows.length > 0) {
    console.log('   Admin user already exists, skipping seed');
    return;
  }

  const passwordHash = await bcrypt.hash('Admin@123456', 12);

  await client.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [adminEmail, passwordHash, 'Admin', 'KoraPay', 'super_admin', true, true]
  );

  console.log('   Default admin user created:');
  console.log(`     Email:    ${adminEmail}`);
  console.log(`     Password: Admin@123456`);
  console.log('     IMPORTANT: Change this password immediately in production!');
}

async function listTables() {
  const { rows } = await client.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);
  console.log('\n   Tables in database:');
  rows.forEach((r) => console.log(`     - ${r.tablename}`));
  console.log(`   Total: ${rows.length} tables\n`);
}

async function main() {
  console.log('================================================');
  console.log('  KoraPay Database Migration Tool');
  console.log('================================================');
  console.log(`  Database: ${DATABASE_URL.replace(/:[^:@]*@/, ':****@')}`);
  console.log(`  SSL:      ${useSSL ? 'enabled' : 'disabled'}`);
  console.log(`  Mode:     ${ROLLBACK ? 'ROLLBACK' : 'MIGRATE'}${SEED ? ' + SEED' : ''}`);
  console.log('================================================');

  try {
    await client.connect();
    console.log('   Connected to database\n');

    if (ROLLBACK) {
      await rollback();
    } else {
      await migrate();
      if (SEED) {
        await seed();
      }
      await listTables();
    }

    console.log('   All operations completed successfully\n');
    process.exit(0);
  } catch (err) {
    console.error('\n   ERROR:', err.message);
    if (err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
