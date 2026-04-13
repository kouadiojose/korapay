import { Request, Response, NextFunction } from 'express';
import * as settlementService from './settlement.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middleware/authenticate';
import { z } from 'zod';

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'processing', 'settled', 'failed']).optional(),
});

export async function listSettlements(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const query = listQuerySchema.parse(req.query);
    const result = await settlementService.listSettlements(
      authReq.user.id,
      query.page,
      query.per_page,
      query.status,
    );
    return successResponse(res, result, 'Settlements retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getSettlement(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await settlementService.getSettlement(authReq.user.id, req.params.reference);
    return successResponse(res, result, 'Settlement retrieved');
  } catch (err) {
    next(err);
  }
}
