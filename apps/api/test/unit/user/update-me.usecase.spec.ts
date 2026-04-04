import { UpdateMeUseCase } from '../../../src/features/user/app/usecases/update-me.usecase';
import { InterestResolverService } from '../../../src/features/user/app/services/interest-resolver.service';
import { User, Category, UserRole } from '@sagepoint/domain';
import { NotFoundException } from '@nestjs/common';
import {
  FakeUserRepository,
  FakeCategoryRepository,
  FakeFileStorage,
} from '../_fakes/repositories';

const WEB_DEV = Category.create('c1', 'Web Development', 'web-development');
const DESIGN = Category.create('c2', 'Design', 'design');

describe('UpdateMeUseCase', () => {
  let userRepo: FakeUserRepository;
  let categoryRepo: FakeCategoryRepository;
  let fileStorage: FakeFileStorage;
  let useCase: UpdateMeUseCase;

  beforeEach(() => {
    userRepo = new FakeUserRepository();
    categoryRepo = new FakeCategoryRepository();
    fileStorage = new FakeFileStorage();
    userRepo.seed(User.create('u1', 'alice@example.com', 'Alice'));
    categoryRepo.seed(WEB_DEV, DESIGN);
    const interestResolver = new InterestResolverService(categoryRepo);
    useCase = new UpdateMeUseCase(userRepo, interestResolver, fileStorage);
  });

  describe('updating name only', () => {
    it('saves new name and leaves other fields unchanged', async () => {
      const result = await useCase.execute('u1', { name: 'Alice Updated' });

      expect(result.name).toBe('Alice Updated');
      expect(userRepo.getById('u1')!.name).toBe('Alice Updated');
    });
  });

  describe('updating learningGoal only', () => {
    it('saves new learning goal', async () => {
      const result = await useCase.execute('u1', {
        learningGoal: 'Master TypeScript',
      });

      expect(result.learningGoal).toBe('Master TypeScript');
    });
  });

  describe('updating interests only', () => {
    it('resolves category IDs and attaches them to the user', async () => {
      const result = await useCase.execute('u1', { interests: ['c1', 'c2'] });

      expect(result.interests).toHaveLength(2);
      expect(result.interests.map((i) => i.slug)).toEqual([
        'web-development',
        'design',
      ]);
    });

    it('silently ignores invalid category IDs', async () => {
      const result = await useCase.execute('u1', {
        interests: ['c1', 'nonexistent'],
      });

      expect(result.interests).toHaveLength(1);
    });

    it('creates a new category from a custom interest', async () => {
      const result = await useCase.execute('u1', {
        interests: ['custom:Rust'],
      });

      expect(result.interests).toHaveLength(1);
      expect(result.interests[0].slug).toBe('rust');
    });
  });

  describe('updating name and interests together', () => {
    it('applies both changes in one call', async () => {
      const result = await useCase.execute('u1', {
        name: 'Bob',
        interests: ['c1'],
      });

      expect(result.name).toBe('Bob');
      expect(result.interests).toHaveLength(1);
      expect(result.interests[0].slug).toBe('web-development');
    });
  });

  describe('when interests are not supplied', () => {
    it('does not change existing interests', async () => {
      // Seed user with a pre-existing interest
      const userWithInterest = User.create(
        'u1',
        'alice@example.com',
        'Alice',
      ).withInterests([WEB_DEV]);
      await userRepo.save(userWithInterest);

      const result = await useCase.execute('u1', { name: 'New Name' });

      expect(result.interests).toHaveLength(1);
      expect(result.interests[0].slug).toBe('web-development');
    });
  });

  describe('avatar replacement', () => {
    it('deletes old avatar from storage when replacing with a new one', async () => {
      const oldPath = 'avatars/u1/old-uuid.jpg';
      const oldUrl = `https://storage.googleapis.com/test-bucket/${oldPath}`;
      const newUrl =
        'https://storage.googleapis.com/test-bucket/avatars/u1/new-uuid.jpg';

      // Seed user with existing avatar and a file in storage
      await fileStorage.upload(oldPath, Buffer.from('old'));
      const userWithAvatar = new User(
        'u1',
        'alice@example.com',
        'Alice',
        UserRole.USER,
        oldUrl,
      );
      await userRepo.save(userWithAvatar);

      await useCase.execute('u1', { avatarUrl: newUrl });

      expect(fileStorage.has(oldPath)).toBe(false);
    });

    it('does not delete when setting the same avatar URL', async () => {
      const path = 'avatars/u1/same.jpg';
      const url = `https://storage.googleapis.com/test-bucket/${path}`;

      await fileStorage.upload(path, Buffer.from('img'));
      const userWithAvatar = new User(
        'u1',
        'alice@example.com',
        'Alice',
        UserRole.USER,
        url,
      );
      await userRepo.save(userWithAvatar);

      await useCase.execute('u1', { avatarUrl: url });

      expect(fileStorage.has(path)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('throws NotFoundException when user does not exist', async () => {
      await expect(
        useCase.execute('nonexistent', { name: 'Ghost' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
