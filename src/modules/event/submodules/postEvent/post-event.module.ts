/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PostEventService } from './post-event.service';
import { PostEventController } from './post-event.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationModule } from 'src/utils/notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [PostEventController],
  providers: [PostEventService],
  exports: [PostEventService],
})
export class PostEventModule {}
