import request from 'supertest';
import express from 'express';
import searchRoutes from '../../src/features/users/routes/profile.routes';
import { searchUsersService } from '../../src/features/users/services/search.service';
import { errorHandler } from '../../src/utils/errors/error-handler.middleware';

jest.mock('../../src/features/users/services/search.service');

jest.mock('../../src/features/middleware/authenticate.middleware', () => ({
    authenticateJWT: (req: any, res: any, next: any) => next()
}));

const app = express();
app.use(express.json());
app.use('/', searchRoutes);
app.use(errorHandler);

describe('Search Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and users when query is valid', async () => {
        const users = [{ username: 'john', user_fullname: 'John Doe', profile_picture: 'pic' }];
        (searchUsersService as jest.Mock).mockResolvedValueOnce(users);

        const res = await request(app).get('/user/search/').query({ name: 'john' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ data: users });
        expect(searchUsersService).toHaveBeenCalledWith('john');
    });

    it('should return 400 when validation fails', async () => {
        const res = await request(app).get('/user/search/').query({});
        expect(res.status).toBe(400);
    });
});