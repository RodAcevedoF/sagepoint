import type { IUserService } from '@/features/user/domain/inbound/user.service';
import type { IUserRepository, IFileStorage } from '@sagepoint/domain';
import { UserDtoMapper } from './app/dto/user-dto.mapper';
import { UserService } from '@/features/user/infra/driver/user.service';
import { CreateUserUseCase } from './app/usecases/create-user.usecase';
import { GetUserUseCase } from './app/usecases/get-user.usecase';
import { UpdateUserUseCase } from './app/usecases/update-user.usecase';
import { UpdateMeUseCase } from './app/usecases/update-me.usecase';
import { CompleteOnboardingUseCase } from './app/usecases/complete-onboarding.usecase';
import { InterestResolverService } from './app/services/interest-resolver.service';
import { PrismaService } from '@/core/infra/database/prisma.service';
import {
  PrismaUserRepository,
  PrismaCategoryRepository,
} from '@sagepoint/database';

export interface UserDependencies {
  userService: IUserService;
  userRepository: IUserRepository;
  userDtoMapper: UserDtoMapper;
}

export function makeUserDependencies(
  fileStorage: IFileStorage,
): UserDependencies {
  const prismaService = new PrismaService();
  const userRepository = new PrismaUserRepository(prismaService);
  const categoryRepository = new PrismaCategoryRepository(prismaService);
  const interestResolver = new InterestResolverService(categoryRepository);

  const createUserUseCase = new CreateUserUseCase(userRepository);
  const getUserUseCase = new GetUserUseCase(userRepository);
  const updateUserUseCase = new UpdateUserUseCase(userRepository);
  const updateMeUseCase = new UpdateMeUseCase(
    userRepository,
    interestResolver,
    fileStorage,
  );
  const completeOnboardingUseCase = new CompleteOnboardingUseCase(
    userRepository,
    interestResolver,
  );

  const userService = new UserService(
    createUserUseCase,
    getUserUseCase,
    updateUserUseCase,
    updateMeUseCase,
    completeOnboardingUseCase,
  );

  const userDtoMapper = new UserDtoMapper(fileStorage);

  return {
    userService,
    userRepository,
    userDtoMapper,
  };
}
