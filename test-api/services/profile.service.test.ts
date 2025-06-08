// At the top of your file, update the imports and mocks:
import { 
  getUserProfileService,
  getAdminProfileService,
  updateUserProfileService,
  updateAdminProfileService,
  getOtherUserProfileService
} from '../../src/features/users/services/profile.service';
import * as userRepository from '../../src/features/users/repositories/user.repository';
import * as adminRepository from '../../src/features/users/repositories/admin.repository';
import { NotFoundError, BadRequestError } from '../../src/utils/errors/api-error';
import { logProfileUpdate } from '../../src/features/users/services/audit.service';
import fetch from 'node-fetch';

// Mocks
jest.mock('../../src/features/users/repositories/user.repository');
jest.mock('../../src/features/users/repositories/admin.repository');
jest.mock('node-fetch');
jest.mock('../../src/features/users/services/audit.service');

const { Response } = jest.requireActual('node-fetch');

// Add this line to properly type the mocked fetch
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Profile Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfileService', () => {
    it('should return user profile data when user exists', async () => {
      const mockUser = {
        id: '1',
        email: 'user@ucr.ac.cr',
        username: 'testuser',
        full_name: 'Test User',
        profile_picture: 'http://example.com/pic.jpg',
        auth_id: 'firebase-auth-id',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      (userRepository.findByEmailUser as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await getUserProfileService('user@ucr.ac.cr');

      expect(userRepository.findByEmailUser).toHaveBeenCalledWith('user@ucr.ac.cr');
      expect(result).toEqual({
        message: 'User profile retrieved successfully',
        userData: {
          email: mockUser.email,
          username: mockUser.username,
          full_name: mockUser.full_name,
          profile_picture: mockUser.profile_picture
        }
      });
    });

    it('should throw NotFoundError when user does not exist', async () => {
      (userRepository.findByEmailUser as jest.Mock).mockResolvedValueOnce(null);

      await expect(getUserProfileService('nonexistent@ucr.ac.cr'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('getAdminProfileService', () => {
    it('should return admin profile data when admin exists', async () => {
      const mockAdmin = {
        id: '1',
        email: 'admin@ucr.ac.cr',
        full_name: 'Admin User',
        profile_picture: 'http://example.com/admin.jpg',
        auth_id: 'firebase-auth-id',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValueOnce(mockAdmin);

      const result = await getAdminProfileService('admin@ucr.ac.cr');

      expect(adminRepository.findByEmailAdmin).toHaveBeenCalledWith('admin@ucr.ac.cr');
      expect(result).toEqual({
        message: 'Admin profile retrieved successfully',
        adminData: {
          email: mockAdmin.email,
          full_name: mockAdmin.full_name,
          profile_picture: mockAdmin.profile_picture
        }
      });
    });

    it('should throw NotFoundError when admin does not exist', async () => {
      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValueOnce(null);

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
        profile_picture: 'http://example.com/old.jpg',
        auth_id: 'firebase-auth-id',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      const updatedUser = {
        ...originalUser,
        username: 'newusername',
        full_name: 'New Name'
      };

      const updateData = {
        username: 'newusername',
        full_name: 'New Name'
      };

      (userRepository.findByEmailUser as jest.Mock).mockResolvedValueOnce(originalUser);
      (userRepository.updateUserProfile as jest.Mock).mockResolvedValueOnce(updatedUser);

      const result = await updateUserProfileService('user@ucr.ac.cr', 'token', updateData);

      expect(userRepository.findByEmailUser).toHaveBeenCalledWith('user@ucr.ac.cr');
      expect(userRepository.updateUserProfile).toHaveBeenCalledWith('user@ucr.ac.cr', {
        username: 'newusername',
        full_name: 'New Name'
      });

      expect(logProfileUpdate).toHaveBeenCalledWith(
        'mobile',
        'user',
        '1',
        'user@ucr.ac.cr',
        ['username', 'full_name'],
        expect.objectContaining({
          username: 'oldusername',
          full_name: 'Old Name'
        }),
        expect.objectContaining({
          username: 'newusername',
          full_name: 'New Name'
        })
      );

      expect(result).toEqual({
        message: 'User profile updated successfully',
        userData: {
          email: updatedUser.email,
          username: updatedUser.username,
          full_name: updatedUser.full_name,
          profile_picture: updatedUser.profile_picture
        }
      });
    });

    it('should update user profile with image upload', async () => {
      const originalUser = {
        id: '1',
        email: 'user@ucr.ac.cr',
        username: 'testuser',
        full_name: 'Test User',
        profile_picture: 'http://example.com/old.jpg',
        auth_id: 'firebase-auth-id',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      const updatedUser = {
        ...originalUser,
        profile_picture: 'http://example.com/new.jpg'
      };

      const updateData = {};
      const fileBuffer = Buffer.from('test image data');
      const fileName = 'profile.jpg';
      const fileMimeType = 'image/jpeg';

      // Mock successful file upload
      mockedFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ fileUrl: 'http://example.com/new.jpg' }), { status: 200 })
      );

      (userRepository.findByEmailUser as jest.Mock).mockResolvedValueOnce(originalUser);
      (userRepository.updateUserProfile as jest.Mock).mockResolvedValueOnce(updatedUser);

      const result = await updateUserProfileService(
        'user@ucr.ac.cr', 
        'token', 
        updateData, 
        fileBuffer, 
        fileName, 
        fileMimeType
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/files/upload'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer token'
          })
        })
      );

      expect(userRepository.updateUserProfile).toHaveBeenCalledWith(
        'user@ucr.ac.cr', 
        expect.objectContaining({
          profile_picture: 'http://example.com/new.jpg'
        })
      );

      expect(result.userData.profile_picture).toBe('http://example.com/new.jpg');
    });

    it('should throw BadRequestError when no fields to update are provided', async () => {
      const originalUser = {
        id: '1',
        email: 'user@ucr.ac.cr',
        username: 'testuser',
        full_name: 'Test User',
        profile_picture: 'http://example.com/pic.jpg',
        auth_id: 'firebase-auth-id',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      (userRepository.findByEmailUser as jest.Mock).mockResolvedValueOnce(originalUser);

      await expect(updateUserProfileService('user@ucr.ac.cr', 'token', {}))
        .rejects
        .toThrow(BadRequestError);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      (userRepository.findByEmailUser as jest.Mock).mockResolvedValueOnce(null);

      await expect(updateUserProfileService('nonexistent@ucr.ac.cr', 'token', { username: 'newname' }))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw BadRequestError when image upload fails', async () => {
      const originalUser = {
        id: '1',
        email: 'user@ucr.ac.cr',
        username: 'testuser',
        full_name: 'Test User',
        profile_picture: 'http://example.com/old.jpg',
        auth_id: 'firebase-auth-id',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      const updateData = {};
      const fileBuffer = Buffer.from('test image data');
      const fileName = 'profile.jpg';
      const fileMimeType = 'image/jpeg';

      // Mock failed file upload
      mockedFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Upload failed' }), { status: 400 })
      );

      (userRepository.findByEmailUser as jest.Mock).mockResolvedValueOnce(originalUser);

      await expect(updateUserProfileService(
        'user@ucr.ac.cr', 
        'token', 
        updateData, 
        fileBuffer, 
        fileName, 
        fileMimeType
      ))
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
        profile_picture: 'http://example.com/old-admin.jpg',
        auth_id: 'firebase-auth-id',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      const updatedAdmin = {
        ...originalAdmin,
        full_name: 'New Admin'
      };

      const updateData = {
        full_name: 'New Admin'
      };

      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValueOnce(originalAdmin);
      (adminRepository.updateAdminProfile as jest.Mock).mockResolvedValueOnce(updatedAdmin);

      const result = await updateAdminProfileService('admin@ucr.ac.cr', 'token', updateData);

      expect(adminRepository.findByEmailAdmin).toHaveBeenCalledWith('admin@ucr.ac.cr');
      expect(adminRepository.updateAdminProfile).toHaveBeenCalledWith('admin@ucr.ac.cr', {
        full_name: 'New Admin'
      });

      expect(logProfileUpdate).toHaveBeenCalledWith(
        'web',
        'admin',
        '1',
        'admin@ucr.ac.cr',
        ['full_name'],
        expect.objectContaining({
          full_name: 'Old Admin'
        }),
        expect.objectContaining({
          full_name: 'New Admin'
        })
      );

      expect(result).toEqual({
        message: 'Admin profile updated successfully',
        adminData: {
          email: updatedAdmin.email,
          full_name: updatedAdmin.full_name,
          profile_picture: updatedAdmin.profile_picture
        }
      });
    });

    it('should update admin profile with image upload', async () => {
      const originalAdmin = {
        id: '1',
        email: 'admin@ucr.ac.cr',
        full_name: 'Admin User',
        profile_picture: 'http://example.com/old-admin.jpg',
        auth_id: 'firebase-auth-id',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      const updatedAdmin = {
        ...originalAdmin,
        profile_picture: 'http://example.com/new-admin.jpg'
      };

      const updateData = {};
      const fileBuffer = Buffer.from('test admin image data');
      const fileName = 'admin-profile.jpg';
      const fileMimeType = 'image/jpeg';

      // Mock successful file upload
      mockedFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ fileUrl: 'http://example.com/new-admin.jpg' }), { status: 200 })
      );

      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValueOnce(originalAdmin);
      (adminRepository.updateAdminProfile as jest.Mock).mockResolvedValueOnce(updatedAdmin);

      const result = await updateAdminProfileService(
        'admin@ucr.ac.cr', 
        'token', 
        updateData, 
        fileBuffer, 
        fileName, 
        fileMimeType
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/files/upload'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer token'
          })
        })
      );

      expect(adminRepository.updateAdminProfile).toHaveBeenCalledWith(
        'admin@ucr.ac.cr', 
        expect.objectContaining({
          profile_picture: 'http://example.com/new-admin.jpg'
        })
      );

      expect(result.adminData.profile_picture).toBe('http://example.com/new-admin.jpg');
    });

    it('should throw BadRequestError when no fields to update are provided', async () => {
      const originalAdmin = {
        id: '1',
        email: 'admin@ucr.ac.cr',
        full_name: 'Admin User',
        profile_picture: 'http://example.com/admin.jpg',
        auth_id: 'firebase-auth-id',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValueOnce(originalAdmin);

      await expect(updateAdminProfileService('admin@ucr.ac.cr', 'token', {}))
        .rejects
        .toThrow(BadRequestError);
    });

    it('should throw NotFoundError when admin does not exist', async () => {
      (adminRepository.findByEmailAdmin as jest.Mock).mockResolvedValueOnce(null);

      await expect(updateAdminProfileService('nonexistent@ucr.ac.cr', 'token', { full_name: 'New Admin' }))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('getOtherUserProfileService', () => {
    it('should return other user profile data when user exists', async () => {
      const mockUser = {
        id: '1',
        email: 'user@ucr.ac.cr',
        username: 'otheruser',
        full_name: 'Other User',
        profile_picture: 'http://example.com/other.jpg',
        auth_id: 'firebase-auth-id',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      (userRepository.findByIdUser as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await getOtherUserProfileService('1');

      expect(userRepository.findByIdUser).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        message: 'User profile retrieved successfully',
        userData: {
          username: mockUser.username,
          full_name: mockUser.full_name,
          profile_picture: mockUser.profile_picture
        }
      });
    });

    it('should throw NotFoundError when user does not exist', async () => {
      (userRepository.findByIdUser as jest.Mock).mockResolvedValueOnce(null);

      await expect(getOtherUserProfileService('nonexistent-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });
});