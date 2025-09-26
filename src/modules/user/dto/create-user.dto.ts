import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  IsBoolean,
  IsJSON,
  MaxLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MaxLength(255)
  notificationEmail: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.organizer;

  @IsOptional()
  user_metadata?: any;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  organization?: string;
}
