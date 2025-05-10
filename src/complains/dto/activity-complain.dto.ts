// src/users/dto/create-user.dto.ts
import { IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, isString, IsString, MinLength } from 'class-validator';

export class activityComplainDto {
  @IsString()
  @IsNotEmpty()
  complain_id: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsIn(['PENDING', 'IN PROGRESS', 'COMPLETD'])
  @IsNotEmpty()
  status: 'PENDING' | 'PROGRESS' | 'COMPLETD';
}