import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('webhooks', (table) => {
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
    table.string('url', 500).notNullable();
    table.jsonb('events').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.string('secret', 255).notNullable();
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at', { useTz: true })
      .defaultTo(knex.fn.now());
  });

  await knex.schema.alterTable('webhooks', (table) => {
    table.index('merchant_id', 'idx_webhooks_merchant_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('webhooks');
}
