import { Module } from '@nestjs/common';
import { USER_SERVICE } from '@/features/user/domain/inbound/user.service';
import { USER_REPOSITORY } from '@sagepoint/domain';
import { USER_DTO_MAPPER } from '@/features/user/app/dto/user-dto.mapper';
import { UserController } from '@/features/user/infra/driver/http/user.controller';
import { OnboardingController } from '@/features/user/infra/driver/http/onboarding.controller';
import { getDependencies } from '@/core/bootstrap';

@Module({
  controllers: [UserController, OnboardingController],
  providers: [
    {
      provide: USER_SERVICE,
      useFactory: () => getDependencies().user.userService,
    },
    {
      provide: USER_REPOSITORY,
      useFactory: () => getDependencies().user.userRepository,
    },
    {
      provide: USER_DTO_MAPPER,
      useFactory: () => getDependencies().user.userDtoMapper,
    },
  ],
  exports: [USER_SERVICE, USER_REPOSITORY, USER_DTO_MAPPER],
})
export class UserModule {}
