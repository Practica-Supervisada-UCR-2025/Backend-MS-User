import request from 'supertest';
import express, { ErrorRequestHandler } from 'express';
import systemRoutes from '../../src/features/system/routes/system.routes';
import { errorHandler } from '../../src/utils/errors/error-handler.middleware';
import client from '../../src/config/database';

// Mock the database client
jest.mock('../../src/config/database', () => ({
  query: jest.fn()
}));

describe('System Routes Integration Tests', () => {
  let app: express.Application;
  const originalEnv = process.env;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/', systemRoutes);
    app.use(errorHandler as ErrorRequestHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variables
    process.env = {
      ...originalEnv,
      DB_HOST: 'localhost' // Use test value
    };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('GET /health', () => {
    it('should return 200 and success message when database is connected', async () => {
      // Mock successful database query
      (client.query as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .get('/health')
        .expect(200);

      // Base response check
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Server is running and database connection is active');
      expect(response.body.database.connected).toBe(true);

      // Optional properties check
      if (response.body.timestamp) {
        expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
      }

      expect(response.body.database.host).toBe('localhost');
    });

    it('should return 500 when database connection fails', async () => {
      // Mock failed database query
      const mockError = new Error('Database connection failed');
      (client.query as jest.Mock).mockRejectedValueOnce(mockError);

      const response = await request(app)
        .get('/health')
        .expect(500);

      // Base error response check
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Server is running but database connection failed');
      expect(response.body.database.connected).toBe(false);
      expect(response.body.database.error).toBe('Database connection failed');

      // Optional timestamp check
      if (response.body.timestamp) {
        expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
      }
    });
  });
});