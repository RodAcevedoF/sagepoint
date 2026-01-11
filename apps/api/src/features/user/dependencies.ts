import type { IUserService } from '@/features/user/domain/inbound/user.service';
import { IUserRepository } from '@sagepoint/domain';
import { UserService } from '@/features/user/infra/driver/user.service';
import { InMemoryUserRepository } from '@/features/user/infra/driven/in-memory-user.repository';
import { CreateUserUseCase } from './app/usecases/create-user.usecase';
import { GetUserUseCase } from './app/usecases/get-user.usecase';

import { UpdateUserUseCase } from './app/usecases/update-user.usecase';

export interface UserDependencies {
  userService: IUserService;
  userRepository: IUserRepository;
}

import { PrismaService } from '@/core/infra/database/prisma.service';
import { PrismaUserRepository } from '@/features/user/infra/driven/prisma-user.repository';

// ... imports

export function makeUserDependencies(): UserDependencies {
  const prismaService = new PrismaService(); // Ideally singleton from module, but factory creates isolated scope
  // Actually, standard Nest way is injecting PrismaService, but here we are in factory land.
  // We can instantiate it here, but we need to ensure lifecycle hooks work.
  // Ideally, PrismaService should be passed via Bootstrap or similar.
  // For now, let's instantiate.
  const userRepository = new PrismaUserRepository(prismaService);

  const createUserUseCase = new CreateUserUseCase(userRepository);
  const getUserUseCase = new GetUserUseCase(userRepository);
  const updateUserUseCase = new UpdateUserUseCase(userRepository);

  const userService = new UserService(createUserUseCase, getUserUseCase, updateUserUseCase);

  return {
    userService,
    userRepository,
  };
}
