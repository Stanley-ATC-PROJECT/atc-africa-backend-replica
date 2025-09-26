import {
  IsString,
  IsOptional,
  IsUrl,
  MinLength,
  IsEnum,
} from 'class-validator';

export class CreateSponsorDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsUrl()
  @IsOptional()
  logo_url?: string;

  @IsUrl()
  @IsOptional()
  website_url?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(['gold', 'silver', 'bronze'])
  tier?: string; // e.g., "Gold", "Silver", "Bronze", "Platinum"
}
