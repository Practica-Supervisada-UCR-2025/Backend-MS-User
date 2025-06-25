import { GetAllUsersQueryDto } from '../../src/features/users/dto/getAllUsers.dto';
import { validate } from 'class-validator';

describe('GetAllUsersQueryDto', () => {
  it('should pass validation with valid created_after and limit', async () => {
    const dto = new GetAllUsersQueryDto();
    dto.created_after = '2025-06-01T00:00:00Z';
    dto.limit = 10;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if created_after is not a valid ISO date', async () => {
    const dto = new GetAllUsersQueryDto();
    dto.created_after = 'not-a-date';
    dto.limit = 10;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('created_after');
  });


  it('should fail validation if limit is not a number', async () => {
    const dto = new GetAllUsersQueryDto() as any;
    dto.created_after = '2025-06-01T00:00:00Z';
    dto.limit = 'not-a-number';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('limit');
  });

  it('should fail validation if limit is less than 1', async () => {
    const dto = new GetAllUsersQueryDto();
    dto.created_after = '2025-06-01T00:00:00Z';
    dto.limit = 0;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('limit');
  });
});
