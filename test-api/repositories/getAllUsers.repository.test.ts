import {
  getAllUsersRepository,
  getUserByUsernameRepository,
} from '../../src/features/users/repositories/user.repository';
import db from '../../src/config/database';

jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

describe('user.repository', () => {
  const mockUsers = [
    {
      id: 'user-1',
      email: 'user@ucr.ac.cr',
      full_name: 'Test User',
      username: 'testuser',
      profile_picture: null,
      is_active: true,
      created_at: new Date('2025-06-15T00:00:00Z'),
      auth_id: 'auth123',
      is_banned: false,
      suspension_end_date: '',
    }, 
    {
      id: 'user-2',
      email: 'another@ucr.ac.cr',
      full_name: 'Another User',
      username: 'anotheruser',
      profile_picture: null,
      is_active: true,
      created_at: new Date('2025-06-16T00:00:00Z'),
      auth_id: 'auth456',
      is_banned: false,
      suspension_end_date: '',
    },
  ];

  const mockCount = [{ total: '10' }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsersRepository', () => {
    it('should return users and totalRemaining count', async () => {
      (db.query as jest.Mock)
        .mockImplementationOnce(() => Promise.resolve({ rows: mockUsers }))
        .mockImplementationOnce(() => Promise.resolve({ rows: mockCount }));

      const dto = {
        created_after: '2025-06-01T00:00:00Z',
        limit: 2,
      };

      const result = await getAllUsersRepository(dto);

      expect(result.users).toEqual(mockUsers);
      expect(result.totalRemaining).toBe(10);

      expect(db.query).toHaveBeenCalledTimes(2);
      const calls = (db.query as jest.Mock).mock.calls;
      expect(calls[0][0]).toContain('SELECT');
      expect(calls[0][1]).toEqual([dto.created_after, dto.limit]);
      expect(calls[1][0]).toContain('SELECT COUNT');
      expect(calls[1][1]).toEqual([dto.created_after]);
    });
  });

  describe('getUserByUsernameRepository', () => {
    it('should return a user if found', async () => {
      const mockUser = mockUsers[0];

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

      const result = await getUserByUsernameRepository('testuser');

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE is_active = true AND username = $1'),
        ['testuser']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null if no user is found', async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await getUserByUsernameRepository('unknownuser');

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query).toHaveBeenCalledWith(expect.any(String), ['unknownuser']);
      expect(result).toBeNull();
    });
  });
});
