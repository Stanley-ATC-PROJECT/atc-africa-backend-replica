/* eslint-disable prettier/prettier */
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventCategory, EventStatus } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  flyer_image?: string;

  @IsString()
  description: string;

  @IsDate()
  @Type(() => Date)
  event_date: Date;

  @IsDate()
  @Type(() => Date)
  start_time: Date;

  @IsDate()
  @Type(() => Date)
  end_time: Date;

  @IsEnum(EventCategory)
  @IsOptional()
  category?: EventCategory;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;

  @IsString()
  about: string;

  @IsUrl()
  registration_link: string;

  @IsUrl()
  event_website_link: string;

}
