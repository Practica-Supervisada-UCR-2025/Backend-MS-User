// Create mock for the database client
const mockClient = {
  query: jest.fn()
};

// Mock the database module
jest.mock('../../src/config/database', () => mockClient);

import { findByEmailAdmin, createAdmin, updateAdminActiveStatus } from '../../src/features/users/repositories/admin.repository';
import { v4 as uuidv4 } from 'uuid';
import { AdminUser } from '../../src/features/users/interfaces/user-entities.interface';

// Mock UUID generation
jest.mock('uuid', () => ({
  v4: jest.fn()
}));

describe('Admin Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmailAdmin', () => {
    it('should find an admin by email', async () => {
      const mockAdmin: AdminUser = {
        id: '1',
        email: 'admin@ucr.ac.cr',
        full_name: 'Admin User',
        auth_id: 'firebase-auth-id-1',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [mockAdmin],
        rowCount: 1
      });

      const result = await findByEmailAdmin('admin@ucr.ac.cr');
      
      expect(result).toEqual(mockAdmin);
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT * FROM admin_users WHERE email = $1',
        ['admin@ucr.ac.cr']
      );
    });

    it('should return null when admin not found', async () => {
      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      const result = await findByEmailAdmin('nonexistent@ucr.ac.cr');
      
      expect(result).toBeNull();
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT * FROM admin_users WHERE email = $1',
        ['nonexistent@ucr.ac.cr']
      );
    });
  });

  describe('createAdmin', () => {
    it('should create a new admin', async () => {
      const mockUUID = 'mock-uuid';
      (uuidv4 as jest.Mock).mockReturnValue(mockUUID);

      const newAdmin: AdminUser = {
        id: mockUUID,
        email: 'new.admin@ucr.ac.cr',
        full_name: 'New Admin',
        auth_id: 'firebase-auth-id-2',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [newAdmin],
        rowCount: 1
      });

      await createAdmin(newAdmin);
      
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO admin_users'),
        [newAdmin.id, newAdmin.email, newAdmin.full_name, newAdmin.auth_id, newAdmin.is_active]
      );
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      mockClient.query.mockRejectedValueOnce(mockError);

      const newAdmin: AdminUser = {
        id: 'test-id',
        email: 'new.admin@ucr.ac.cr',
        full_name: 'New Admin',
        auth_id: 'firebase-auth-id-3',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      await expect(createAdmin(newAdmin)).rejects.toThrow('Database error');
    });
  });

  describe('updateAdminActiveStatus', () => {
    it('should update admin active status successfully', async () => {
      const mockAdmin = {
        id: '1',
        email: 'admin@ucr.ac.cr',
        full_name: 'Admin User',
        auth_id: 'firebase-auth-id-4',
        is_active: false,
        created_at: new Date(),
        last_login: null
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [mockAdmin],
        rowCount: 1
      });

      const result = await updateAdminActiveStatus('admin@ucr.ac.cr', false);

      expect(result).toEqual(mockAdmin);
      expect(mockClient.query).toHaveBeenCalledWith(
        'UPDATE admin_users SET is_active = $1 WHERE email = $2 RETURNING *',
        [false, 'admin@ucr.ac.cr']
      );
    });

    it('should throw error when admin not found', async () => {
      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      await expect(updateAdminActiveStatus('nonexistent@ucr.ac.cr', true))
        .rejects
        .toThrow('Admin with email nonexistent@ucr.ac.cr not found');
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      mockClient.query.mockRejectedValueOnce(mockError);

      await expect(updateAdminActiveStatus('admin@ucr.ac.cr', true))
        .rejects
        .toThrow('Database error');

      expect(mockClient.query).toHaveBeenCalledWith(
        'UPDATE admin_users SET is_active = $1 WHERE email = $2 RETURNING *',
        [true, 'admin@ucr.ac.cr']
      );
    });
  });
});