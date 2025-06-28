import { suspendUserService } from '../../src/features/users/services/suspension.service';
import { CreateSuspensionDTO } from '../../src/features/users/dto/create-suspension.dto';
import * as userRepository from '../../src/features/users/repositories/user.repository';
import * as suspensionRepository from '../../src/features/users/repositories/suspension.repository';
import { NotFoundError } from '../../src/utils/errors/api-error';

jest.mock('../../src/features/users/repositories/user.repository');
jest.mock('../../src/features/users/repositories/suspension.repository');

describe('suspendUserService', () => {
  const mockUser = { id: 'user123', name: 'Test User' };
  const mockDto: CreateSuspensionDTO = { user_id: 'user123', reason: 'test reason', admin_id: 'admin1' } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundError if user does not exist', async () => {
    (userRepository.findByIdUser as jest.Mock).mockResolvedValue(null);
    await expect(suspendUserService(mockDto)).rejects.toThrow(NotFoundError);
    await expect(suspendUserService(mockDto)).rejects.toThrow('User not found');
  });

  it('should call createSuspension and return its result if user exists', async () => {
    (userRepository.findByIdUser as jest.Mock).mockResolvedValue(mockUser);
    const mockSuspension = { id: 'susp1', ...mockDto };
    (suspensionRepository.createSuspension as jest.Mock).mockResolvedValue(mockSuspension);

    const result = await suspendUserService(mockDto);
    expect(userRepository.findByIdUser).toHaveBeenCalledWith('user123');
    expect(suspensionRepository.createSuspension).toHaveBeenCalledWith(mockDto);
    expect(result).toEqual(mockSuspension);
  });
});
