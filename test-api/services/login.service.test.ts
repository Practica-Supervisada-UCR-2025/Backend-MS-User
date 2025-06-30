// tests/services/auth.service.test.ts
import { loginUserService, loginAdminService } from '../../src/features/users/services/login.service';
import {UnauthorizedError, InternalServerError, ForbiddenError} from '../../src/utils/errors/api-error';
import admin from '../../src/config/firebase';
import jwt from 'jsonwebtoken';

// Mocks
jest.mock('../../src/features/users/repositories/user.repository', () => ({
  findByEmailUser: jest.fn()
}));

jest.mock('../../src/features/users/repositories/admin.repository', () => ({
  findByEmailAdmin: jest.fn()
}));

jest.mock('../../src/features/users/repositories/suspension.repository', () => ({
  isUserSuspended: jest.fn()
}));

import { isUserSuspended } from '../../src/features/users/repositories/suspension.repository';


// @ts-ignore
const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
import { findByEmailUser } from '../../src/features/users/repositories/user.repository';
import { findByEmailAdmin } from '../../src/features/users/repositories/admin.repository';

describe('Auth Service', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginUserService', () => {
    it('should throw UnauthorizedError if user is not found in DB', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ email: 'user@ucr.ac.cr', uid: '123' });
      (findByEmailUser as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(loginUserService('valid-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if Firebase token is invalid', async () => {
      mockVerifyIdToken.mockRejectedValueOnce(new Error('invalid token'));

      await expect(loginUserService('invalid-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if token has no email', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ uid: '123' }); // no email

      await expect(loginUserService('token-without-email')).rejects.toThrow(UnauthorizedError);
    });

    it('should return a JWT token containing role=user, containing uuid and email', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ email: 'user@ucr.ac.cr', uid: 'user123' });
      (findByEmailUser as jest.Mock).mockResolvedValueOnce({ id: '123', email: 'user@ucr.ac.cr', is_active: true });

      const result = await loginUserService('valid-token');

      expect(result).toHaveProperty('access_token');
      expect(typeof result.access_token).toBe('string');

      const decoded = jwt.decode(result.access_token) as 
      { 
        role: string,
        email: string,
        uuid: string
      };
      expect(decoded.role).toBe('user');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('uuid');
    });

    it('should throw UnauthorizedError if user is inactive', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ email: 'user@ucr.ac.cr', uid: '123' });
      (findByEmailUser as jest.Mock).mockResolvedValueOnce({ id: '123', email: 'user@ucr.ac.cr', is_active: false });

      await expect(loginUserService('valid-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if user ID is null', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ email: 'user@ucr.ac.cr', uid: '123' });
      (findByEmailUser as jest.Mock).mockResolvedValueOnce({ id: null, email: 'user@ucr.ac.cr', is_active: true });

      await expect(loginUserService('valid-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw ForbiddenError if user is suspended', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ email: 'user@ucr.ac.cr', uid: 'user123' });
      (findByEmailUser as jest.Mock).mockResolvedValueOnce({ id: 'user123', email: 'user@ucr.ac.cr', is_active: true });
      (isUserSuspended as jest.Mock).mockResolvedValueOnce(true);

      try {
        await loginUserService('valid-token');
        fail('Expected ForbiddenError, but no error was thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ForbiddenError);
        expect(error.message).toBe('Forbidden');
        expect(error.details).toEqual(['User account is suspended']);
        expect(error.details).toContain('User account is suspended');
      }
    });

  });

  describe('loginAdminService', () => {
    it('should throw UnauthorizedError if token is invalid', async () => {
      mockVerifyIdToken.mockRejectedValueOnce(new Error('invalid token'));

      await expect(loginAdminService('invalid-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if admin is not found in DB', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ email: 'admin@ucr.ac.cr', uid: 'admin123' });
      (findByEmailAdmin as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(loginAdminService('valid-admin-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if token has no email', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ uid: 'admin123' }); // no email

      await expect(loginAdminService('token-without-email')).rejects.toThrow(UnauthorizedError);
    });

    it('should return a JWT token containing role=admin, containing uuid and email', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ email: 'admin@ucr.ac.cr', uid: 'admin123' });
      (findByEmailAdmin as jest.Mock).mockResolvedValueOnce({ id: '123', email: 'admin@ucr.ac.cr', is_active: true });

      const result = await loginAdminService('valid-token');

      expect(result).toHaveProperty('access_token');
      expect(typeof result.access_token).toBe('string');

      const decoded = jwt.decode(result.access_token) as 
      { 
        role: string,
        email: string,
        uuid: string
      };
      expect(decoded.role).toBe('admin');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('uuid');
    });

    it('should throw UnauthorizedError if admin is inactive', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ email: 'admin@ucr.ac.cr', uid: 'admin123' });
      (findByEmailAdmin as jest.Mock).mockResolvedValueOnce({ id: '123', email: 'admin@ucr.ac.cr', is_active: false });

      await expect(loginAdminService('valid-admin-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if admin ID is null', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ email: 'admin@ucr.ac.cr', uid: 'admin123' });
      (findByEmailAdmin as jest.Mock).mockResolvedValueOnce({ id: null, email: 'admin@ucr.ac.cr', is_active: true });

      await expect(loginAdminService('valid-admin-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should log successful verification for valid admin', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockVerifyIdToken.mockResolvedValueOnce({ email: 'admin@ucr.ac.cr', uid: 'admin123' });
      (findByEmailAdmin as jest.Mock).mockResolvedValueOnce({ id: '123', email: 'admin@ucr.ac.cr', is_active: true });

      const result = await loginAdminService('valid-token');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Successful verification. Admin:',
        'admin123',
        'Email:',
        'admin@ucr.ac.cr',
        '123'
      );
      consoleSpy.mockRestore();
    });
  });

});
