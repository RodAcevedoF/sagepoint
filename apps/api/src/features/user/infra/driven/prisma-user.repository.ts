import {
  IUserRepository,
  User,
  Category,
  OnboardingStatus,
  UserRole,
} from '@sagepoint/domain';
import type {
  User as PrismaUser,
  UserInterest as PrismaUserInterest,
  Category as PrismaCategory,
} from '@sagepoint/database';
import { PrismaService } from '@/core/infra/database/prisma.service';

type UserWithInterests = PrismaUser & {
  interests: (PrismaUserInterest & { category: PrismaCategory })[];
};

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    const interestCreate = user.interests.map((i) => ({ categoryId: i.id }));

    await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.passwordHash,
        googleId: user.googleId,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        isVerified: user.isVerified,
        verificationToken: user.verificationToken,
        learningGoal: user.learningGoal,
        onboardingStatus: user.onboardingStatus,
        interests: {
          create: interestCreate,
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      update: {
        email: user.email,
        name: user.name,
        password: user.passwordHash,
        googleId: user.googleId,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        isVerified: user.isVerified,
        verificationToken: user.verificationToken,
        learningGoal: user.learningGoal,
        onboardingStatus: user.onboardingStatus,
        interests: {
          deleteMany: {},
          create: interestCreate,
        },
        updatedAt: user.updatedAt,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { email },
      include: { interests: { include: { category: true } } },
    });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { id },
      include: { interests: { include: { category: true } } },
    });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const data = await this.prisma.user.findFirst({
      where: { googleId },
      include: { interests: { include: { category: true } } },
    });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  private mapToDomain(data: UserWithInterests): User {
    const interests = data.interests.map(
      (i) =>
        new Category(
          i.category.id,
          i.category.name,
          i.category.slug,
          i.category.description ?? undefined,
          i.category.parentId ?? undefined,
          i.category.createdAt,
          i.category.updatedAt,
        ),
    );

    return new User(
      data.id,
      data.email,
      data.name,
      data.role as UserRole,
      data.avatarUrl ?? undefined,
      data.isActive,
      data.isVerified,
      data.verificationToken ?? undefined,
      data.password ?? undefined,
      data.googleId ?? undefined,
      data.learningGoal ?? undefined,
      data.onboardingStatus as OnboardingStatus,
      interests,
      data.createdAt,
      data.updatedAt,
    );
  }
}
