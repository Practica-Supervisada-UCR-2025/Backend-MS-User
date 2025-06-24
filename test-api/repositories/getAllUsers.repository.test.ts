import { getAllUsersRepository } from '../../src/features/users/repositories/user.repository';
import db from '../../src/config/database';;

jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

describe('getAllUsersRepository', () => {
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
    },
  ];

  const mockCount = [{ total: '10' }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return users and totalRemaining count', async () => {
    (db.query as jest.Mock).mockImplementationOnce(() =>
  Promise.resolve({ rows: mockUsers })
).mockImplementationOnce(() =>
  Promise.resolve({ rows: mockCount })
);
    const dto = {
      created_after: '2025-06-01T00:00:00Z',
      limit: 2,
    };

    const result = await getAllUsersRepository(dto);

    expect(result.users).toEqual(mockUsers);
    expect(result.totalRemaining).toBe(10);

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT COUNT'), [dto.created_after]);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT id'), [dto.created_after, dto.limit]);
  });
});
