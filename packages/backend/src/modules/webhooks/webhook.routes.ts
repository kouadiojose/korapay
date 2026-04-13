import { Router } from 'express';
import * as controller from './webhook.controller';
import { authenticate } from '../../middleware/authenticate';
import { validateRequest } from '../../middleware/validateRequest';
import { createWebhookSchema, updateWebhookSchema } from './webhook.schema';

const router = Router();

router.post('/', authenticate, validateRequest(createWebhookSchema), controller.createWebhook);
router.get('/', authenticate, controller.listWebhooks);
router.patch('/:id', authenticate, validateRequest(updateWebhookSchema), controller.updateWebhook);
router.delete('/:id', authenticate, controller.deleteWebhook);
router.post('/deliveries/:deliveryId/retry', authenticate, controller.retryWebhookDelivery);

export default router;
