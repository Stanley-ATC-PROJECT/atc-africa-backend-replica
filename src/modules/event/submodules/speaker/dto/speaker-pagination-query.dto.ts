import { PaginationQueryDto } from 'src/common/dto/PaginationQuery.dto';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class SpeakerPaginationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true' || value === true,
  )
  @IsBoolean()
  keynote?: boolean;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true' || value === true,
  )
  @IsBoolean()
  active?: boolean;
}
