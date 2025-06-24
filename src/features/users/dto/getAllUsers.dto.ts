import { IsISO8601, IsInt, Min } from 'class-validator';

export class GetAllUsersQueryDto {
  @IsISO8601()
  created_after!: string;

  @IsInt()
  @Min(1)
  limit!: number;
}
