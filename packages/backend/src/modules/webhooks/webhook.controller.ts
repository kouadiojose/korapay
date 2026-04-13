import { Request, Response, NextFunction } from 'express';
import * as webhookService from './webhook.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middleware/authenticate';

export async function createWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await webhookService.createWebhook(authReq.user.id, req.body);
    return successResponse(res, result, 'Webhook created. Store the secret securely.', 201);
  } catch (err) {
    next(err);
  }
}

export async function listWebhooks(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await webhookService.listWebhooks(authReq.user.id);
    return successResponse(res, result, 'Webhooks retrieved');
  } catch (err) {
    next(err);
  }
}

export async function updateWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await webhookService.updateWebhook(authReq.user.id, req.params.id, req.body);
    return successResponse(res, result, 'Webhook updated');
  } catch (err) {
    next(err);
  }
}

export async function deleteWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await webhookService.deleteWebhook(authReq.user.id, req.params.id);
    return successResponse(res, result, 'Webhook deleted');
  } catch (err) {
    next(err);
  }
}

export async function retryWebhookDelivery(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await webhookService.retryWebhookDelivery(authReq.user.id, req.params.deliveryId);
    return successResponse(res, result, 'Webhook delivery retried');
  } catch (err) {
    next(err);
  }
}
