import { Request, Response, NextFunction } from 'express';
import { getUsersBySearch } from '../../src/features/users/controllers/profile.controller';
import { searchUsersService } from '../../src/features/users/services/search.service';
import { BadRequestError } from '../../src/utils/errors/api-error';
import * as yup from 'yup';

jest.mock('../../src/features/users/services/search.service');

const mockSearchUsersService = searchUsersService as jest.Mock;

describe('getUsersBySearch', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.MockedFunction<NextFunction>;

    beforeEach(() => {
        req = { query: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should respond with 200 and users on success', async () => {
        const users = [{ username: 'john', user_fullname: 'John Doe', profile_picture: 'pic' }];
        req.query = { name: 'john' };
        mockSearchUsersService.mockResolvedValueOnce(users);

        await getUsersBySearch(req as Request, res as Response, next);

        expect(mockSearchUsersService).toHaveBeenCalledWith('john');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ data: users });
    });

    it('should call next with BadRequestError on validation error', async () => {
        req.query = {} as any;

        await getUsersBySearch(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });

    it('should call next with error when service throws', async () => {
        req.query = { name: 'john' };
        const error = new Error('boom');
        mockSearchUsersService.mockRejectedValueOnce(error);

        await getUsersBySearch(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});