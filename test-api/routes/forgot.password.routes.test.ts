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
    mockGenerateLink.mockResolvedValue('Recovery email sent to user@example.com');

    const response = await request(app)
      .post('/api/recover-password')
      .send({ email: 'userTest@ucr.ac.cr' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Recovery email sent to user@example.com',
    });
    expect(mockGenerateLink).toHaveBeenCalledWith('userTest@ucr.ac.cr');
  });

  it('should respond with 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/api/recover-password')
      .send({ email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Formato de email incorrecto. Asegurate que sea el correo institucional.',
    });
  });

  // it('should respond with 500 if the service throws an error', async () => {
  //   mockGenerateLink.mockRejectedValue(new Error('Internal error'));

  //   const response = await request(app)
  //     .post('/api/recover-password')
  //     .send({ email: 'user@ucr.ac.cr' });

  //   expect(response.status).toBe(500);
  //   expect(response.body).toEqual({
  //     error: 'No se logró enviar el correo de recuperación. Verifica que el correo sea el correcto.',
  //   });
  // });
});
