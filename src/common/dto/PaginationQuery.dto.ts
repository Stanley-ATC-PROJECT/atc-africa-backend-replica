import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
export class PaginationQueryDto {
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsString()
  @IsOptional()
  orderBy: string = 'created_at';

  @IsEnum(['ASC', 'DESC'], { message: 'Order must be either ASC or DESC' })
  order: 'ASC' | 'DESC' = 'ASC';

  @IsString()
  @IsOptional()
  search?: string;
}
