import request from 'supertest';
import { app } from '../../src/app';
import * as forgotService from '../../src/features/users/services/forgot.password.service';

jest.mock('../../src/features/users/services/forgot.password.service');

describe('POST /api/recover-password', () => {
  const mockGenerateLink = forgotService.generatePasswordResetLink as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with 200 and a success message when email is valid', async () => {
    mockGenerateLink.mockResolvedValue('The recovery email has been sent to user@example.com. Follow the instructions in the email to reset your password.');

    const response = await request(app)
      .post('/api/recover-password')
      .send({ email: 'userTest@ucr.ac.cr' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'The recovery email has been sent to user@example.com. Follow the instructions in the email to reset your password.',
    });
    expect(mockGenerateLink).toHaveBeenCalledWith('userTest@ucr.ac.cr');
  });

  it('should respond with 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/api/recover-password')
      .send({ email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid email format. Make sure it is the institutional email.',
    });
  });

});
