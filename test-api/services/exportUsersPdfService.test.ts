import { exportUsersPdfService } from '../../src/features/users/services/exportUsersPdf.service';
import * as userRepository from '../../src/features/users/repositories/user.repository';
import * as pdfUtil from '../../src/utils/PDF/userPdfGenerator';

jest.mock('../../src/features/users/repositories/user.repository');
jest.mock('../../src/utils/PDF/userPdfGenerator');

const mockedGetAllUsers = userRepository.getAllUsers as jest.Mock;
const mockedGenerateUsersPdf = pdfUtil.generateUsersPdf as jest.Mock;

describe('exportUsersPdfService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return PDF buffer when users exist', async () => {
    const mockUsers = [{ id: 1, name: 'Esteban' }];
    const fakeBuffer = Buffer.from('fake-pdf');

    mockedGetAllUsers.mockResolvedValue(mockUsers);
    mockedGenerateUsersPdf.mockResolvedValue(fakeBuffer);

    const result = await exportUsersPdfService();

    expect(mockedGetAllUsers).toHaveBeenCalled();
    expect(mockedGenerateUsersPdf).toHaveBeenCalledWith(mockUsers);
    expect(result).toBe(fakeBuffer);
  });

  test('should throw error when no users found (empty array)', async () => {
    mockedGetAllUsers.mockResolvedValue([]);

    await expect(exportUsersPdfService()).rejects.toThrow(
      'There are no users to export.'
    );
  });

  test('should throw error when getAllUsers returns null', async () => {
    mockedGetAllUsers.mockResolvedValue(null);

    await expect(exportUsersPdfService()).rejects.toThrow(
      'There are no users to export.'
    );
  });

  test('should throw if generateUsersPdf fails', async () => {
    const mockUsers = [{ id: 1, name: 'Esteban' }];
    mockedGetAllUsers.mockResolvedValue(mockUsers);
    mockedGenerateUsersPdf.mockRejectedValue(new Error('PDF generation failed'));

    await expect(exportUsersPdfService()).rejects.toThrow('PDF generation failed');
  });
});
