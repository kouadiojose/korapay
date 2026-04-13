import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('merchant_id')
      .notNullable()
      .references('id')
      .inTable('merchants')
      .onDelete('RESTRICT');
    table
      .string('reference', 100)
      .unique()
      .notNullable();
    table.string('merchant_reference', 255).nullable();
    table.string('type', 20).notNullable();
    table
      .string('status', 20)
      .notNullable()
      .defaultTo('pending');
    table.string('payment_method', 30).notNullable();
    table.decimal('amount', 18, 2).notNullable();
    table.string('currency', 3).notNullable();
    table.decimal('fee', 18, 2).notNullable().defaultTo(0);
    table.decimal('net_amount', 18, 2).nullable();
    table
      .string('environment', 10)
      .notNullable()
      .defaultTo('test');
    table.string('customer_name', 255).nullable();
    table.string('customer_email', 255).nullable();
    table.string('customer_phone', 20).nullable();
    table.string('provider_reference', 255).nullable();
    table.jsonb('provider_response').nullable();
    table.string('payment_link', 500).nullable();
    table.jsonb('destination').nullable();
    table.text('narration').nullable();
    table.text('description').nullable();
    table.string('idempotency_key', 255).nullable();
    table.jsonb('metadata').defaultTo('{}');
    table.string('ip_address', 45).nullable();
    table
      .timestamp('completed_at', { useTz: true })
      .nullable();
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at', { useTz: true })
      .defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE transactions
    ADD CONSTRAINT transactions_type_check
    CHECK (type IN ('collection', 'transfer', 'payout'))
  `);

  await knex.raw(`
    ALTER TABLE transactions
    ADD CONSTRAINT transactions_status_check
    CHECK (status IN ('pending', 'processing', 'success', 'failed', 'reversed', 'expired', 'cancelled'))
  `);

  await knex.raw(`
    ALTER TABLE transactions
    ADD CONSTRAINT transactions_payment_method_check
    CHECK (payment_method IN ('orange_money', 'mtn_momo', 'wave', 'moov_money', 'bank_card', 'bank_transfer'))
  `);

  await knex.raw(`
    ALTER TABLE transactions
    ADD CONSTRAINT transactions_environment_check
    CHECK (environment IN ('test', 'live'))
  `);

  await knex.schema.alterTable('transactions', (table) => {
    table.index('merchant_id', 'idx_transactions_merchant_id');
    table.index('reference', 'idx_transactions_reference');
    table.index('merchant_reference', 'idx_transactions_merchant_reference');
    table.index('status', 'idx_transactions_status');
    table.index('type', 'idx_transactions_type');
    table.index('payment_method', 'idx_transactions_payment_method');
    table.index('environment', 'idx_transactions_environment');
    table.index('idempotency_key', 'idx_transactions_idempotency_key');
  });

  await knex.raw(`
    CREATE INDEX idx_transactions_created_at_desc
    ON transactions (created_at DESC)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
}
