import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  LoggerService,
  Logger,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.constant';

/**
 * Redis service for caching and session management
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT) private readonly client: Redis,
    private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    // Set up event listeners for Redis connection
    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis connection is ready');
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error:', error.message);
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      this.logger.log('Redis reconnecting...');
    });

    // Don't manually connect - lazyConnect will handle this automatically
    // The connection will be established when the first command is executed
    this.logger.log('Redis client initialized with lazy connection');
  }

  async onModuleDestroy() {
    if (this.client && this.client.status !== 'end') {
      try {
        await this.client.quit();
        this.logger.log('Disconnected from Redis');
      } catch (error) {
        this.logger.warn('Error during Redis disconnection:', error.message);
        // Force disconnect if quit fails
        this.client.disconnect();
      }
    }
  }

  /**
   * Set a key-value pair with expiration
   */
  async setex(key: string, seconds: number, value: string): Promise<void> {
    await this.client.setex(key, seconds, value);
  }

  /**
   * Set a key-value pair without expiration
   */
  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  /**
   * Get value by key
   */
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Set expiration on a key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  /**
   * Increment a numeric value
   */
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  async flushall(): Promise<void> {
    await this.client.flushall();
  }

  /**
   * Get Redis client for advanced operations
   */
  getClient(): Redis {
    return this.client;
  }
}
