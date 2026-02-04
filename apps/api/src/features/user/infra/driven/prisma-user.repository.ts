import { IUserRepository, User, Category, OnboardingStatus } from '@sagepoint/domain';
import { PrismaService } from '@/core/infra/database/prisma.service';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    const interestCreate = user.interests.map(i => ({ categoryId: i.id }));

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
        include: { interests: { include: { category: true } } }
    });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
        where: { id },
        include: { interests: { include: { category: true } } }
    });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const data = await this.prisma.user.findFirst({
        where: { googleId },
        include: { interests: { include: { category: true } } }
    });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  // Helper mapper
  private mapToDomain(data: any): User {
    const interests = (data.interests || []).map((i: any) => new Category(
        i.category.id, i.category.name, i.category.slug, i.category.description, i.category.parentId, i.category.createdAt, i.category.updatedAt
    ));

    return new User(
        data.id,
        data.email,
        data.name,
        data.role as any,
        data.avatarUrl,
        data.isActive,
        data.isVerified,
        data.verificationToken,
        data.password, // passwordHash -> db.password
        data.googleId,
        data.learningGoal,
        data.onboardingStatus as OnboardingStatus,
        interests,
        data.createdAt,
        data.updatedAt,
    );
  }
}
