import { Router, RequestHandler } from 'express';
import { getAllUsersController } from '../controllers/getAllUsers.controller';
import { authenticateJWT } from '../../middleware/authenticate.middleware';

const router = Router();

router.get('/users/active', authenticateJWT, getAllUsersController as RequestHandler);

export default router;
