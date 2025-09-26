import { PaginationQueryDto } from 'src/common/dto/PaginationQuery.dto';
import { UserRole } from '@prisma/client';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UserQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  email?: string;
}
