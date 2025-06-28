import { RequestHandler, Router } from 'express';
import { suspendUserController } from '../controllers/suspension.controller';
import { authenticateJWT } from '../../middleware/authenticate.middleware';

const router = Router();

// POST /api/users/suspend
router.post('/user/suspend', authenticateJWT, suspendUserController as RequestHandler);

export default router;
