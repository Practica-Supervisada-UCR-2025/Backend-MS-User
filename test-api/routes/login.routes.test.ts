// tests/routes/login.routes.test.ts
import request from 'supertest';
import express from 'express';
import loginRoutes from '../../src/features/users/routes/login.routes';
import { loginUserService, loginAdminService } from '../../src/features/users/services/login.service';

jest.mock('../../src/features/users/services/login.service');

const mockLoginUserService = loginUserService as jest.Mock;
const mockLoginAdminService = loginAdminService as jest.Mock;

// Creamos una app de testing
const app = express();
app.use(express.json());
app.use(loginRoutes);

describe('Login Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /user/uth/login', () => {
    it('should return 200 and access_token when request is valid', async () => {
      mockLoginUserService.mockResolvedValueOnce({ access_token: 'jwt-user-token' });

      const response = await request(app)
        .post('/user/auth/login')
        .send({ auth_token: 'valid-token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token', 'jwt-user-token');
      expect(mockLoginUserService).toHaveBeenCalledWith('valid-token');
    });

    it('should return 500 if controller throws an error', async () => {
      mockLoginUserService.mockRejectedValueOnce(new Error('Boom!'));

      const response = await request(app)
        .post('/user/auth/login')
        .send({ auth_token: 'any' });

      expect(response.status).toBe(500); // puede ser personalizado si tienes errorHandler
    });
  });

  describe('POST /admin/auth/login', () => {
    it('should return 200 and access_token for valid admin login', async () => {
      mockLoginAdminService.mockResolvedValueOnce({ access_token: 'jwt-admin-token' });

      const response = await request(app)
        .post('/admin/auth/login')
        .send({ auth_token: 'valid-token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token', 'jwt-admin-token');
      expect(mockLoginAdminService).toHaveBeenCalledWith('valid-token');
    });
  });
});
