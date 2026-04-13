import { Router } from 'express';
import * as controller from './transfer.controller';
import { authenticate } from '../../middleware/authenticate';
import { validateRequest } from '../../middleware/validateRequest';
import { initiateTransferSchema } from './transfer.schema';

const router = Router();

router.post('/', authenticate, validateRequest(initiateTransferSchema), controller.initiateTransfer);
router.get('/', authenticate, controller.listTransfers);
router.get('/:reference', authenticate, controller.getTransfer);

export default router;
