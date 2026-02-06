import type { IUserService } from '@/features/user/domain/inbound/user.service';
import type { IUserRepository } from '@sagepoint/domain';
import { UserService } from '@/features/user/infra/driver/user.service';
import { CreateUserUseCase } from './app/usecases/create-user.usecase';
import { GetUserUseCase } from './app/usecases/get-user.usecase';
import { UpdateUserUseCase } from './app/usecases/update-user.usecase';
import { UpdateMeUseCase } from './app/usecases/update-me.usecase';
import { CompleteOnboardingUseCase } from './app/usecases/complete-onboarding.usecase';
import { PrismaService } from '@/core/infra/database/prisma.service';
import { PrismaUserRepository } from '@/features/user/infra/driven/prisma-user.repository';
import { PrismaCategoryRepository } from '@/features/category/infra/adapter/prisma-category.repository';

export interface UserDependencies {
  userService: IUserService;
  userRepository: IUserRepository;
}

export function makeUserDependencies(): UserDependencies {
  const prismaService = new PrismaService();
  const userRepository = new PrismaUserRepository(prismaService);
  const categoryRepository = new PrismaCategoryRepository(prismaService);

  const createUserUseCase = new CreateUserUseCase(userRepository);
  const getUserUseCase = new GetUserUseCase(userRepository);
  const updateUserUseCase = new UpdateUserUseCase(userRepository);
  const updateMeUseCase = new UpdateMeUseCase(userRepository);
  const completeOnboardingUseCase = new CompleteOnboardingUseCase(
    userRepository,
    categoryRepository,
  );

  const userService = new UserService(
    createUserUseCase,
    getUserUseCase,
    updateUserUseCase,
    updateMeUseCase,
    completeOnboardingUseCase,
  );

  return {
    userService,
    userRepository,
  };
}
