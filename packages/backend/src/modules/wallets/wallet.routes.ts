import { Router } from 'express';
import * as controller from './wallet.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.get('/', authenticate, controller.getWallets);
router.get('/:currency', authenticate, controller.getWallet);
router.get('/:currency/transactions', authenticate, controller.getWalletTransactions);

export default router;
