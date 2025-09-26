/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class AddEventSponsorDto {
  @IsString()
  @IsNotEmpty()
  event_id: string;

  @IsString()
  @IsNotEmpty()
  sponsor_id: string;

  @IsOptional()
  @IsString()
  tier?: string; // Override sponsor tier for this specific event

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number; // For ordering sponsors in the event
}
