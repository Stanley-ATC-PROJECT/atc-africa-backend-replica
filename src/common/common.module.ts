import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/utils/storage/storage.module';

// Export interfaces for global use
export * from './interfaces/multer-file.interface';
@Global()
@Module({
  imports: [ConfigModule, PrismaModule, StorageModule],
  providers: [Logger],
  exports: [Logger, PrismaModule, StorageModule],
})
export class CommonModule {}
