import { Module } from '@nestjs/common';
import { USER_SERVICE } from '@/features/user/domain/inbound/user.service';
import { USER_REPOSITORY } from '@sagepoint/domain';
import { UserController } from '@/features/user/infra/driver/http/user.controller';
import { getDependencies } from '@/core/bootstrap';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: USER_SERVICE,
      useFactory: () => getDependencies().user.userService,
    },
    {
      provide: USER_REPOSITORY,
      useFactory: () => getDependencies().user.userRepository,
    },
  ],
  exports: [USER_SERVICE],
})
export class UserModule {}
