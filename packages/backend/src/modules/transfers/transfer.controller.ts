import { Request, Response, NextFunction } from 'express';
import * as transferService from './transfer.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middleware/authenticate';
import { listTransfersQuerySchema } from './transfer.schema';

export async function initiateTransfer(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await transferService.initiateTransfer(authReq.user.id, req.body);
    return successResponse(res, result, 'Transfer initiated', 201);
  } catch (err) {
    next(err);
  }
}

export async function listTransfers(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const query = listTransfersQuerySchema.parse(req.query);
    const result = await transferService.listTransfers(
      authReq.user.id,
      query.page,
      query.per_page,
      query.status,
    );
    return successResponse(res, result, 'Transfers retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getTransfer(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await transferService.getTransfer(authReq.user.id, req.params.reference);
    return successResponse(res, result, 'Transfer retrieved');
  } catch (err) {
    next(err);
  }
}
