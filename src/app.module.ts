/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { EventModule } from './modules/event/event.module';
import { SpeakerModule } from './modules/event/submodules/speaker/speaker.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SponsorModule } from './modules/sponsor/sponsor.module';
import { CacheModule as CustomCacheModule } from './utils/cache/cache.module';
import { RedisModule } from './utils/redis/redis.module';
import { NotificationModule } from './utils/notification/notification.module';
import { CommonModule } from './common/common.module';
// BullModule no longer needed - using EventEmitter instead
// import { BullModule } from '@nestjs/bullmq';
import { ENV } from './utils/config/env.enum';
import { StorageModule } from './utils/storage/storage.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    EventModule,
    SpeakerModule,
    PrismaModule,
    SponsorModule,
    NotificationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: false,
      expandVariables: true,
      // load: [envConfig],
    }),
    CustomCacheModule,
    // TODO: Fix redis connection issues, for RedisModule to work
    // RedisModule,
    CommonModule,
    StorageModule,
    // TODO: Fix redis connection issues for BullModule to work
    // BullModule.forRootAsync({
    //   useFactory: async (configService) => ({
    //     connection: {
    //       url: configService.get(ENV.REDIS_URL),
    //     },
    //   }),
    //   inject: [ConfigService],
    //   imports: [ConfigModule],
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
