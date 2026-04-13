import { Router } from 'express';
import * as controller from './settlement.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.get('/', authenticate, controller.listSettlements);
router.get('/:reference', authenticate, controller.getSettlement);

export default router;
