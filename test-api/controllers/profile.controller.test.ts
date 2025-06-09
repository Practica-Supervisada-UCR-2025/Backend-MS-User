import { Request, Response, NextFunction } from 'express';
import { getUserProfileController, getAdminProfileController, updateUserProfileController, updateAdminProfileController, getOtherUserProfileController } from '../../src/features/users/controllers/profile.controller';
import * as profileService from '../../src/features/users/services/profile.service';
import { BadRequestError, NotFoundError } from '../../src/utils/errors/api-error';
import { AuthenticatedRequest } from '../../src/features/middleware/authenticate.middleware';
import { Buffer } from 'buffer';
import * as yup from 'yup';
import { Readable } from 'stream';
import multer from 'multer';

// Mock multer
jest.mock('multer', () => {
  return Object.assign(
    jest.fn().mockReturnValue({
      single: jest.fn().mockImplementation(() => {
        return (req: any, res: any, next: any) => {
          if (req._failMulter) {
            const error = new Error('File too large');
            error.name = 'MulterError';
            return next(error);
          }
          next();
        };
      })
    }),
    {
      memoryStorage: jest.fn().mockReturnValue({}),
      diskStorage: jest.fn(),
      MulterError: jest.fn()
    }
  );
});

// Mock the services
jest.mock('../../src/features/users/services/profile.service');

describe('Profile Controllers', () => {
  let mockReq: Partial<Request> & {
    user?: any;
    _failMulter?: boolean;
    params: Record<string, string>;
  };
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  
  beforeEach(() => {
    mockReq = {
      user: {
        email: 'test@ucr.ac.cr',
        role: 'user',
        uuid: 'test-uuid-123'
      },
      headers: {},
      get: jest.fn(),
      params: {}
    };
    (mockReq as any).token = 'mock-token';
    mockReq._failMulter = false;

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfileController', () => {
    it('should return user profile data successfully', async () => {
      const serviceResponse = {
        message: 'User profile retrieved successfully',
        userData: {
          email: 'test@ucr.ac.cr',
          username: 'testuser',
          full_name: 'Test User',
          profile_picture: 'http://example.com/pic.jpg'
        }
      };

      (profileService.getUserProfileService as jest.Mock).mockResolvedValueOnce(serviceResponse);

      await getUserProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(profileService.getUserProfileService).toHaveBeenCalledWith('test@ucr.ac.cr');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: serviceResponse.message,
        data: serviceResponse.userData
      });
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Test error');
      (profileService.getUserProfileService as jest.Mock).mockRejectedValueOnce(error);

      await getUserProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getAdminProfileController', () => {
    beforeEach(() => {
      mockReq.user = {
        email: 'admin@ucr.ac.cr',
        role: 'admin',
        uuid: 'admin-uuid-123'
      };
    });

    it('should return admin profile data successfully', async () => {
      const serviceResponse = {
        message: 'Admin profile retrieved successfully',
        adminData: {
          email: 'admin@ucr.ac.cr',
          full_name: 'Test Admin',
          profile_picture: 'http://example.com/admin.jpg'
        }
      };

      (profileService.getAdminProfileService as jest.Mock).mockResolvedValueOnce(serviceResponse);

      await getAdminProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(profileService.getAdminProfileService).toHaveBeenCalledWith('admin@ucr.ac.cr');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: serviceResponse.message,
        data: serviceResponse.adminData
      });
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Test error');
      (profileService.getAdminProfileService as jest.Mock).mockRejectedValueOnce(error);

      await getAdminProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUserProfileController', () => {
    const createMockFile = () => ({
      fieldname: 'profile_picture',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      destination: '/tmp',
      filename: 'test.jpg',
      path: '/tmp/test.jpg',
      buffer: Buffer.from('test image'),
      stream: new Readable()
    });

    it('should update user profile without image successfully', async () => {
      const updateData = {
        username: 'newusername',
        full_name: 'New Name'
      };

      const serviceResponse = {
        message: 'User profile updated successfully',
        userData: {
          email: 'test@ucr.ac.cr',
          username: 'newusername',
          full_name: 'New Name',
          profile_picture: 'http://example.com/pic.jpg'
        }
      };

      mockReq.body = updateData;
      (profileService.updateUserProfileService as jest.Mock).mockResolvedValueOnce(serviceResponse);

      await updateUserProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(profileService.updateUserProfileService).toHaveBeenCalledWith(
        'test@ucr.ac.cr',
        'mock-token',
        updateData
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: serviceResponse.message,
        data: serviceResponse.userData
      });
    });

    it('should update user profile with image successfully', async () => {
      const updateData = {
        username: 'newusername'
      };

      const mockFile = createMockFile();

      const serviceResponse = {
        message: 'User profile updated successfully',
        userData: {
          email: 'test@ucr.ac.cr',
          username: 'newusername',
          profile_picture: 'http://example.com/new.jpg'
        }
      };

      mockReq.body = updateData;
      mockReq.file = mockFile;
      
      (profileService.updateUserProfileService as jest.Mock).mockResolvedValueOnce(serviceResponse);

      await updateUserProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(profileService.updateUserProfileService).toHaveBeenCalledWith(
        'test@ucr.ac.cr',
        'mock-token',
        updateData,
        mockFile.buffer,
        mockFile.originalname,
        mockFile.mimetype
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: serviceResponse.message,
        data: serviceResponse.userData
      });
    });

    it('should handle multer errors', async () => {
      mockReq._failMulter = true;
      mockReq.body = {};

      await updateUserProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Error upload profile')
        })
      );
    });

    it('should handle validation errors', async () => {
      const validationError = new yup.ValidationError('Validation failed');
      mockReq.body = { username: '' };

      (profileService.updateUserProfileService as jest.Mock).mockRejectedValueOnce(validationError);

      await updateUserProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('updateAdminProfileController', () => {
    const createMockFile = () => ({
      fieldname: 'profile_picture',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      destination: '/tmp',
      filename: 'test.jpg',
      path: '/tmp/test.jpg',
      buffer: Buffer.from('test image'),
      stream: new Readable()
    });

    beforeEach(() => {
      mockReq.user = {
        email: 'admin@ucr.ac.cr',
        role: 'admin',
        uuid: 'admin-uuid-123'
      };
    });

    it('should update admin profile without image successfully', async () => {
      const updateData = {
        full_name: 'New Admin Name'
      };

      const serviceResponse = {
        message: 'Admin profile updated successfully',
        adminData: {
          email: 'admin@ucr.ac.cr',
          full_name: 'New Admin Name',
          profile_picture: 'http://example.com/admin.jpg'
        }
      };

      mockReq.body = updateData;
      (profileService.updateAdminProfileService as jest.Mock).mockResolvedValueOnce(serviceResponse);

      await updateAdminProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(profileService.updateAdminProfileService).toHaveBeenCalledWith(
        'admin@ucr.ac.cr',
        'mock-token',
        updateData
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: serviceResponse.message,
        data: serviceResponse.adminData
      });
    });

    it('should update admin profile with image successfully', async () => {
      const updateData = {
        full_name: 'New Admin Name'
      };

      const mockFile = createMockFile();

      const serviceResponse = {
        message: 'Admin profile updated successfully',
        adminData: {
          email: 'admin@ucr.ac.cr',
          full_name: 'New Admin Name',
          profile_picture: 'http://example.com/new-admin.jpg'
        }
      };

      mockReq.body = updateData;
      mockReq.file = mockFile;
      
      (profileService.updateAdminProfileService as jest.Mock).mockResolvedValueOnce(serviceResponse);

      await updateAdminProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(profileService.updateAdminProfileService).toHaveBeenCalledWith(
        'admin@ucr.ac.cr',
        'mock-token',
        updateData,
        mockFile.buffer,
        mockFile.originalname,
        mockFile.mimetype
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: serviceResponse.message,
        data: serviceResponse.adminData
      });
    });

    it('should handle multer errors', async () => {
      mockReq._failMulter = true;
      mockReq.body = {};

      await updateAdminProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Error upload profile')
        })
      );
    });

    it('should handle validation errors', async () => {
      const validationError = new yup.ValidationError('Validation failed');
      mockReq.body = { full_name: '' };

      (profileService.updateAdminProfileService as jest.Mock).mockRejectedValueOnce(validationError);

      await updateAdminProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('getOtherUserProfileController', () => {
    const validUserId = '123e4567-e89b-12d3-a456-426614174000';

    beforeEach(() => {
      mockReq.params = { userId: validUserId };
    });

    it('should return other user profile data successfully', async () => {
      const serviceResponse = {
        message: 'User profile retrieved successfully',
        userData: {
          username: 'otheruser',
          full_name: 'Other User',
          profile_picture: 'http://example.com/other.jpg'
        }
      };

      (profileService.getOtherUserProfileService as jest.Mock).mockResolvedValueOnce(serviceResponse);

      await getOtherUserProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(profileService.getOtherUserProfileService).toHaveBeenCalledWith(validUserId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: serviceResponse.message,
        data: serviceResponse.userData
      });
    });

    it('should return 400 when userId is invalid', async () => {
      mockReq.params = { userId: 'invalid-uuid' };

      await getOtherUserProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Valid User ID is required.'
      });
      expect(profileService.getOtherUserProfileService).not.toHaveBeenCalled();
    });

    it('should handle not found error', async () => {
      (profileService.getOtherUserProfileService as jest.Mock).mockRejectedValueOnce(
        new NotFoundError('User not found')
      );

      await getOtherUserProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found'
        })
      );
    });

    it('should handle general errors through next middleware', async () => {
      const error = new Error('Test error');
      (profileService.getOtherUserProfileService as jest.Mock).mockRejectedValueOnce(error);

      await getOtherUserProfileController(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});