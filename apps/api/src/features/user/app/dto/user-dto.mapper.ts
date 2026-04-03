import type { IFileStorage } from '@sagepoint/domain';
import { User } from '@sagepoint/domain';
import type { UserResponseDto } from './user-response.dto';

export const USER_DTO_MAPPER = Symbol('USER_DTO_MAPPER');

const SIGNED_URL_TTL = 3600; // 1 hour

export interface IUserDtoMapper {
  toDto(user: User): Promise<UserResponseDto>;
}

export class UserDtoMapper implements IUserDtoMapper {
  constructor(private readonly fileStorage: IFileStorage) {}

  async toDto(user: User): Promise<UserResponseDto> {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: await this.resolveAvatarUrl(user.avatarUrl),
      isActive: user.isActive,
      isVerified: user.isVerified,
      googleId: user.googleId,
      learningGoal: user.learningGoal,
      onboardingStatus: user.onboardingStatus,
      interests: user.interests,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async resolveAvatarUrl(
    avatarUrl: string | undefined,
  ): Promise<string | undefined> {
    if (!avatarUrl) return undefined;
    // Legacy: already a full URL
    if (avatarUrl.startsWith('http')) return avatarUrl;
    // Storage path → signed URL
    return this.fileStorage.getUrl(avatarUrl, SIGNED_URL_TTL);
  }
}
