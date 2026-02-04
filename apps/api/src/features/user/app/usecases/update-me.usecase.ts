import { NotFoundException } from '@nestjs/common';
import { IUserRepository, User } from '@sagepoint/domain';

export interface UpdateMeInput {
  name?: string;
  learningGoal?: string;
  avatarUrl?: string;
}

export class UpdateMeUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, input: UpdateMeInput): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = user.withPartialUpdate(input);
    await this.userRepository.save(updatedUser);

    return updatedUser;
  }
}
