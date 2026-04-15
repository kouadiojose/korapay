import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add locked_balance non-negative constraint
  await knex.raw(`
    ALTER TABLE wallets
    ADD CONSTRAINT wallets_locked_balance_non_negative
    CHECK (locked_balance >= 0)
  `);

  // Add wallet balance invariant: balance = available_balance + locked_balance
  await knex.raw(`
    ALTER TABLE wallets
    ADD CONSTRAINT wallets_balance_invariant
    CHECK (balance = available_balance + locked_balance)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_balance_invariant');
  await knex.raw('ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_locked_balance_non_negative');
}
