// Mock setup must be before imports
const mockAdmin = {
  auth: jest.fn().mockReturnThis(),
  verifyIdToken: jest.fn(),
};

jest.mock('../../src/config/firebase', () => mockAdmin);
jest.mock('../../src/features/users/services/jwt.service');

jest.mock('../../src/features/users/repositories/suspension.repository', () => ({
  isUserSuspended: jest.fn().mockResolvedValue(false),
}));

import { Request, Response, NextFunction } from 'express';
import { authenticateJWT, validateAuth } from '../../src/features/middleware/authenticate.middleware';
import { JwtService } from '../../src/features/users/services/jwt.service';
import { UnauthorizedError } from '../../src/utils/errors/api-error';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      body: {}
    };
    mockResponse = {};
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateJWT', () => {
    it('should throw UnauthorizedError when no token provided', () => {
      authenticateJWT(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.message).toBe('No token provided');
    });

    it('should throw UnauthorizedError when token format is invalid', () => {
      mockRequest.headers = { authorization: 'InvalidFormat token123' };

      authenticateJWT(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.message).toBe('Invalid token format');
    });

    it('should throw UnauthorizedError when token is empty', () => {
      mockRequest.headers = { authorization: 'Bearer ' };

      authenticateJWT(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.message).toBe('Invalid token format');
    });

    it('should set user role to admin when token is valid with admin role', async () => {
      mockRequest.headers = { authorization: 'Bearer validToken' };
      const mockDecodedToken = { role: 'admin', email: 'example@ucr.ac.cr', uuid: '123456789101' };

      (JwtService.prototype.verifyToken as jest.Mock).mockReturnValue(mockDecodedToken);

      await authenticateJWT(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect((mockRequest as any).user.role).toBe('admin');
    });

    it('should set user role to user when token is valid with non-admin role', async () => {
      mockRequest.headers = { authorization: 'Bearer validToken' };
      const mockDecodedToken = { role: 'user', email: 'example@ucr.ac.cr', uuid: '123456789101' };

      (JwtService.prototype.verifyToken as jest.Mock).mockReturnValue(mockDecodedToken);

      await authenticateJWT(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect((mockRequest as any).user.role).toBe('user');
    });

    it('should throw UnauthorizedError when token is valid but missing email', async () => {
      mockRequest.headers = { authorization: 'Bearer validToken' };
      const mockDecodedToken = { role: 'user', uuid: '123456789101' }; // no email

      (JwtService.prototype.verifyToken as jest.Mock).mockReturnValue(mockDecodedToken);

      await authenticateJWT(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.message).toBe('Unauthorized');
      expect(error.details).toEqual(['Not registered user']);
    });

    it('should allow access when admin is suspended', async () => {
      const { isUserSuspended } = require('../../src/features/users/repositories/suspension.repository');
      (isUserSuspended as jest.Mock).mockResolvedValueOnce(true); // still suspended

      mockRequest.headers = { authorization: 'Bearer validToken' };
      const mockDecodedToken = {
        role: 'admin',
        email: 'admin@ucr.ac.cr',
        uuid: 'admin123'
      };

      (JwtService.prototype.verifyToken as jest.Mock).mockReturnValue(mockDecodedToken);

      await authenticateJWT(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(); // admin should be allowed
      expect((mockRequest as any).user.role).toBe('admin');
    });

    it('should throw ForbiddenError when non-admin user is suspended', async () => {
      const { isUserSuspended } = require('../../src/features/users/repositories/suspension.repository');
      (isUserSuspended as jest.Mock).mockResolvedValueOnce(true); // ← simulate suspension

      mockRequest.headers = { authorization: 'Bearer validToken' };
      const mockDecodedToken = {
        role: 'user',
        email: 'example@ucr.ac.cr',
        uuid: '123456789101'
      };

      (JwtService.prototype.verifyToken as jest.Mock).mockReturnValue(mockDecodedToken);

      await authenticateJWT(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
      );

      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.name).toBe('ForbiddenError');
      expect(error.message).toBe('Unauthorized');
      expect(error.details).toContain('User suspended');
    });
  });

  // validateAuth se mantiene igual
  describe('validateAuth', () => {
    it('should throw UnauthorizedError when no auth_token provided', async () => {
      await validateAuth(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
      );

      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.message).toBe('Unauthorized');
      expect(Array.isArray(error.details)).toBe(true);
      expect(error.details).toEqual(['No auth token provided']);
    });

    it('should throw UnauthorizedError when Firebase token is invalid', async () => {
      mockRequest.body = { auth_token: 'invalidToken' };
      mockAdmin.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await validateAuth(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
      );

      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.message).toBe('Unauthorized');
      expect(Array.isArray(error.details)).toBe(true);
      expect(error.details).toEqual(['Invalid auth token']);
    });

    it('should call next() when Firebase token is valid', async () => {
      mockRequest.body = { auth_token: 'validToken' };
      mockAdmin.verifyIdToken.mockResolvedValue({});

      await validateAuth(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockAdmin.verifyIdToken).toHaveBeenCalledWith('validToken');
    });

    it('should throw UnauthorizedError when auth_token is an empty string', async () => {
      mockRequest.body = { auth_token: '' };

      await validateAuth(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
      );

      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.message).toBe('Unauthorized');
      expect(error.details).toEqual(['No auth token provided']);
    });

    it('should throw UnauthorizedError when Firebase token verification throws an unexpected error', async () => {
      mockRequest.body = { auth_token: 'validToken' };
      mockAdmin.verifyIdToken.mockRejectedValueOnce(new Error('Unexpected error'));

      await validateAuth(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
      );

      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.message).toBe('Unauthorized');
      expect(error.details).toEqual(['Invalid auth token']);
    });
  });
});
