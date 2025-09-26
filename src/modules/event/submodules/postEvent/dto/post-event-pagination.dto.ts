/* eslint-disable prettier/prettier */
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/PaginationQuery.dto';

export class PostEventPaginationQueryDto extends PaginationQueryDto {
  @IsString()
  @IsOptional()
  event_id?: string;

  @IsString()
  @IsOptional()
  platform?: string; // For social media mentions filtering
}
