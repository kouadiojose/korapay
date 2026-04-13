import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('api_keys', (table) => {
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
    table
      .string('public_key', 255)
      .unique()
      .notNullable();
    table.string('secret_key_hash', 255).notNullable();
    table
      .string('environment', 10)
      .notNullable()
      .defaultTo('test');
    table.string('label', 100).nullable();
    table.boolean('is_active').defaultTo(true);
    table
      .timestamp('last_used_at', { useTz: true })
      .nullable();
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now());
    table
      .timestamp('revoked_at', { useTz: true })
      .nullable();
  });

  await knex.raw(`
    ALTER TABLE api_keys
    ADD CONSTRAINT api_keys_environment_check
    CHECK (environment IN ('test', 'live'))
  `);

  await knex.schema.alterTable('api_keys', (table) => {
    table.index('merchant_id', 'idx_api_keys_merchant_id');
    table.index('public_key', 'idx_api_keys_public_key');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('api_keys');
}
