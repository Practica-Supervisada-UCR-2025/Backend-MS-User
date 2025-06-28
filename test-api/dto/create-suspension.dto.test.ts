import { createSuspensionSchema } from '../../src/features/users/dto/create-suspension.dto';
import { v4 as uuidv4 } from 'uuid';

describe('createSuspensionSchema', () => {
  it('should validate a correct payload', async () => {
    const valid = {
      user_id: uuidv4(),
      days: 5,
      description: 'Valid suspension',
    };
    await expect(createSuspensionSchema.validate(valid)).resolves.toBeTruthy();
  });

  it('should fail for missing user_id', async () => {
    const invalid = { days: 2 };
    await expect(createSuspensionSchema.validate(invalid)).rejects.toThrow();
  });

  it('should fail for invalid days', async () => {
    const invalid = { user_id: uuidv4(), days: 0 };
    await expect(createSuspensionSchema.validate(invalid)).rejects.toThrow();
  });
});
