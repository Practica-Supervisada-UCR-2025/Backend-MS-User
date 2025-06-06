import { searchUsersService } from '../../src/features/users/services/search.service';
import * as userRepository from '../../src/features/users/repositories/user.repository';

jest.mock('../../src/features/users/repositories/user.repository');

const mockSearchUsersByName = userRepository.searchUsersByName as jest.Mock;

describe('searchUsersService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should map repository users to expected format', async () => {
        const repoUsers = [
            { username: 'john', full_name: 'John Doe', profile_picture: 'pic1' },
            { username: 'jane', full_name: 'Jane Doe', profile_picture: 'pic2' }
        ];
        mockSearchUsersByName.mockResolvedValueOnce(repoUsers);

        const result = await searchUsersService('john');

        expect(mockSearchUsersByName).toHaveBeenCalledWith('john');
        expect(result).toEqual([
            { username: 'john', user_fullname: 'John Doe', profile_picture: 'pic1' },
            { username: 'jane', user_fullname: 'Jane Doe', profile_picture: 'pic2' }
        ]);
    });

    it('should return empty array when repository returns none', async () => {
        mockSearchUsersByName.mockResolvedValueOnce([]);

        const result = await searchUsersService('no');

        expect(result).toEqual([]);
    });
});