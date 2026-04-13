import { Router } from 'express';
import * as controller from './payout.controller';
import { authenticate } from '../../middleware/authenticate';
import { validateRequest } from '../../middleware/validateRequest';
import { initiatePayoutSchema, bulkPayoutSchema } from './payout.schema';

const router = Router();

router.post('/', authenticate, validateRequest(initiatePayoutSchema), controller.initiatePayout);
router.post('/bulk', authenticate, validateRequest(bulkPayoutSchema), controller.bulkPayout);
router.get('/', authenticate, controller.listPayouts);
router.get('/:reference', authenticate, controller.getPayoutByReference);

export default router;
