import { getUserProfileService, getAdminProfileService } from '../../src/features/users/services/profile.service';
import * as userRepository from '../../src/features/users/repositories/user.repository';
import * as adminRepository from '../../src/features/users/repositories/admin.repository';
import { NotFoundError } from '../../src/utils/errors/api-error';

// Mock repositories
jest.mock('../../src/features/users/repositories/user.repository');
jest.mock('../../src/features/users/repositories/admin.repository');

describe('Profile Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfileService', () => {
    const validEmail = 'test@ucr.ac.cr';
    const mockUser = {
      id: '1',
      email: validEmail,
      full_name: 'Test User',
      username: 'testuser',
      profile_picture: 'http://example.com/pic.jpg',
      auth_id: 'auth-id-1',
      is_active: true,
      created_at: new Date(),
      last_login: null
    };

    it('should return user profile data when user exists', async () => {
      (userRepository.findByEmailUser as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await getUserProfileService(validEmail);

      expect(result).toEqual({
        message: 'User profile retrieved successfully',
        userData: {
          email: mockUser.email,
          username: mockUser.username,
          full_name: mockUser.full_name,
          profile_picture: mockUser.profile_picture
        }
      });
      expect(userRepository.findByEmailUser).toHaveBeenCalledWith(validEmail);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      (userRepository.findByEmailUser as jest.Mock).mockResolvedValueOnce(null);

      await expect(getUserProfileService(validEmail))
        .rejects.toThrow(NotFoundError);

      expect(userRepository.findByEmailUser).toHaveBeenCalledWith(validEmail);
    });
  });

  describe('getAdminProfileService', () => {
    const validEmail = 'admin@ucr.ac.cr';
    const mockAdmin = {
      id: '1',
      email: validEmail,
      full_name: 'Admin User',
      profile_picture: 'http://example.com/admin.jpg',
      auth_id: 'auth-id-2',
      is_active: true,
      created_at: new Date(),
      last_login: null
    };

    it('should return admin profile data when admin exists', async () => {
      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValueOnce(mockAdmin);

      const result = await getAdminProfileService(validEmail);

      expect(result).toEqual({
        message: 'Admin profile retrieved successfully',
        adminData: {
          email: mockAdmin.email,
          full_name: mockAdmin.full_name,
          profile_picture: mockAdmin.profile_picture
        }
      });
      expect(adminRepository.findByEmailAdmin).toHaveBeenCalledWith(validEmail);
    });

    it('should throw NotFoundError when admin does not exist', async () => {
      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValueOnce(null);

      await expect(getAdminProfileService(validEmail))
        .rejects.toThrow(NotFoundError);

      expect(adminRepository.findByEmailAdmin).toHaveBeenCalledWith(validEmail);
    });
  });
});