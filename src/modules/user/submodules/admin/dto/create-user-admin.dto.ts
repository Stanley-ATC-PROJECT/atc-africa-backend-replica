import { IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { OmitType } from '@nestjs/mapped-types';
export class CreateUserAdminDto extends OmitType(CreateUserDto, [
  'role',
] as const) {
  @IsEnum(UserRole)
  role: UserRole = UserRole.admin;
}
