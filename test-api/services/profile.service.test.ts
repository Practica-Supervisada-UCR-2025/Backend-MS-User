import { 
  getUserProfileService, 
  getAdminProfileService, 
  updateUserProfileService, 
  updateAdminProfileService 
} from '../../src/features/users/services/profile.service';
import * as userRepository from '../../src/features/users/repositories/user.repository';
import * as adminRepository from '../../src/features/users/repositories/admin.repository';
import { NotFoundError, BadRequestError } from '../../src/utils/errors/api-error';

// Mock repositories
jest.mock('../../src/features/users/repositories/user.repository');
jest.mock('../../src/features/users/repositories/admin.repository');

describe('Profile Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfileService', () => {
    it('should return user profile when user exists', async () => {
      const mockUser = {
        id: '1',
        email: 'user@ucr.ac.cr',
        username: 'testuser',
        full_name: 'Test User',
        profile_picture: 'https://example.com/image.jpg',
        auth_id: 'auth123',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      (userRepository.findByEmailUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserProfileService('user@ucr.ac.cr');

      expect(result).toEqual({
        message: "User profile retrieved successfully",
        userData: {
          email: mockUser.email,
          username: mockUser.username,
          full_name: mockUser.full_name,
          profile_picture: mockUser.profile_picture
        }
      });

      expect(userRepository.findByEmailUser).toHaveBeenCalledWith('user@ucr.ac.cr');
    });

    it('should throw NotFoundError when user does not exist', async () => {
      (userRepository.findByEmailUser as jest.Mock).mockResolvedValue(null);

      await expect(getUserProfileService('nonexistent@ucr.ac.cr'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('getAdminProfileService', () => {
    it('should return admin profile when admin exists', async () => {
      const mockAdmin = {
        id: '1',
        email: 'admin@ucr.ac.cr',
        full_name: 'Admin User',
        profile_picture: 'https://example.com/admin.jpg',
        auth_id: 'auth456',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValue(mockAdmin);

      const result = await getAdminProfileService('admin@ucr.ac.cr');

      expect(result).toEqual({
        message: "Admin profile retrieved successfully",
        adminData: {
          email: mockAdmin.email,
          full_name: mockAdmin.full_name,
          profile_picture: mockAdmin.profile_picture
        }
      });

      expect(adminRepository.findByEmailAdmin).toHaveBeenCalledWith('admin@ucr.ac.cr');
    });

    it('should throw NotFoundError when admin does not exist', async () => {
      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValue(null);

      await expect(getAdminProfileService('nonexistent@ucr.ac.cr'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('updateUserProfileService', () => {
    it('should update user profile successfully', async () => {
      const originalUser = {
        id: '1',
        email: 'user@ucr.ac.cr',
        username: 'oldusername',
        full_name: 'Old Name',
        profile_picture: 'https://example.com/old.jpg',
        auth_id: 'auth123',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      const updatedUser = {
        ...originalUser,
        username: 'newusername',
        full_name: 'New Name',
        profile_picture: 'https://example.com/new.jpg'
      };

      const updateData = {
        email: 'user@ucr.ac.cr',
        username: 'newusername',
        full_name: 'New Name',
        profile_picture: 'https://example.com/new.jpg'
      };

      (userRepository.findByEmailUser as jest.Mock).mockResolvedValue(originalUser);
      (userRepository.updateUserProfile as jest.Mock).mockResolvedValue(updatedUser);

      const result = await updateUserProfileService('user@ucr.ac.cr', updateData);

      expect(result).toEqual({
        message: "User profile updated successfully",
        userData: {
          email: updatedUser.email,
          username: updatedUser.username,
          full_name: updatedUser.full_name,
          profile_picture: updatedUser.profile_picture
        }
      });

      expect(userRepository.findByEmailUser).toHaveBeenCalledWith('user@ucr.ac.cr');
      expect(userRepository.updateUserProfile).toHaveBeenCalledWith('user@ucr.ac.cr', {
        username: 'newusername',
        full_name: 'New Name',
        profile_picture: 'https://example.com/new.jpg'
      });
    });

    it('should update user profile with partial data', async () => {
      const originalUser = {
        id: '1',
        email: 'user@ucr.ac.cr',
        username: 'oldusername',
        full_name: 'Old Name',
        profile_picture: 'https://example.com/old.jpg',
        auth_id: 'auth123',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      const updatedUser = {
        ...originalUser,
        full_name: 'New Name'
      };

      const updateData = {
        email: 'user@ucr.ac.cr',
        full_name: 'New Name'
      };

      (userRepository.findByEmailUser as jest.Mock).mockResolvedValue(originalUser);
      (userRepository.updateUserProfile as jest.Mock).mockResolvedValue(updatedUser);

      const result = await updateUserProfileService('user@ucr.ac.cr', updateData);

      expect(result.userData.full_name).toBe('New Name');
      expect(userRepository.updateUserProfile).toHaveBeenCalledWith('user@ucr.ac.cr', {
        full_name: 'New Name'
      });
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const updateData = {
        email: 'nonexistent@ucr.ac.cr',
        username: 'newusername'
      };

      (userRepository.findByEmailUser as jest.Mock).mockResolvedValue(null);

      await expect(updateUserProfileService('nonexistent@ucr.ac.cr', updateData))
        .rejects
        .toThrow(NotFoundError);

      expect(userRepository.updateUserProfile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when no fields to update are provided', async () => {
      const mockUser = {
        id: '1',
        email: 'user@ucr.ac.cr',
        username: 'testuser',
        full_name: 'Test User',
        profile_picture: 'https://example.com/image.jpg',
        auth_id: 'auth123',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };
      
      const updateData = {
        email: 'user@ucr.ac.cr'
        // No other fields provided
      };

      (userRepository.findByEmailUser as jest.Mock).mockResolvedValue(mockUser);

      await expect(updateUserProfileService('user@ucr.ac.cr', updateData))
        .rejects
        .toThrow(BadRequestError);

      expect(userRepository.updateUserProfile).not.toHaveBeenCalled();
    });

    it('should throw error when repository call fails', async () => {
      const mockUser = {
        id: '1',
        email: 'user@ucr.ac.cr',
        username: 'testuser',
        full_name: 'Test User',
        profile_picture: 'https://example.com/image.jpg',
        auth_id: 'auth123',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      const updateData = {
        email: 'user@ucr.ac.cr',
        username: 'newusername'
      };

      (userRepository.findByEmailUser as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.updateUserProfile as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(updateUserProfileService('user@ucr.ac.cr', updateData))
        .rejects
        .toThrow(BadRequestError);
    });
  });

  describe('updateAdminProfileService', () => {
    it('should update admin profile successfully', async () => {
      const originalAdmin = {
        id: '1',
        email: 'admin@ucr.ac.cr',
        full_name: 'Old Admin',
        profile_picture: 'https://example.com/old-admin.jpg',
        auth_id: 'auth456',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      const updatedAdmin = {
        ...originalAdmin,
        full_name: 'New Admin',
        profile_picture: 'https://example.com/new-admin.jpg'
      };

      const updateData = {
        email: 'admin@ucr.ac.cr',
        full_name: 'New Admin',
        profile_picture: 'https://example.com/new-admin.jpg'
      };

      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValue(originalAdmin);
      (adminRepository.updateAdminProfile as jest.Mock).mockResolvedValue(updatedAdmin);

      const result = await updateAdminProfileService('admin@ucr.ac.cr', updateData);

      expect(result).toEqual({
        message: "Admin profile updated successfully",
        adminData: {
          email: updatedAdmin.email,
          full_name: updatedAdmin.full_name,
          profile_picture: updatedAdmin.profile_picture
        }
      });

      expect(adminRepository.findByEmailAdmin).toHaveBeenCalledWith('admin@ucr.ac.cr');
      expect(adminRepository.updateAdminProfile).toHaveBeenCalledWith('admin@ucr.ac.cr', {
        full_name: 'New Admin',
        profile_picture: 'https://example.com/new-admin.jpg'
      });
    });

    it('should update admin profile with partial data', async () => {
      const originalAdmin = {
        id: '1',
        email: 'admin@ucr.ac.cr',
        full_name: 'Old Admin',
        profile_picture: 'https://example.com/old-admin.jpg',
        auth_id: 'auth456',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      const updatedAdmin = {
        ...originalAdmin,
        full_name: 'New Admin'
      };

      const updateData = {
        email: 'admin@ucr.ac.cr',
        full_name: 'New Admin'
      };

      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValue(originalAdmin);
      (adminRepository.updateAdminProfile as jest.Mock).mockResolvedValue(updatedAdmin);

      const result = await updateAdminProfileService('admin@ucr.ac.cr', updateData);

      expect(result.adminData.full_name).toBe('New Admin');
      expect(adminRepository.updateAdminProfile).toHaveBeenCalledWith('admin@ucr.ac.cr', {
        full_name: 'New Admin'
      });
    });

    it('should throw NotFoundError when admin does not exist', async () => {
      const updateData = {
        email: 'nonexistent@ucr.ac.cr',
        full_name: 'New Admin'
      };

      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValue(null);

      await expect(updateAdminProfileService('nonexistent@ucr.ac.cr', updateData))
        .rejects
        .toThrow(NotFoundError);

      expect(adminRepository.updateAdminProfile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when no fields to update are provided', async () => {
      const mockAdmin = {
        id: '1',
        email: 'admin@ucr.ac.cr',
        full_name: 'Admin User',
        profile_picture: 'https://example.com/admin.jpg',
        auth_id: 'auth456',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };
      
      const updateData = {
        email: 'admin@ucr.ac.cr'
        // No other fields provided
      };

      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValue(mockAdmin);

      await expect(updateAdminProfileService('admin@ucr.ac.cr', updateData))
        .rejects
        .toThrow(BadRequestError);

      expect(adminRepository.updateAdminProfile).not.toHaveBeenCalled();
    });

    it('should throw error when repository call fails', async () => {
      const mockAdmin = {
        id: '1',
        email: 'admin@ucr.ac.cr',
        full_name: 'Admin User',
        profile_picture: 'https://example.com/admin.jpg',
        auth_id: 'auth456',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      const updateData = {
        email: 'admin@ucr.ac.cr',
        full_name: 'New Admin'
      };

      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValue(mockAdmin);
      (adminRepository.updateAdminProfile as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(updateAdminProfileService('admin@ucr.ac.cr', updateData))
        .rejects
        .toThrow(BadRequestError);
    });
  });
});