/* eslint-disable prettier/prettier */
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class HighlightItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(['video', 'image'])
  type: 'video' | 'image';

  @IsString()
  @IsNotEmpty()
  @IsOptional() //only required for videos(youtube url)
  url: string;

  // Add index signature to make it compatible with InputJsonValue
  [key: string]: any;
}

export class CreateEventHighlightDto {
  @IsString()
  @IsNotEmpty()
  event_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HighlightItemDto)
  highlights: HighlightItemDto[];

  @IsInt()
  @Min(0)
  attendance: number;

  @IsInt()
  @Min(0)
  ticket_sales: number;
}
