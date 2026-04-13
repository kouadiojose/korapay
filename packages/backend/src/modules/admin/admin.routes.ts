import { Router } from 'express';
import * as controller from './admin.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '../../types/common.types';

const router = Router();

// All admin routes require authentication + admin authorization
router.use(authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get('/merchants', controller.listMerchants);
router.get('/merchants/:id', controller.getMerchant);
router.patch('/merchants/:id/status', controller.updateMerchantStatus);

router.get('/stats', controller.getPlatformStats);

router.get('/kyc/pending', controller.listPendingKyc);
router.post('/kyc/:documentId/review', controller.reviewKyc);

router.get('/audit-logs', controller.listAuditLogs);

export default router;
