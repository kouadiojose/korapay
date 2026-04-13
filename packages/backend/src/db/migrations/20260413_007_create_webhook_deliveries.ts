import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('webhook_deliveries', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('webhook_id')
      .notNullable()
      .references('id')
      .inTable('webhooks')
      .onDelete('CASCADE');
    table
      .uuid('transaction_id')
      .nullable()
      .references('id')
      .inTable('transactions')
      .onDelete('SET NULL');
    table.string('event', 50).notNullable();
    table.jsonb('payload').notNullable();
    table.integer('response_status').nullable();
    table.text('response_body').nullable();
    table.integer('attempt_count').notNullable().defaultTo(0);
    table.integer('max_attempts').notNullable().defaultTo(5);
    table
      .timestamp('next_retry_at', { useTz: true })
      .nullable();
    table
      .timestamp('delivered_at', { useTz: true })
      .nullable();
    table
      .string('status', 20)
      .notNullable()
      .defaultTo('pending');
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE webhook_deliveries
    ADD CONSTRAINT webhook_deliveries_status_check
    CHECK (status IN ('pending', 'delivered', 'failed', 'exhausted'))
  `);

  await knex.schema.alterTable('webhook_deliveries', (table) => {
    table.index('webhook_id', 'idx_webhook_deliveries_webhook_id');
    table.index('transaction_id', 'idx_webhook_deliveries_transaction_id');
    table.index('status', 'idx_webhook_deliveries_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('webhook_deliveries');
}
