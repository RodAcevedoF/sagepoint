import { NotFoundException } from '@nestjs/common';
import type { IUserRepository, IFileStorage } from '@sagepoint/domain';
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
    private readonly fileStorage: IFileStorage,
  ) {}

  async execute(userId: string, input: UpdateMeInput): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete old avatar from storage when replacing or removing
    if (
      input.avatarUrl !== undefined &&
      user.avatarUrl &&
      input.avatarUrl !== user.avatarUrl
    ) {
      await this.deleteOldAvatar(user.avatarUrl);
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

  private async deleteOldAvatar(avatarUrl: string): Promise<void> {
    try {
      // Storage path (e.g. "avatars/userId/uuid.jpg")
      if (!avatarUrl.startsWith('http')) {
        await this.fileStorage.delete(avatarUrl);
        return;
      }
      // Legacy public GCS URL: https://storage.googleapis.com/{bucket}/{path}
      const match = avatarUrl.match(/storage\.googleapis\.com\/[^/]+\/(.+)$/);
      if (match) {
        await this.fileStorage.delete(match[1]);
      }
    } catch {
      // Non-critical — don't block the update
    }
  }
}
