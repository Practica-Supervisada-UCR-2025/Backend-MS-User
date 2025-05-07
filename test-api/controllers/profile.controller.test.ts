import { getUserProfileController, getAdminProfileController } from '../../src/features/users/controllers/profile.controller';
import * as profileService from '../../src/features/users/services/profile.service';
import { NotFoundError } from '../../src/utils/errors/api-error';

// Mock service
jest.mock('../../src/features/users/services/profile.service');

describe('Profile Controllers', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      body: {
        email: 'test@ucr.ac.cr'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getUserProfileController', () => {
    it('should return 201 and user profile when profile is found', async () => {
      const mockProfileData = {
        message: 'User profile retrieved successfully',
        userData: {
          email: 'test@ucr.ac.cr',
          username: 'testuser',
          full_name: 'Test User',
          profile_picture: 'http://example.com/pic.jpg'
        }
      };

      (profileService.getUserProfileService as jest.Mock).mockResolvedValueOnce(mockProfileData);

      await getUserProfileController(req, res, next);

      expect(profileService.getUserProfileService).toHaveBeenCalledWith('test@ucr.ac.cr');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: mockProfileData.message,
        data: mockProfileData.userData
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws an error', async () => {
      const error = new NotFoundError('User not found');
      (profileService.getUserProfileService as jest.Mock).mockRejectedValueOnce(error);

      await getUserProfileController(req, res, next);

      expect(profileService.getUserProfileService).toHaveBeenCalledWith('test@ucr.ac.cr');
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAdminProfileController', () => {
    it('should return 201 and admin profile when profile is found', async () => {
      const mockProfileData = {
        message: 'Admin profile retrieved successfully',
        adminData: {
          email: 'admin@ucr.ac.cr',
          full_name: 'Admin User',
          profile_picture: 'http://example.com/admin.jpg'
        }
      };

      req.body.email = 'admin@ucr.ac.cr';
      (profileService.getAdminProfileService as jest.Mock).mockResolvedValueOnce(mockProfileData);

      await getAdminProfileController(req, res, next);

      expect(profileService.getAdminProfileService).toHaveBeenCalledWith('admin@ucr.ac.cr');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: mockProfileData.message,
        data: mockProfileData.adminData
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws an error', async () => {
      const error = new NotFoundError('Admin user not found');
      req.body.email = 'admin@ucr.ac.cr';
      (profileService.getAdminProfileService as jest.Mock).mockRejectedValueOnce(error);

      await getAdminProfileController(req, res, next);

      expect(profileService.getAdminProfileService).toHaveBeenCalledWith('admin@ucr.ac.cr');
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});