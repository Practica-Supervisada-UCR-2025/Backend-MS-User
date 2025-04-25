// src/features/users/routes/login.routes.ts
import { Router } from 'express';
import { loginUserController, loginAdminController } from '../controllers/login.controller';
import { validateAuth, AuthenticatedRequest } from '../../middleware/authenticate.middleware';

const router = Router();

router.post('/user/auth/login', loginUserController);
router.post('/admin/auth/login', loginAdminController);

export default router;
