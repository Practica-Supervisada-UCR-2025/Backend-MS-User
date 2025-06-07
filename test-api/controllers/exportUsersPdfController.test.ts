import { exportUsersPdfController } from '../../src/features/users/controllers/exportUsersPdf.controller';
import { exportUsersPdfService } from '../../src/features/users/services/exportUsersPdf.service';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../src/features/middleware/authenticate.middleware';
// Mock manual del servicio
jest.mock('../../src/features/users/services/exportUsersPdf.service');
const mockedExportUsersPdfService = exportUsersPdfService as jest.Mock;

describe('exportUsersPdfController', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      user: { email: 'admin@example.com', role: 'admin', uuid: '123e4567-e89b-12d3-a456-426614174000' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockedExportUsersPdfService.mockReset();
  });

  test('should return PDF buffer for admin user', async () => {
    const fakePdf = Buffer.from('fake-pdf');
    mockedExportUsersPdfService.mockResolvedValue(fakePdf);

    await exportUsersPdfController(req as Request, res as Response);

    expect(mockedExportUsersPdfService).toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reporteUsuarios.pdf"',
    });
    expect(res.send).toHaveBeenCalledWith(fakePdf);
  });

  test('should return 403 if user is not admin', async () => {
    req.user = { email: 'user@example.com', role: 'user', uuid: '123e4567-e89b-12d3-a456-426614174001' };

    await exportUsersPdfController(req as Request, res as Response);

    expect(mockedExportUsersPdfService).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied. You must be an admin to access this endpoint.',
    });
  });

  test('should return 404 if no users to export', async () => {
    mockedExportUsersPdfService.mockRejectedValue(new Error('There are no users to export.'));

    await exportUsersPdfController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No users found to export.',
    });
  });

  test('should return 500 on unexpected error', async () => {
    mockedExportUsersPdfService.mockRejectedValue(new Error('Database failure'));

    await exportUsersPdfController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Failed to generate PDF.',
    });
  });

  test('should return 403 if user is undefined', async () => {
    req.user = undefined;

    await exportUsersPdfController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied. You must be an admin to access this endpoint.',
    });
  });
});
