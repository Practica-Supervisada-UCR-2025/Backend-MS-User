import { Router, RequestHandler } from 'express';
import { getUserProfileController, getAdminProfileController, getUsersBySearch } from '../controllers/profile.controller';
import { authenticateJWT } from '../../middleware/authenticate.middleware';
import { updateUserProfileController, updateAdminProfileController, getOtherUserProfileController } from '../controllers/profile.controller';

const router = Router();

// Endpoint for web
router.get('/user/auth/profile', authenticateJWT, getUserProfileController as RequestHandler);

router.get('/user/profile/:id', authenticateJWT, getOtherUserProfileController as RequestHandler);

// Endpoint for mobile
router.get('/admin/auth/profile', authenticateJWT, getAdminProfileController as RequestHandler);

// Endpoint for mobile
router.patch('/user/auth/profile', authenticateJWT, updateUserProfileController as RequestHandler);

router.patch('/admin/auth/profile', authenticateJWT, updateAdminProfileController as RequestHandler);

router.get('/user/search/', authenticateJWT, getUsersBySearch as RequestHandler);

export default router;