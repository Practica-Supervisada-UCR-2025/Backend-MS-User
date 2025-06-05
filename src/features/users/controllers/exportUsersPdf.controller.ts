import { Request, Response } from 'express';
import { RequestHandler } from 'express';
import { exportUsersPdfService } from '../services/exportUsersPdf.service';
import { AuthenticatedRequest } from '../../../features/middleware/authenticate.middleware';


export const exportUsersPdfController = async (req: Request, res: Response) => {
  const typedReq = req as AuthenticatedRequest;

  if (typedReq.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  const pdfBuffer = await exportUsersPdfService();

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="usuarios.pdf"',
  });

  res.send(pdfBuffer);
};