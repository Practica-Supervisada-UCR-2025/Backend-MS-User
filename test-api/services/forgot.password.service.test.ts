import axios from 'axios';
import mockAdmin from '../mocks/firebase.mock';
import { generatePasswordResetLink } from '../../src/features/users/services/forgot.password.service';

jest.mock('../../src/config/firebase', () => ({
  __esModule: true,
  default: mockAdmin,
}));

jest.mock('axios');
const mockedAxiosPost = axios.post as jest.Mock;

describe('generatePasswordResetLink with static mock', () => {
  const email = 'userTest@ucr.ac.cr';
  const recoveryLink = 'https://mock-reset-link.com';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a password reset link and send it via MS-Notification', async () => {
    mockAdmin.auth().generatePasswordResetLink.mockResolvedValueOnce(recoveryLink);
    mockedAxiosPost.mockResolvedValueOnce({ status: 200 });

    const result = await generatePasswordResetLink(email);

    expect(mockAdmin.auth().generatePasswordResetLink).toHaveBeenCalledWith(email);
    expect(mockedAxiosPost).toHaveBeenCalledWith(
      `http://${process.env.MS_NOTIFICATIONS_URL}/api/email/send-password-reset`,
      { email, recoveryLink }
    );
    expect(result).toBe(`The recovery email has been sent to userTest@ucr.ac.cr. Follow the instructions in the email to reset your password.`);
  });

  it('should throw an error if Firebase generatePasswordResetLink fails', async () => {
    mockAdmin.auth().generatePasswordResetLink.mockRejectedValueOnce(new Error('Firebase error'));

    await expect(generatePasswordResetLink(email)).rejects.toThrow('The email is not valid or is not registered.');
    expect(mockedAxiosPost).not.toHaveBeenCalled();
  });

  it('should throw an error if axios.post fails', async () => {
    mockAdmin.auth().generatePasswordResetLink.mockResolvedValueOnce(recoveryLink);
    mockedAxiosPost.mockRejectedValueOnce(new Error('Axios error'));

    await expect(generatePasswordResetLink(email)).rejects.toThrow('The email is not valid or is not registered.');
  });
});
