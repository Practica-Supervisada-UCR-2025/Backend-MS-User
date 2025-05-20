import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class SendRecoveryLinkDto {
  @IsEmail()
  @IsNotEmpty()
  @Matches(/^[\w.-]+@ucr\.ac\.cr$/, {
    message: 'The email must be an institutional one (@ucr.ac.cr)',
  })
  email!: string;
}
