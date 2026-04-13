import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('wallet_transactions', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('wallet_id')
      .notNullable()
      .references('id')
      .inTable('wallets')
      .onDelete('CASCADE');
    table.string('type', 20).notNullable();
    table.decimal('amount', 18, 2).notNullable();
    table.decimal('balance_before', 18, 2).notNullable();
    table.decimal('balance_after', 18, 2).notNullable();
    table.string('reference', 100).notNullable();
    table.text('description').nullable();
    table
      .uuid('transaction_id')
      .nullable()
      .references('id')
      .inTable('transactions')
      .onDelete('SET NULL');
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE wallet_transactions
    ADD CONSTRAINT wallet_transactions_type_check
    CHECK (type IN ('credit', 'debit', 'hold', 'release'))
  `);

  await knex.schema.alterTable('wallet_transactions', (table) => {
    table.index('wallet_id', 'idx_wallet_transactions_wallet_id');
    table.index('transaction_id', 'idx_wallet_transactions_transaction_id');
    table.index('reference', 'idx_wallet_transactions_reference');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('wallet_transactions');
}
