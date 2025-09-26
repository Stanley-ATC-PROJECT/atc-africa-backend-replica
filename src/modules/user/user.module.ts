import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationModule } from '../../utils/notification/notification.module';
import { AdminController } from './submodules/admin/admin.controller';
import { CommunityManagerController } from './submodules/community-manager/community-manager.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [NotificationModule, forwardRef(() => AuthModule)],
  controllers: [UserController, AdminController, CommunityManagerController],
  providers: [UserService, UserRepository, PrismaService],
  exports: [UserService],
})
export class UserModule {}
