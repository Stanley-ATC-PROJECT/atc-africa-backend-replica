/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { AddEventSponsorDto } from './add-event-sponsor.dto';

export class UpdateEventSponsorDto extends PartialType(AddEventSponsorDto) {}
