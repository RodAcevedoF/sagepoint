import { NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '@sagepoint/domain';
import { User } from '@sagepoint/domain';
import type { InterestResolverService } from '../services/interest-resolver.service';

export interface UpdateMeInput {
  name?: string;
  learningGoal?: string;
  avatarUrl?: string;
  interests?: string[];
}

export class UpdateMeUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly interestResolver: InterestResolverService,
  ) {}

  async execute(userId: string, input: UpdateMeInput): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const categories =
      input.interests !== undefined
        ? await this.interestResolver.resolve(input.interests)
        : undefined;

    const updatedUser =
      categories !== undefined
        ? user.withPartialUpdate(input).withInterests(categories)
        : user.withPartialUpdate(input);

    await this.userRepository.save(updatedUser);
    return updatedUser;
  }
}
