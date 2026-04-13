import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('merchants', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('user_id')
      .unique()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('business_name', 255).notNullable();
    table.string('business_email', 255).notNullable();
    table.string('business_phone', 20).nullable();
    table.string('business_type', 30).notNullable();
    table.string('country', 3).notNullable();
    table.text('address').nullable();
    table.string('website', 500).nullable();
    table.string('logo_url', 500).nullable();
    table
      .string('kyc_status', 20)
      .notNullable()
      .defaultTo('pending');
    table.boolean('is_live').defaultTo(false);
    table.jsonb('settlement_bank').nullable();
    table.string('webhook_secret', 255).nullable();
    table.jsonb('metadata').defaultTo('{}');
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at', { useTz: true })
      .defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE merchants
    ADD CONSTRAINT merchants_business_type_check
    CHECK (business_type IN ('individual', 'sole_proprietor', 'partnership', 'corporation', 'ngo'))
  `);

  await knex.raw(`
    ALTER TABLE merchants
    ADD CONSTRAINT merchants_kyc_status_check
    CHECK (kyc_status IN ('pending', 'submitted', 'under_review', 'approved', 'rejected'))
  `);

  await knex.schema.alterTable('merchants', (table) => {
    table.index('user_id', 'idx_merchants_user_id');
    table.index('country', 'idx_merchants_country');
    table.index('kyc_status', 'idx_merchants_kyc_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('merchants');
}
