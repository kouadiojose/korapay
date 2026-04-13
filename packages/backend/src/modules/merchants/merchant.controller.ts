import { Request, Response, NextFunction } from 'express';
import * as merchantService from './merchant.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middleware/authenticate';

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await merchantService.getProfile(authReq.user.id);
    return successResponse(res, result, 'Merchant profile retrieved');
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await merchantService.updateProfile(authReq.user.id, req.body);
    return successResponse(res, result, 'Merchant profile updated');
  } catch (err) {
    next(err);
  }
}

export async function getApiKeys(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await merchantService.getApiKeys(authReq.user.id);
    return successResponse(res, result, 'API keys retrieved');
  } catch (err) {
    next(err);
  }
}

export async function generateApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await merchantService.generateApiKey(authReq.user.id, req.body.label);
    return successResponse(res, result, 'API key generated. Store the secret key securely — it will not be shown again.', 201);
  } catch (err) {
    next(err);
  }
}

export async function revokeApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await merchantService.revokeApiKey(authReq.user.id, req.params.id);
    return successResponse(res, result, 'API key revoked');
  } catch (err) {
    next(err);
  }
}
