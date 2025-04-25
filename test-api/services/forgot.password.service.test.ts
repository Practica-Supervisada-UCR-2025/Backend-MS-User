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
      ' http://157.230.224.13:3002/api/email/send-password-reset',
      { email, recoveryLink }
    );
    expect(result).toBe(`Se envio el correo de recuperación a userTest@ucr.ac.cr.Sigue las instrucciones en el correo para restablecer tu contraseña.`);
  });

  it('should throw an error if Firebase generatePasswordResetLink fails', async () => {
    mockAdmin.auth().generatePasswordResetLink.mockRejectedValueOnce(new Error('Firebase error'));

    await expect(generatePasswordResetLink(email)).rejects.toThrow('El correo electrónico no es válido o no está registrado.');
    expect(mockedAxiosPost).not.toHaveBeenCalled();
  });

  it('should throw an error if axios.post fails', async () => {
    mockAdmin.auth().generatePasswordResetLink.mockResolvedValueOnce(recoveryLink);
    mockedAxiosPost.mockRejectedValueOnce(new Error('Axios error'));

    await expect(generatePasswordResetLink(email)).rejects.toThrow('El correo electrónico no es válido o no está registrado.');
  });
  
});
