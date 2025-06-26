import { IsISO8601, IsInt, Min, MinLength, MaxLength, IsString, IsOptional } from 'class-validator';

export class GetAllUsersQueryDto {
  @IsOptional()
  @IsISO8601()
  created_after?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  username?: string;
}
