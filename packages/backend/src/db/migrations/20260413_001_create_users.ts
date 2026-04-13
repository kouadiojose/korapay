import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table
      .string('email', 255)
      .unique()
      .notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('phone', 20).nullable();
    table
      .string('role', 20)
      .notNullable()
      .defaultTo('merchant');
    table.boolean('email_verified').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table
      .timestamp('last_login_at', { useTz: true })
      .nullable();
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at', { useTz: true })
      .defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE users
    ADD CONSTRAINT users_role_check
    CHECK (role IN ('merchant', 'admin', 'super_admin'))
  `);

  await knex.schema.alterTable('users', (table) => {
    table.index('email', 'idx_users_email');
    table.index('role', 'idx_users_role');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
