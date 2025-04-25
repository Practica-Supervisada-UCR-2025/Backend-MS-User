import { SendRecoveryLinkDto } from '../../src/features/users/dto/send-recovery-link.dto';
import { validate } from 'class-validator';

describe('SendRecoveryLinkDto', () => {
  it('should pass validation with a valid email', async () => {
    const dto = new SendRecoveryLinkDto();
    dto.email = 'user@ucr.ac.cr';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail validation with an invalid email', async () => {
    const dto = new SendRecoveryLinkDto();
    dto.email = 'invalid-email';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail validation when email is missing', async () => {
    const dto = new SendRecoveryLinkDto();

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });
});
