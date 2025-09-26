import { IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { OmitType } from '@nestjs/mapped-types';

export class CreateOrganizerDto extends OmitType(CreateUserDto, [
  'role',
  'is_active',
] as const) {
  @IsEnum(UserRole)
  role: UserRole = UserRole.organizer;
}
