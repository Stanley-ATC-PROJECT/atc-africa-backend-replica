import { CreateUserDto } from '../../user/dto/create-user.dto';
import { OmitType } from '@nestjs/mapped-types';
export class RegisterDto extends OmitType(CreateUserDto, [
  'is_active',
]) {}
