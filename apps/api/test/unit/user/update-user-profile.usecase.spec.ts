import { UpdateUserProfileUseCase } from '../../../src/features/user/app/usecases/update-user-profile.usecase';
import { User, Category } from '@sagepoint/domain';
import type { IUserRepository, ICategoryRepository } from '@sagepoint/domain';

import { NotFoundException } from '@nestjs/common';
import {
  FakeUserRepository,
  FakeCategoryRepository,
} from '../_fakes/repositories';

const WEB_DEV = Category.create('c1', 'Web Development', 'web-development');
const DATA_SCI = Category.create('c2', 'Data Science', 'data-science');

describe('UpdateUserProfileUseCase', () => {
  let userRepo: FakeUserRepository;
  let categoryRepo: FakeCategoryRepository;
  let useCase: UpdateUserProfileUseCase;

  beforeEach(() => {
    userRepo = new FakeUserRepository();
    categoryRepo = new FakeCategoryRepository();
    userRepo.seed(User.create('u1', 'test@example.com', 'Test'));
    categoryRepo.seed(WEB_DEV, DATA_SCI);
    // Bypass @Inject decorators — constructor accepts the interfaces directly
    useCase = new UpdateUserProfileUseCase(
      userRepo as IUserRepository,
      categoryRepo as ICategoryRepository,
    );
  });

  describe('when user exists', () => {
    it('updates learning goal and interests', async () => {
      await useCase.execute('u1', 'Build web apps', ['c1', 'c2']);

      const updated = userRepo.getById('u1')!;
      expect(updated.learningGoal).toBe('Build web apps');
      expect(updated.interests).toHaveLength(2);
    });

    it('ignores invalid category IDs', async () => {
      await useCase.execute('u1', 'Learn AI', ['c1', 'invalid-id']);

      const updated = userRepo.getById('u1')!;
      expect(updated.interests).toHaveLength(1);
      expect(updated.interests[0].id).toBe('c1');
    });

    it('accepts empty interests', async () => {
      await useCase.execute('u1', 'Self-directed', []);

      const updated = userRepo.getById('u1')!;
      expect(updated.interests).toHaveLength(0);
      expect(updated.learningGoal).toBe('Self-directed');
    });
  });

  describe('when user does not exist', () => {
    it('throws NotFoundException', async () => {
      await expect(useCase.execute('nonexistent', 'goal', [])).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
