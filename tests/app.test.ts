import request from 'supertest';
import {app} from '../src/app';

describe('GET /', () => {
    it('should return a 200 status and the correct message', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Server is running on port 3000');
    });
});