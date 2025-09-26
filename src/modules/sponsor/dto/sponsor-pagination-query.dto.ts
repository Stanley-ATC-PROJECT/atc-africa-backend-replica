/* eslint-disable prettier/prettier */
import { PaginationQueryDto } from 'src/common/dto/PaginationQuery.dto';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class SponsorPaginationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  tier?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true' || value === true,
  )
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  website_url?: string;
}
