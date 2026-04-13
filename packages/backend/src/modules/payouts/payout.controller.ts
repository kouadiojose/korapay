import { Request, Response, NextFunction } from 'express';
import * as payoutService from './payout.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middleware/authenticate';
import { listPayoutsQuerySchema } from './payout.schema';

export async function initiatePayout(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await payoutService.initiatePayout(authReq.user.id, req.body);
    return successResponse(res, result, 'Payout initiated', 201);
  } catch (err) {
    next(err);
  }
}

export async function bulkPayout(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await payoutService.bulkPayout(authReq.user.id, req.body);
    return successResponse(res, result, 'Bulk payout processed', 201);
  } catch (err) {
    next(err);
  }
}

export async function listPayouts(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const query = listPayoutsQuerySchema.parse(req.query);
    const result = await payoutService.listPayouts(
      authReq.user.id,
      query.page,
      query.per_page,
      query.status,
    );
    return successResponse(res, result, 'Payouts retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getPayoutByReference(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await payoutService.getPayoutByReference(authReq.user.id, req.params.reference);
    return successResponse(res, result, 'Payout retrieved');
  } catch (err) {
    next(err);
  }
}
