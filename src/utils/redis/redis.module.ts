import { Module, Logger, LoggerService } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redis from 'ioredis';
// import { ConfigService } from 'src/utils/config/config.service';
import { ConfigService } from '@nestjs/config';
import { ENV } from 'src/utils/config/env.enum';
import { REDIS_CLIENT } from 'src/utils/redis/redis.constant';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    RedisService,
    Logger,
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService): Redis => {
        const redisUrl = configService.get(ENV.REDIS_URL) as string;

        const client = new Redis(redisUrl, {
          lazyConnect: true, // Enable lazy connection
          maxRetriesPerRequest: 3,
          enableReadyCheck: false,
          reconnectOnError: (err) => {
            const targetErrors = ['READONLY', 'ECONNRESET', 'EPIPE'];
            return targetErrors.some((target) => err.message.includes(target));
          },
        });

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
