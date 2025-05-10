// src/complains/dto/create-complain.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateComplainDto {
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @IsInt()
  @IsNotEmpty()
  category_id: number;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsIn(['high', 'normal', 'low'])
  @IsNotEmpty()
  priority: 'high' | 'normal' | 'low';
}
