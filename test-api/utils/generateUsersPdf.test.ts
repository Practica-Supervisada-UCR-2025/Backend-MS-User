import { generateUsersPdf } from '../../src/utils/PDF/userPdfGenerator';

describe('generateUsersPdf', () => {
  test('should generate a PDF buffer with valid user data', async () => {
    const users = [
      {
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        username: 'testuser',
        created_at: '2024-01-01T00:00:00.000Z',
        is_active: true,
        auth_id: 'auth123',
      },
      {
        id: '2',
        email: 'inactive@example.com',
        full_name: 'Inactive User',
        username: 'inactive',
        created_at: '2024-02-01T00:00:00.000Z',
        is_active: false,
        auth_id: 'auth456',
      },
    ];

    const buffer = await generateUsersPdf(users);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);

    // (opcional) Verificá que comience como un PDF
    expect(buffer.toString('utf8', 0, 4)).toBe('%PDF');
  });

  test('should generate a PDF even if users array is empty', async () => {
    const buffer = await generateUsersPdf([]);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.toString('utf8', 0, 4)).toBe('%PDF');
  });
});
