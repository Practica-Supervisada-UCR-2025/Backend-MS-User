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

  it('should return 400 if created_after is invalid', async () => {
    req.query = {
      created_after: 'not-a-date',
      limit: '5', // ← necesario para que pasen juntos la validación cruzada
    };

    await getAllUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid query parameters.',
      messages: ['created_after must be a valid ISO 8601 date string'],
    });
  });

  it('should return 400 if limit is invalid', async () => {
    req.query = {
      created_after: '2025-06-01T00:00:00Z', // ← necesario para que no entre en la validación cruzada
      limit: 'not-a-number',
    };

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

  it('should return 400 if username is too short', async () => {
    req.query = { username: 'a' };

    await getAllUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid query parameters.',
      messages: ['username must be longer than or equal to 2 characters'],
    });
  });

  it('should return 400 if limit is provided without created_after', async () => {
    req.query = { limit: '10' };

    await getAllUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid query parameters.',
      messages: ['limit and created_after must be provided together or omitted together'],
    });
  });

  it('should return 400 if created_after is provided without limit', async () => {
    req.query = { created_after: '2025-06-01T00:00:00Z' };

    await getAllUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid query parameters.',
      messages: ['limit and created_after must be provided together or omitted together'],
    });
  });

  it('should call the service with all parameters and return 200 with data', async () => {
    req.query = {
      created_after: '2025-06-01T00:00:00Z',
      limit: '2',
      username: 'pruebas',
    };

    const mockResult = {
      message: 'User fetched successfully',
      data: [{ id: 'user-1', username: 'pruebas' }],
      metadata: {
        last_time: '2025-06-10T00:00:00Z',
        remainingItems: 0,
        remainingPages: 0,
      },
    };

    (getAllUsersService as jest.Mock).mockResolvedValue(mockResult);

    await getAllUsersController(req, res);

    expect(getAllUsersService).toHaveBeenCalledWith({
      created_after: '2025-06-01T00:00:00Z',
      limit: 2,
      username: 'pruebas',
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should call the service with no parameters and return 200', async () => {
    req.query = {};

    const mockResult = {
      message: 'All users fetched successfully',
      data: [],
      metadata: {
        last_time: null,
        remainingItems: 0,
        remainingPages: null,
      },
    };

    (getAllUsersService as jest.Mock).mockResolvedValue(mockResult);

    await getAllUsersController(req, res);

    expect(getAllUsersService).toHaveBeenCalledWith({
      created_after: undefined,
      limit: undefined,
      username: undefined,
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should return 500 if service throws', async () => {
    req.query = { username: 'someone' };

    (getAllUsersService as jest.Mock).mockRejectedValue(new Error('DB error'));

    await getAllUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Failed to fetch active users.',
    });
  });
});
