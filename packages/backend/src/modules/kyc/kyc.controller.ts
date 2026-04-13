import { Request, Response, NextFunction } from 'express';
import * as kycService from './kyc.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middleware/authenticate';

export async function uploadDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await kycService.uploadDocument(authReq.user.id, req.body);
    return successResponse(res, result, 'Document uploaded', 201);
  } catch (err) {
    next(err);
  }
}

export async function listDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await kycService.listDocuments(authReq.user.id);
    return successResponse(res, result, 'Documents retrieved');
  } catch (err) {
    next(err);
  }
}

export async function submitForReview(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await kycService.submitForReview(authReq.user.id);
    return successResponse(res, result, 'KYC submitted for review');
  } catch (err) {
    next(err);
  }
}

export async function getStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await kycService.getStatus(authReq.user.id);
    return successResponse(res, result, 'KYC status retrieved');
  } catch (err) {
    next(err);
  }
}
