import { Router } from 'express';
import * as controller from './payment.controller';
import { authenticate } from '../../middleware/authenticate';
import { authenticateApiKey } from '../../middleware/authenticateApiKey';
import { validateRequest } from '../../middleware/validateRequest';
import { initializePaymentSchema } from './payment.schema';

const router = Router();

// API-key authenticated routes (for merchant integrations)
router.post('/charges/initialize', authenticateApiKey, validateRequest(initializePaymentSchema), controller.initializePayment);
router.get('/charges/:reference', authenticateApiKey, controller.getPaymentStatus);

// Provider callback (no auth - validated by provider signature)
router.post('/callbacks/:provider', controller.handleProviderCallback);

// Dashboard routes (JWT authenticated)
router.get('/transactions/stats', authenticate, controller.getTransactionStats);
router.get('/transactions', authenticate, controller.listTransactions);
router.get('/transactions/:reference', authenticate, controller.getTransaction);

export default router;
