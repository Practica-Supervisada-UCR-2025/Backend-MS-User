// tests/controllers/login.controller.test.ts
import { loginUserController, loginAdminController } from '../../src/features/users/controllers/login.controller';
import { loginUserService, loginAdminService } from '../../src/features/users/services/login.service';
import { UnauthorizedError } from '../../src/utils/errors/api-error';

// Mocks
jest.mock('../../src/features/users/services/login.service');

const mockLoginUserService = loginUserService as jest.Mock;
const mockLoginAdminService = loginAdminService as jest.Mock;

describe('Login Controllers', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('loginUserController', () => {
    it('should respond with 200 and access_token when token is valid', async () => {
      const mockToken = { access_token: 'jwt-user-token' };
      req.body.auth_token = 'firebase-valid-token';
      mockLoginUserService.mockResolvedValueOnce(mockToken);

      await loginUserController(req, res, next);

      expect(mockLoginUserService).toHaveBeenCalledWith('firebase-valid-token');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockToken);
    });

    it('should call next with UnauthorizedError when no token is provided', async () => {
      req.body = {}; // no auth_token

      await loginUserController(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with unexpected errors', async () => {
      const error = new Error('Unexpected Error');
      req.body.auth_token = 'some-token';
      mockLoginUserService.mockRejectedValueOnce(error);

      await loginUserController(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('loginAdminController', () => {
    it('should respond with 200 and access_token when token is valid', async () => {
      const mockToken = { access_token: 'jwt-admin-token' };
      req.body.auth_token = 'firebase-valid-token';
      mockLoginAdminService.mockResolvedValueOnce(mockToken);

      await loginAdminController(req, res, next);

      expect(mockLoginAdminService).toHaveBeenCalledWith('firebase-valid-token');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockToken);
    });

    it('should call next with UnauthorizedError when no token is provided', async () => {
      req.body = {}; // no auth_token

      await loginAdminController(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with unexpected errors', async () => {
      const error = new Error('Unexpected error');
      req.body.auth_token = 'some-token';
      mockLoginAdminService.mockRejectedValueOnce(error);

      await loginAdminController(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
