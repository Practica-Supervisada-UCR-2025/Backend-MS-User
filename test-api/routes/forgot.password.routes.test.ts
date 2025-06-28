import request from 'supertest';
import express from 'express';
import forgotPasswordRouter from '../../src/features/users/routes/forgot.password.routes';
import * as forgotService from '../../src/features/users/services/forgot.password.service';

// Service mock
jest.mock('../../src/features/users/services/forgot.password.service');
const mockedGenerateLink = forgotService.generatePasswordResetLink as jest.Mock;

// Middleware mock
jest.mock('../../src/features/middleware/authenticate.middleware', () => ({
  authenticateJWT: (req: any, res: any, next: any) => next(),
}));

const app = express();
app.use(express.json());
app.use('/api', forgotPasswordRouter);

describe('POST /api/recover-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should respond with 200 and a success message when email is valid', async () => {
    mockedGenerateLink.mockResolvedValue(
      'The recovery email has been sent to user@example.com. Follow the instructions in the email to reset your password.'
    );

    const res = await request(app)
      .post('/api/recover-password')
      .send({ email: 'userTest@ucr.ac.cr' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message:
        'The recovery email has been sent to user@example.com. Follow the instructions in the email to reset your password.',
    });
    expect(mockedGenerateLink).toHaveBeenCalledWith('userTest@ucr.ac.cr');
  });

  test('should respond with 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/recover-password')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'Invalid email format. Make sure it is the institutional email.',
    });
  });
});
