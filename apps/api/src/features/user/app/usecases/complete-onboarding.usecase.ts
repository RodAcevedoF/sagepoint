import type { IUserRepository } from '@sagepoint/domain';
import { NotFoundException } from '@nestjs/common';
import type { OnboardingInput } from '@/features/user/domain/inbound/user.service';
import type { InterestResolverService } from '../services/interest-resolver.service';

export class CompleteOnboardingUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly interestResolver: InterestResolverService,
  ) {}

  async execute(userId: string, input: OnboardingInput): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (input.status === 'SKIPPED') {
      const skippedUser = user.skipOnboarding();
      await this.userRepository.save(skippedUser);
      return;
    }

    if (input.status === 'PENDING') {
      const resetUser = user.resetOnboarding();
      await this.userRepository.save(resetUser);
      return;
    }

    const categories = await this.interestResolver.resolve(input.interests);
    const goal = input.learningGoal || '';

    const completedUser = user.completeOnboarding(goal, categories);
    await this.userRepository.save(completedUser);
  }
}
