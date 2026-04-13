import { Request, Response, NextFunction } from 'express';
import * as paymentService from './payment.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middleware/authenticate';
import { ApiKeyRequest } from '../../middleware/authenticateApiKey';
import { listTransactionsQuerySchema } from './payment.schema';

export async function initializePayment(req: Request, res: Response, next: NextFunction) {
  try {
    const apiReq = req as ApiKeyRequest;
    const result = await paymentService.initializePayment(
      apiReq.merchant.id,
      apiReq.merchant.environment,
      req.body,
    );
    return successResponse(res, result, 'Payment initialized', 201);
  } catch (err) {
    next(err);
  }
}

export async function getPaymentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const apiReq = req as ApiKeyRequest;
    const result = await paymentService.getPaymentStatus(
      apiReq.merchant.id,
      req.params.reference,
    );
    return successResponse(res, result, 'Payment status retrieved');
  } catch (err) {
    next(err);
  }
}

export async function handleProviderCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.handleProviderCallback(
      req.params.provider,
      req.body,
      req.headers as Record<string, string>,
    );
    return successResponse(res, result, 'Callback processed');
  } catch (err) {
    next(err);
  }
}

export async function listTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const filters = listTransactionsQuerySchema.parse(req.query);
    const result = await paymentService.listTransactions(authReq.user.id, filters);
    return successResponse(res, result, 'Transactions retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await paymentService.getTransaction(authReq.user.id, req.params.reference);
    return successResponse(res, result, 'Transaction retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getTransactionStats(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await paymentService.getTransactionStats(authReq.user.id);
    return successResponse(res, result, 'Transaction statistics retrieved');
  } catch (err) {
    next(err);
  }
}
