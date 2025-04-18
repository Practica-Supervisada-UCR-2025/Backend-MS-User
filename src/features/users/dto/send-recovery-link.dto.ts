// send-recovery-link.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendRecoveryLinkDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
