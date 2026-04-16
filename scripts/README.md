# KoraPay Scripts

## migrate-all.js

Standalone database migration script. Creates all 11 tables (users, merchants, wallets, transactions, api_keys, webhooks, webhook_deliveries, kyc_documents, settlements, wallet_transactions, audit_logs) with proper constraints, indexes, and foreign keys.

### Setup

```bash
cd scripts
npm install
```

### Usage

**Migrate (create all tables):**
```bash
DATABASE_URL=postgresql://user:pass@host:port/db node migrate-all.js
```

**Migrate + create default admin user:**
```bash
DATABASE_URL=postgresql://user:pass@host:port/db node migrate-all.js --seed
```

**Rollback (DROP all tables - destructive):**
```bash
DATABASE_URL=postgresql://user:pass@host:port/db node migrate-all.js --rollback
```

### Examples

**Local development (no SSL):**
```bash
DATABASE_URL=postgresql://korapay:password@localhost:5432/korapay_dev npm run migrate
```

**Railway production (SSL auto-enabled):**
```bash
DATABASE_URL="postgresql://postgres:xxx@containers-us-west-xxx.railway.app:5432/railway" npm run migrate:seed
```

**Get DATABASE_URL from Railway:**
1. Open your PostgreSQL service in Railway
2. Go to "Connect" tab
3. Copy "Postgres Connection URL"

### Default Admin Credentials (after --seed)

- Email: `admin@korapay.com`
- Password: `Admin@123456`

**IMPORTANT**: Change this password immediately after first login.

### Features

- **Idempotent**: Tracks applied migrations in `korapay_migrations` table - safe to re-run
- **Transactional**: Each migration runs in its own transaction (rollback on error)
- **SSL detection**: Auto-enables SSL for non-localhost connections
- **Safe constraints**: Includes wallet balance invariant (`balance = available + locked`)

### Tables Created

| # | Table | Purpose |
|---|-------|---------|
| 1 | users | User accounts (merchants, admins) |
| 2 | merchants | Business profiles |
| 3 | wallets | Currency balances per merchant |
| 4 | transactions | All payment transactions |
| 5 | api_keys | Merchant API keys (test + live) |
| 6 | webhooks | Webhook endpoint registrations |
| 7 | webhook_deliveries | Webhook delivery history with retries |
| 8 | kyc_documents | KYC verification documents |
| 9 | settlements | Merchant payout settlements |
| 10 | wallet_transactions | Wallet ledger (credit/debit history) |
| 11 | audit_logs | System-wide audit trail |
