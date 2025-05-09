// src/users/dto/create-user.dto.ts
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string; // Will be hashed before saving to `password_hash`

  @IsNotEmpty()
  phone?: string;

  @IsInt()
  role_id: number;

  @IsInt()
  factory_id: number;
}