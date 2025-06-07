import { Request, Response } from 'express';
import { RequestHandler } from 'express';
import { exportUsersPdfService } from '../services/exportUsersPdf.service';
import { AuthenticatedRequest } from '../../../features/middleware/authenticate.middleware';


export const exportUsersPdfController = async (req: Request, res: Response) => {
  const typedReq = req as AuthenticatedRequest;

  if (typedReq.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. You must be an admin to access this endpoint.' });
  }

 try {
  const pdfBuffer = await exportUsersPdfService();
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="reporteUsuarios.pdf"',
  });
  res.send(pdfBuffer);
  } catch (error: any) {
  console.error('Error generating PDF:', error);
  
  if (error.message === 'There are no users to export.') {
    return res.status(404).json({ message: 'No users found to export.' });
  }

  res.status(500).json({ message: 'Failed to generate PDF.' });
}
};
