import { GetUserUseCase } from '../../../src/features/user/app/usecases/get-user.usecase';
import { User } from '@sagepoint/domain';
import { FakeUserRepository } from '../_fakes/repositories';

const USER = User.create('u1', 'test@example.com', 'Test User');

describe('GetUserUseCase', () => {
  let userRepo: FakeUserRepository;
  let useCase: GetUserUseCase;

  beforeEach(() => {
    userRepo = new FakeUserRepository();
    useCase = new GetUserUseCase(userRepo);
    userRepo.seed(USER);
  });

  describe('execute (by id)', () => {
    it('returns user when found', async () => {
      const result = await useCase.execute('u1');
      expect(result!.email).toBe('test@example.com');
    });

    it('returns null when not found', async () => {
      const result = await useCase.execute('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('byEmail', () => {
    it('returns user when email matches', async () => {
      const result = await useCase.byEmail('test@example.com');
      expect(result!.id).toBe('u1');
    });

    it('returns null when email not found', async () => {
      const result = await useCase.byEmail('unknown@example.com');
      expect(result).toBeNull();
    });
  });

  describe('byGoogleId', () => {
    it('returns null when no user has the given Google ID', async () => {
      const result = await useCase.byGoogleId('google-123');
      expect(result).toBeNull();
    });
  });
});
