/* eslint-disable prettier/prettier */
import { ConfigService as ConfigServiceBase } from '@nestjs/config';
import { ENV } from 'src/utils/config/env.enum';
import 'dotenv/config';

class ConfigService extends ConfigServiceBase {
  constructor() {
    super();
  }

  get(key: ENV): string {
    const value = super.get<string>(key);
    if (value === undefined) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
  }

  set(key: ENV, value: any): void {
    super.set(key, value);
  }
}

const configService = new ConfigService(); // ✅ use custom class

export { configService, ConfigService };
