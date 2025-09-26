/* eslint-disable prettier/prettier */
import { IsOptional, IsString } from 'class-validator';

export class UploadFlyerDto {
  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}
