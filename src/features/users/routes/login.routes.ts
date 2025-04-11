// src/features/users/routes/login.routes.ts
import { Router } from 'express';
import { loginUserController } from '../controllers/login.controller';

const router = Router();

router.post('/auth/login', loginUserController);

export default router;
