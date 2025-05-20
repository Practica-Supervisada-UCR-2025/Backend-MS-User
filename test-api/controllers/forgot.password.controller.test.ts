import { sendRecoveryLink } from '../../src/features/users/controllers/forgot.password.controller';
import { generatePasswordResetLink } from '../../src/features/users/services/forgot.password.service';

jest.mock('../../src/features/users/services/forgot.password.service');
const mockGeneratePasswordResetLink = generatePasswordResetLink as jest.Mock;

describe('Forgot Password Controller', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should return 200 and success message when email is valid', async () => {
    const message = 'The recovery email has been sent to user@example.com. Follow the instructions in the email to reset your password.';
    req.body.email = 'userTest@ucr.ac.cr';
    mockGeneratePasswordResetLink.mockResolvedValueOnce(message);

    await sendRecoveryLink(req, res);

    expect(mockGeneratePasswordResetLink).toHaveBeenCalledWith('userTest@ucr.ac.cr');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message });
  });

  it('should return 400 if email is invalid', async () => {
    req.body.email = 'not-an-email';

    await sendRecoveryLink(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email format. Make sure it is the institutional email.' });
  });
});
