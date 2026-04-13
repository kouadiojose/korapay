import { Router } from 'express';
import * as controller from './merchant.controller';
import { authenticate } from '../../middleware/authenticate';
import { validateRequest } from '../../middleware/validateRequest';
import { updateProfileSchema, generateApiKeySchema } from './merchant.schema';

const router = Router();

router.get('/profile', authenticate, controller.getProfile);
router.patch('/profile', authenticate, validateRequest(updateProfileSchema), controller.updateProfile);
router.get('/api-keys', authenticate, controller.getApiKeys);
router.post('/api-keys', authenticate, validateRequest(generateApiKeySchema), controller.generateApiKey);
router.delete('/api-keys/:id', authenticate, controller.revokeApiKey);

export default router;
