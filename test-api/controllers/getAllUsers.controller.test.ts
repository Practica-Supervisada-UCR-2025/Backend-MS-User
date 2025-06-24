import { getAllUsersController } from '../../src/features/users/controllers/getAllUsers.controller';
import { getAllUsersService } from '../../src/features/users/services/getAllUsers.service';

jest.mock('../../src/features/users/services/getAllUsers.service');

describe('getAllUsersController', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('should return 400 if created_after is missing', async () => {
    req.query = { limit: '10' };

    await getAllUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid query parameters.',
      messages: ['created_after must be a valid ISO 8601 date string'],
    });
  });

  it('should return 400 if created_after is invalid', async () => {
    req.query = { created_after: 'not-a-date', limit: '10' };

    await getAllUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid query parameters.',
      messages: ['created_after must be a valid ISO 8601 date string'],
    });
  });

  it('should return 400 if limit is missing', async () => {
    req.query = { created_after: '2025-06-01T00:00:00Z' };

    await getAllUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid query parameters.',
      messages: expect.arrayContaining([
        'limit must not be less than 1',
        'limit must be an integer number',
      ]),
    });
  });

  it('should return 400 if limit is invalid', async () => {
    req.query = { created_after: '2025-06-01T00:00:00Z', limit: 'not-a-number' };

    await getAllUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid query parameters.',
      messages: expect.arrayContaining([
        'limit must not be less than 1',
        'limit must be an integer number',
      ]),
    });
  });

  it('should call the service and return 200 with data', async () => {
    req.query = {
      created_after: '2025-06-01T00:00:00Z',
      limit: '2',
    };

    const mockResult = {
      message: 'Active users fetched successfully',
      data: [{ id: 'user-1' }, { id: 'user-2' }],
      metadata: {
        last_time: '2025-06-10T00:00:00Z',
        remainingItems: 4,
        remainingPages: 2,
      },
    };

    (getAllUsersService as jest.Mock).mockResolvedValue(mockResult);

    await getAllUsersController(req, res);

    expect(getAllUsersService).toHaveBeenCalledWith({
      created_after: '2025-06-01T00:00:00Z',
      limit: 2,
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should return 500 if service throws', async () => {
    req.query = {
      created_after: '2025-06-01T00:00:00Z',
      limit: '5',
    };

    (getAllUsersService as jest.Mock).mockRejectedValue(new Error('DB error'));

    await getAllUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Failed to fetch active users.',
    });
  });
});
