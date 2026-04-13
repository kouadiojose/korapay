import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('audit_logs', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('actor_id')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.string('actor_type', 20).notNullable();
    table.string('action', 50).notNullable();
    table.string('resource_type', 50).notNullable();
    table.string('resource_id', 255).nullable();
    table.jsonb('changes').nullable();
    table.string('ip_address', 45).nullable();
    table.text('user_agent').nullable();
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE audit_logs
    ADD CONSTRAINT audit_logs_actor_type_check
    CHECK (actor_type IN ('user', 'system', 'api'))
  `);

  await knex.schema.alterTable('audit_logs', (table) => {
    table.index('actor_id', 'idx_audit_logs_actor_id');
    table.index('action', 'idx_audit_logs_action');
    table.index('resource_type', 'idx_audit_logs_resource_type');
    table.index('created_at', 'idx_audit_logs_created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
}
