// Interface for creating a user suspension
export interface CreateSuspensionDto {
  user_id: string;
  days: number;
  description?: string;
}
