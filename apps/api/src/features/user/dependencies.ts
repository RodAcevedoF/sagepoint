import type { IUserService } from '@/features/user/domain/inbound/user.service';
import type { IUserRepository, IFileStorage } from '@sagepoint/domain';
import type { PrismaClient } from '@sagepoint/database';
import { UserDtoMapper } from './app/dto/user-dto.mapper';
import { UserService } from '@/features/user/infra/driver/user.service';
import { CreateUserUseCase } from './app/usecases/create-user.usecase';
import { GetUserUseCase } from './app/usecases/get-user.usecase';
import { UpdateUserUseCase } from './app/usecases/update-user.usecase';
import { UpdateMeUseCase } from './app/usecases/update-me.usecase';
import { CompleteOnboardingUseCase } from './app/usecases/complete-onboarding.usecase';
import { GetResourceQuotaUseCase } from './app/usecases/get-resource-quota.usecase';
import { InterestResolverService } from './app/services/interest-resolver.service';
import {
  PrismaUserRepository,
  PrismaCategoryRepository,
  PrismaDocumentRepository,
  PrismaRoadmapRepository,
  PrismaResourceLimitsRepository,
} from '@sagepoint/database';

export interface UserDependencies {
  userService: IUserService;
  userRepository: IUserRepository;
  userDtoMapper: UserDtoMapper;
}

export function makeUserDependencies(
  prismaService: PrismaClient,
  fileStorage: IFileStorage,
): UserDependencies {
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
  const getResourceQuotaUseCase = new GetResourceQuotaUseCase(
    new PrismaDocumentRepository(prismaService),
    new PrismaRoadmapRepository(prismaService),
    new PrismaResourceLimitsRepository(prismaService),
  );

  const userService = new UserService(
    createUserUseCase,
    getUserUseCase,
    updateUserUseCase,
    updateMeUseCase,
    completeOnboardingUseCase,
    getResourceQuotaUseCase,
  );

  const userDtoMapper = new UserDtoMapper(fileStorage);

  return {
    userService,
    userRepository,
    userDtoMapper,
  };
}
