import { registerUserService, registerAdminService } from '../../src/features/users/services/register.service';
import * as userRepository from '../../src/features/users/repositories/user.repository';
import * as adminRepository from '../../src/features/users/repositories/admin.repository';
import { ConflictError, UnauthorizedError, InternalServerError } from '../../src/utils/errors/api-error';
import axios from 'axios';

// Mock repositories and axios
jest.mock('../../src/features/users/repositories/user.repository');
jest.mock('../../src/features/users/repositories/admin.repository');
jest.mock('axios');

describe('Register Services', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (axios.post as jest.Mock).mockResolvedValue({});
  });

  describe('registerUserService', () => {
    const validUserData = {
      email: 'test@ucr.ac.cr',
      full_name: 'Test User',
      auth_id: 'test-auth-id',
      auth_token: 'test-auth-token'
    };

    it('should successfully register a new user', async () => {
      // Mock repository functions
      (userRepository.findByEmailUser as jest.Mock).mockResolvedValue(null);
      (userRepository.createUser as jest.Mock).mockResolvedValue({ id: '1', ...validUserData });

      const result = await registerUserService(validUserData);

      expect(result).toEqual({
        message: 'User registered successfully.'
      });

      expect(userRepository.createUser).toHaveBeenCalledWith(expect.objectContaining({
        email: validUserData.email,
        full_name: validUserData.full_name,
        username: validUserData.email.split('@')[0],
        profile_picture: expect.any(String),
        auth_id: validUserData.auth_id,
        is_active: true,
        created_at: expect.any(Date),
        last_login: null
      }));

      // Verify email notification was attempted with correct data
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String), // URL doesn't matter since we're mocking
        {
          email: validUserData.email,
          full_name: validUserData.full_name,
          userType: 'mobile'
        }
      );
    });

    it('should successfully register even if email notification fails', async () => {
      (userRepository.findByEmailUser as jest.Mock).mockResolvedValue(null);
      (userRepository.createUser as jest.Mock).mockResolvedValue({ id: '1', ...validUserData });
      (axios.post as jest.Mock).mockRejectedValue(new Error('Email service unavailable'));

      const result = await registerUserService(validUserData);

      expect(result).toEqual({
        message: 'User registered successfully.'
      });
    });

    it('should throw ConflictError when user email already exists', async () => {
      (userRepository.findByEmailUser as jest.Mock).mockResolvedValue({ id: '1', ...validUserData });

      await expect(registerUserService(validUserData))
        .rejects.toThrow(ConflictError);
    });

    it('should throw InternalServerError when repository fails', async () => {
      (userRepository.findByEmailUser as jest.Mock).mockResolvedValue(null);
      (userRepository.createUser as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(registerUserService(validUserData))
        .rejects.toThrow(InternalServerError);
    });
  });

  describe('registerAdminService', () => {
    const validAdminData = {
      email: 'admin@ucr.ac.cr',
      full_name: 'Admin User',
      auth_id: 'admin-auth-id',
      auth_token: 'admin-auth-token'
    };

    it('should successfully register a new admin', async () => {
      // Mock repository functions
      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValue(null);
      (adminRepository.createAdmin as jest.Mock).mockResolvedValue({ id: '1', ...validAdminData });

      const result = await registerAdminService(validAdminData, 'admin');

      expect(result).toEqual({
        message: 'Admin registered successfully.'
      });

      expect(adminRepository.createAdmin).toHaveBeenCalledWith(expect.objectContaining({
        email: validAdminData.email,
        full_name: validAdminData.full_name,
        auth_id: validAdminData.auth_id,
        is_active: true,
        created_at: expect.any(Date),
        last_login: null
      }));

      // Verify email notification was attempted with correct data
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String), // URL doesn't matter since we're mocking
        {
          email: validAdminData.email,
          full_name: validAdminData.full_name,
          userType: 'web'
        }
      );
    });

    it('should successfully register even if email notification fails', async () => {
      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValue(null);
      (adminRepository.createAdmin as jest.Mock).mockResolvedValue({ id: '1', ...validAdminData });
      (axios.post as jest.Mock).mockRejectedValue(new Error('Email service unavailable'));

      const result = await registerAdminService(validAdminData, 'admin');

      expect(result).toEqual({
        message: 'Admin registered successfully.'
      });
    });

    it('should throw ConflictError when admin email already exists', async () => {
      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValue({ id: '1', ...validAdminData });

      await expect(registerAdminService(validAdminData, 'admin'))
        .rejects.toThrow(ConflictError);
    });

    it('should throw UnauthorizedError when role is not admin', async () => {
      await expect(registerAdminService(validAdminData, 'user'))
        .rejects.toThrow(UnauthorizedError);
      
      expect(adminRepository.createAdmin).not.toHaveBeenCalled();
    });

    it('should throw InternalServerError when repository fails', async () => {
      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValue(null);
      (adminRepository.createAdmin as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(registerAdminService(validAdminData, 'admin'))
        .rejects.toThrow(InternalServerError);
    });
  });
});