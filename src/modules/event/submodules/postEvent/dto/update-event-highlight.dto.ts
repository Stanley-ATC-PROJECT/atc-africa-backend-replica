/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateEventHighlightDto } from './create-event-highlight.dto';

export class UpdateEventHighlightDto extends PartialType(
  CreateEventHighlightDto,
) {}
