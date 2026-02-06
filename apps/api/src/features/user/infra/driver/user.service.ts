import { CreateUserUseCase } from '@/features/user/app/usecases/create-user.usecase';
import { GetUserUseCase } from '@/features/user/app/usecases/get-user.usecase';
import { UpdateUserUseCase } from '@/features/user/app/usecases/update-user.usecase';
import { UpdateMeUseCase } from '@/features/user/app/usecases/update-me.usecase';
import { CompleteOnboardingUseCase } from '@/features/user/app/usecases/complete-onboarding.usecase';
import { User } from '@sagepoint/domain';
import {
  CreateUserInput,
  IUserService,
  OnboardingInput,
  UpdateProfileInput,
} from '@/features/user/domain/inbound/user.service';

export class UserService implements IUserService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateMeUseCase: UpdateMeUseCase,
    private readonly completeOnboardingUseCase: CompleteOnboardingUseCase,
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    return await this.createUserUseCase.execute(input);
  }

  async save(user: User): Promise<void> {
    await this.updateUserUseCase.execute(user);
  }

  async get(id: string): Promise<User | null> {
    return await this.getUserUseCase.execute(id);
  }

  async getByEmail(email: string): Promise<User | null> {
    return await this.getUserUseCase.byEmail(email);
  }

  async getByGoogleId(googleId: string): Promise<User | null> {
    return await this.getUserUseCase.byGoogleId(googleId);
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<User> {
    return await this.updateMeUseCase.execute(userId, input);
  }

  async completeOnboarding(
    userId: string,
    input: OnboardingInput,
  ): Promise<void> {
    await this.completeOnboardingUseCase.execute(userId, input);
  }
}
