import { PaginationQueryDto } from 'src/common/dto/PaginationQuery.dto';
import { EventStatus, EventCategory } from '@prisma/client';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsISO8601,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class EventPaginationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  organizer?: string;

  @IsOptional()
  @IsEnum(EventStatus, { message: 'Invalid event status' })
  status?: EventStatus;

  @IsOptional()
  @IsEnum(EventCategory, { message: 'Invalid event category' })
  category?: EventCategory;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true' || value === true,
  )
  @IsBoolean()
  featured?: boolean;

  // Date range (replaces separate /range endpoint & upcoming/past filters)
  @IsOptional()
  @IsISO8601({}, { message: 'start must be an ISO8601 date string' })
  start?: string; // ISO date string

  @IsOptional()
  @IsISO8601({}, { message: 'end must be an ISO8601 date string' })
  end?: string; // ISO date string
}
