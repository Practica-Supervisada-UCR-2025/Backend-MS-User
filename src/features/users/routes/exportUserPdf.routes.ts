//exportUsersPdf.routes.ts
import { Router } from 'express';
import { authenticateJWT } from '../../middleware/authenticate.middleware';
import { exportUsersPdfController } from '../controllers/exportUsersPdf.controller';
import { RequestHandler } from 'express';
const router = Router();

router.get('/admin/exportUsersPDF', authenticateJWT, exportUsersPdfController as RequestHandler);


export default router;
 