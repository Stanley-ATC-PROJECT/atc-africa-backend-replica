/* eslint-disable prettier/prettier */
import { IsEnum, IsOptional, IsString, IsDate } from 'class-validator';
import { EventStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  flyer_image?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}
