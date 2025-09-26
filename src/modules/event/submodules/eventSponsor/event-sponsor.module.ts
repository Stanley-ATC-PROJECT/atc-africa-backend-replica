/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { EventSponsorService } from './event-sponsor.service';
import { EventSponsorController } from './event-sponsor.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EventSponsorController],
  providers: [EventSponsorService],
  exports: [EventSponsorService],
})
export class EventSponsorModule {}
