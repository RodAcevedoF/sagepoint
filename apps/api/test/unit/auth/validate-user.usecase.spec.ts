import {
  ValidateUserUseCase,
  EmailNotVerifiedError,
} from '../../../src/features/auth/app/usecases/validate-user.usecase';
import { User } from '@sagepoint/domain';
import { FakeUserService, FakePasswordHasher } from '../_fakes/repositories';

describe('ValidateUserUseCase', () => {
  let userService: FakeUserService;
  let passwordHasher: FakePasswordHasher;
  let useCase: ValidateUserUseCase;

  beforeEach(() => {
    userService = new FakeUserService();
    passwordHasher = new FakePasswordHasher();
    useCase = new ValidateUserUseCase(
      userService as any,
      passwordHasher as any,
    );
  });

  describe('when credentials are valid and email is verified', () => {
    it('returns the user', async () => {
      const user = User.create(
        'u1',
        'test@example.com',
        'Test',
        undefined,
        'hashed:correct-password',
      ).verify();
      userService.seed(user);

      const result = await useCase.execute('test@example.com', 'correct-password');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('u1');
    });
  });

  describe('when user does not exist', () => {
    it('returns null', async () => {
      const result = await useCase.execute('nobody@example.com', 'pass');
      expect(result).toBeNull();
    });
  });

  describe('when password is wrong', () => {
    it('returns null', async () => {
      const user = User.create(
        'u1',
        'test@example.com',
        'Test',
        undefined,
        'hashed:correct-password',
      ).verify();
      userService.seed(user);

      const result = await useCase.execute('test@example.com', 'wrong-password');
      expect(result).toBeNull();
    });
  });

  describe('when user has no password (Google-only)', () => {
    it('returns null', async () => {
      userService.seed(User.create('u1', 'google@example.com', 'Google User'));

      const result = await useCase.execute('google@example.com', 'any');
      expect(result).toBeNull();
    });
  });

  describe('when email is not verified', () => {
    it('throws EmailNotVerifiedError', async () => {
      const user = User.create(
        'u1',
        'unverified@example.com',
        'Unverified',
        undefined,
        'hashed:pass',
      );
      userService.seed(user);

      await expect(
        useCase.execute('unverified@example.com', 'pass'),
      ).rejects.toThrow(EmailNotVerifiedError);
    });
  });
});
