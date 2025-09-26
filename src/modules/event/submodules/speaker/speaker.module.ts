import { Module } from '@nestjs/common';
import { SpeakerController } from './speaker.controller';
import { SpeakerService } from './speaker.service';
import { SpeakerRepository } from './speaker.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SpeakerController],
  providers: [SpeakerService, SpeakerRepository],
  exports: [SpeakerService, SpeakerRepository],
})
export class SpeakerModule {}
