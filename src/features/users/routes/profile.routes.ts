import { Router, RequestHandler } from 'express';
import { getUserProfileController, getAdminProfileController } from '../controllers/profile.controller';
import { authenticateJWT } from '../../middleware/authenticate.middleware';
import { updateUserProfileController, updateAdminProfileController } from '../controllers/profile.controller';

const router = Router();

// Endpoint for web
router.get('/user/auth/profile', authenticateJWT, getUserProfileController as RequestHandler);

// Endpoint for mobile
router.get('/admin/auth/profile', authenticateJWT, getAdminProfileController as RequestHandler);

// Endpoint for mobile
router.patch('/user/auth/profile', authenticateJWT, updateUserProfileController as RequestHandler);

router.patch('/admin/auth/profile', authenticateJWT, updateAdminProfileController as RequestHandler);

export default router;