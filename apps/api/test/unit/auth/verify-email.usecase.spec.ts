import {
  VerifyEmailUseCase,
  InvalidVerificationTokenError,
  UserNotFoundError,
} from '../../../src/features/auth/app/usecases/verify-email.usecase';
import { User } from '@sagepoint/domain';
import { FakeUserService, FakeTokenStore } from '../_fakes/repositories';

describe('VerifyEmailUseCase', () => {
  let userService: FakeUserService;
  let tokenStore: FakeTokenStore;
  let useCase: VerifyEmailUseCase;

  beforeEach(() => {
    userService = new FakeUserService();
    tokenStore = new FakeTokenStore();
    useCase = new VerifyEmailUseCase(userService as any, tokenStore as any);
  });

  describe('when token is valid and user is unverified', () => {
    it('verifies the user and deletes the token', async () => {
      const user = User.create('u1', 'test@example.com', 'Test');
      userService.seed(user);
      await tokenStore.storeVerificationToken('u1', 'valid-token', 86400);

      const result = await useCase.execute('valid-token');

      expect(result.message).toContain('verified successfully');
      const updated = userService.getById('u1')!;
      expect(updated.isVerified).toBe(true);
      expect(tokenStore.hasVerificationToken('valid-token')).toBe(false);
    });
  });

  describe('when user is already verified', () => {
    it('returns "already verified" message without error', async () => {
      const user = User.create('u1', 'test@example.com', 'Test').verify();
      userService.seed(user);
      await tokenStore.storeVerificationToken('u1', 'token', 86400);

      const result = await useCase.execute('token');

      expect(result.message).toContain('already verified');
    });
  });

  describe('error cases', () => {
    it('throws InvalidVerificationTokenError for unknown token', async () => {
      await expect(useCase.execute('unknown-token')).rejects.toThrow(
        InvalidVerificationTokenError,
      );
    });

    it('throws UserNotFoundError when token maps to non-existent user', async () => {
      await tokenStore.storeVerificationToken('ghost', 'orphan-token', 86400);

      await expect(useCase.execute('orphan-token')).rejects.toThrow(
        UserNotFoundError,
      );
    });
  });
});
