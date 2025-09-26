/* eslint-disable prettier/prettier */
import { PaginationQueryDto } from 'src/common/dto/PaginationQuery.dto';
import { IsOptional, IsString } from 'class-validator';

export class EventSponsorPaginationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  event_id?: string;

  @IsOptional()
  @IsString()
  sponsor_id?: string;

  @IsOptional()
  @IsString()
  tier?: string;
}
