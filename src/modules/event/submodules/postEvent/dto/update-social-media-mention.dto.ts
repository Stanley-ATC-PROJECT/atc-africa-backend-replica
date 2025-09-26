/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateSocialMediaMentionDto } from './create-social-media-mention.dto';

export class UpdateSocialMediaMentionDto extends PartialType(
  CreateSocialMediaMentionDto,
) {}
