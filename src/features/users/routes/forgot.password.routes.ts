import { Router } from 'express';
import { sendRecoveryLink } from '../controllers/forgot.password.controller';

const router = Router();

router.post('/recover-password', sendRecoveryLink);

export default router;
