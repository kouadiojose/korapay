import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('kyc_documents', (table) => {
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
    table.string('document_type', 50).notNullable();
    table.string('file_url', 500).notNullable();
    table.string('file_name', 255).nullable();
    table.integer('file_size').nullable();
    table
      .string('status', 20)
      .notNullable()
      .defaultTo('pending');
    table.text('rejection_reason').nullable();
    table
      .uuid('reviewed_by')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table
      .timestamp('reviewed_at', { useTz: true })
      .nullable();
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE kyc_documents
    ADD CONSTRAINT kyc_documents_document_type_check
    CHECK (document_type IN ('national_id', 'passport', 'business_registration', 'tax_certificate', 'proof_of_address', 'bank_statement'))
  `);

  await knex.raw(`
    ALTER TABLE kyc_documents
    ADD CONSTRAINT kyc_documents_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'))
  `);

  await knex.schema.alterTable('kyc_documents', (table) => {
    table.index('merchant_id', 'idx_kyc_documents_merchant_id');
    table.index('status', 'idx_kyc_documents_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('kyc_documents');
}
