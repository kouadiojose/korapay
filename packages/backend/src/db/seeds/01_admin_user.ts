import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Check if admin user already exists
  const existingAdmin = await knex('users')
    .where('email', 'admin@korapay.com')
    .first();

  if (existingAdmin) {
    return;
  }

  // bcrypt hash of "Admin@123456" with 10 salt rounds
  const passwordHash =
    '$2b$10$mPBPLwtWd6a9xlqY8Oe3YepBwe7CFVkMQFCrAucvCBVAcPnv45A1i';

  await knex('users').insert({
    email: 'admin@korapay.com',
    password_hash: passwordHash,
    first_name: 'System',
    last_name: 'Admin',
    role: 'super_admin',
    email_verified: true,
    is_active: true,
  });
}
