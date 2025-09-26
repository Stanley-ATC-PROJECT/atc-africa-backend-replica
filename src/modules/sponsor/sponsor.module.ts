/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SponsorService } from './sponsor.service';
import { SponsorController } from './sponsor.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SponsorService],
  controllers: [SponsorController],
  exports: [SponsorService],
})
export class SponsorModule {}
