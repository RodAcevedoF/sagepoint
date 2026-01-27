import { CreateUserUseCase } from '@/features/user/app/usecases/create-user.usecase';
import { GetUserUseCase } from '@/features/user/app/usecases/get-user.usecase';
import { UpdateUserUseCase } from '@/features/user/app/usecases/update-user.usecase';
import { User } from '@sagepoint/domain';
import { CreateUserInput, IUserService } from '@/features/user/domain/inbound/user.service';

export class UserService implements IUserService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
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
}
