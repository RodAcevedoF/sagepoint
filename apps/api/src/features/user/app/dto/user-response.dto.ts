import { User, UserRole, Category } from '@sagepoint/domain';

/**
 * Safe user response - excludes sensitive fields like passwordHash, verificationToken
 */
export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  googleId: string | null;
  learningGoal: string | null;
  interests: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    isVerified: user.isVerified,
    googleId: user.googleId,
    learningGoal: user.learningGoal,
    interests: user.interests,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
