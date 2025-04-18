import { Request, Response } from 'express';
import { SendRecoveryLinkDto } from '../dto/send-recovery-link.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { generatePasswordResetLink } from '../services/forgot.password.service';

export const sendRecoveryLink = async (req: Request, res: Response): Promise<void> => {
  const dto = plainToInstance(SendRecoveryLinkDto, req.body);
  const errors = await validate(dto);

  if (errors.length > 0) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }

  try {
    const result = await generatePasswordResetLink(dto.email);
    res.status(200).json({ message: result });
  } catch (err) {
    console.error('[Error sending recovery link]', err);
    res.status(500).json({ error: 'Could not send recovery email' });
  }
};
