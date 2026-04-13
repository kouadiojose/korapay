import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('wallets', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('merchant_id')
      .notNullable()
      .references('id')
      .inTable('merchants')
      .onDelete('CASCADE');
    table.string('currency', 3).notNullable();
    table.decimal('balance', 18, 2).notNullable().defaultTo(0);
    table.decimal('available_balance', 18, 2).notNullable().defaultTo(0);
    table.decimal('locked_balance', 18, 2).notNullable().defaultTo(0);
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at', { useTz: true })
      .defaultTo(knex.fn.now());

    table.unique(['merchant_id', 'currency'], {
      indexName: 'uq_wallets_merchant_currency',
    });
  });

  await knex.raw(`
    ALTER TABLE wallets
    ADD CONSTRAINT wallets_balance_non_negative
    CHECK (balance >= 0)
  `);

  await knex.raw(`
    ALTER TABLE wallets
    ADD CONSTRAINT wallets_available_balance_non_negative
    CHECK (available_balance >= 0)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('wallets');
}
