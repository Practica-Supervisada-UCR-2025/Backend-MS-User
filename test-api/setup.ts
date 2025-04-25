import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.test' });

// Mock Firebase Admin
jest.mock('../src/config/firebase', () => {
  const mockVerifyIdToken = jest.fn();
  const mockAuth = {
    verifyIdToken: mockVerifyIdToken
  };
  return {
    auth: () => mockAuth,
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn()
    }
  };
});

// Mock database
jest.mock('../src/config/database', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  }
}));

// Global test setup
beforeAll(async () => {
  // Clear all mocks before each test suite
  jest.clearAllMocks();
});

afterAll(async () => {
  // Clean up any resources if needed
});

// Add global mocks that might be needed across tests
global.console.error = jest.fn();