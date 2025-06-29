import { isUserSuspended } from '../../src/features/users/repositories/suspension.repository';
import client from '../../src/config/database';
import { QueryResult } from 'pg';

jest.mock('../../src/config/database', () => ({
    query: jest.fn(),
}));

const mockClient = client as unknown as { query: jest.Mock };

describe('isUserSuspended', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return true when an active suspension exists', async () => {
        const mockResult = { rows: [{ id: '1' }] } as QueryResult;
        mockClient.query.mockResolvedValueOnce(mockResult);

        const result = await isUserSuspended('user-uuid');

        expect(mockClient.query).toHaveBeenCalledWith(expect.any(String), ['user-uuid']);
        expect(result).toBe(true);
    });

    it('should return false when no active suspension exists', async () => {
        mockClient.query.mockResolvedValueOnce({ rows: [] } as QueryResult);

        const result = await isUserSuspended('user-uuid');

        expect(mockClient.query).toHaveBeenCalledWith(expect.any(String), ['user-uuid']);
        expect(result).toBe(false);
    });
});