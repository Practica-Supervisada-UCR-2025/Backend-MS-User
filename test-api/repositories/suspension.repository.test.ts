import client from '../../src/config/database';

jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

jest.mock('uuid', () => ({ v4: jest.fn() }));

import { createSuspension } from '../../src/features/users/repositories/suspension.repository';
import { v4 as uuidv4 } from 'uuid';

describe('createSuspension', () => {
  const mockUserId = 'user-123';
  const mockDays = 5;
  const mockDescription = 'Test suspension';
  const mockId = 'uuid-123';
  const mockStartDate = new Date();
  const mockEndDate = new Date(mockStartDate);
  mockEndDate.setDate(mockStartDate.getDate() + mockDays);

  beforeEach(() => {
    jest.clearAllMocks();
    (uuidv4 as jest.Mock).mockReturnValue(mockId);
  });

  it('should insert a suspension and return the inserted row', async () => {
    const mockRow = {
      id: mockId,
      user_id: mockUserId,
      start_date: mockStartDate,
      end_date: mockEndDate,
      description: mockDescription,
    };
    (client.query as jest.Mock).mockResolvedValue({ rows: [mockRow] });

    const result = await createSuspension({ user_id: mockUserId, days: mockDays, description: mockDescription });

    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_suspensions'),
      [mockId, mockUserId, expect.any(Date), expect.any(Date), mockDescription]
    );
    expect(result).toEqual(mockRow);
  });

  it('should handle DB errors', async () => {
    (client.query as jest.Mock).mockRejectedValue(new Error('DB error'));
    await expect(
      createSuspension({ user_id: mockUserId, days: mockDays, description: mockDescription })
    ).rejects.toThrow('DB error');
  });
});
