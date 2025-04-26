import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testTimeout: 100000, // Set a very high timeout (100 seconds)
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['ts', 'js'],
  roots: ['<rootDir>/src', '<rootDir>/test-api'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/types/**/*',
    '!src/**/*.d.ts',
    '!src/test-db/**/*',
    '!src/app.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/test-api/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFiles: ['dotenv/config'],
  testEnvironmentOptions: {
    env: {
      NODE_ENV: 'test'
    }
  },
  detectOpenHandles: false,
  forceExit: false
};

export default config;