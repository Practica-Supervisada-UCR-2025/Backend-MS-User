const mockClient = {
    query: jest.fn()
};

jest.mock('../../src/config/database', () => mockClient);

import { searchUsersByName } from '../../src/features/users/repositories/user.repository';

describe('searchUsersByName', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should query database with ILIKE and DISTINCT and return rows', async () => {
        const rows = [
            { id: '1', username: 'john', full_name: 'John Doe', profile_picture: 'pic1' }
        ];
        mockClient.query.mockResolvedValueOnce({ rows });

        const result = await searchUsersByName('john', 5);

        expect(mockClient.query).toHaveBeenCalledWith(
            expect.stringContaining('ILIKE $1'),
            ['%john%', 5]
        );
        expect(mockClient.query.mock.calls[0][0]).toContain('SELECT DISTINCT');
        expect(result).toEqual(rows);
    });
});