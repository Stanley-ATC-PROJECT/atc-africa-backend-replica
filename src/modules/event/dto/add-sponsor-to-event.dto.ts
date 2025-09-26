import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class AddSponsorToEventDto {
  @IsString()
  eventId: string;

  @IsString()
  sponsorId: string;

  @IsString()
  @IsOptional()
  tier?: string; // Override sponsor tier for this specific event

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
