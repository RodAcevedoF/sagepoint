import { Module } from '@nestjs/common';
import { USER_SERVICE } from '@/features/user/domain/inbound/user.service';
import { USER_REPOSITORY } from '@sagepoint/domain';
import { UserController } from '@/features/user/infra/driver/http/user.controller';
import { OnboardingController } from '@/features/user/infra/driver/http/onboarding.controller';
import { UpdateUserProfileUseCase } from '@/features/user/app/usecases/update-user-profile.usecase';
import { getDependencies } from '@/core/bootstrap';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [CategoryModule],
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
       provide: 'UpdateUserProfileUseCase',
       useClass: UpdateUserProfileUseCase
    }
  ],
  exports: [USER_SERVICE],
})
export class UserModule {}
