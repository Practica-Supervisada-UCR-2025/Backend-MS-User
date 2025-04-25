// Mock database module
const mockClient = {
  query: jest.fn()
};

jest.mock('../../src/config/database', () => mockClient);

import { findByEmailUser, createUser, updateUserActiveStatus } from '../../src/features/users/repositories/user.repository';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../src/features/users/interfaces/user-entities.interface';

// Mock UUID generation
jest.mock('uuid', () => ({
  v4: jest.fn()
}));

describe('User Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmailUser', () => {
    it('should find a user by email', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@ucr.ac.cr',
        full_name: 'Test User',
        username: 'testuser',
        profile_picture: 'http://example.com/pic.jpg',
        auth_id: 'firebase-auth-id-1',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1
      });

      const result = await findByEmailUser('test@ucr.ac.cr');
      
      expect(result).toEqual(mockUser);
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        ['test@ucr.ac.cr']
      );
    });

    it('should return null when user not found', async () => {
      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      const result = await findByEmailUser('nonexistent@ucr.ac.cr');
      
      expect(result).toBeNull();
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        ['nonexistent@ucr.ac.cr']
      );
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUUID = 'mock-uuid';
      (uuidv4 as jest.Mock).mockReturnValue(mockUUID);

      const newUser: User = {
        id: mockUUID,
        email: 'new@ucr.ac.cr',
        full_name: 'New User',
        username: 'newuser',
        profile_picture: 'http://example.com/pic.jpg',
        auth_id: 'firebase-auth-id-2',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [newUser],
        rowCount: 1
      });

      const result = await createUser(newUser);
      
      expect(result).toEqual(newUser);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [newUser.id, newUser.email, newUser.full_name, newUser.username, newUser.profile_picture, newUser.auth_id, newUser.is_active]
      );
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      mockClient.query.mockRejectedValueOnce(mockError);

      const newUser: User = {
        id: 'test-id',
        email: 'new@ucr.ac.cr',
        full_name: 'New User',
        username: 'newuser',
        profile_picture: 'http://example.com/pic.jpg',
        auth_id: 'firebase-auth-id-3',
        is_active: true,
        created_at: new Date(),
        last_login: null
      };

      await expect(createUser(newUser)).rejects.toThrow('Database error');
    });
  });

  describe('updateUserActiveStatus', () => {
    it('should update user active status successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@ucr.ac.cr',
        full_name: 'Test User',
        username: 'testuser',
        profile_picture: 'http://example.com/pic.jpg',
        auth_id: 'firebase-auth-id-4',
        is_active: false,
        created_at: new Date(),
        last_login: null
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1
      });

      const result = await updateUserActiveStatus('test@ucr.ac.cr', false);

      expect(result).toEqual(mockUser);
      expect(mockClient.query).toHaveBeenCalledWith(
        'UPDATE users SET is_active = $1 WHERE email = $2 RETURNING *',
        [false, 'test@ucr.ac.cr']
      );
    });

    it('should throw error when user not found', async () => {
      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      await expect(updateUserActiveStatus('nonexistent@ucr.ac.cr', true))
        .rejects
        .toThrow('User with email nonexistent@ucr.ac.cr not found');
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      mockClient.query.mockRejectedValueOnce(mockError);

      await expect(updateUserActiveStatus('test@ucr.ac.cr', true))
        .rejects
        .toThrow('Database error');

      expect(mockClient.query).toHaveBeenCalledWith(
        'UPDATE users SET is_active = $1 WHERE email = $2 RETURNING *',
        [true, 'test@ucr.ac.cr']
      );
    });
  });
});