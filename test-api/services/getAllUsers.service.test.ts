import { getAllUsersService } from '../../src/features/users/services/getAllUsers.service';
import { getAllUsersRepository } from '../../src/features/users/repositories/user.repository';
import { GetAllUsersQueryDto } from '../../src/features/users/dto/getAllUsers.dto';

jest.mock('../../src/features/users/repositories/user.repository');
const mockGetAllUsersRepository = getAllUsersRepository as jest.Mock;

describe('getAllUsersService', () => {
  const sampleUsers = [
    {
      id: 'user-1',
      email: 'user@ucr.ac.cr',
      full_name: 'Test User',
      username: 'testuser',
      profile_picture: null,
      is_active: true,
      created_at: new Date('2025-06-20T00:00:00Z'),
    },
    {
      id: 'user-2',
      email: 'another@ucr.ac.cr',
      full_name: 'Another User',
      username: 'anotheruser',
      profile_picture: null,
      is_active: true,
      created_at: new Date('2025-06-22T00:00:00Z'),
    },
  ];

  const dto: GetAllUsersQueryDto = {
    created_after: '2025-06-01T00:00:00Z',
    limit: 2,
  };

  it('should return formatted users and metadata correctly', async () => {
    mockGetAllUsersRepository.mockResolvedValueOnce({
      users: sampleUsers,
      totalRemaining: 6,
    });

    const result = await getAllUsersService(dto);

    expect(result.message).toBe('All users fetched successfully');
    expect(result.data).toHaveLength(2);
    expect(result.metadata).toEqual({
      last_time: sampleUsers[1].created_at,
      remainingItems: 4,
      remainingPages: 2,
    });
  });

  it('should return empty data and metadata when no users', async () => {
    mockGetAllUsersRepository.mockResolvedValueOnce({
      users: [],
      totalRemaining: 0,
    });

    const result = await getAllUsersService(dto);

    expect(result.message).toBe('All users fetched successfully');
    expect(result.data).toEqual([]);
    expect(result.metadata).toEqual({
      last_time: null,
      remainingItems: 0,
      remainingPages: 0,
    });
  });
});
