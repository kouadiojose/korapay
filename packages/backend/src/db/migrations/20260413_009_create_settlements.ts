import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('settlements', (table) => {
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
    table.string('currency', 3).notNullable();
    table.decimal('total_amount', 18, 2).notNullable();
    table.decimal('total_fees', 18, 2).notNullable();
    table.decimal('net_amount', 18, 2).notNullable();
    table.integer('transaction_count').notNullable();
    table
      .string('status', 20)
      .notNullable()
      .defaultTo('pending');
    table.date('settlement_date').notNullable();
    table
      .timestamp('settled_at', { useTz: true })
      .nullable();
    table.string('bank_reference', 255).nullable();
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE settlements
    ADD CONSTRAINT settlements_status_check
    CHECK (status IN ('pending', 'processing', 'settled', 'failed'))
  `);

  await knex.schema.alterTable('settlements', (table) => {
    table.index('merchant_id', 'idx_settlements_merchant_id');
    table.index('status', 'idx_settlements_status');
    table.index('settlement_date', 'idx_settlements_settlement_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('settlements');
}
