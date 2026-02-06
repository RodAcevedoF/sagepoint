import type {
  IUserRepository,
  ICategoryRepository,
  Category,
} from '@sagepoint/domain';
import { NotFoundException } from '@nestjs/common';
import type { OnboardingInput } from '@/features/user/domain/inbound/user.service';

export class CompleteOnboardingUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(userId: string, input: OnboardingInput): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user with onboarding status
    if (input.status === 'SKIPPED') {
      const skippedUser = user.skipOnboarding();
      await this.userRepository.save(skippedUser);
      return;
    }

    // Reset onboarding (dev only)
    if (input.status === 'PENDING') {
      const resetUser = user.resetOnboarding();
      await this.userRepository.save(resetUser);
      return;
    }

    // Separate category IDs from custom interests
    const categoryIds = input.interests.filter((i) => !i.startsWith('custom:'));
    const customInterests = input.interests
      .filter((i) => i.startsWith('custom:'))
      .map((i) => i.replace('custom:', ''));

    // Fetch valid categories
    const categories: Category[] = [];
    for (const id of categoryIds) {
      const cat = await this.categoryRepository.findById(id);
      if (cat) categories.push(cat);
    }

    // Build goal with custom interests appended if any
    let goal = input.learningGoal || '';
    if (customInterests.length > 0) {
      // Store custom interests in the goal for now (could be separate field later)
      const customNote = `\n\nCustom interests: ${customInterests.join(', ')}`;
      goal = goal + customNote;
    }

    const completedUser = user.completeOnboarding(goal, categories);
    await this.userRepository.save(completedUser);
  }
}
