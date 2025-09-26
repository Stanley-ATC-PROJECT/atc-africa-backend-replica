import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserAdminDto } from './create-user-admin.dto';
import { IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

// Exclude password from update DTO for security reasons
export class UpdateUserAdminDto extends PartialType(
  OmitType(CreateUserAdminDto, ['password'] as const),
) {}

// Separate DTO for password updates by admin
export class UpdateUserPasswordAdminDto {
  @IsString()
  @MinLength(6)
  newPassword: string;
}

// DTO for bulk user operations
export class BulkUserOperationDto {
  @IsString({ each: true })
  userIds: string[];

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsOptional()
  is_active?: boolean;
}
