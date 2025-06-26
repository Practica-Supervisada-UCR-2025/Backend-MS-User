import request from 'supertest';
import express from 'express';

// ⬅️ Mock antes de importar rutas
jest.mock('../../src/features/middleware/authenticate.middleware', () => ({
  authenticateJWT: jest.fn((_req: any, _res: any, next: any) => next()),
}));

import getAllUsersRoutes from '../../src/features/users/routes/getAllUsers.routes';
import { getAllUsersService } from '../../src/features/users/services/getAllUsers.service';

jest.mock('../../src/features/users/services/getAllUsers.service');
const mockGetAllUsersService = getAllUsersService as jest.Mock;

const app = express();
app.use(express.json());
app.use('/api', getAllUsersRoutes);

describe('GET /api/users/get/all route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and user data when query params are valid', async () => {
    const mockResponse = {
      message: 'Active users fetched successfully',
      data: [{ id: 'user-1' }],
      metadata: {
        last_time: '2025-06-22T00:00:00Z',
        remainingItems: 0,
        remainingPages: 0,
      },
    };

    mockGetAllUsersService.mockResolvedValueOnce(mockResponse);

    const response = await request(app)
      .get('/api/users/get/all')
      .query({ created_after: '2025-06-01T00:00:00Z', limit: 1 })
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
    expect(mockGetAllUsersService).toHaveBeenCalledWith({
      created_after: '2025-06-01T00:00:00Z',
      limit: 1,
    });
  });

  it('should return 500 if the service throws', async () => {
    mockGetAllUsersService.mockRejectedValueOnce(new Error('Service failure'));

    const response = await request(app)
      .get('/api/users/get/all')
      .query({ created_after: '2025-06-01T00:00:00Z', limit: 1 })
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to fetch active users.' });
  });
});
