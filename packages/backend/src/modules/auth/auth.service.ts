import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../config/database';
import { config } from '../../config';
import {
  AppError,
  ConflictError,
  AuthenticationError,
  NotFoundError,
} from '../../utils/errors';
import { UserRole } from '../../types/common.types';
import type { RegisterInput, LoginInput } from './auth.schema';

interface UserRecord {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  email_verified: boolean;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface MerchantRecord {
  id: string;
  user_id: string;
  business_name: string;
  business_email: string;
  business_phone: string | null;
  business_type: string;
  country: string;
  kyc_status: string;
  is_live: boolean;
  created_at: string;
  updated_at: string;
}

function generateTokens(user: UserRecord) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const access_token = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  } as jwt.SignOptions);

  const refresh_token = jwt.sign(
    { sub: user.id, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry } as jwt.SignOptions,
  );

  return { access_token, refresh_token };
}

export async function register(input: RegisterInput) {
  const existing = await db('users').where('email', input.email).first();
  if (existing) {
    throw new ConflictError('A user with this email already exists');
  }

  const salt = await bcrypt.genSalt(12);
  const password_hash = await bcrypt.hash(input.password, salt);

  const result = await db.transaction(async (trx) => {
    const [user] = await trx('users')
      .insert({
        email: input.email,
        password_hash,
        first_name: input.first_name,
        last_name: input.last_name,
        phone: input.phone || null,
        role: UserRole.MERCHANT,
      })
      .returning('*');

    const [merchant] = await trx('merchants')
      .insert({
        user_id: user.id,
        business_name: input.business_name,
        business_email: input.email,
        business_phone: input.phone || null,
        business_type: input.business_type,
        country: input.country,
      })
      .returning('*');

    // Create default XOF wallet
    await trx('wallets').insert({
      merchant_id: merchant.id,
      currency: 'XOF',
      balance: 0,
      available_balance: 0,
      locked_balance: 0,
    });

    return { user, merchant };
  });

  const { password_hash: _hash, ...userWithoutPassword } = result.user;

  return {
    user: userWithoutPassword,
    merchant: result.merchant,
  };
}

export async function login(input: LoginInput) {
  const user = await db('users').where('email', input.email).first();
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  if (!user.is_active) {
    throw new AuthenticationError('Account is deactivated');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password_hash);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  await db('users').where('id', user.id).update({ last_login_at: new Date() });

  const { password_hash: _hash, ...userWithoutPassword } = user;

  const merchant = await db('merchants').where('user_id', user.id).first();

  const tokens = generateTokens(user);

  return {
    ...tokens,
    user: userWithoutPassword,
    merchant,
  };
}

export async function getProfile(userId: string) {
  const user = await db('users')
    .select(
      'id',
      'email',
      'first_name',
      'last_name',
      'phone',
      'role',
      'email_verified',
      'is_active',
      'last_login_at',
      'created_at',
      'updated_at',
    )
    .where('id', userId)
    .first();

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const merchant = await db('merchants').where('user_id', userId).first();

  return { user, merchant };
}

export async function refreshToken(token: string) {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as {
      sub: string;
      type: string;
    };

    if (decoded.type !== 'refresh') {
      throw new AuthenticationError('Invalid token type');
    }

    const user = await db('users').where('id', decoded.sub).first();
    if (!user || !user.is_active) {
      throw new AuthenticationError('User not found or inactive');
    }

    return generateTokens(user);
  } catch (err) {
    if (err instanceof AuthenticationError) throw err;
    if (err instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Refresh token has expired');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid refresh token');
    }
    throw new AuthenticationError('Token refresh failed');
  }
}

export async function forgotPassword(email: string) {
  // Always return success to prevent email enumeration
  const user = await db('users').where('email', email).first();
  if (!user) {
    return { message: 'If the email exists, a reset link has been sent' };
  }

  // In production, generate a reset token and send email here
  // For now, just return a success message
  return { message: 'If the email exists, a reset link has been sent' };
}
