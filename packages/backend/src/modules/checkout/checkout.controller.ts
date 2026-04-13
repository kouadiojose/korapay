import { Request, Response, NextFunction } from 'express';
import * as checkoutService from './checkout.service';
import { successResponse } from '../../utils/response';

export async function getCheckoutSession(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await checkoutService.getCheckoutSession(req.params.reference);
    return successResponse(res, result, 'Checkout session retrieved');
  } catch (err) {
    next(err);
  }
}

export async function processPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await checkoutService.processPayment(req.params.reference, req.body);
    return successResponse(res, result, 'Payment submitted');
  } catch (err) {
    next(err);
  }
}

export async function getPaymentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await checkoutService.getPaymentStatus(req.params.reference);
    return successResponse(res, result, 'Payment status retrieved');
  } catch (err) {
    next(err);
  }
}
