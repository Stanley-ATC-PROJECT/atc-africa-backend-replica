import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateOrganizerDto } from './create-organizer.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

// Exclude password from update DTO for security reasons
export class UpdateOrganizerDto extends PartialType(
  OmitType(CreateOrganizerDto, ['password'] as const),
) {}

// Separate DTO for password updates by community manager
export class UpdateOrganizerPasswordDto {
  @IsString()
  @MinLength(6)
  newPassword: string;
}

// DTO for bulk organizer operations
export class BulkOrganizerOperationDto {
  @IsString({ each: true })
  userIds: string[];

  @IsOptional()
  is_active?: boolean;
}
