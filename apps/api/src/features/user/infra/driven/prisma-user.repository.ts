import { IUserRepository, User, Category } from '@sagepoint/domain';
import { PrismaService } from '@/core/infra/database/prisma.service';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    const interestConnect = user.interests.map(i => ({ id: i.id }));
    
    // For many-to-many update in Prisma, we often need to explicit set/connect
    // A simple overwrite approach:
    
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
        interests: {
            connect: interestConnect
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
        interests: {
            set: interestConnect // Replace all interests
        },
        updatedAt: user.updatedAt,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ 
        where: { email },
        include: { interests: true }
    });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ 
        where: { id },
        include: { interests: true }
    });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const data = await this.prisma.user.findFirst({ 
        where: { googleId },
        include: { interests: true }
    });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  // Helper mapper
  private mapToDomain(data: any): User {
    const interests = (data.interests || []).map((i: any) => new Category(
        i.id, i.name, i.slug, i.description, i.parentId, i.createdAt, i.updatedAt
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
        interests,
        data.createdAt,
        data.updatedAt,
    );
  }
}
