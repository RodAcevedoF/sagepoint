import { User } from '@sagepoint/domain';
import { IUserRepository } from '@sagepoint/domain';

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async byEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async byGoogleId(googleId: string): Promise<User | null> {
    return await this.userRepository.findByGoogleId(googleId);
  }
}
