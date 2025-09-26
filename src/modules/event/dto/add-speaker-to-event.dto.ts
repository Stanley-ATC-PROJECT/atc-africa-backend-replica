import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class AddSpeakerToEventDto {
  @IsString()
  eventId: string;

  @IsString()
  speakerId: string;

  @IsBoolean()
  @IsOptional()
  is_keynote?: boolean = false;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
