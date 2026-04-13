import { Request, Response, NextFunction } from 'express';
import * as walletService from './wallet.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middleware/authenticate';
import { walletTransactionsQuerySchema } from './wallet.schema';

export async function getWallets(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const currency = req.query.currency as string | undefined;
    const result = await walletService.getWallets(authReq.user.id, currency);
    return successResponse(res, result, 'Wallets retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getWallet(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const result = await walletService.getWallet(authReq.user.id, req.params.currency);
    return successResponse(res, result, 'Wallet retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getWalletTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const query = walletTransactionsQuerySchema.parse(req.query);
    const result = await walletService.getWalletTransactions(
      authReq.user.id,
      req.params.currency,
      query.page,
      query.per_page,
      query.type,
    );
    return successResponse(res, result, 'Wallet transactions retrieved');
  } catch (err) {
    next(err);
  }
}
