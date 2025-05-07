import { Router } from 'express';
import { getUserProfileController, getAdminProfileController } from '../controllers/profile.controller';
import { authenticateJWT } from '../../middleware/authenticate.middleware';

const router = Router();

// Endpoint para web
router.get('/user/auth/profile', authenticateJWT, getUserProfileController);

// Endpoint para mobile
router.get('/admin/auth/profile', authenticateJWT, getAdminProfileController);

export default router;