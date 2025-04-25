import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class SendRecoveryLinkDto {
  @IsEmail()
  @IsNotEmpty()
  @Matches(/^[\w.-]+@ucr\.ac\.cr$/, {
    message: 'El correo electrónico debe ser institucional (@ucr.ac.cr)',
  })
  email!: string;
}
