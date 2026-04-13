import { Router } from 'express';
import * as controller from './checkout.controller';

const router = Router();

// All checkout routes are public (no auth required)
router.get('/checkout/:reference', controller.getCheckoutSession);
router.post('/checkout/:reference/pay', controller.processPayment);
router.get('/checkout/:reference/status', controller.getPaymentStatus);

export default router;
