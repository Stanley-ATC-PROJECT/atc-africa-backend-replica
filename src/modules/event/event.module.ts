/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventService } from './services/event.service';
import { EventController } from './event.controller';
import { EventRepository } from './event.repository';
import { EventNotificationService } from './services/event-notification.service';
import { SpeakerModule } from './submodules/speaker/speaker.module';
import { PostEventModule } from './submodules/postEvent/post-event.module';
import { EventSponsorModule } from './submodules/eventSponsor/event-sponsor.module';
import { UserModule } from '../user/user.module';
import { StorageModule } from '../../utils/storage/storage.module';
import { NotificationModule } from '../../utils/notification/notification.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    UserModule,
    SpeakerModule,
    PostEventModule,
    EventSponsorModule,
    StorageModule,
    NotificationModule,
  ],
  controllers: [EventController],
  providers: [EventService, EventRepository, EventNotificationService],
  exports: [EventRepository, EventService, EventNotificationService],
})
export class EventModule {}
