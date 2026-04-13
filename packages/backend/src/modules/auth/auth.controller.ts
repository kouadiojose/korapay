import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middleware/authenticate';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, result, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    return successResponse(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await authService.getProfile(authReq.user.id);
    return successResponse(res, result, 'Profile retrieved');
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refresh_token } = req.body;
    const result = await authService.refreshToken(refresh_token);
    return successResponse(res, result, 'Token refreshed');
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.forgotPassword(req.body.email);
    return successResponse(res, result, 'Password reset initiated');
  } catch (err) {
    next(err);
  }
}
