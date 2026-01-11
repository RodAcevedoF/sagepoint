import { User, IUserRepository } from '@sagepoint/domain';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(user: User): Promise<void> {
    await this.userRepository.save(user);
  }
}
