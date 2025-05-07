import { Router } from 'express';
import { getUserProfileController, getAdminProfileController } from '../controllers/profile.controller';
import { authenticateJWT } from '../../middleware/authenticate.middleware';
import { updateUserProfileController, updateAdminProfileController } from '../controllers/profile.controller';

const router = Router();

// Endpoint for web
router.get('/user/auth/profile', authenticateJWT, getUserProfileController);

// Endpoint for mobile
router.get('/admin/auth/profile', authenticateJWT, getAdminProfileController);

// Endpoint for mobile
router.patch('/user/auth/profile', authenticateJWT, updateUserProfileController);

router.patch('/admin/auth/profile', authenticateJWT, updateAdminProfileController);

export default router;