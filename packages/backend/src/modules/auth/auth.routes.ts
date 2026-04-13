import { Router } from 'express';
import * as controller from './auth.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { authenticate } from '../../middleware/authenticate';
import { registerSchema, loginSchema, forgotPasswordSchema, refreshTokenSchema } from './auth.schema';

const router = Router();

router.post('/register', validateRequest(registerSchema), controller.register);
router.post('/login', validateRequest(loginSchema), controller.login);
router.get('/me', authenticate, controller.getProfile);
router.post('/refresh', validateRequest(refreshTokenSchema), controller.refreshToken);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), controller.forgotPassword);

export default router;
