import { Router } from 'express';
import * as controller from './kyc.controller';
import { authenticate } from '../../middleware/authenticate';
import { validateRequest } from '../../middleware/validateRequest';
import { uploadDocumentSchema } from './kyc.schema';

const router = Router();

router.post('/documents', authenticate, validateRequest(uploadDocumentSchema), controller.uploadDocument);
router.get('/documents', authenticate, controller.listDocuments);
router.post('/submit', authenticate, controller.submitForReview);
router.get('/status', authenticate, controller.getStatus);

export default router;
