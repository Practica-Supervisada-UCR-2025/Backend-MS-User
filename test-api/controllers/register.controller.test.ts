import request from 'supertest';
import express, { ErrorRequestHandler } from 'express';
import registerRoutes from '../../src/features/users/routes/register.routes';
import { errorHandler } from '../../src/utils/errors/error-handler.middleware';
import * as userRepository from '../../src/features/users/repositories/user.repository';
import * as adminRepository from '../../src/features/users/repositories/admin.repository';

// Import the mock instead of the real firebase config
import mockAdmin from '../mocks/firebase.mock';

// Mock the entire firebase config module
jest.mock('../../src/config/firebase', () => ({
  __esModule: true,
  default: mockAdmin,
}));

jest.mock('../../src/features/users/repositories/user.repository');
jest.mock('../../src/features/users/repositories/admin.repository');

// Mock authenticate middleware
jest.mock('../../src/features/middleware/authenticate.middleware', () => {
  const { UnauthorizedError } = require('../../src/utils/errors/api-error');
  return {
    validateAuth: (req: any, res: any, next: any) => next(),
    authenticateJWT: (req: any, res: any, next: any) => {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer admin-token')) {
        req.user = { role: 'admin' };
        next();
      } else {
        next(new UnauthorizedError('Unauthorized'));
      }
    }
  };
});

describe('Register Controller Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/', registerRoutes);
    app.use(errorHandler as ErrorRequestHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAdmin.auth().verifyIdToken.mockReset();
  });

  describe('POST /user/auth/register', () => {
    const validUserData = {
      email: 'test@ucr.ac.cr',
      full_name: 'Test User',
      auth_id: 'test-auth-id',
      auth_token: 'valid-firebase-token'
    };

    it('should successfully register a new user', async () => {
      // Mock Firebase verification
      mockAdmin.auth().verifyIdToken.mockResolvedValueOnce({
        email: validUserData.email
      });

      // Mock repository
      (userRepository.findByEmailUser as jest.Mock).mockResolvedValueOnce(null);
      (userRepository.createUser as jest.Mock).mockResolvedValueOnce({ id: '1', ...validUserData });

      const response = await request(app)
        .post('/user/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'User registered successfully.'
      });
    });

    it('should return 409 when user already exists', async () => {
      // Mock Firebase verification
      mockAdmin.auth().verifyIdToken.mockResolvedValueOnce({
        email: validUserData.email
      });

      // Mock repository
      (userRepository.findByEmailUser as jest.Mock).mockResolvedValueOnce({ id: '1', ...validUserData });

      const response = await request(app)
        .post('/user/auth/register')
        .send(validUserData)
        .expect(409);

      expect(response.body).toEqual({
        message: 'Email already registered'
      });
    });
  });

  describe('POST /admin/auth/register', () => {
    const validAdminData = {
      email: 'admin@ucr.ac.cr',
      full_name: 'Admin User',
      auth_id: 'admin-auth-id',
      auth_token: 'valid-firebase-token'
    };

    it('should successfully register a new admin with valid admin role', async () => {
      // Mock Firebase verification
      mockAdmin.auth().verifyIdToken.mockResolvedValueOnce({
        email: validAdminData.email
      });

      // Mock repository
      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValueOnce(null);
      (adminRepository.createAdmin as jest.Mock).mockResolvedValueOnce({ id: '1', ...validAdminData });

      const response = await request(app)
        .post('/admin/auth/register')
        .set('Authorization', 'Bearer admin-token')
        .send(validAdminData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Admin registered successfully.'
      });
    });

    it('should return 403 when trying to register admin without admin role', async () => {
      await request(app)
        .post('/admin/auth/register')
        .send(validAdminData)
        .expect(401)
        .expect({
          message: 'Unauthorized'
        });
    });
  });
});