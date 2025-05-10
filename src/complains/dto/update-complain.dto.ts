// src/complains/dto/update-complain.dto.ts
export class UpdateComplainDto {
  readonly user_id?: number;
  readonly category_id?: number;
  readonly subject?: string;
  readonly description?: string;
  readonly priority?: 'high' | 'normal' | 'low';
}
