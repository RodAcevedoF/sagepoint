import { IUserRepository, User } from '@sagepoint/domain';
import { PrismaService } from '@/core/infra/database/prisma.service';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
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
        updatedAt: user.updatedAt,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ where: { email } });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ where: { id } });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  // Helper mapper
  private mapToDomain(data: any): User {
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
        data.createdAt,
        data.updatedAt,
    );
  }
}
