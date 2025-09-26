/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateSocialMediaMentionDto {
  @IsString()
  @IsNotEmpty()
  event_id: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsUrl()
  link: string;
}
