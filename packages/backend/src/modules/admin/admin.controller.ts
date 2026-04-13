import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middleware/authenticate';
import { z } from 'zod';

const listMerchantsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  kyc_status: z.enum(['pending', 'submitted', 'under_review', 'approved', 'rejected']).optional(),
});

const updateStatusSchema = z.object({
  is_active: z.boolean(),
});

const reviewKycSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  rejection_reason: z.string().max(1000).optional(),
});

const listAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  action: z.string().max(50).optional(),
  resource_type: z.string().max(50).optional(),
  actor_id: z.string().uuid().optional(),
});

export async function listMerchants(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listMerchantsQuerySchema.parse(req.query);
    const result = await adminService.listMerchants(query.page, query.per_page, query.kyc_status);
    return successResponse(res, result, 'Merchants retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getMerchant(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getMerchant(req.params.id);
    return successResponse(res, result, 'Merchant retrieved');
  } catch (err) {
    next(err);
  }
}

export async function updateMerchantStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const body = updateStatusSchema.parse(req.body);
    const result = await adminService.updateMerchantStatus(req.params.id, body.is_active);
    return successResponse(res, result, 'Merchant status updated');
  } catch (err) {
    next(err);
  }
}

export async function getPlatformStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getPlatformStats();
    return successResponse(res, result, 'Platform statistics retrieved');
  } catch (err) {
    next(err);
  }
}

export async function listPendingKyc(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listMerchantsQuerySchema.parse(req.query);
    const result = await adminService.listPendingKyc(query.page, query.per_page);
    return successResponse(res, result, 'Pending KYC reviews retrieved');
  } catch (err) {
    next(err);
  }
}

export async function reviewKyc(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const body = reviewKycSchema.parse(req.body);
    const result = await adminService.reviewKyc(
      authReq.user.id,
      req.params.documentId,
      body.decision,
      body.rejection_reason,
    );
    return successResponse(res, result, 'KYC review completed');
  } catch (err) {
    next(err);
  }
}

export async function listAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listAuditLogsQuerySchema.parse(req.query);
    const result = await adminService.listAuditLogs(query.page, query.per_page, {
      action: query.action,
      resource_type: query.resource_type,
      actor_id: query.actor_id,
    });
    return successResponse(res, result, 'Audit logs retrieved');
  } catch (err) {
    next(err);
  }
}
