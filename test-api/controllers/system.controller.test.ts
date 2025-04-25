import { Request, Response } from 'express';
import { healthCheck } from '../../src/features/system/controllers/system.controller';
import client from '../../src/config/database';

// Mock the database client
jest.mock('../../src/config/database', () => ({
  query: jest.fn()
}));

describe('SystemController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockRequest = {};
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('healthCheck', () => {
    it('should return 200 and success message when database is connected', async () => {
      // Mock successful database query
      (client.query as jest.Mock).mockResolvedValueOnce({});

      await healthCheck(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        message: 'Server is running and database connection is active',
        database: expect.objectContaining({
          connected: true
        })
      }));
    });

    it('should return 500 and error message when database connection fails', async () => {
      // Mock database query error
      const dbError = new Error('Database connection failed');
      (client.query as jest.Mock).mockRejectedValueOnce(dbError);

      await healthCheck(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: 'Server is running but database connection failed',
        database: expect.objectContaining({
          connected: false,
          error: 'Database connection failed'
        })
      }));
    });
  });
});