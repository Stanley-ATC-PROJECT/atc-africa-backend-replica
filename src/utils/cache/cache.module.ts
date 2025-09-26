/* eslint-disable prettier/prettier */
import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { CacheService } from './cache.service';
import { ENV } from '../config/env.enum';

// CacheModule configured using REDIS_URL, CACHE_TTL, and CACHE_MAX from .env
// TODO: Fix redis connection issues for CacheModule to work, for now we'll use in-memory cache
// @Module({
//   imports: [
//     ConfigModule,
//     NestCacheModule.registerAsync({
//       isGlobal: true,
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: async (config: ConfigService) => {
//         const logger = new Logger('CacheModule');
//         const redisUrl = config.get<string>(ENV.REDIS_URL);
//         const cacheTtl = config.get<number>(ENV.CACHE_TTL) || 3600;
//         const cacheMax = config.get<number>(ENV.CACHE_MAX) || 100;

//         logger.log('Initializing Redis cache store...');
//         logger.log(`Redis URL: ${redisUrl ? 'Configured' : 'Not configured'}`);
//         logger.log(`Cache TTL: ${cacheTtl}s, Max items: ${cacheMax}`);

//         try {
//           const store = await redisStore({
//             url: redisUrl,
//             socket: {
//               reconnectStrategy: (retries) => Math.min(retries * 50, 500),
//             },
//           });

//           // Test the connection
//           await store.client.ping();
//           logger.log('✅ Redis cache store connected and ready');

//           return {
//             store,
//             ttl: cacheTtl,
//             max: cacheMax,
//           };
//         } catch (error) {
//           logger.error(
//             '❌ Failed to connect to Redis cache store:',
//             error.message,
//           );
//           throw error;
//         }
//       },
//     }),
//   ],
//   providers: [CacheService],
//   exports: [CacheService, NestCacheModule],
// })
// In-memory cache module configuration (no Redis)
@Module({
  imports: [
    ConfigModule,
    NestCacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      // Factory for in-memory cache config
      useFactory: async (config: ConfigService) => {
        const logger = new Logger('CacheModule');
        const cacheTtl = config.get<number>(ENV.CACHE_TTL) || 3600;
        const cacheMax = config.get<number>(ENV.CACHE_MAX) || 100;

        logger.log('Initializing in-memory cache store...');
        logger.log(`Cache TTL: ${cacheTtl}s, Max items: ${cacheMax}`);

        // Use default in-memory store provided by @nestjs/cache-manager
        return {
          ttl: cacheTtl,
          max: cacheMax,
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}
