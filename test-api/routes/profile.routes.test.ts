import request from 'supertest';
import express from 'express';
import profileRoutes from '../../src/features/users/routes/profile.routes';
import * as profileService from '../../src/features/users/services/profile.service';
import { NotFoundError } from '../../src/utils/errors/api-error';
import { errorHandler } from '../../src/utils/errors/error-handler.middleware';

// Mock services
jest.mock('../../src/features/users/services/profile.service');

// Mock authenticate middleware
jest.mock('../../src/features/middleware/authenticate.middleware', () => {
  return {
    authenticateJWT: (req: any, res: any, next: any) => {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        if (authHeader.includes('user-token')) {
          req.user = { role: 'user' };
        } else if (authHeader.includes('admin-token')) {
          req.user = { role: 'admin' };
        }
        next();
      } else {
        next(new Error('Unauthorized'));
      }
    }
  };
});

describe('Profile Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/', profileRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /user/auth/profile', () => {
    it('should return 201 and user profile data when authenticated', async () => {
      const mockProfileData = {
        message: 'User profile retrieved successfully',
        userData: {
          email: 'user@ucr.ac.cr',
          username: 'user',
          full_name: 'User Name',
          profile_picture: 'http://example.com/user.jpg'
        }
      };

      (profileService.getUserProfileService as jest.Mock).mockResolvedValueOnce(mockProfileData);

      const response = await request(app)
        .get('/user/auth/profile')
        .set('Authorization', 'Bearer user-token')
        .send({ email: 'user@ucr.ac.cr' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: mockProfileData.message,
        data: mockProfileData.userData
      });
    });

    it('should return 404 when user profile is not found', async () => {
      (profileService.getUserProfileService as jest.Mock).mockRejectedValueOnce(
        new NotFoundError('User not found')
      );

      const response = await request(app)
        .get('/user/auth/profile')
        .set('Authorization', 'Bearer user-token')
        .send({ email: 'nonexistent@ucr.ac.cr' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return error when not authenticated', async () => {
      const response = await request(app)
        .get('/user/auth/profile')
        .send({ email: 'user@ucr.ac.cr' });

      expect(response.status).not.toBe(201);
    });
  });

  describe('GET /admin/auth/profile', () => {
    it('should return 201 and admin profile data when authenticated', async () => {
      const mockProfileData = {
        message: 'Admin profile retrieved successfully',
        adminData: {
          email: 'admin@ucr.ac.cr',
          full_name: 'Admin User',
          profile_picture: 'http://example.com/admin.jpg'
        }
      };

      (profileService.getAdminProfileService as jest.Mock).mockResolvedValueOnce(mockProfileData);

      const response = await request(app)
        .get('/admin/auth/profile')
        .set('Authorization', 'Bearer admin-token')
        .send({ email: 'admin@ucr.ac.cr' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: mockProfileData.message,
        data: mockProfileData.adminData
      });
    });

    it('should return 404 when admin profile is not found', async () => {
      (profileService.getAdminProfileService as jest.Mock).mockRejectedValueOnce(
        new NotFoundError('Admin user not found')
      );

      const response = await request(app)
        .get('/admin/auth/profile')
        .set('Authorization', 'Bearer admin-token')
        .send({ email: 'nonexistent@ucr.ac.cr' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Admin user not found');
    });

    it('should return error when not authenticated', async () => {
      const response = await request(app)
        .get('/admin/auth/profile')
        .send({ email: 'admin@ucr.ac.cr' });

      expect(response.status).not.toBe(201);
    });
  });

  describe('PATCH /user/auth/profile', () => {
    it('should return 200 and updated user profile data when authenticated', async () => {
      const updateData = {
        email: 'user@ucr.ac.cr',
        username: 'updateduser',
        full_name: 'Updated User',
        profile_picture: 'http://example.com/new.jpg'
      };

      const mockUpdateResult = {
        message: 'User profile updated successfully',
        userData: {
          email: 'user@ucr.ac.cr',
          username: 'updateduser',
          full_name: 'Updated User',
          profile_picture: 'http://example.com/new.jpg'
        }
      };

      (profileService.updateUserProfileService as jest.Mock).mockResolvedValueOnce(mockUpdateResult);

      const response = await request(app)
        .patch('/user/auth/profile')
        .set('Authorization', 'Bearer user-token')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: mockUpdateResult.message,
        data: mockUpdateResult.userData
      });
    });

    it('should return 404 when user profile is not found', async () => {
      const updateData = {
        email: 'nonexistent@ucr.ac.cr',
        username: 'newuser'
      };

      (profileService.updateUserProfileService as jest.Mock).mockRejectedValueOnce(
        new NotFoundError('User not found')
      );

      const response = await request(app)
        .patch('/user/auth/profile')
        .set('Authorization', 'Bearer user-token')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return error when not authenticated', async () => {
      const updateData = {
        email: 'user@ucr.ac.cr',
        username: 'newuser'
      };

      const response = await request(app)
        .patch('/user/auth/profile')
        .send(updateData);

      expect(response.status).not.toBe(200);
    });
  });

  describe('PATCH /admin/auth/profile', () => {
    it('should return 200 and updated admin profile data when authenticated', async () => {
      const updateData = {
        email: 'admin@ucr.ac.cr',
        full_name: 'Updated Admin',
        profile_picture: 'http://example.com/new-admin.jpg'
      };

      const mockUpdateResult = {
        message: 'Admin profile updated successfully',
        adminData: {
          email: 'admin@ucr.ac.cr',
          full_name: 'Updated Admin',
          profile_picture: 'http://example.com/new-admin.jpg'
        }
      };

      (profileService.updateAdminProfileService as jest.Mock).mockResolvedValueOnce(mockUpdateResult);

      const response = await request(app)
        .patch('/admin/auth/profile')
        .set('Authorization', 'Bearer admin-token')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: mockUpdateResult.message,
        data: mockUpdateResult.adminData
      });
    });

    it('should return 404 when admin profile is not found', async () => {
      const updateData = {
        email: 'nonexistent@ucr.ac.cr',
        full_name: 'New Admin'
      };

      (profileService.updateAdminProfileService as jest.Mock).mockRejectedValueOnce(
        new NotFoundError('Admin not found')
      );

      const response = await request(app)
        .patch('/admin/auth/profile')
        .set('Authorization', 'Bearer admin-token')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Admin not found');
    });

    it('should return error when not authenticated', async () => {
      const updateData = {
        email: 'admin@ucr.ac.cr',
        full_name: 'New Admin'
      };

      const response = await request(app)
        .patch('/admin/auth/profile')
        .send(updateData);

      expect(response.status).not.toBe(200);
    });
  });
});