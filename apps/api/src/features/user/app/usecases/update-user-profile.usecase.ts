import { USER_REPOSITORY, CATEGORY_REPOSITORY } from '@sagepoint/domain';
import type {
  IUserRepository,
  ICategoryRepository,
  Category,
} from '@sagepoint/domain';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(
    userId: string,
    goal: string,
    interestIds: string[],
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const categories: Category[] = [];
    for (const id of interestIds) {
      // Here we could also lookup by slug if we prefer, but ID is safer
      const cat = await this.categoryRepository.findById(id);
      if (cat) categories.push(cat);
    }

    const updatedUser = user.updateProfile(goal, categories);
    await this.userRepository.save(updatedUser);
  }
}
