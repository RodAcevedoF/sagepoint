import {
  connectPrisma,
  disconnectPrisma,
  cleanDatabase,
  asPrismaService,
} from './_setup/prisma-test-client';
import { PrismaUserRepository } from '@sagepoint/database';
import { PrismaCategoryRepository } from '@sagepoint/database';
import { User, Category, UserRole, OnboardingStatus } from '@sagepoint/domain';

describe('PrismaUserRepository (integration)', () => {
  let userRepo: PrismaUserRepository;
  let catRepo: PrismaCategoryRepository;

  const NOW = new Date('2026-01-01');

  function buildUser(
    overrides: Partial<{
      id: string;
      email: string;
      name: string;
      role: UserRole;
      isActive: boolean;
      isVerified: boolean;
      passwordHash: string;
      googleId: string;
      learningGoal: string;
      onboardingStatus: OnboardingStatus;
      interests: Category[];
    }> = {},
  ) {
    return new User(
      overrides.id ?? 'u1',
      overrides.email ?? 'test@example.com',
      overrides.name ?? 'Test User',
      overrides.role ?? UserRole.USER,
      undefined, // avatarUrl
      overrides.isActive ?? true,
      overrides.isVerified ?? true,
      undefined, // verificationToken
      overrides.passwordHash ?? '$2b$10$hashedpassword',
      overrides.googleId,
      overrides.learningGoal,
      overrides.onboardingStatus ?? OnboardingStatus.PENDING,
      overrides.interests ?? [],
      NOW,
      NOW,
    );
  }

  function buildCategory(id: string, name: string, slug: string) {
    return new Category(id, name, slug, undefined, undefined, NOW, NOW);
  }

  beforeAll(async () => {
    await connectPrisma();
    const prisma = asPrismaService();
    userRepo = new PrismaUserRepository(prisma);
    catRepo = new PrismaCategoryRepository(prisma);
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('save + findById', () => {
    it('creates a new user and retrieves it', async () => {
      const user = buildUser({ name: 'Alice', email: 'alice@test.com' });
      await userRepo.save(user);

      const found = await userRepo.findById('u1');

      expect(found).not.toBeNull();
      expect(found!.name).toBe('Alice');
      expect(found!.email).toBe('alice@test.com');
      expect(found!.role).toBe(UserRole.USER);
      expect(found!.isActive).toBe(true);
      expect(found!.isVerified).toBe(true);
    });

    it('updates an existing user on second save', async () => {
      await userRepo.save(buildUser());

      const updated = buildUser({
        name: 'Updated Name',
        learningGoal: 'Learn ML',
      });
      await userRepo.save(updated);

      const found = await userRepo.findById('u1');
      expect(found!.name).toBe('Updated Name');
      expect(found!.learningGoal).toBe('Learn ML');
    });
  });

  describe('findByEmail', () => {
    it('returns user by email', async () => {
      await userRepo.save(buildUser({ email: 'bob@test.com' }));

      const found = await userRepo.findByEmail('bob@test.com');
      expect(found).not.toBeNull();
      expect(found!.email).toBe('bob@test.com');
    });

    it('returns null for non-existent email', async () => {
      const found = await userRepo.findByEmail('ghost@test.com');
      expect(found).toBeNull();
    });
  });

  describe('findByGoogleId', () => {
    it('returns user by Google ID', async () => {
      await userRepo.save(buildUser({ googleId: 'google-123' }));

      const found = await userRepo.findByGoogleId('google-123');
      expect(found).not.toBeNull();
      expect(found!.googleId).toBe('google-123');
    });

    it('returns null for non-existent Google ID', async () => {
      const found = await userRepo.findByGoogleId('nope');
      expect(found).toBeNull();
    });
  });

  describe('interests (nested relation)', () => {
    it('saves and retrieves user interests', async () => {
      const cat1 = buildCategory('cat-1', 'Web Dev', 'web-dev');
      const cat2 = buildCategory('cat-2', 'ML', 'ml');
      await catRepo.save(cat1);
      await catRepo.save(cat2);

      const user = buildUser({ interests: [cat1, cat2] });
      await userRepo.save(user);

      const found = await userRepo.findById('u1');
      expect(found!.interests).toHaveLength(2);
      expect(found!.interests.map((i) => i.slug).sort()).toEqual([
        'ml',
        'web-dev',
      ]);
    });

    it('replaces interests on update', async () => {
      const cat1 = buildCategory('cat-1', 'Web Dev', 'web-dev');
      const cat2 = buildCategory('cat-2', 'ML', 'ml');
      const cat3 = buildCategory('cat-3', 'DevOps', 'devops');
      await catRepo.save(cat1);
      await catRepo.save(cat2);
      await catRepo.save(cat3);

      // First save with cat1, cat2
      await userRepo.save(buildUser({ interests: [cat1, cat2] }));

      // Update to cat2, cat3 only
      await userRepo.save(buildUser({ interests: [cat2, cat3] }));

      const found = await userRepo.findById('u1');
      expect(found!.interests).toHaveLength(2);
      expect(found!.interests.map((i) => i.slug).sort()).toEqual([
        'devops',
        'ml',
      ]);
    });
  });
});
