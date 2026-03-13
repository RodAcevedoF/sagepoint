import { CompleteOnboardingUseCase } from '../../../src/features/user/app/usecases/complete-onboarding.usecase';
import { User, OnboardingStatus, Category } from '@sagepoint/domain';
import { NotFoundException } from '@nestjs/common';
import {
  FakeUserRepository,
  FakeCategoryRepository,
} from '../_fakes/repositories';

const WEB_DEV = Category.create('c1', 'Web Development', 'web-development');
const DATA_SCI = Category.create('c2', 'Data Science', 'data-science');
const DEVOPS = Category.create('c3', 'DevOps', 'devops');

describe('CompleteOnboardingUseCase', () => {
  let userRepo: FakeUserRepository;
  let categoryRepo: FakeCategoryRepository;
  let useCase: CompleteOnboardingUseCase;

  beforeEach(() => {
    userRepo = new FakeUserRepository();
    categoryRepo = new FakeCategoryRepository();
    userRepo.seed(User.create('u1', 'test@example.com', 'Test User'));
    categoryRepo.seed(WEB_DEV, DATA_SCI, DEVOPS);
    useCase = new CompleteOnboardingUseCase(userRepo, categoryRepo);
  });

  describe('completing onboarding', () => {
    it('saves user with COMPLETED status, goal, and valid interests', async () => {
      await useCase.execute('u1', {
        status: 'COMPLETED',
        learningGoal: 'Build web apps',
        interests: ['c1', 'c2'],
      });

      const saved = userRepo.getById('u1')!;
      expect(saved.onboardingStatus).toBe(OnboardingStatus.COMPLETED);
      expect(saved.learningGoal).toBe('Build web apps');
      expect(saved.interests).toHaveLength(2);
      expect(saved.interests.map((i) => i.slug)).toEqual([
        'web-development',
        'data-science',
      ]);
    });

    it('ignores invalid category IDs silently', async () => {
      await useCase.execute('u1', {
        status: 'COMPLETED',
        learningGoal: 'Learn',
        interests: ['c1', 'nonexistent'],
      });

      expect(userRepo.getById('u1')!.interests).toHaveLength(1);
    });

    it('appends custom interests to the learning goal', async () => {
      await useCase.execute('u1', {
        status: 'COMPLETED',
        learningGoal: 'My goal',
        interests: ['c1', 'custom:Blockchain', 'custom:IoT'],
      });

      const saved = userRepo.getById('u1')!;
      expect(saved.learningGoal).toContain('Blockchain');
      expect(saved.learningGoal).toContain('IoT');
      expect(saved.interests).toHaveLength(1); // only c1
    });
  });

  describe('skipping onboarding', () => {
    it('saves user with SKIPPED status', async () => {
      await useCase.execute('u1', {
        status: 'SKIPPED',
        learningGoal: '',
        interests: [],
      });

      expect(userRepo.getById('u1')!.onboardingStatus).toBe(
        OnboardingStatus.SKIPPED,
      );
    });
  });

  describe('resetting onboarding', () => {
    it('saves user with PENDING status and clears data', async () => {
      // First complete onboarding
      const completed = User.create(
        'u1',
        'test@example.com',
        'Test User',
      ).completeOnboarding('Old goal', [WEB_DEV, DATA_SCI]);
      await userRepo.save(completed);

      await useCase.execute('u1', {
        status: 'PENDING',
        learningGoal: '',
        interests: [],
      });

      const saved = userRepo.getById('u1')!;
      expect(saved.onboardingStatus).toBe(OnboardingStatus.PENDING);
      expect(saved.learningGoal).toBeNull();
      expect(saved.interests).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('throws NotFoundException when user does not exist', async () => {
      await expect(
        useCase.execute('nonexistent', {
          status: 'COMPLETED',
          learningGoal: '',
          interests: [],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
