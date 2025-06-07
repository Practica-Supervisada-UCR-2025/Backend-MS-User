import request from 'supertest';
import express from 'express';
// Update the import path below if the file location or name is different
import exportUsersPdfRouter from '../../src/features/users/routes/exportUserPdf.routes';
import { exportUsersPdfService } from '../../src/features/users/services/exportUsersPdf.service';

// Mock del servicio
jest.mock('../../src/features/users/services/exportUsersPdf.service');
const mockedExportUsersPdfService = exportUsersPdfService as jest.Mock;

// Mock del middleware
jest.mock('../../src/features/middleware/authenticate.middleware', () => ({
  authenticateJWT: (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer admin-token')) {
      req.user = { role: 'admin' };
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  },
}));

const app = express();
app.use(express.json());
app.use('/api', exportUsersPdfRouter);

describe('GET /api/admin/exportUsersPDF', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return PDF for admin user', async () => {
    const fakePdf = Buffer.from('fake-pdf-data');
    mockedExportUsersPdfService.mockResolvedValue(fakePdf);

    const res = await request(app)
      .get('/api/admin/exportUsersPDF')
      .set('Authorization', 'Bearer admin-token');

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toBe('application/pdf');
    expect(res.header['content-disposition']).toContain('reporteUsuarios.pdf');
    expect(res.body).toEqual(fakePdf);
  });

  test('should return 401 if no valid token', async () => {
    const res = await request(app).get('/api/admin/exportUsersPDF');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Unauthorized' });
  });

  test('should return 404 if no users to export', async () => {
    mockedExportUsersPdfService.mockRejectedValue(
      new Error('There are no users to export.')
    );

    const res = await request(app)
      .get('/api/admin/exportUsersPDF')
      .set('Authorization', 'Bearer admin-token');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'No users found to export.' });
  });
});
